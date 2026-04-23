#!/usr/bin/env python3
"""
Simple test script for the Handwriting Evaluation API
"""
import base64
import io
import requests
from PIL import Image, ImageDraw

def create_test_image():
    """Create a simple test image with the letter 'A'"""
    # Create a 256x256 white image
    img = Image.new('RGB', (256, 256), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple 'A' shape
    # Left line
    draw.line([(100, 200), (128, 50)], fill='black', width=8)
    # Right line  
    draw.line([(128, 50), (156, 200)], fill='black', width=8)
    # Cross bar
    draw.line([(110, 125), (146, 125)], fill='black', width=8)
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def test_api():
    """Test the evaluation API"""
    base_url = "http://localhost:8000"
    
    print("Testing Handwriting Evaluation API...")
    print("=" * 50)
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"Root Endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Root endpoint failed: {e}")
        return
    
    # Test evaluation endpoint
    try:
        test_image = create_test_image()
        
        payload = {
            "character": "A",
            "image": test_image
        }
        
        print("Testing character evaluation...")
        response = requests.post(f"{base_url}/api/evaluate-character", json=payload)
        print(f"Evaluation: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Score: {result['score']:.1f}")
            print("✅ API test successful!")
        else:
            print(f"Error: {response.json()}")
            
    except Exception as e:
        print(f"Evaluation test failed: {e}")

if __name__ == "__main__":
    test_api()