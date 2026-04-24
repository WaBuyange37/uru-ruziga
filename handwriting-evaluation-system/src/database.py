"""
Database Storage Component
Stores handwriting evaluation data for future OCR training
"""
import sqlite3
import json
import base64
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class HandwritingDatabase:
    def __init__(self, db_path: str = "handwriting_data.db"):
        """Initialize database connection and create tables"""
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Create database tables if they don't exist"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Main handwriting attempts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS handwriting_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    character TEXT NOT NULL,
                    latin_character TEXT NOT NULL,
                    raw_image TEXT NOT NULL,
                    processed_image TEXT,
                    reference_image TEXT NOT NULL,
                    score REAL NOT NULL,
                    passed BOOLEAN NOT NULL,
                    feedback TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    -- Extracted features for ML
                    contour_area REAL,
                    aspect_ratio REAL,
                    bounding_box TEXT,
                    
                    -- Comparison metrics
                    ssim_score REAL,
                    contour_score REAL,
                    
                    -- Metadata
                    canvas_size TEXT,
                    processing_version TEXT DEFAULT '1.0'
                )
            """)
            
            # Reference images cache table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reference_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    character TEXT UNIQUE NOT NULL,
                    latin_character TEXT NOT NULL,
                    image_data TEXT NOT NULL,
                    font_path TEXT NOT NULL,
                    font_size INTEGER NOT NULL,
                    canvas_size TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_character ON handwriting_attempts(character)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_latin_char ON handwriting_attempts(latin_character)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_score ON handwriting_attempts(score)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON handwriting_attempts(created_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_passed ON handwriting_attempts(passed)")
            
            conn.commit()
            logger.info("Database initialized successfully")
    
    def store_attempt(self, 
                     character: str,
                     latin_character: str,
                     raw_image: str,
                     reference_image: str,
                     score: float,
                     ssim_score: float,
                     contour_score: float,
                     bounding_box: tuple,
                     contour_area: float = None,
                     aspect_ratio: float = None,
                     user_id: str = None,
                     processed_image: str = None) -> int:
        """
        Store a handwriting attempt in the database
        
        Returns:
            int: The ID of the stored attempt
        """
        passed = score >= 70.0  # Threshold for "correct" label
        feedback = self._generate_feedback(score, ssim_score, contour_score)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO handwriting_attempts (
                    user_id, character, latin_character, raw_image, processed_image,
                    reference_image, score, passed, feedback, contour_area, aspect_ratio,
                    bounding_box, ssim_score, contour_score, canvas_size
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, character, latin_character, raw_image, processed_image,
                reference_image, score, passed, json.dumps(feedback), contour_area,
                aspect_ratio, json.dumps(bounding_box), ssim_score, contour_score,
                "256x256"
            ))
            
            attempt_id = cursor.lastrowid
            conn.commit()
            
            logger.info(f"Stored attempt {attempt_id}: {character} (score: {score:.1f})")
            return attempt_id
    
    def store_reference_image(self, 
                            character: str,
                            latin_character: str,
                            image_data: str,
                            font_path: str,
                            font_size: int = 200) -> bool:
        """
        Store or update a reference image in the cache
        
        Returns:
            bool: True if successful
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Use INSERT OR REPLACE to handle updates
            cursor.execute("""
                INSERT OR REPLACE INTO reference_images (
                    character, latin_character, image_data, font_path, 
                    font_size, canvas_size, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                character, latin_character, image_data, font_path,
                font_size, "256x256", datetime.now()
            ))
            
            conn.commit()
            logger.info(f"Stored reference image for character: {character}")
            return True
    
    def get_reference_image(self, character: str) -> Optional[Dict[str, Any]]:
        """Get cached reference image for a character"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT character, latin_character, image_data, font_path, 
                       font_size, canvas_size, created_at, updated_at
                FROM reference_images 
                WHERE character = ?
            """, (character,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'character': row[0],
                    'latin_character': row[1],
                    'image_data': row[2],
                    'font_path': row[3],
                    'font_size': row[4],
                    'canvas_size': row[5],
                    'created_at': row[6],
                    'updated_at': row[7]
                }
            return None
    
    def get_attempts_by_character(self, character: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all attempts for a specific character"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, user_id, character, latin_character, score, passed,
                       ssim_score, contour_score, created_at, bounding_box
                FROM handwriting_attempts 
                WHERE character = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (character, limit))
            
            rows = cursor.fetchall()
            return [
                {
                    'id': row[0],
                    'user_id': row[1],
                    'character': row[2],
                    'latin_character': row[3],
                    'score': row[4],
                    'passed': bool(row[5]),
                    'ssim_score': row[6],
                    'contour_score': row[7],
                    'created_at': row[8],
                    'bounding_box': json.loads(row[9]) if row[9] else None
                }
                for row in rows
            ]
    
    def get_training_dataset(self, min_score: float = None, max_score: float = None) -> List[Dict[str, Any]]:
        """
        Get dataset for OCR training
        
        Args:
            min_score: Minimum score threshold
            max_score: Maximum score threshold
            
        Returns:
            List of training samples with images and labels
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            query = """
                SELECT id, character, latin_character, raw_image, reference_image,
                       score, passed, ssim_score, contour_score, bounding_box,
                       created_at
                FROM handwriting_attempts
                WHERE 1=1
            """
            params = []
            
            if min_score is not None:
                query += " AND score >= ?"
                params.append(min_score)
            
            if max_score is not None:
                query += " AND score <= ?"
                params.append(max_score)
            
            query += " ORDER BY created_at DESC"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            return [
                {
                    'id': row[0],
                    'character': row[1],
                    'latin_character': row[2],
                    'user_image': row[3],
                    'reference_image': row[4],
                    'score': row[5],
                    'label': 'correct' if row[6] else 'incorrect',
                    'ssim_score': row[7],
                    'contour_score': row[8],
                    'bounding_box': json.loads(row[9]) if row[9] else None,
                    'created_at': row[10]
                }
                for row in rows
            ]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Total attempts
            cursor.execute("SELECT COUNT(*) FROM handwriting_attempts")
            total_attempts = cursor.fetchone()[0]
            
            # Attempts by character
            cursor.execute("""
                SELECT character, latin_character, COUNT(*), AVG(score), 
                       SUM(CASE WHEN passed THEN 1 ELSE 0 END) as correct_count
                FROM handwriting_attempts 
                GROUP BY character, latin_character
                ORDER BY COUNT(*) DESC
            """)
            by_character = [
                {
                    'character': row[0],
                    'latin_character': row[1],
                    'total_attempts': row[2],
                    'average_score': round(row[3], 1),
                    'correct_attempts': row[4],
                    'accuracy_rate': round((row[4] / row[2]) * 100, 1)
                }
                for row in cursor.fetchall()
            ]
            
            # Recent activity
            cursor.execute("""
                SELECT DATE(created_at) as date, COUNT(*) as attempts
                FROM handwriting_attempts 
                WHERE created_at >= datetime('now', '-7 days')
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            """)
            recent_activity = [
                {'date': row[0], 'attempts': row[1]}
                for row in cursor.fetchall()
            ]
            
            return {
                'total_attempts': total_attempts,
                'by_character': by_character,
                'recent_activity': recent_activity,
                'database_path': self.db_path
            }
    
    def _generate_feedback(self, score: float, ssim_score: float, contour_score: float) -> List[str]:
        """Generate feedback messages based on scores"""
        feedback = []
        
        if score >= 90:
            feedback.append("Excellent! Your character is nearly perfect.")
        elif score >= 70:
            feedback.append("Great work! You're very close.")
        elif score >= 50:
            feedback.append("Good effort. Keep practicing.")
        else:
            feedback.append("Try following the guide overlay more closely.")
        
        # Specific feedback based on component scores
        if ssim_score < 0.5:
            feedback.append("Focus on the overall shape and structure.")
        
        if contour_score < 0.3:
            feedback.append("Pay attention to the stroke patterns.")
        
        return feedback