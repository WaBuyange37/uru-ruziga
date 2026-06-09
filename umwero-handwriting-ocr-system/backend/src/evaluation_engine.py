"""
Main evaluation engine that orchestrates the complete handwriting evaluation pipeline.
Integrates font rendering, image processing, comparison algorithms, feedback generation,
and data collection for OCR training datasets.
"""

import logging
import time
from typing import Any, Optional, List, Tuple
from dataclasses import dataclass
import asyncio

from .font_renderer import FontRenderingService, ReferenceData
from .image_processor import ImageProcessingPipeline, ProcessedImage, ProcessingConfig
from .comparison_algorithm import HybridComparisonAlgorithm, ComparisonResult, ComparisonWeights
from .feedback_generator import FeedbackGenerator, FeedbackReport, FeedbackItem, FeedbackConfig
from .feature_extractor import FeatureExtractor
from .database_service import db_service
from .data_collector import data_collector

logger = logging.getLogger(__name__)


@dataclass
class EvaluationResult:
    """Complete evaluation result"""
    score: float
    confidence: float
    feedback: List[str]
    detailed_feedback: List[FeedbackItem]
    processing_time_ms: int
    
    # Technical details
    comparison_result: ComparisonResult
    reference_data: Optional[ReferenceData]
    processing_metadata: dict


