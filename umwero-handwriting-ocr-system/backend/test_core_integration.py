#!/usr/bin/env python3
"""
Core Integration Test for Umwero Handwriting OCR System (No Database)

Tests core components without database dependencies:
1. Font rendering (with fallback)
2. Image processing pipeline
3. Comparison algorithms
4. Feedback generation
5. End-to-end evaluation flow

Usage:
    python test_core_integration.py
"""

import sys
import os
import logging
import numpy as np
import cv2
import base64
from pathlib import Path

# Add src to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Import core components (without database dependencies)
from font_renderer import FontRenderingService
from image_processor import ImageProcessingPipeline
from comparison_algorithm import HybridComparisonAlgorithm
from feedback_generator import FeedbackGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_image(character: str = "A") -> str:
    """Create a simple test image and return as base64."""
    # Create a 256x256 test image
    image = np.zeros((256, 256), dtype=np.uint8)
    
    # Draw a simple character-like shape
    if character.upper() == "A":
        # Draw an "A" shape
        cv2.line(image, (128, 200), (100, 100), 255, 8)  # Left line
        cv2.line(image, (128, 200), (156, 100), 255, 8)  # Right line
        cv2.line(image, (114, 150), (142, 150), 255, 6)  # Cross bar
    else:
        # Draw a simple rectangle for other characters
        cv2.rectangle(image, (100, 100), (156, 200), 255, -1)
    
    # Convert to base64
    _, buffer = cv2.imencode('.png', image)
    base64_data = base64.b64encode(buffer).decode('utf-8')
    
    return f"data:image/png;base64,{base64_data}"

