#!/usr/bin/env python3
"""
Simple test script to verify the backend evaluation engine works.
Run from the backend directory.
"""

import sys
import os
import base64
import asyncio
from io import BytesIO
from PIL import Image, ImageDraw
import numpy as np

# Add src to path
sys.path.insert(0, 'src')

from src.evaluation_engine import EvaluationEngine
from src.image_processor import ImageProcessingPipeline, ProcessingConfig
from src.comparison_algorithm import HybridComparisonAlgorithm


def create_test_image(character: str = "A", size: int = 256) -> str:
    """Create a simple test image of a character"""
    # Create a white canvas
    img = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple representation of the character
    if character.upper() == 'A':
        # Draw a simple triangle for 'A'
        points = [
            (size//2, size//4),      # Top point
            (size//4, 3*size//4),    # Bottom left
            (3*size//4, 3*size//4),  # Bottom right
            (size//2, size//4)       # Back to top
        ]
        draw.polygon(points, outline='black', width=3)
        # Draw horizontal line
        draw.line([(size//3, size//2), (2*size//3, size//2)], fill='black', width=3)
    else:
        # Draw a simple rectangle for other characters
        draw.rectangle([size//4, size//4, 3*size//4, 3*size//4], outline='black', width=3)
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    
    return f"data:image/png;base64,{base64.b64encode(img_data).decode()}"


async def test_evaluation_engine():
    """Test the evaluation engine"""
    print("🧪 Testing Umwero Handwriting Evaluation Engine...")
    
    # Create evaluation engine (without font file for now)
    engine = EvaluationEngine()
    
    # Check system status
    status = engine.get_system_status()
    print(f"📊 System Status: {status}")
    
    # Create test image
    test_character = "A"
    test_image = create_test_image(test_character)
    print(f"✏️  Created test image for character '{test_character}'")
    
    # Perform evaluation
    print("🔄 Running evaluation...")
    result = await engine.evaluate_handwriting(
        character=test_character,
        user_image_data=test_image,
        session_id="test_session",
        user_id="test_user"
    )
    
    # Display results
    print("\n📋 Evaluation Results:")
    print(f"   Score: {result.score:.1f}/100")
    print(f"   Confidence: {result.confidence:.3f}")
    print(f"   Processing Time: {result.processing_time_ms}ms")
    print(f"   Feedback: {result.feedback}")
    
    if result.detailed_feedback:
        print("   Detailed Feedback:")
        for item in result.detailed_feedback:
            print(f"     - {item.category}: {item.message}")
    
    return True


def test_image_processing():
    """Test image processing pipeline"""
    print("\n🖼️  Testing Image Processing Pipeline...")
    
    processor = ImageProcessingPipeline(ProcessingConfig())
    
    # Create test image
    test_image = create_test_image("A")
    
    # Process image
    processed = processor.preprocess_image(test_image)
    
    print(f"   Original size: 256x256")
    print(f"   Processed size: {processed.processed_image.shape}")
    print(f"   Bounding box: {processed.bounding_box}")
    print(f"   Features extracted: {len(processed.features.__dict__)} features")
    
    return True


def test_comparison_algorithm():
    """Test comparison algorithm"""
    print("\n🔍 Testing Comparison Algorithm...")
    
    algorithm = HybridComparisonAlgorithm()
    processor = ImageProcessingPipeline(ProcessingConfig())
    
    # Create two similar images
    image1 = create_test_image("A")
    image2 = create_test_image("A")
    
    # Process both images
    processed1 = processor.preprocess_image(image1)
    processed2 = processor.preprocess_image(image2)
    
    # Compare
    result = algorithm.compare_images(processed1, processed2)
    
    print(f"   SSIM Score: {result.ssim_score:.3f}")
    print(f"   Contour Score: {result.contour_score:.3f}")
    print(f"   Skeleton Score: {result.skeleton_score:.3f}")
    print(f"   Final Score: {result.final_score:.1f}/100")
    print(f"   Confidence: {result.confidence:.3f}")
    
    return True


async def main():
    """Run all tests"""
    print("🚀 Starting Umwero Handwriting Evaluation Backend Tests\n")
    
    try:
        # Test individual components
        test_image_processing()
        test_comparison_algorithm()
        
        # Test full evaluation engine
        await test_evaluation_engine()
        
        print("\n✅ All backend tests completed successfully!")
        print("\n📝 Next Steps:")
        print("   1. Start the FastAPI server: python main.py")
        print("   2. Test the API endpoints")
        print("   3. Add a sample Umwero font file for font rendering")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)