class EvaluationEngine:
    """
    Main evaluation engine that orchestrates the complete handwriting evaluation pipeline.
    This is the primary interface for evaluating handwriting samples.
    """
    
    def __init__(self, 
                 font_renderer: Optional[FontRenderingService] = None,
                 processing_config: Optional[ProcessingConfig] = None,
                 comparison_weights: Optional[ComparisonWeights] = None,
                 feedback_config: Optional[FeedbackConfig] = None,
                 cache_service=None,
                 performance_optimizer=None,
                 collect_training_data: bool = True):
        
        # Initialize components
        self.font_renderer = font_renderer
        self.cache_service = cache_service
        self.performance_optimizer = performance_optimizer
        self.collect_training_data = collect_training_data
        
        self.image_processor = ImageProcessingPipeline(processing_config or ProcessingConfig())
        self.comparison_algorithm = HybridComparisonAlgorithm(comparison_weights or ComparisonWeights())
        self.feedback_generator = FeedbackGenerator(feedback_config or FeedbackConfig())
        self.feature_extractor = FeatureExtractor()
        
        # Cache for reference data (fallback when cache service is not available)
        self.reference_cache = {}
        
        # Connect cache service to font renderer if both are available
        if self.font_renderer and self.cache_service:
            self.font_renderer.set_cache_service(self.cache_service)
        
        logger.info("EvaluationEngine initialized successfully")
        
        # Log component status
        logger.info(f"Font renderer available: {self.font_renderer is not None}")
        logger.info(f"Cache service available: {self.cache_service is not None}")
        logger.info(f"Performance optimizer available: {self.performance_optimizer is not None}")
        logger.info(f"Training data collection: {self.collect_training_data}")
        logger.info(f"Image processor: {type(self.image_processor).__name__}")
        logger.info(f"Comparison algorithm: {type(self.comparison_algorithm).__name__}")
        logger.info(f"Feedback generator: {type(self.feedback_generator).__name__}")
        logger.info(f"Feature extractor: {type(self.feature_extractor).__name__}")
    
    async def evaluate_handwriting(self, 
                                 character: str,
                                 user_image_data: str,
                                 reference_image_data: Optional[str] = None,
                                 session_id: Optional[str] = None,
                                 user_id: Optional[str] = None,
                                 user_strokes: Optional[List[dict[str, Any]]] = None,
                                 expected_stroke_count: Optional[int] = None) -> EvaluationResult:
        """
        Evaluate user handwriting against reference character.
        
        Args:
            character: Character being evaluated
            user_image_data: Base64 encoded user drawing
            session_id: Optional session identifier
            user_id: Optional user identifier
            
        Returns:
            EvaluationResult with score, feedback, and detailed analysis
        """
        start_time = time.time()
        
        try:
            logger.info(f"Starting evaluation for character '{character}' (session: {session_id})")
            
            # Step 1: Get or generate reference image
            reference_data = await self._get_reference_data(character)
            
            # Step 2: Process user image
            user_processed = self._process_user_image(user_image_data)
            
            # Step 3: Process reference image from Supabase when provided,
            # otherwise use the freshly generated/cached font reference.
            if reference_image_data:
                logger.info("Reference image loaded: yes, source=character-images")
                reference_processed = self.image_processor.preprocess_image(reference_image_data)
                logger.info(
                    "Reference preprocessing succeeded: bbox=%s foreground_pixels=%d",
                    reference_processed.bounding_box,
                    int((reference_processed.normalized > 0).sum()),
                )
            else:
                logger.info("Reference image loaded: no, using font renderer fallback")
                reference_processed = self._process_reference_image(reference_data, character)
            
            # Step 4: Compare images using hybrid algorithm
            comparison_result = self.comparison_algorithm.compare_images(
                reference_processed, user_processed
            )
            comparison_result = self.comparison_algorithm.apply_stroke_evidence(
                comparison_result,
                user_strokes=user_strokes,
                expected_stroke_count=expected_stroke_count,
            )
            logger.info(
                "Score components: ssim=%.3f contour=%.3f skeleton=%.3f "
                "direction=%.3f alignment=%.3f final=%.1f confidence=%.3f",
                comparison_result.ssim_score,
                comparison_result.contour_score,
                comparison_result.skeleton_score,
                comparison_result.stroke_direction_score,
                comparison_result.shape_alignment_score,
                comparison_result.final_score,
                comparison_result.confidence,
            )
            
            # Step 5: Generate feedback
            feedback_report = self.feedback_generator.generate_feedback(
                comparison_result,
                (reference_processed, user_processed),
                character
            )
            
            # Step 6: Extract features for ML training
            feature_vector = self.feature_extractor.extract_all_features(user_processed.normalized)
            
            # Step 7: Calculate processing time
            processing_time = int((time.time() - start_time) * 1000)
            
            # Step 8: Collect data for OCR training (if enabled)
            collection_id = None
            if self.collect_training_data:
                try:
                    collection_id = await self._collect_training_data(
                        character=character,
                        user_image_data=user_image_data,
                        reference_data=reference_data,
                        user_processed=user_processed,
                        reference_processed=reference_processed,
                        comparison_result=comparison_result,
                        feedback_report=feedback_report,
                        feature_vector=feature_vector,
                        session_id=session_id,
                        user_id=user_id,
                        processing_time=processing_time
                    )
                except Exception as e:
                    logger.error(f"Data collection failed: {e}")
                    # Continue with evaluation even if data collection fails
            
            # Step 9: Record performance metrics
            if self.performance_optimizer and hasattr(self.performance_optimizer, "record_evaluation_metrics"):
                try:
                    await self.performance_optimizer.record_evaluation_metrics(
                        character=character,
                        processing_time_ms=processing_time,
                        score=comparison_result.final_score,
                        confidence=comparison_result.confidence
                    )
                except Exception as e:
                    logger.error(f"Performance metrics recording failed: {e}")
            
            # Step 10: Create final result
            result = EvaluationResult(
                score=comparison_result.final_score,
                confidence=comparison_result.confidence,
                feedback=feedback_report.primary_feedback,
                detailed_feedback=feedback_report.detailed_feedback,
                processing_time_ms=processing_time,
                comparison_result=comparison_result,
                reference_data=reference_data,
                processing_metadata={
                    'character': character,
                    'session_id': session_id,
                    'user_id': user_id,
                    'processing_time_ms': processing_time,
                    'reference_cached': character in self.reference_cache,
                    'algorithm_version': '1.0.0',
                    'collection_id': collection_id,
                    'feature_extraction_success': feature_vector.get('extraction_success', False)
                }
            )
            
            logger.info(f"Evaluation completed: score={result.score:.1f}, "
                       f"confidence={result.confidence:.3f}, time={processing_time}ms")
            
            return result
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(f"Evaluation failed for character '{character}': {e}")
            
            # Return error result
            return EvaluationResult(
                score=0.0,
                confidence=0.0,
                feedback=[f"Evaluation failed: {str(e)}"],
                detailed_feedback=[],
                processing_time_ms=processing_time,
                comparison_result=None,
                reference_data=None,
                processing_metadata={
                    'error': str(e),
                    'character': character,
                    'processing_time_ms': processing_time
                }
            )
    
    async def _get_reference_data(self, character: str) -> Optional[ReferenceData]:
        """Get reference data for character, using cache service if available"""
        # Try cache service first
        if self.cache_service:
            try:
                cached_data = await self.cache_service.get_reference_data(character)
                if cached_data:
                    logger.debug(f"Using cached reference from cache service for character '{character}'")
                    return cached_data
            except Exception as e:
                logger.warning(f"Cache service lookup failed for '{character}': {e}")
        
        # Check local cache as fallback
        if character in self.reference_cache:
            logger.debug(f"Using local cached reference for character '{character}'")
            return self.reference_cache[character]
        
        # Generate new reference if font renderer is available
        if self.font_renderer:
            try:
                logger.debug(f"Generating reference for character '{character}'")
                
                # Use cached rendering if available
                if hasattr(self.font_renderer, 'render_character_cached'):
                    reference_image = await self.font_renderer.render_character_cached(character, 256)
                else:
                    reference_image = self.font_renderer.render_character(character, 256)
                
                # Get metrics
                metrics = self.font_renderer.get_character_metrics(character)
                
                # Create reference data
                reference_data = ReferenceData(
                    image=reference_image,
                    processed_image=None,  # Will be processed later
                    metrics=metrics,
                    rendering_engine=self.font_renderer.selected_engine.value,
                    quality_score=1.0  # Assume high quality for font-rendered images
                )
                
                # Cache the result in cache service if available
                if self.cache_service:
                    try:
                        await self.cache_service.set_reference_data(character, reference_data)
                        logger.debug(f"Reference cached in cache service for character '{character}'")
                    except Exception as e:
                        logger.warning(f"Failed to cache reference in cache service: {e}")
                        # Fallback to local cache
                        self.reference_cache[character] = reference_data
                else:
                    # Use local cache
                    self.reference_cache[character] = reference_data
                
                logger.debug(f"Reference generated and cached for character '{character}'")
                return reference_data
                
            except Exception as e:
                logger.error(f"Failed to generate reference for character '{character}': {e}")
                return None
        else:
            logger.warning("No font renderer available, using fallback reference")
            return None
    
    def _process_user_image(self, image_data: str) -> ProcessedImage:
        """Process user drawing image"""
        try:
            logger.info("User image loaded: yes")
            processed = self.image_processor.preprocess_image(image_data)
            logger.info(
                "User preprocessing succeeded: bbox=%s foreground_pixels=%d",
                processed.bounding_box,
                int((processed.normalized > 0).sum()),
            )
            return processed
            
        except Exception as e:
            logger.error(f"Failed to process user image: {e}")
            raise ValueError(f"Invalid user image: {str(e)}")
    
    def _process_reference_image(self, reference_data: Optional[ReferenceData], character: str) -> ProcessedImage:
        """Process reference image"""
        if reference_data and reference_data.image:
            try:
                logger.debug(f"Processing reference image for character '{character}'")
                processed = self.image_processor.preprocess_image(reference_data.image)
                logger.debug(f"Reference image processed: bbox={processed.bounding_box}")
                return processed
                
            except Exception as e:
                logger.error(f"Failed to process reference image: {e}")
                # Fall back to creating a synthetic reference
                return self._create_fallback_reference()
        else:
            logger.warning("No reference data available, creating fallback")
            return self._create_fallback_reference()
    
    def _create_fallback_reference(self) -> ProcessedImage:
        """Create a fallback reference image when font rendering is not available"""
        import numpy as np
        
        # Create a simple square as fallback reference
        fallback_image = np.zeros((256, 256), dtype=np.uint8)
        # Draw a simple rectangle as placeholder
        fallback_image[64:192, 64:192] = 255
        
        # Process the fallback image
        processed = self.image_processor.preprocess_image(fallback_image)
        
        logger.warning("Using fallback reference image")
        return processed
    
    def get_supported_characters(self) -> List[str]:
        """Get list of supported characters"""
        if self.font_renderer:
            try:
                quality_report = self.font_renderer.validate_font_quality()
                return quality_report.supported_characters
            except Exception as e:
                logger.error(f"Failed to get supported characters: {e}")
                return []
        else:
            # Return basic ASCII letters as fallback
            return list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    
    def get_system_status(self) -> dict:
        """Get system status information"""
        cache_info = {}
        if self.cache_service:
            try:
                cache_info = asyncio.run(self.cache_service.get_cache_stats())
            except Exception as e:
                cache_info = {'error': str(e)}
        
        return {
            'font_renderer_available': self.font_renderer is not None,
            'cache_service_available': self.cache_service is not None,
            'local_cached_references': len(self.reference_cache),
            'cache_service_stats': cache_info,
            'supported_characters': len(self.get_supported_characters()),
            'components': {
                'image_processor': type(self.image_processor).__name__,
                'comparison_algorithm': type(self.comparison_algorithm).__name__,
                'feedback_generator': type(self.feedback_generator).__name__
            }
        }
    
    async def clear_cache(self):
        """Clear all caches"""
        # Clear cache service
        if self.cache_service:
            try:
                await self.cache_service.clear_all_cache()
                logger.info("Cache service cleared")
            except Exception as e:
                logger.error(f"Failed to clear cache service: {e}")
        
        # Clear local cache
        self.reference_cache.clear()
        logger.info("Local reference cache cleared")
    
    async def precompute_references(self, characters: List[str]) -> dict:
        """Precompute references for multiple characters using cache service"""
        if not self.font_renderer:
            logger.warning("Cannot precompute references without font renderer")
            return {}
        
        # Use cache service warm_cache if available
        if self.cache_service:
            try:
                results = await self.cache_service.warm_cache(characters, self.font_renderer)
                logger.info(f"Cache service warmed for {sum(results.values())}/{len(characters)} characters")
                return results
            except Exception as e:
                logger.error(f"Cache service warm_cache failed: {e}")
                # Fall back to local precomputation
        
        # Fallback to local precomputation
        results = {}
        for character in characters:
            try:
                # This will cache the reference locally
                await self._get_reference_data(character)
                results[character] = True
                logger.debug(f"Precomputed reference for '{character}'")
                
            except Exception as e:
                logger.error(f"Failed to precompute reference for '{character}': {e}")
                results[character] = False
        
        logger.info(f"Precomputed references for {sum(results.values())}/{len(characters)} characters")
        return results
    
    async def _collect_training_data(
        self,
        character: str,
        user_image_data: str,
        reference_data: Optional[ReferenceData],
        user_processed: ProcessedImage,
        reference_processed: ProcessedImage,
        comparison_result: ComparisonResult,
        feedback_report: FeedbackReport,
        feature_vector: dict,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        processing_time: int = 0
    ) -> Optional[str]:
        """
        Collect comprehensive training data for OCR dataset.
        
        Returns:
            Collection ID if successful, None if failed
        """
        try:
            # Determine character type
            character_type = self._determine_character_type(character)
            
            # Convert images to base64 for storage
            import cv2
            import base64
            
            # Convert processed images back to base64
            def image_to_base64(image_array):
                _, buffer = cv2.imencode('.png', image_array)
                return base64.b64encode(buffer).decode('utf-8')
            
            processed_user_b64 = image_to_base64(user_processed.normalized)
            processed_ref_b64 = image_to_base64(reference_processed.normalized)
            
            # Get skeleton image if available
            skeleton_b64 = None
            if user_processed.skeleton is not None:
                skeleton_b64 = image_to_base64(user_processed.skeleton)
            
            # Prepare evaluation results
            evaluation_results = {
                "final_score": comparison_result.final_score,
                "ssim_score": comparison_result.ssim_score,
                "contour_score": comparison_result.contour_score,
                "skeleton_score": comparison_result.skeleton_score,
                "confidence_score": comparison_result.confidence,
                "evaluation_time_ms": processing_time
            }
            
            # Prepare feedback data
            feedback_data = {
                "overall_feedback": feedback_report.summary,
                "encouragement": feedback_report.encouragement,
                "missing_strokes": [item.message for item in feedback_report.detailed_feedback if item.category == "missing_strokes"],
                "proportion_issues": [item.message for item in feedback_report.detailed_feedback if item.category == "proportions"],
                "positioning_issues": [item.message for item in feedback_report.detailed_feedback if item.category == "positioning"],
                "topology_issues": [item.message for item in feedback_report.detailed_feedback if item.category == "topology"],
                "suggestions": [item.suggestion for item in feedback_report.detailed_feedback if item.suggestion],
                "practice_areas": feedback_report.practice_areas,
                "feedback_type": "constructive" if comparison_result.final_score >= 70 else "corrective",
                "priority": "high" if comparison_result.final_score < 40 else "medium"
            }
            
            # Prepare user context
            user_context = {
                "user_id": user_id,
                "session_id": session_id,
                "drawing_time_ms": None,  # Not available in current implementation
                "device_info": None       # Not available in current implementation
            }
            
            # Collect the data
            collection_id = await data_collector.collect_evaluation_data(
                character=character,
                character_type=character_type,
                user_drawing_base64=user_image_data,
                reference_image_base64=processed_ref_b64,  # Use processed reference
                processed_image_base64=processed_user_b64,
                evaluation_results=evaluation_results,
                feedback_data=feedback_data,
                feature_vector=feature_vector,
                user_context=user_context,
                skeleton_image_base64=skeleton_b64
            )
            
            logger.debug(f"Training data collected: {collection_id}")
            return collection_id
            
        except Exception as e:
            logger.error(f"Failed to collect training data: {e}")
            return None
    
    def _determine_character_type(self, character: str) -> str:
        """Determine character type based on character."""
        vowels = ["a", "e", "i", "o", "u"]
        if character.lower() in vowels:
            return "vowel"
        elif len(character) > 2:
            return "ligature"
        else:
            return "consonant"


# Utility functions for testing and debugging
def create_evaluation_engine(font_path: Optional[str] = None, cache_service=None) -> EvaluationEngine:
    """Create evaluation engine with optional font path and cache service"""
    font_renderer = None
    
    if font_path:
        try:
            from .font_renderer import FontRenderingService
            font_renderer = FontRenderingService(font_path, cache_service=cache_service)
            logger.info(f"Font renderer created with font: {font_path}")
        except Exception as e:
            logger.error(f"Failed to create font renderer: {e}")
    
    return EvaluationEngine(font_renderer, cache_service=cache_service)


# Example usage and testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Create evaluation engine without font (for testing)
    engine = EvaluationEngine()
    
    print(f"Evaluation engine created")
    print(f"System status: {engine.get_system_status()}")
    print(f"Supported characters: {engine.get_supported_characters()[:10]}...")  # First 10
