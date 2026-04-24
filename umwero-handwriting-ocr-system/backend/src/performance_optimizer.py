"""
Performance optimization module for the handwriting evaluation system.
Provides caching, precomputation, and performance monitoring capabilities.
"""

import asyncio
import logging
import time
import hashlib
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import numpy as np
from PIL import Image

from .cache_service import CacheService, CacheWarmer
from .font_renderer import FontRenderingService, ReferenceData
from .image_processor import ImageProcessingPipeline
from .comparison_algorithm import HybridComparisonAlgorithm


@dataclass
class PerformanceMetrics:
    """Performance metrics for monitoring"""
    total_requests: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    avg_response_time: float = 0.0
    total_response_time: float = 0.0
    error_count: int = 0


class PerformanceOptimizer:
    """
    Performance optimization service that coordinates caching, precomputation,
    and performance monitoring for the handwriting evaluation system.
    """
    
    def __init__(self, 
                 font_renderer: FontRenderingService,
                 image_processor: ImageProcessingPipeline,
                 comparison_algorithm: HybridComparisonAlgorithm,
                 cache_service: Optional[CacheService] = None):
        
        self.font_renderer = font_renderer
        self.image_processor = image_processor
        self.comparison_algorithm = comparison_algorithm
        self.cache_service = cache_service or CacheService()
        self.metrics = PerformanceMetrics()
        
        # Attach cache service to font renderer
        self.font_renderer.set_cache_service(self.cache_service)
        
        # Performance monitoring
        self._request_times: List[float] = []
        self._max_request_history = 1000
        
        logging.info("PerformanceOptimizer initialized")
    
    async def initialize(self):
        """Initialize the performance optimizer"""
        # Test cache connection
        cache_connected = await self.cache_service.ping()
        if cache_connected:
            logging.info("Cache service connected successfully")
        else:
            logging.warning("Cache service not available - using fallback")
        
        # Warm cache with common characters
        await self._warm_common_cache()
    
    async def _warm_common_cache(self):
        """Warm cache with commonly used characters"""
        try:
            await CacheWarmer.warm_common_characters(
                self.cache_service, 
                self.font_renderer
            )
            logging.info("Cache warming completed for common characters")
        except Exception as e:
            logging.error(f"Cache warming failed: {e}")
    
    def _generate_image_hash(self, image_data: str) -> str:
        """Generate hash for image data for caching"""
        return hashlib.md5(image_data.encode()).hexdigest()
    
    async def evaluate_character_optimized(self, 
                                         character: str, 
                                         user_image_data: str) -> Dict[str, Any]:
        """
        Optimized character evaluation with caching and performance monitoring.
        
        Args:
            character: Target character to evaluate
            user_image_data: Base64 encoded user drawing
            
        Returns:
            Evaluation result with score, feedback, and performance metrics
        """
        start_time = time.time()
        self.metrics.total_requests += 1
        
        try:
            # Generate cache key for this evaluation
            image_hash = self._generate_image_hash(user_image_data)
            
            # Try to get cached result first
            cached_result = await self.cache_service.get_evaluation_result(
                character, image_hash
            )
            
            if cached_result:
                self.metrics.cache_hits += 1
                logging.debug(f"Using cached evaluation result for '{character}'")
                
                # Update performance metrics
                response_time = time.time() - start_time
                self._update_performance_metrics(response_time)
                
                return cached_result
            
            # Cache miss - perform full evaluation
            self.metrics.cache_misses += 1
            result = await self._perform_full_evaluation(character, user_image_data)
            
            # Cache the result
            await self.cache_service.set_evaluation_result(
                character, image_hash, result
            )
            
            # Update performance metrics
            response_time = time.time() - start_time
            self._update_performance_metrics(response_time)
            
            return result
            
        except Exception as e:
            self.metrics.error_count += 1
            logging.error(f"Evaluation failed for '{character}': {e}")
            raise
    
    async def _perform_full_evaluation(self, 
                                     character: str, 
                                     user_image_data: str) -> Dict[str, Any]:
        """Perform full evaluation without caching"""
        
        # Get or generate reference data (with caching)
        reference_data = await self._get_reference_data_cached(character)
        
        # Process user image
        user_image = self.image_processor.decode_base64_image(user_image_data)
        processed_user = self.image_processor.process_image(user_image)
        
        # Perform comparison
        comparison_result = self.comparison_algorithm.compare_images(
            reference_data.processed_image,
            processed_user,
            character
        )
        
        # Generate feedback (this could also be cached in the future)
        feedback = self._generate_feedback(comparison_result, character)
        
        return {
            'character': character,
            'score': comparison_result['final_score'],
            'passed': comparison_result['final_score'] >= 70,
            'feedback': feedback,
            'metrics': {
                'ssim_score': comparison_result['ssim_score'],
                'contour_score': comparison_result['contour_score'],
                'skeleton_score': comparison_result['skeleton_score']
            },
            'reference_quality': reference_data.quality_score
        }
    
    async def _get_reference_data_cached(self, character: str) -> ReferenceData:
        """Get reference data with caching optimization"""
        # Try cache first
        cached_ref = await self.cache_service.get_reference_data(character)
        if cached_ref:
            return cached_ref
        
        # Generate new reference data
        img = self.font_renderer.render_character(character, 256)
        metrics = self.font_renderer.get_character_metrics(character)
        quality = self.font_renderer._assess_rendering_quality(img)
        processed = np.array(img, dtype=np.float32) / 255.0
        
        reference_data = ReferenceData(
            image=img,
            processed_image=processed,
            metrics=metrics,
            rendering_engine=self.font_renderer.selected_engine.value,
            quality_score=quality
        )
        
        # Cache for future use
        await self.cache_service.set_reference_data(character, reference_data)
        
        return reference_data
    
    def _generate_feedback(self, comparison_result: Dict[str, Any], character: str) -> List[str]:
        """Generate feedback based on comparison results"""
        feedback = []
        score = comparison_result['final_score']
        
        if score >= 90:
            feedback.append("Excellent! Your character formation is very accurate.")
        elif score >= 70:
            feedback.append("Good work! Your character is recognizable with minor improvements needed.")
        else:
            feedback.append("Keep practicing! Your character needs significant improvement.")
        
        # Add specific feedback based on individual metrics
        if comparison_result['ssim_score'] < 0.6:
            feedback.append("Focus on the overall shape and structure of the character.")
        
        if comparison_result['contour_score'] < 0.6:
            feedback.append("Pay attention to the outline and proportions of your strokes.")
        
        if comparison_result['skeleton_score'] < 0.6:
            feedback.append("Work on connecting your strokes properly and maintaining character topology.")
        
        return feedback
    
    def _update_performance_metrics(self, response_time: float):
        """Update performance metrics"""
        self._request_times.append(response_time)
        
        # Keep only recent requests for moving average
        if len(self._request_times) > self._max_request_history:
            self._request_times = self._request_times[-self._max_request_history:]
        
        # Update metrics
        self.metrics.total_response_time += response_time
        self.metrics.avg_response_time = (
            self.metrics.total_response_time / self.metrics.total_requests
        )
    
    async def precompute_character_set(self, characters: List[str]):
        """Precompute and cache reference data for a set of characters"""
        logging.info(f"Precomputing reference data for {len(characters)} characters...")
        
        tasks = []
        for char in characters:
            task = self._precompute_character(char)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = sum(1 for r in results if not isinstance(r, Exception))
        logging.info(f"Precomputation completed: {success_count}/{len(characters)} successful")
    
    async def _precompute_character(self, character: str):
        """Precompute reference data for a single character"""
        try:
            # Check if already cached
            cached = await self.cache_service.get_reference_data(character)
            if cached:
                return
            
            # Generate and cache reference data
            await self._get_reference_data_cached(character)
            
            # Also precompute feature vector
            features = await self._extract_character_features(character)
            await self.cache_service.set_feature_vector(character, features)
            
        except Exception as e:
            logging.error(f"Failed to precompute character '{character}': {e}")
            raise
    
    async def _extract_character_features(self, character: str) -> Dict[str, float]:
        """Extract and return character features for caching"""
        ref_data = await self._get_reference_data_cached(character)
        
        # Extract basic geometric features
        img_array = np.array(ref_data.image)
        non_zero_pixels = np.sum(img_array > 0)
        total_pixels = img_array.shape[0] * img_array.shape[1]
        
        features = {
            'width': float(ref_data.metrics.width),
            'height': float(ref_data.metrics.height),
            'aspect_ratio': float(ref_data.metrics.width / max(ref_data.metrics.height, 1)),
            'fill_ratio': float(non_zero_pixels / total_pixels),
            'quality_score': float(ref_data.quality_score),
            'advance_width': float(ref_data.metrics.advance_width)
        }
        
        return features
    
    async def get_performance_report(self) -> Dict[str, Any]:
        """Get comprehensive performance report"""
        cache_stats = await self.cache_service.get_cache_stats()
        
        cache_hit_rate = (
            self.metrics.cache_hits / max(self.metrics.total_requests, 1) * 100
        )
        
        recent_avg_time = (
            np.mean(self._request_times[-100:]) if self._request_times else 0
        )
        
        return {
            'total_requests': self.metrics.total_requests,
            'cache_hit_rate': round(cache_hit_rate, 2),
            'cache_hits': self.metrics.cache_hits,
            'cache_misses': self.metrics.cache_misses,
            'avg_response_time_ms': round(self.metrics.avg_response_time * 1000, 2),
            'recent_avg_response_time_ms': round(recent_avg_time * 1000, 2),
            'error_count': self.metrics.error_count,
            'error_rate': round(self.metrics.error_count / max(self.metrics.total_requests, 1) * 100, 2),
            'cache_stats': cache_stats
        }
    
    async def optimize_for_character_set(self, characters: List[str]):
        """Optimize system for a specific set of characters"""
        logging.info(f"Optimizing system for {len(characters)} characters...")
        
        # Precompute all reference data
        await self.precompute_character_set(characters)
        
        # Warm cache
        await CacheWarmer.warm_character_set(
            self.cache_service, 
            self.font_renderer, 
            characters
        )
        
        logging.info("System optimization completed")
    
    async def clear_performance_data(self):
        """Clear performance metrics and cache"""
        self.metrics = PerformanceMetrics()
        self._request_times.clear()
        await self.cache_service.clear_cache()
        logging.info("Performance data cleared")
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform system health check"""
        health = {
            'status': 'healthy',
            'cache_connected': await self.cache_service.ping(),
            'font_renderer_ready': self.font_renderer is not None,
            'image_processor_ready': self.image_processor is not None,
            'comparison_algorithm_ready': self.comparison_algorithm is not None
        }
        
        # Check if any critical component is failing
        if not all([
            health['cache_connected'],
            health['font_renderer_ready'],
            health['image_processor_ready'],
            health['comparison_algorithm_ready']
        ]):
            health['status'] = 'degraded'
        
        return health
    
    async def close(self):
        """Clean up resources"""
        await self.cache_service.close()
        logging.info("PerformanceOptimizer closed")


# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def test_performance_optimizer():
        # This would be used with actual components
        print("PerformanceOptimizer test - requires actual font renderer and other components")
    
    asyncio.run(test_performance_optimizer())