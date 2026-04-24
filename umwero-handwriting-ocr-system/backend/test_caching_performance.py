"""
Test script for caching and performance optimization functionality.
Validates Redis caching, performance metrics, and cache warming.
"""

import asyncio
import time
import logging
from typing import List
import numpy as np
from PIL import Image
import io
import base64

# Import our modules
from src.cache_service import CacheService, CacheWarmer
from src.performance_optimizer import PerformanceOptimizer
from src.font_renderer import FontRenderingService, RenderingEngine, ReferenceData, CharacterMetrics
from src.image_processor import ImageProcessingPipeline
from src.comparison_algorithm import HybridComparisonAlgorithm

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MockFontRenderer:
    """Mock font renderer for testing when actual font is not available"""
    
    def __init__(self):
        self.selected_engine = RenderingEngine.PILLOW
        self.cache_service = None
    
    def set_cache_service(self, cache_service):
        self.cache_service = cache_service
    
    def render_character(self, character: str, size: int = 256) -> Image.Image:
        """Generate a simple mock character image"""
        img = Image.new('L', (size, size), 0)
        # Draw a simple representation
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        # Try to use a system font, fallback to basic drawing
        try:
            font = ImageFont.load_default()
            bbox = draw.textbbox((0, 0), character, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (size - text_width) // 2
            y = (size - text_height) // 2
            draw.text((x, y), character, font=font, fill=255)
        except:
            # Fallback: draw a simple rectangle
            draw.rectangle([size//4, size//4, 3*size//4, 3*size//4], fill=128)
        
        return img
    
    def get_character_metrics(self, character: str) -> CharacterMetrics:
        """Generate mock character metrics"""
        return CharacterMetrics(
            width=100,
            height=120,
            baseline=100,
            ascent=120,
            descent=20,
            advance_width=110,
            bounding_box=(10, 10, 110, 130)
        )
    
    def _assess_rendering_quality(self, img: Image.Image) -> float:
        """Mock quality assessment"""
        return 0.85


async def test_cache_service():
    """Test basic cache service functionality"""
    logger.info("Testing cache service...")
    
    cache = CacheService(redis_url="redis://localhost:6379")
    
    # Test connection
    connected = await cache.ping()
    logger.info(f"Cache connected: {connected}")
    
    if not connected:
        logger.warning("Redis not available, using memory cache fallback")
    
    # Test basic caching
    test_features = {
        'width': 100.0,
        'height': 120.0,
        'aspect_ratio': 0.83,
        'quality_score': 0.85
    }
    
    await cache.set_feature_vector('A', test_features)
    retrieved_features = await cache.get_feature_vector('A')
    
    assert retrieved_features == test_features, "Feature caching failed"
    logger.info("✓ Feature vector caching works")
    
    # Test cache stats
    stats = await cache.get_cache_stats()
    logger.info(f"Cache stats: {stats}")
    
    await cache.close()
    logger.info("✓ Cache service test completed")


async def test_cache_warming():
    """Test cache warming functionality"""
    logger.info("Testing cache warming...")
    
    cache = CacheService()
    font_renderer = MockFontRenderer()
    
    # Test warming with common characters
    test_chars = ['A', 'B', 'C']
    await cache.warm_cache(test_chars, font_renderer)
    
    # Verify characters are cached
    for char in test_chars:
        ref_data = await cache.get_reference_data(char)
        assert ref_data is not None, f"Character '{char}' not cached"
        assert ref_data.image is not None, f"Image not cached for '{char}'"
        logger.info(f"✓ Character '{char}' cached successfully")
    
    await cache.close()
    logger.info("✓ Cache warming test completed")


async def test_performance_optimizer():
    """Test performance optimizer functionality"""
    logger.info("Testing performance optimizer...")
    
    # Initialize components
    font_renderer = MockFontRenderer()
    image_processor = ImageProcessingPipeline()
    comparison_algorithm = HybridComparisonAlgorithm()
    cache_service = CacheService()
    
    optimizer = PerformanceOptimizer(
        font_renderer=font_renderer,
        image_processor=image_processor,
        comparison_algorithm=comparison_algorithm,
        cache_service=cache_service
    )
    
    await optimizer.initialize()
    
    # Test character precomputation
    test_chars = ['A', 'B']
    await optimizer.precompute_character_set(test_chars)
    
    # Verify precomputed data
    for char in test_chars:
        ref_data = await cache_service.get_reference_data(char)
        assert ref_data is not None, f"Character '{char}' not precomputed"
        logger.info(f"✓ Character '{char}' precomputed successfully")
    
    # Test performance metrics
    performance_report = await optimizer.get_performance_report()
    logger.info(f"Performance report: {performance_report}")
    
    # Test health check
    health = await optimizer.health_check()
    logger.info(f"Health check: {health}")
    
    await optimizer.close()
    logger.info("✓ Performance optimizer test completed")


def create_test_image(character: str) -> str:
    """Create a test image for evaluation"""
    img = Image.new('L', (256, 256), 0)
    draw = ImageDraw.Draw(img)
    
    # Draw a simple representation of the character
    try:
        from PIL import ImageFont
        font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), character, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (256 - text_width) // 2
        y = (256 - text_height) // 2
        draw.text((x, y), character, font=font, fill=255)
    except:
        # Fallback drawing
        draw.rectangle([64, 64, 192, 192], fill=128)
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{image_data}"


async def test_evaluation_caching():
    """Test evaluation result caching"""
    logger.info("Testing evaluation caching...")
    
    # Initialize components
    font_renderer = MockFontRenderer()
    image_processor = ImageProcessingPipeline()
    comparison_algorithm = HybridComparisonAlgorithm()
    cache_service = CacheService()
    
    optimizer = PerformanceOptimizer(
        font_renderer=font_renderer,
        image_processor=image_processor,
        comparison_algorithm=comparison_algorithm,
        cache_service=cache_service
    )
    
    await optimizer.initialize()
    
    # Create test image
    test_image = create_test_image('A')
    
    # First evaluation (should be slow)
    start_time = time.time()
    result1 = await optimizer.evaluate_character_optimized('A', test_image)
    first_time = time.time() - start_time
    
    # Second evaluation (should be cached and faster)
    start_time = time.time()
    result2 = await optimizer.evaluate_character_optimized('A', test_image)
    second_time = time.time() - start_time
    
    # Verify results are identical
    assert result1['score'] == result2['score'], "Cached result differs from original"
    logger.info(f"✓ Evaluation caching works (first: {first_time:.3f}s, cached: {second_time:.3f}s)")
    
    # Check performance metrics
    performance_report = await optimizer.get_performance_report()
    assert performance_report['cache_hits'] > 0, "No cache hits recorded"
    logger.info(f"✓ Cache hit rate: {performance_report['cache_hit_rate']:.1f}%")
    
    await optimizer.close()
    logger.info("✓ Evaluation caching test completed")


async def test_cache_invalidation():
    """Test cache invalidation functionality"""
    logger.info("Testing cache invalidation...")
    
    cache = CacheService()
    font_renderer = MockFontRenderer()
    
    # Cache some data
    await cache.warm_cache(['A'], font_renderer)
    
    # Verify it's cached
    ref_data = await cache.get_reference_data('A')
    assert ref_data is not None, "Data not cached"
    
    # Invalidate cache for character
    await cache.invalidate_character('A')
    
    # Verify it's removed
    ref_data = await cache.get_reference_data('A')
    assert ref_data is None, "Data not invalidated"
    
    logger.info("✓ Cache invalidation works")
    
    await cache.close()
    logger.info("✓ Cache invalidation test completed")


async def run_performance_benchmark():
    """Run performance benchmark with and without caching"""
    logger.info("Running performance benchmark...")
    
    # Initialize components
    font_renderer = MockFontRenderer()
    image_processor = ImageProcessingPipeline()
    comparison_algorithm = HybridComparisonAlgorithm()
    cache_service = CacheService()
    
    optimizer = PerformanceOptimizer(
        font_renderer=font_renderer,
        image_processor=image_processor,
        comparison_algorithm=comparison_algorithm,
        cache_service=cache_service
    )
    
    await optimizer.initialize()
    
    # Benchmark parameters
    test_chars = ['A', 'B', 'C', 'D', 'E']
    iterations = 3
    
    # Clear cache first
    await cache_service.clear_cache()
    
    # Benchmark without cache (first run)
    logger.info("Benchmarking without cache...")
    uncached_times = []
    
    for char in test_chars:
        test_image = create_test_image(char)
        
        start_time = time.time()
        await optimizer.evaluate_character_optimized(char, test_image)
        elapsed = time.time() - start_time
        uncached_times.append(elapsed)
    
    avg_uncached = np.mean(uncached_times)
    logger.info(f"Average uncached time: {avg_uncached:.3f}s")
    
    # Benchmark with cache (subsequent runs)
    logger.info("Benchmarking with cache...")
    cached_times = []
    
    for _ in range(iterations):
        for char in test_chars:
            test_image = create_test_image(char)
            
            start_time = time.time()
            await optimizer.evaluate_character_optimized(char, test_image)
            elapsed = time.time() - start_time
            cached_times.append(elapsed)
    
    avg_cached = np.mean(cached_times)
    speedup = avg_uncached / avg_cached if avg_cached > 0 else 0
    
    logger.info(f"Average cached time: {avg_cached:.3f}s")
    logger.info(f"Speedup: {speedup:.1f}x")
    
    # Get final performance report
    performance_report = await optimizer.get_performance_report()
    logger.info(f"Final performance report: {performance_report}")
    
    await optimizer.close()
    logger.info("✓ Performance benchmark completed")


async def main():
    """Run all tests"""
    logger.info("Starting caching and performance tests...")
    
    try:
        await test_cache_service()
        await test_cache_warming()
        await test_performance_optimizer()
        await test_evaluation_caching()
        await test_cache_invalidation()
        await run_performance_benchmark()
        
        logger.info("🎉 All tests passed!")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise


if __name__ == "__main__":
    # Add PIL import for test image creation
    from PIL import ImageDraw
    
    asyncio.run(main())