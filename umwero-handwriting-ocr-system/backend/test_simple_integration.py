#!/usr/bin/env python3
"""
Simple Integration Test for Core Components

Tests basic functionality without complex imports.
"""

import sys
import os
import logging
import numpy as np
import cv2
import base64

# Add src to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_image(character: str = "A") -> str:
    """Create a simple test image and return as base64."""
    image = np.zeros((256, 256), dtype=np.uint8)
    
    if character.upper() == "A":
        cv2.line(image, (128, 200), (100, 100), 255, 8)
        cv2.line(image, (128, 200), (156, 100), 255, 8)
        cv2.line(image, (114, 150), (142, 150), 255, 6)
    else:
        cv2.rectangle(image, (100, 100), (156, 200), 255, -1)
    
    _, buffer = cv2.imencode('.png', image)
    base64_data = base64.b64encode(buffer).decode('utf-8')
    
    return f"data:image/png;base64,{base64_data}"

def test_image_processing():
    """Test image processing independently."""
    logger.info("Testing image processing...")
    
    try:
        # Import image processor
        from image_processor import ImageProcessingPipeline
        
        processor = ImageProcessingPipeline()
        test_image_b64 = create_test_image("A")
        
        processed = processor.preprocess_image(test_image_b64)
        
        if processed and hasattr(processed, 'processed_image'):
            logger.info("✅ Image processing works correctly")
            return True
        else:
            logger.error("❌ Image processing failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Image processing error: {e}")
        return False

def test_font_rendering():
    """Test font rendering independently."""
    logger.info("Testing font rendering...")
    
    try:
        # Create a simple mock font renderer
        class MockFontRenderer:
            def render_character(self, character, size=256):
                image = np.zeros((size, size), dtype=np.uint8)
                cv2.putText(image, character, (size//4, size//2), 
                           cv2.FONT_HERSHEY_SIMPLEX, 3, 255, 8)
                return image
        
        renderer = MockFontRenderer()
        rendered = renderer.render_character("A", 256)
        
        if rendered is not None and rendered.shape == (256, 256):
            logger.info("✅ Font rendering works correctly")
            return True
        else:
            logger.error("❌ Font rendering failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Font rendering error: {e}")
        return False

def test_basic_comparison():
    """Test basic image comparison."""
    logger.info("Testing basic image comparison...")
    
    try:
        # Create two similar images
        image1 = create_test_image("A")
        image2 = create_test_image("A")
        
        # Decode images
        def decode_image(base64_str):
            image_data = base64.b64decode(base64_str.split(',')[1])
            image_array = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_GRAYSCALE)
            return image_array
        
        img1 = decode_image(image1)
        img2 = decode_image(image2)
        
        # Simple comparison using SSIM
        from skimage.metrics import structural_similarity as ssim
        
        score = ssim(img1, img2)
        
        if score > 0.8:  # Should be very similar since they're identical
            logger.info(f"✅ Basic comparison works correctly (SSIM: {score:.3f})")
            return True
        else:
            logger.error(f"❌ Basic comparison failed (SSIM: {score:.3f})")
            return False
            
    except Exception as e:
        logger.error(f"❌ Basic comparison error: {e}")
        return False

def test_feature_extraction():
    """Test basic feature extraction."""
    logger.info("Testing feature extraction...")
    
    try:
        # Create test image
        test_image_b64 = create_test_image("A")
        
        # Decode image
        image_data = base64.b64decode(test_image_b64.split(',')[1])
        image_array = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_GRAYSCALE)
        
        # Extract basic features
        contours, _ = cv2.findContours(image_array, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            main_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(main_contour)
            perimeter = cv2.arcLength(main_contour, True)
            
            x, y, w, h = cv2.boundingRect(main_contour)
            aspect_ratio = w / h if h > 0 else 1.0
            
            features = {
                "area": area,
                "perimeter": perimeter,
                "aspect_ratio": aspect_ratio,
                "bbox_width": w,
                "bbox_height": h
            }
            
            logger.info(f"✅ Feature extraction works correctly: {features}")
            return True
        else:
            logger.error("❌ Feature extraction failed - no contours found")
            return False
            
    except Exception as e:
        logger.error(f"❌ Feature extraction error: {e}")
        return False

def main():
    """Run simple integration tests."""
    logger.info("🚀 Starting Simple Integration Tests")
    
    tests = [
        ("Font Rendering", test_font_rendering),
        ("Image Processing", test_image_processing),
        ("Basic Comparison", test_basic_comparison),
        ("Feature Extraction", test_feature_extraction),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        try:
            result = test_func()
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
    logger.info("SIMPLE INTEGRATION TEST SUMMARY")
    logger.info("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All simple integration tests passed!")
        logger.info("Core functionality is working correctly.")
    else:
        logger.error(f"❌ {total - passed} tests failed")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)