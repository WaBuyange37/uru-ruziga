#!/usr/bin/env python3
"""
Test database integration for Umwero Handwriting OCR System

This script tests:
1. Database connectivity
2. Data collection workflow
3. Feature extraction and storage
4. Dataset export functionality

Usage:
    python test_database_integration.py
"""

import asyncio
import logging
import os
import sys
import base64
from pathlib import Path

# Add src to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from database_service import db_service
from data_collector import data_collector
from feature_extractor import FeatureExtractor
import numpy as np
import cv2

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

async def test_database_connectivity():
    """Test basic database connectivity."""
    logger.info("Testing database connectivity...")
    
    try:
        connected = await db_service.connect()
        if not connected:
            logger.error("❌ Database connection failed")
            return False
        
        # Test basic query
        stats = await db_service.get_dataset_statistics()
        logger.info(f"✅ Database connected. Current stats: {stats}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database connectivity test failed: {e}")
        return False

async def test_feature_extraction():
    """Test feature extraction functionality."""
    logger.info("Testing feature extraction...")
    
    try:
        # Create test image
        test_image_b64 = create_test_image("A")
        
        # Decode image
        image_data = base64.b64decode(test_image_b64.split(',')[1])
        image_array = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_GRAYSCALE)
        
        # Extract features
        feature_extractor = FeatureExtractor()
        features = feature_extractor.extract_all_features(image_array)
        
        if features.get('extraction_success', False):
            logger.info("✅ Feature extraction successful")
            logger.info(f"Geometric features: {len(features.get('geometric', {}))}")
            logger.info(f"Topological features: {len(features.get('topological', {}))}")
            logger.info(f"Feature vector length: {len(features.get('vector', []))}")
            return True
        else:
            logger.error("❌ Feature extraction failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Feature extraction test failed: {e}")
        return False

async def test_data_collection():
    """Test complete data collection workflow."""
    logger.info("Testing data collection workflow...")
    
    try:
        # Create test data
        character = "A"
        user_image = create_test_image("A")
        reference_image = create_test_image("A")  # Same for simplicity
        
        # Mock evaluation results
        evaluation_results = {
            "final_score": 85.5,
            "ssim_score": 0.82,
            "contour_score": 0.88,
            "skeleton_score": 0.85,
            "confidence_score": 0.90,
            "evaluation_time_ms": 250
        }
        
        # Mock feedback data
        feedback_data = {
            "overall_feedback": "Good attempt! The character shape is recognizable.",
            "encouragement": "Keep practicing to improve consistency.",
            "missing_strokes": [],
            "proportion_issues": ["Character could be slightly taller"],
            "positioning_issues": [],
            "topology_issues": [],
            "suggestions": ["Focus on making the cross bar more horizontal"],
            "practice_areas": ["proportions"],
            "feedback_type": "constructive",
            "priority": "medium"
        }
        
        # Mock feature vector
        feature_vector = {
            "geometric": {
                "contour_area": 1250.0,
                "aspect_ratio": 0.8,
                "bbox_width": 56.0,
                "bbox_height": 100.0
            },
            "topological": {
                "stroke_count": 3,
                "loop_count": 0,
                "endpoint_count": 4,
                "intersection_count": 1
            },
            "shape": {
                "complexity_score": 0.7,
                "horizontal_symmetry": 0.85,
                "vertical_symmetry": 0.95
            },
            "vector": [0.125, 0.8, 0.9, 0.85, 0.7, 0.3, 0.0, 0.2, 0.1, 0.067, 0.7, 0.85, 0.95, 0.6, 0.1, 0.05, 0.02],
            "extraction_success": True
        }
        
        # User context
        user_context = {
            "user_id": "test_user_123",
            "session_id": "test_session_456",
            "drawing_time_ms": 15000,
            "device_info": "Test Browser"
        }
        
        # Collect data
        collection_id = await data_collector.collect_evaluation_data(
            character=character,
            character_type="consonant",
            user_drawing_base64=user_image,
            reference_image_base64=reference_image,
            processed_image_base64=reference_image,  # Same for simplicity
            evaluation_results=evaluation_results,
            feedback_data=feedback_data,
            feature_vector=feature_vector,
            user_context=user_context
        )
        
        if collection_id:
            logger.info(f"✅ Data collection successful. Collection ID: {collection_id}")
            return True
        else:
            logger.error("❌ Data collection failed - no collection ID returned")
            return False
            
    except Exception as e:
        logger.error(f"❌ Data collection test failed: {e}")
        return False

async def test_dataset_export():
    """Test dataset export functionality."""
    logger.info("Testing dataset export...")
    
    try:
        # Export as JSON (small sample)
        export_path = await data_collector.export_dataset(
            export_format="json",
            output_path="test_export.json",
            filters={"limit": 5}
        )
        
        # Check if file was created
        if os.path.exists(export_path):
            file_size = os.path.getsize(export_path)
            logger.info(f"✅ Dataset export successful. File: {export_path} ({file_size} bytes)")
            
            # Clean up test file
            os.remove(export_path)
            return True
        else:
            logger.error("❌ Dataset export failed - file not created")
            return False
            
    except Exception as e:
        logger.error(f"❌ Dataset export test failed: {e}")
        return False

async def test_character_profiles():
    """Test character profile management."""
    logger.info("Testing character profile management...")
    
    try:
        # Test getting a character profile
        profile = await db_service.get_character_profile("A")
        
        if profile:
            logger.info(f"✅ Character profile found for 'A': difficulty={profile.difficultyLevel}")
        else:
            logger.info("Character profile for 'A' not found, this is expected if not seeded")
        
        # Test updating character statistics
        await db_service.update_character_statistics("A", 85.5)
        logger.info("✅ Character statistics updated successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Character profile test failed: {e}")
        return False

async def main():
    """Run all database integration tests."""
    logger.info("🧪 Starting Database Integration Tests")
    
    tests = [
        ("Database Connectivity", test_database_connectivity),
        ("Feature Extraction", test_feature_extraction),
        ("Data Collection", test_data_collection),
        ("Character Profiles", test_character_profiles),
        ("Dataset Export", test_dataset_export),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        try:
            result = await test_func()
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
    logger.info("TEST SUMMARY")
    logger.info("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All database integration tests passed!")
    else:
        logger.error(f"❌ {total - passed} tests failed")
    
    # Cleanup
    await db_service.disconnect()
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)