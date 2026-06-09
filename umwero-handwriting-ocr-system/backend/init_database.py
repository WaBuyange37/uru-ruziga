#!/usr/bin/env python3
"""
Database initialization script for Umwero Handwriting OCR System

This script:
1. Generates Prisma client
2. Applies database migrations
3. Seeds initial character profiles
4. Validates database setup

Usage:
    python init_database.py
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add src to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from database_service import db_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_prisma_client():
    """Generate Prisma client from schema."""
    try:
        logger.info("Generating Prisma client...")
        
        # Run prisma generate command
        import subprocess
        result = subprocess.run(
            ["python", "-m", "prisma", "generate"],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("✅ Prisma client generated successfully")
            return True
        else:
            logger.error(f"❌ Prisma generate failed: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to generate Prisma client: {e}")
        return False

async def apply_migrations():
    """Apply database migrations."""
    try:
        logger.info("Applying database migrations...")
        
        # Run prisma db push command
        import subprocess
        result = subprocess.run(
            ["python", "-m", "prisma", "db", "push"],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("✅ Database migrations applied successfully")
            return True
        else:
            logger.error(f"❌ Database migration failed: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to apply migrations: {e}")
        return False

async def seed_character_profiles():
    """Seed initial character profiles for Umwero characters."""
    try:
        logger.info("Seeding character profiles...")
        
        # Connect to database
        connected = await db_service.connect()
        if not connected:
            logger.error("❌ Failed to connect to database")
            return False
        
        # Define Umwero characters with their properties
        characters = [
            # Vowels
            {"character": "a", "type": "vowel", "difficulty": 2.0, "has_loops": True, "has_curves": True},
            {"character": "e", "type": "vowel", "difficulty": 2.5, "has_loops": False, "has_curves": True},
            {"character": "i", "type": "vowel", "difficulty": 1.5, "has_loops": False, "has_curves": False},
            {"character": "o", "type": "vowel", "difficulty": 2.0, "has_loops": True, "has_curves": True},
            {"character": "u", "type": "vowel", "difficulty": 2.0, "has_loops": False, "has_curves": True},
            
            # Common consonants
            {"character": "b", "type": "consonant", "difficulty": 3.0, "has_loops": True, "has_curves": True},
            {"character": "c", "type": "consonant", "difficulty": 2.0, "has_loops": False, "has_curves": True},
            {"character": "d", "type": "consonant", "difficulty": 3.0, "has_loops": True, "has_curves": True},
            {"character": "f", "type": "consonant", "difficulty": 2.5, "has_loops": False, "has_curves": False},
            {"character": "g", "type": "consonant", "difficulty": 3.5, "has_loops": True, "has_curves": True},
            {"character": "h", "type": "consonant", "difficulty": 2.0, "has_loops": False, "has_curves": False},
            {"character": "j", "type": "consonant", "difficulty": 2.5, "has_loops": False, "has_curves": True},
            {"character": "k", "type": "consonant", "difficulty": 3.0, "has_loops": False, "has_curves": False},
            {"character": "l", "type": "consonant", "difficulty": 2.0, "has_loops": False, "has_curves": False},
            {"character": "m", "type": "consonant", "difficulty": 3.0, "has_loops": False, "has_curves": True},
            {"character": "n", "type": "consonant", "difficulty": 2.5, "has_loops": False, "has_curves": True},
            {"character": "p", "type": "consonant", "difficulty": 3.0, "has_loops": True, "has_curves": True},
            {"character": "r", "type": "consonant", "difficulty": 3.0, "has_loops": False, "has_curves": True},
            {"character": "s", "type": "consonant", "difficulty": 3.5, "has_loops": False, "has_curves": True},
            {"character": "t", "type": "consonant", "difficulty": 2.5, "has_loops": False, "has_curves": False},
            {"character": "v", "type": "consonant", "difficulty": 2.5, "has_loops": False, "has_curves": False},
            {"character": "w", "type": "consonant", "difficulty": 3.0, "has_loops": False, "has_curves": True},
            {"character": "y", "type": "consonant", "difficulty": 2.5, "has_loops": False, "has_curves": True},
            {"character": "z", "type": "consonant", "difficulty": 3.0, "has_loops": False, "has_curves": False},
            
            # Common ligatures (compound characters)
            {"character": "ka", "type": "ligature", "difficulty": 4.0, "has_loops": False, "has_curves": True},
            {"character": "ga", "type": "ligature", "difficulty": 4.5, "has_loops": True, "has_curves": True},
            {"character": "ngo", "type": "ligature", "difficulty": 5.0, "has_loops": True, "has_curves": True},
            {"character": "nya", "type": "ligature", "difficulty": 4.5, "has_loops": False, "has_curves": True},
        ]
        
        created_count = 0
        for char_data in characters:
            try:
                # Check if character profile already exists
                existing = await db_service.get_character_profile(char_data["character"])
                
                if not existing:
                    # Create new character profile
                    await db_service.prisma.characterprofile.create(
                        data={
                            "character": char_data["character"],
                            "characterType": char_data["type"],
                            "difficultyLevel": char_data["difficulty"],
                            "strokeComplexity": char_data["difficulty"],
                            "hasLoops": char_data["has_loops"],
                            "hasCurves": char_data["has_curves"],
                            "scoreAdjustment": 0.0,
                            "toleranceLevel": 1.0,
                            "totalAttempts": 0
                        }
                    )
                    created_count += 1
                    logger.debug(f"Created profile for character '{char_data['character']}'")
                else:
                    logger.debug(f"Profile already exists for character '{char_data['character']}'")
                    
            except Exception as e:
                logger.error(f"Failed to create profile for '{char_data['character']}': {e}")
        
        logger.info(f"✅ Character profiles seeded: {created_count} new profiles created")
        
        await db_service.disconnect()
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to seed character profiles: {e}")
        return False

async def validate_database():
    """Validate database setup and connectivity."""
    try:
        logger.info("Validating database setup...")
        
        # Connect to database
        connected = await db_service.connect()
        if not connected:
            logger.error("❌ Database connection failed")
            return False
        
        # Test basic operations
        stats = await db_service.get_dataset_statistics()
        logger.info(f"Database statistics: {stats}")
        
        # Count character profiles
        profile_count = await db_service.prisma.characterprofile.count()
        logger.info(f"Character profiles in database: {profile_count}")
        
        await db_service.disconnect()
        
        logger.info("✅ Database validation successful")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database validation failed: {e}")
        return False

async def main():
    """Main initialization function."""
    logger.info("🚀 Starting Umwero OCR Database Initialization")
    
    # Check environment variables
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("❌ DATABASE_URL environment variable not set")
        logger.info("Please set DATABASE_URL to your PostgreSQL connection string")
        logger.info("Example: postgresql://user:password@localhost:5432/umwero_ocr")
        return False
    
    logger.info(f"Database URL: {database_url.split('@')[0]}@***")
    
    # Step 1: Generate Prisma client
    if not await generate_prisma_client():
        logger.error("❌ Failed to generate Prisma client")
        return False
    
    # Step 2: Apply migrations
    if not await apply_migrations():
        logger.error("❌ Failed to apply database migrations")
        return False
    
    # Step 3: Seed character profiles
    if not await seed_character_profiles():
        logger.error("❌ Failed to seed character profiles")
        return False
    
    # Step 4: Validate setup
    if not await validate_database():
        logger.error("❌ Database validation failed")
        return False
    
    logger.info("🎉 Database initialization completed successfully!")
    logger.info("The Umwero OCR system is ready to collect training data.")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)