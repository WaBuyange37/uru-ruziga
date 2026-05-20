"""
Simple test script to verify the Uruziga AI Service is working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    """Test root endpoint"""
    print("Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Root endpoint working\n")


def test_health():
    """Test health check endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Health endpoint working\n")


def test_evaluate():
    """Test evaluation endpoint"""
    print("Testing evaluate endpoint...")
    
    payload = {
        "character_id": "test_char_123",
        "strokes": [
            [
                {"x": 100, "y": 150, "timestamp": 1234567890.0, "pressure": 0.8},
                {"x": 102, "y": 152, "timestamp": 1234567891.0, "pressure": 0.8},
                {"x": 104, "y": 154, "timestamp": 1234567892.0, "pressure": 0.7}
            ],
            [
                {"x": 150, "y": 100, "timestamp": 1234567900.0, "pressure": 0.9},
                {"x": 152, "y": 102, "timestamp": 1234567901.0, "pressure": 0.9}
            ]
        ],
        "options": {
            "include_heatmap": True,
            "include_stroke_analysis": True,
            "detail_level": "detailed"
        }
    }
    
    response = requests.post(f"{BASE_URL}/evaluate", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    
    data = response.json()
    assert "score" in data
    assert "accuracy_level" in data
    assert "feedback" in data
    print("✓ Evaluate endpoint working\n")


def test_generate_reference():
    """Test reference generation endpoint"""
    print("Testing generate-reference endpoint...")
    
    payload = {
        "character": "ᐁ",
        "size": 400,
        "format": "png",
        "include_stroke_order": True
    }
    
    response = requests.post(f"{BASE_URL}/generate-reference", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    
    data = response.json()
    assert "image_url" in data
    assert "character_id" in data
    print("✓ Generate-reference endpoint working\n")


def test_store_dataset():
    """Test dataset storage endpoint"""
    print("Testing store-dataset endpoint...")
    
    payload = {
        "attempt_id": "attempt_test_123",
        "user_id": "user_test_456",
        "character_id": "char_test_789",
        "strokes": [
            [
                {"x": 100, "y": 150, "timestamp": 1234567890.0, "pressure": 0.8}
            ]
        ],
        "score": 85.5,
        "metadata": {
            "device_type": "mobile",
            "input_method": "touch"
        }
    }
    
    response = requests.post(f"{BASE_URL}/store-dataset", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    
    data = response.json()
    assert "dataset_entry_id" in data
    assert "stored_at" in data
    print("✓ Store-dataset endpoint working\n")


def test_metrics():
    """Test metrics endpoint"""
    print("Testing metrics endpoint...")
    response = requests.get(f"{BASE_URL}/metrics")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Metrics endpoint working\n")


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("Uruziga AI Service - Test Suite")
    print("=" * 60)
    print()
    
    try:
        test_root()
        test_health()
        test_evaluate()
        test_generate_reference()
        test_store_dataset()
        test_metrics()
        
        print("=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to service")
        print("  Make sure the service is running: python main.py")
        
    except AssertionError as e:
        print(f"✗ Test failed: {e}")
        
    except Exception as e:
        print(f"✗ Unexpected error: {e}")


if __name__ == "__main__":
    run_all_tests()
