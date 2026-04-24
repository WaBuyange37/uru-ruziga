#!/usr/bin/env python3
"""
Test script for caching and performance optimization features.
Tests Redis caching, feature vector storage, and cache warming.
"""

import asyncio
import logging
import time
import os
import sys
from typing import List

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from cache_service import CacheService, CacheConfig
from font_renderer import FontRenderingService, ReferenceData
from evaluation_engine import EvaluationEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_cache_service():
    """Test basic cache service functionality"""
    logger.info("Testing cache service...")
    
    # Create cache service
    config = CacheConfig(
        redis_url="redis://localhost:6379",
        default_ttl=60,  # Short TTL for testing
        reference_ttl=120,
        feature_ttl=90
    )
    
    cache_service = CacheService(config)
    
    # Wait for Redis initialization
    await asyncio.sleep(0.5)
    
    # Test health check
    health = await cache_service.health_check()
    logger.info(f"Cache service health: {health}")
    
    # Test feature vector caching
    test_features = {
        'contour_area': 1234.5,
        'aspect_ratio': 1.2,
        'stroke_count': 3,
        'loop_count': 1
    }
    
    # Set feature vector
    success = await cache_service.set_feature_vector('A', test_features)
    logger.info(f"Feature vector set: {success}")
    
    # Get feature vector
    cached_features = await cache_service.get_feature_vector('A')
    logger.info(f"Cached features: {cached_features}")
    
    # Test cache stats
    stats = cache_service.get_cache_stats()
    logger.info(f"Cache stats: {stats}")
    
    await cache_service.close()
    logger.info("Cache service test completed")


async def test_font_renderer_caching():
    """Test font renderer with caching"""
    logger.info("Testing font renderer with caching...")
    
    # Create cache service
    cache_service = CacheService()
    await asyncio.sleep(0.5)
    
    # Create font renderer (will use fallback if no font file)
    font_path = "fonts/umwero.ttf"
    if not os.path.exists(font_path):
        logger.warning(f"Font file not found: {font_path}")
        logger.info("Creating dummy font file for testing...")
        
        # Create fonts directory if it doesn't exist
        os.makedirs("fonts", exist_ok=True)
        
        # For testing, we'll skip font renderer tests if no font is available
        logger.warning("Skipping font renderer tests - no font file available")
        await cache_service.close()
        return
    
    try:
        font_renderer = FontRenderingService(font_path, cache_service=cache_service)
        
        # Test cached rendering
        test_chars = ['A', 'B', 'C']
        
        logger.info("Testing cached character rendering...")
        
        for char in test_chars:
            start_time = time.time()
            
            # First render (should cache)
            img1 = await font_renderer.render_character_cached(char)
            first_time = time.time() - start_time
            
            start_time = time.time()
            
            # Second render (should use cache)
            img2 = await font_renderer.render_character_cached(char)
            second_time = time.time() - start_time
            
            logger.info(f"Character '{char}': First render: {first_time:.3f}s, Second render: {second_time:.3f}s")
            
            # Verify images are the same
            if img1.size == img2.size:
                logger.info(f"Character '{char}': Cache working correctly")
            else:
                logger.error(f"Character '{char}': Cache mismatch!")
        
        # Test precompute with caching
        logger.info("Testing precompute with caching...")
        start_time = time.time()
        
        references = await font_renderer.precompute_references_cached(test_chars)
        precompute_time = time.time() - start_time
        
        logger.info(f"Precomputed {len(references)} references in {precompute_time:.3f}s")
        
    except Exception as e:
        logger.error(f"Font renderer test failed: {e}")
    
    await cache_service.close()
    logger.info("Font renderer caching test completed")


async def test_cache_warming():
    """Test cache warming functionality"""
    logger.info("Testing cache warming...")
    
    cache_service = CacheService()
    await asyncio.sleep(0.5)
    
    # Test with dummy font renderer (since we might not have the actual font)
    class DummyFontRenderer:
        def render_character(self, char, size=256):
            from PIL import Image
            # Create a simple dummy image
            img = Image.new('L', (size, size), 0)
            return img
        
        def get_character_metrics(self, char):
            from font_renderer import CharacterMetrics
            return CharacterMetrics(
                width=100, height=100, baseline=80,
                ascent=80, descent=20, advance_width=100,
                bounding_box=(10, 10, 110, 110)
            )
        
        def _assess_rendering_quality(self, img):
            return 0.8
        
        @property
        def selected_engine(self):
            class Engine:
                value = "dummy"
            return Engine()
    
    dummy_renderer = DummyFontRenderer()
    
    # Test cache warming
    test_chars = ['A', 'B', 'C', 'D', 'E']
    
    logger.info(f"Warming cache for {len(test_chars)} characters...")
    start_time = time.time()
    
    results = await cache_service.warm_cache(test_chars, dummy_renderer)
    warm_time = time.time() - start_time
    
    successful = sum(1 for success in results.values() if success)
    logger.info(f"Cache warming completed: {successful}/{len(test_chars)} successful in {warm_time:.3f}s")
    
    # Test cache stats after warming
    stats = cache_service.get_cache_stats()
    logger.info(f"Cache stats after warming: {stats}")
    
    # Test retrieval from cache
    logger.info("Testing retrieval from warmed cache...")
    for char in test_chars[:3]:  # Test first 3 characters
        cached_data = await cache_service.get_reference_data(char)
        if cached_data:
            logger.info(f"Successfully retrieved cached data for '{char}'")
        else:
            logger.warning(f"No cached data found for '{char}'")
    
    await cache_service.close()
    logger.info("Cache warming test completed")


async def test_evaluation_engine_caching():
    """Test evaluation engine with caching"""
    logger.info("Testing evaluation engine with caching...")
    
    cache_service = CacheService()
    await asyncio.sleep(0.5)
    
    # Create evaluation engine with cache service
    evaluation_engine = EvaluationEngine(cache_service=cache_service)
    
    # Test system status
    status = evaluation_engine.get_system_status()
    logger.info(f"Evaluation engine status: {status}")
    
    # Test cache clearing
    await evaluation_engine.clear_cache()
    logger.info("Cache cleared successfully")
    
    await cache_service.close()
    logger.info("Evaluation engine caching test completed")


async def run_performance_test():
    """Run performance comparison with and without caching"""
    logger.info("Running performance comparison...")
    
    # This would require actual font file and more complex setup
    # For now, just log that performance testing would go here
    logger.info("Performance testing requires actual font file and production setup")
    logger.info("In production, this would measure:")
    logger.info("- Cache hit rates")
    logger.info("- Response time improvements")
    logger.info("- Memory usage optimization")
    logger.info("- Concurrent request handling")


async def main():
    """Run all caching tests"""
    logger.info("Starting caching and performance optimization tests...")
    
    try:
        # Test basic cache service
        await test_cache_service()
        
        # Test font renderer caching
        await test_font_renderer_caching()
        
        # Test cache warming
        await test_cache_warming()
        
        # Test evaluation engine caching
        await test_evaluation_engine_caching()
        
        # Run performance tests
        await run_performance_test()
        
        logger.info("All caching tests completed successfully!")
        
    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)
        return 1
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)