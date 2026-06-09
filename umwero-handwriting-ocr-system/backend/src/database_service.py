"""
Database Service for Umwero Handwriting OCR System

Handles all database operations including:
- Drawing attempt storage and retrieval
- Feature vector management
- Feedback record management
- Character profile management
- Performance metrics tracking
- Admin audit logging

Optimized for ML training data collection and high-performance queries.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path

from prisma import Prisma
from prisma.models import (
    DrawingAttempt, FeatureVector, FeedbackRecord, 
    CharacterProfile, PerformanceMetric, AdminAuditLog
)

logger = logging.getLogger(__name__)

class DatabaseService:
    """Production-grade database service with connection pooling and error handling."""
    
    def __init__(self, database_url: Optional[str] = None):
        """Initialize database service with connection pooling."""
        self.prisma = Prisma()
        self._connected = False
        
    async def connect(self) -> bool:
        """Establish database connection with retry logic."""
        if self._connected:
            return True
            
        try:
            await self.prisma.connect()
            self._connected = True
            logger.info("✅ Database connected successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            return False
    
    async def disconnect(self):
        """Safely disconnect from database."""
        if self._connected:
            await self.prisma.disconnect()
            self._connected = False
            logger.info("Database disconnected")
    
    async def ensure_connected(self):
        """Ensure database connection is active."""
        if not self._connected:
            await self.connect()
    
    # ─── Drawing Attempt Operations ─────────────────────────────────────────
    
    async def store_drawing_attempt(
        self,
        character: str,
        character_type: str,
        user_drawing_path: str,
        reference_image_path: str,
        processed_image_path: str,
        final_score: float,
        evaluation_results: Dict[str, Any],
        user_context: Optional[Dict[str, Any]] = None,
        skeleton_image_path: Optional[str] = None
    ) -> str:
        """
        Store a complete drawing attempt with all evaluation data.
        
        Args:
            character: Target character (e.g., "a", "ka", "ngo")
            character_type: "vowel", "consonant", or "ligature"
            user_drawing_path: File path to user's drawing
            reference_image_path: File path to reference image
            processed_image_path: File path to processed image
            final_score: Final evaluation score (0-100)
            evaluation_results: Dict with ssim_score, contour_score, skeleton_score, confidence
            user_context: Optional user/session context
            skeleton_image_path: Optional skeleton analysis image path
            
        Returns:
            Drawing attempt ID
        """
        await self.ensure_connected()
        
        try:
            # Determine quality label and correctness
            is_correct = final_score >= 70.0
            if final_score >= 90:
                quality_label = "excellent"
            elif final_score >= 70:
                quality_label = "good"
            elif final_score >= 40:
                quality_label = "poor"
            else:
                quality_label = "invalid"
            
            # Extract user context
            user_id = user_context.get("user_id") if user_context else None
            session_id = user_context.get("session_id") if user_context else None
            device_info = user_context.get("device_info") if user_context else None
            drawing_time_ms = user_context.get("drawing_time_ms") if user_context else None
            
            # Create drawing attempt record
            attempt = await self.prisma.drawingattempt.create(
                data={
                    "character": character,
                    "characterType": character_type,
                    "userDrawing": user_drawing_path,
                    "referenceImage": reference_image_path,
                    "processedImage": processed_image_path,
                    "skeletonImage": skeleton_image_path,
                    "finalScore": final_score,
                    "ssimScore": evaluation_results.get("ssim_score"),
                    "contourScore": evaluation_results.get("contour_score"),
                    "skeletonScore": evaluation_results.get("skeleton_score"),
                    "confidenceScore": evaluation_results.get("confidence_score"),
                    "isCorrect": is_correct,
                    "qualityLabel": quality_label,
                    "userId": user_id,
                    "sessionId": session_id,
                    "deviceInfo": device_info,
                    "drawingTimeMs": drawing_time_ms,
                    "evaluationTimeMs": evaluation_results.get("evaluation_time_ms"),
                    "isValidSubmission": True,
                    "validationFlags": []
                }
            )
            
            logger.info(f"✅ Stored drawing attempt {attempt.id} for character '{character}' (score: {final_score})")
            return attempt.id
            
        except Exception as e:
            logger.error(f"❌ Failed to store drawing attempt: {e}")
            raise
    
    async def store_feature_vector(
        self,
        drawing_attempt_id: str,
        geometric_features: Dict[str, float],
        topological_features: Dict[str, int],
        shape_features: Dict[str, float],
        complete_feature_vector: List[float]
    ) -> str:
        """Store extracted feature vector for ML training."""
        await self.ensure_connected()
        
        try:
            feature_vector = await self.prisma.featurevector.create(
                data={
                    "drawingAttemptId": drawing_attempt_id,
                    "contourArea": geometric_features.get("contour_area", 0.0),
                    "aspectRatio": geometric_features.get("aspect_ratio", 1.0),
                    "boundingBoxWidth": geometric_features.get("bbox_width", 0.0),
                    "boundingBoxHeight": geometric_features.get("bbox_height", 0.0),
                    "perimeter": geometric_features.get("perimeter", 0.0),
                    "solidity": geometric_features.get("solidity", 0.0),
                    "extent": geometric_features.get("extent", 0.0),
                    "strokeCount": topological_features.get("stroke_count", 0),
                    "loopCount": topological_features.get("loop_count", 0),
                    "endpointCount": topological_features.get("endpoint_count", 0),
                    "intersectionCount": topological_features.get("intersection_count", 0),
                    "complexityScore": shape_features.get("complexity_score", 0.0),
                    "symmetryScore": shape_features.get("symmetry_score"),
                    "featureVector": complete_feature_vector
                }
            )
            
            logger.debug(f"✅ Stored feature vector for attempt {drawing_attempt_id}")
            return feature_vector.id
            
        except Exception as e:
            logger.error(f"❌ Failed to store feature vector: {e}")
            raise
    
    async def store_feedback_record(
        self,
        drawing_attempt_id: str,
        feedback_data: Dict[str, Any]
    ) -> str:
        """Store detailed feedback and analysis."""
        await self.ensure_connected()
        
        try:
            feedback = await self.prisma.feedbackrecord.create(
                data={
                    "drawingAttemptId": drawing_attempt_id,
                    "overallFeedback": feedback_data.get("overall_feedback", ""),
                    "encouragement": feedback_data.get("encouragement"),
                    "missingStrokes": feedback_data.get("missing_strokes", []),
                    "proportionIssues": feedback_data.get("proportion_issues", []),
                    "positioningIssues": feedback_data.get("positioning_issues", []),
                    "topologyIssues": feedback_data.get("topology_issues", []),
                    "suggestions": feedback_data.get("suggestions", []),
                    "practiceAreas": feedback_data.get("practice_areas", []),
                    "feedbackType": feedback_data.get("feedback_type", "constructive"),
                    "priority": feedback_data.get("priority", "medium")
                }
            )
            
            logger.debug(f"✅ Stored feedback record for attempt {drawing_attempt_id}")
            return feedback.id
            
        except Exception as e:
            logger.error(f"❌ Failed to store feedback record: {e}")
            raise
    
    # ─── Character Profile Operations ────────────────────────────────────────
    
    async def get_character_profile(self, character: str) -> Optional[CharacterProfile]:
        """Get character profile for score calibration."""
        await self.ensure_connected()
        
        try:
            profile = await self.prisma.characterprofile.find_unique(
                where={"character": character}
            )
            return profile
        except Exception as e:
            logger.error(f"❌ Failed to get character profile for '{character}': {e}")
            return None
    
    async def update_character_statistics(
        self,
        character: str,
        new_score: float
    ):
        """Update character statistics with new attempt data."""
        await self.ensure_connected()
        
        try:
            # Get current profile or create if doesn't exist
            profile = await self.prisma.characterprofile.find_unique(
                where={"character": character}
            )
            
            if not profile:
                # Create new profile with default values
                character_type = self._determine_character_type(character)
                difficulty = self._estimate_difficulty(character)
                
                await self.prisma.characterprofile.create(
                    data={
                        "character": character,
                        "characterType": character_type,
                        "difficultyLevel": difficulty,
                        "strokeComplexity": difficulty,
                        "hasLoops": self._has_loops(character),
                        "hasCurves": self._has_curves(character),
                        "averageScore": new_score,
                        "successRate": 100.0 if new_score >= 70 else 0.0,
                        "totalAttempts": 1
                    }
                )
            else:
                # Update existing profile statistics
                total_attempts = profile.totalAttempts + 1
                current_total = (profile.averageScore or 0) * profile.totalAttempts
                new_average = (current_total + new_score) / total_attempts
                
                # Calculate success rate
                current_successes = (profile.successRate or 0) * profile.totalAttempts / 100
                new_successes = current_successes + (1 if new_score >= 70 else 0)
                new_success_rate = (new_successes / total_attempts) * 100
                
                await self.prisma.characterprofile.update(
                    where={"character": character},
                    data={
                        "averageScore": new_average,
                        "successRate": new_success_rate,
                        "totalAttempts": total_attempts
                    }
                )
            
            logger.debug(f"✅ Updated character statistics for '{character}'")
            
        except Exception as e:
            logger.error(f"❌ Failed to update character statistics: {e}")
    
    # ─── Query Operations for ML Training ────────────────────────────────────
    
    async def get_training_data(
        self,
        character_types: Optional[List[str]] = None,
        quality_labels: Optional[List[str]] = None,
        min_score: Optional[float] = None,
        max_score: Optional[float] = None,
        limit: Optional[int] = None
    ) -> List[DrawingAttempt]:
        """Get filtered training data for ML model training."""
        await self.ensure_connected()
        
        try:
            where_conditions = {}
            
            if character_types:
                where_conditions["characterType"] = {"in": character_types}
            
            if quality_labels:
                where_conditions["qualityLabel"] = {"in": quality_labels}
            
            if min_score is not None:
                where_conditions["finalScore"] = {"gte": min_score}
            
            if max_score is not None:
                if "finalScore" in where_conditions:
                    where_conditions["finalScore"]["lte"] = max_score
                else:
                    where_conditions["finalScore"] = {"lte": max_score}
            
            # Only include valid submissions
            where_conditions["isValidSubmission"] = True
            
            attempts = await self.prisma.drawingattempt.find_many(
                where=where_conditions,
                include={
                    "featureVector": True,
                    "feedbackRecord": True
                },
                take=limit,
                order_by={"submittedAt": "desc"}
            )
            
            logger.info(f"✅ Retrieved {len(attempts)} training samples")
            return attempts
            
        except Exception as e:
            logger.error(f"❌ Failed to get training data: {e}")
            return []
    
    async def get_dataset_statistics(self) -> Dict[str, Any]:
        """Get comprehensive dataset statistics for admin dashboard."""
        await self.ensure_connected()
        
        try:
            # Total counts
            total_attempts = await self.prisma.drawingattempt.count()
            valid_attempts = await self.prisma.drawingattempt.count(
                where={"isValidSubmission": True}
            )
            
            # Quality distribution
            quality_stats = {}
            for quality in ["excellent", "good", "poor", "invalid"]:
                count = await self.prisma.drawingattempt.count(
                    where={"qualityLabel": quality, "isValidSubmission": True}
                )
                quality_stats[quality] = count
            
            # Character type distribution
            type_stats = {}
            for char_type in ["vowel", "consonant", "ligature"]:
                count = await self.prisma.drawingattempt.count(
                    where={"characterType": char_type, "isValidSubmission": True}
                )
                type_stats[char_type] = count
            
            # Score statistics
            score_stats = await self.prisma.drawingattempt.aggregate(
                _avg={"finalScore": True},
                _min={"finalScore": True},
                _max={"finalScore": True},
                where={"isValidSubmission": True}
            )
            
            return {
                "total_attempts": total_attempts,
                "valid_attempts": valid_attempts,
                "invalid_attempts": total_attempts - valid_attempts,
                "quality_distribution": quality_stats,
                "character_type_distribution": type_stats,
                "score_statistics": {
                    "average": score_stats._avg.finalScore if score_stats._avg.finalScore else 0,
                    "minimum": score_stats._min.finalScore if score_stats._min.finalScore else 0,
                    "maximum": score_stats._max.finalScore if score_stats._max.finalScore else 0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get dataset statistics: {e}")
            return {}
    
    # ─── Performance Tracking ────────────────────────────────────────────────
    
    async def record_performance_metric(
        self,
        metric_type: str,
        component: str,
        value: float,
        unit: str,
        character_type: Optional[str] = None
    ):
        """Record system performance metrics."""
        await self.ensure_connected()
        
        try:
            await self.prisma.performancemetric.create(
                data={
                    "metricType": metric_type,
                    "component": component,
                    "value": value,
                    "unit": unit,
                    "characterType": character_type
                }
            )
        except Exception as e:
            logger.error(f"❌ Failed to record performance metric: {e}")
    
    # ─── Admin Operations ─────────────────────────────────────────────────────
    
    async def log_admin_action(
        self,
        admin_user_id: str,
        action: str,
        target_type: str,
        target_id: Optional[str] = None,
        old_value: Optional[Dict] = None,
        new_value: Optional[Dict] = None,
        justification: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log admin actions for audit trail."""
        await self.ensure_connected()
        
        try:
            await self.prisma.adminauditlog.create(
                data={
                    "adminUserId": admin_user_id,
                    "action": action,
                    "targetType": target_type,
                    "targetId": target_id,
                    "oldValue": old_value,
                    "newValue": new_value,
                    "justification": justification,
                    "ipAddress": ip_address,
                    "userAgent": user_agent
                }
            )
        except Exception as e:
            logger.error(f"❌ Failed to log admin action: {e}")
    
    # ─── Helper Methods ───────────────────────────────────────────────────────
    
    def _determine_character_type(self, character: str) -> str:
        """Determine character type based on character."""
        vowels = ["a", "e", "i", "o", "u"]
        if character.lower() in vowels:
            return "vowel"
        elif len(character) > 2:
            return "ligature"
        else:
            return "consonant"
    
    def _estimate_difficulty(self, character: str) -> float:
        """Estimate character difficulty (1.0 to 5.0)."""
        # Simple heuristic based on character length and complexity
        base_difficulty = min(len(character), 5)
        return float(base_difficulty)
    
    def _has_loops(self, character: str) -> bool:
        """Estimate if character has loops (placeholder logic)."""
        loop_chars = ["o", "p", "b", "d", "q", "a"]
        return any(c in character.lower() for c in loop_chars)
    
    def _has_curves(self, character: str) -> bool:
        """Estimate if character has curves (placeholder logic)."""
        curve_chars = ["o", "c", "s", "u", "n", "m"]
        return any(c in character.lower() for c in curve_chars)

# Global database service instance
db_service = DatabaseService()