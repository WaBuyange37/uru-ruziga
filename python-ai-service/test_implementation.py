"""
Test script to verify the Python AI service implementation.
"""

import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_image_processor():
    """Test image processor module"""
    from src.image_processor import ImageProcessor
    
    processor = ImageProcessor(target_size=256)
    
    # Test stroke to image conversion
    test_strokes = [
        [
            {'x': 50, 'y': 50, 'timestamp': 0, 'pressure': 0.5},
            {'x': 100, 'y': 100, 'timestamp': 100, 'pressure': 0.5},
            {'x': 150, 'y': 50, 'timestamp': 200, 'pressure': 0.5}
        ]
    ]
    
    img = processor.strokes_to_image(test_strokes, canvas_size=400)
    logger.info(f"✓ Stroke to image conversion successful: {img.size}")
    
    # Test image preprocessing
    processed = processor.preprocess_image(img)
    logger.info(f"✓ Image preprocessing successful: {processed.normalized.shape}")
    
    return True


def test_font_renderer():
    """Test font renderer module"""
    from src.font_renderer import FontRenderer
    
    # Test with non-existent font (should use fallback)
    renderer = FontRenderer("fonts/umwero.ttf")
    
    # Render a test character
    img = renderer.render_character('A', size=256)
    logger.info(f"✓ Font rendering successful: {img.size}")
    
    return True


def test_comparison_algorithm():
    """Test comparison algorithm module"""
    from src.comparison import ComparisonAlgorithm
    import numpy as np
    
    algorithm = ComparisonAlgorithm()
    
    # Create test images
    ref_img = np.zeros((256, 256), dtype=np.uint8)
    ref_img[50:200, 50:200] = 255
    
    user_img = np.zeros((256, 256), dtype=np.uint8)
    user_img[55:195, 55:195] = 255
    
    # Test comparison
    result = algorithm.compare(ref_img, user_img, ref_img, user_img)
    logger.info(f"✓ Comparison algorithm successful: score={result.final_score:.1f}")
    
    return True


def test_feedback_generator():
    """Test feedback generator module"""
    from src.feedback_generator import FeedbackGenerator
    
    generator = FeedbackGenerator()
    
    # Test feedback generation
    feedback = generator.generate_feedback(75.0, 0.8, 0.7, 0.75)
    logger.info(f"✓ Feedback generation successful: {len(feedback)} items")
    
    # Test accuracy level
    level = generator.get_accuracy_level(75.0)
    logger.info(f"✓ Accuracy level: {level}")
    
    return True


def test_cache_service():
    """Test cache service module"""
    from src.cache import CacheService
    
    cache = CacheService()
    logger.info(f"✓ Cache service initialized: enabled={cache.enabled}")
    
    if cache.enabled:
        # Test cache operations
        cache.set('test_key', {'value': 'test'})
        result = cache.get('test_key')
        logger.info(f"✓ Cache operations successful: {result}")
    else:
        logger.info("✓ Cache service running in disabled mode (Redis not available)")
    
    return True


def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("Testing Python AI Service Implementation")
    logger.info("=" * 60)
    
    tests = [
        ("Image Processor", test_image_processor),
        ("Font Renderer", test_font_renderer),
        ("Comparison Algorithm", test_comparison_algorithm),
        ("Feedback Generator", test_feedback_generator),
        ("Cache Service", test_cache_service)
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        logger.info(f"\nTesting {name}...")
        try:
            if test_func():
                passed += 1
                logger.info(f"✓ {name} test passed")
        except Exception as e:
            failed += 1
            logger.error(f"✗ {name} test failed: {e}", exc_info=True)
    
    logger.info("\n" + "=" * 60)
    logger.info(f"Test Results: {passed} passed, {failed} failed")
    logger.info("=" * 60)
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