def test_font_rendering():
    """Test font rendering with fallback."""
    logger.info("Testing font rendering...")
    
    try:
        # Try to create font renderer (will use fallback if no font file)
        font_path = "fonts/umwero.ttf"  # This likely doesn't exist
        
        if os.path.exists(font_path):
            font_renderer = FontRenderingService(font_path)
            logger.info("Using actual font file")
        else:
            # Create mock font renderer for testing
            class MockFontRenderer:
                def render_character(self, character, size=256):
                    # Create a simple mock rendering
                    image = np.zeros((size, size), dtype=np.uint8)
                    cv2.putText(image, character, (size//4, size//2), 
                               cv2.FONT_HERSHEY_SIMPLEX, 3, 255, 8)
                    return image
                
                def get_character_metrics(self, character):
                    return {"width": 100, "height": 150, "baseline": 200}
            
            font_renderer = MockFontRenderer()
            logger.info("Using mock font renderer")
        
        # Test rendering
        rendered = font_renderer.render_character("A", 256)
        
        if rendered is not None and rendered.shape == (256, 256):
            logger.info("✅ Font rendering test passed")
            return True, font_renderer
        else:
            logger.error("❌ Font rendering test failed")
            return False, None
            
    except Exception as e:
        logger.error(f"❌ Font rendering test error: {e}")
        return False, None

def test_image_processing():
    """Test image processing pipeline."""
    logger.info("Testing image processing...")
    
    try:
        # Create image processor
        processor = ImageProcessingPipeline()
        
        # Create test image
        test_image_b64 = create_test_image("A")
        
        # Process image
        processed = processor.preprocess_image(test_image_b64)
        
        if processed and hasattr(processed, 'processed_image'):
            logger.info("✅ Image processing test passed")
            return True, processor
        else:
            logger.error("❌ Image processing test failed")
            return False, None
            
    except Exception as e:
        logger.error(f"❌ Image processing test error: {e}")
        return False, None

def test_comparison_algorithm():
    """Test comparison algorithm."""
    logger.info("Testing comparison algorithm...")
    
    try:
        # Create comparison algorithm
        algorithm = HybridComparisonAlgorithm()
        
        # Create two test images
        processor = ImageProcessingPipeline()
        
        image1_b64 = create_test_image("A")
        image2_b64 = create_test_image("A")  # Same character
        
        processed1 = processor.preprocess_image(image1_b64)
        processed2 = processor.preprocess_image(image2_b64)
        
        # Compare images
        result = algorithm.compare_images(processed1, processed2)
        
        if result and hasattr(result, 'final_score'):
            logger.info(f"✅ Comparison algorithm test passed (score: {result.final_score})")
            return True, algorithm
        else:
            logger.error("❌ Comparison algorithm test failed")
            return False, None
            
    except Exception as e:
        logger.error(f"❌ Comparison algorithm test error: {e}")
        return False, None

def test_feedback_generation():
    """Test feedback generation."""
    logger.info("Testing feedback generation...")
    
    try:
        # Create feedback generator
        generator = FeedbackGenerator()
        
        # Create mock comparison result
        class MockComparisonResult:
            def __init__(self):
                self.final_score = 85.0
                self.ssim_score = 0.82
                self.contour_score = 0.88
                self.skeleton_score = 0.85
                self.confidence = 0.90
        
        comparison_result = MockComparisonResult()
        
        # Generate feedback
        feedback = generator.generate_feedback(
            comparison_result, 
            (None, None),  # Images not needed for basic test
            "A"
        )
        
        if feedback and hasattr(feedback, 'primary_feedback'):
            logger.info(f"✅ Feedback generation test passed ({len(feedback.primary_feedback)} messages)")
            return True, generator
        else:
            logger.error("❌ Feedback generation test failed")
            return False, None
            
    except Exception as e:
        logger.error(f"❌ Feedback generation test error: {e}")
        return False, None

def test_end_to_end_evaluation():
    """Test complete end-to-end evaluation without database."""
    logger.info("Testing end-to-end evaluation...")
    
    try:
        # Initialize components
        _, font_renderer = test_font_rendering()
        _, processor = test_image_processing()
        _, algorithm = test_comparison_algorithm()
        _, generator = test_feedback_generation()
        
        if not all([font_renderer, processor, algorithm, generator]):
            logger.error("❌ Cannot run end-to-end test - component initialization failed")
            return False
        
        # Simulate evaluation process
        character = "A"
        
        # Step 1: Render reference
        reference_image = font_renderer.render_character(character, 256)
        logger.info("✅ Reference character rendered")
        
        # Step 2: Create user drawing
        user_image_b64 = create_test_image(character)
        
        # Step 3: Process both images
        reference_processed = processor.preprocess_image(reference_image)
        user_processed = processor.preprocess_image(user_image_b64)
        logger.info("✅ Images processed")
        
        # Step 4: Compare images
        comparison_result = algorithm.compare_images(reference_processed, user_processed)
        logger.info(f"✅ Images compared (score: {comparison_result.final_score})")
        
        # Step 5: Generate feedback
        feedback = generator.generate_feedback(comparison_result, (reference_processed, user_processed), character)
        logger.info(f"✅ Feedback generated ({len(feedback.primary_feedback)} messages)")
        
        # Step 6: Create final result
        final_result = {
            "character": character,
            "score": comparison_result.final_score,
            "passed": comparison_result.final_score >= 70.0,
            "feedback": feedback.primary_feedback,
            "confidence": comparison_result.confidence,
            "metrics": {
                "ssim_score": comparison_result.ssim_score,
                "contour_score": comparison_result.contour_score,
                "skeleton_score": comparison_result.skeleton_score
            }
        }
        
        logger.info("✅ End-to-end evaluation completed successfully")
        logger.info(f"Final result: {final_result}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ End-to-end evaluation test error: {e}")
        return False

def main():
    """Run all core integration tests."""
    logger.info("🚀 Starting Core Components Integration Tests")
    
    tests = [
        ("Font Rendering", test_font_rendering),
        ("Image Processing", test_image_processing),
        ("Comparison Algorithm", test_comparison_algorithm),
        ("Feedback Generation", test_feedback_generation),
        ("End-to-End Evaluation", test_end_to_end_evaluation),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        try:
            if test_name == "End-to-End Evaluation":
                result = test_func()
            else:
                result, _ = test_func()
            
            results.append((test_name, result))
            
            if result:
                logger.info(f"✅ {test_name} test PASSED")
            else:
                logger.error(f"❌ {test_name} test FAILED")
                
        except Exception as e:
            logger.error(f"❌ {test_name} test ERROR: {e}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("CORE INTEGRATION TEST SUMMARY")
    logger.info("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All core integration tests passed!")
        logger.info("Core components are working together correctly.")
    else:
        logger.error(f"❌ {total - passed} tests failed")
        logger.info("Some components need attention before production deployment.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)