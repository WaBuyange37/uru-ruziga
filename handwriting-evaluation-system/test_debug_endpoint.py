#!/usr/bin/env python3
"""
Test the debug endpoint to see reference and user images
"""
import requests
import base64
import json
from PIL import Image, ImageDraw
import io

def create_test_drawing():
    """Create a simple test drawing of the letter 'A'"""
    # Create a 256x256 white canvas
    image = Image.new('RGB', (256, 256), (255, 255, 255))
    draw = ImageDraw.Draw(image)
    
    # Draw a simple 'A' shape in black
    # Left line
    draw.line([(100, 200), (128, 100)], fill=(0, 0, 0), width=8)
    # Right line  
    draw.line([(128, 100), (156, 200)], fill=(0, 0, 0), width=8)
    # Cross bar
    draw.line([(110, 150), (146, 150)], fill=(0, 0, 0), width=6)
    
    # Convert to base64
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    image_data = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{image_data}"

def test_debug_endpoint():
    """Test the debug comparison endpoint"""
    print("Testing debug endpoint...")
    
    # Create test drawing
    test_image = create_test_drawing()
    
    # Test with Umwero character for 'A' (which is '"')
    payload = {
        "character": '"',  # Umwero character for 'A'
        "image": test_image
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/debug-comparison",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Debug endpoint successful!")
            print(f"Reference bbox: {data['reference_bbox']}")
            print(f"User bbox: {data['user_bbox']}")
            
            # Save the binary images for inspection
            ref_binary = base64.b64decode(data['reference_binary'])
            user_binary = base64.b64decode(data['user_binary'])
            
            with open('/tmp/debug_reference_binary.png', 'wb') as f:
                f.write(ref_binary)
            
            with open('/tmp/debug_user_binary.png', 'wb') as f:
                f.write(user_binary)
                
            print("Binary images saved to /tmp/debug_*_binary.png")
            
        else:
            print(f"❌ Debug endpoint failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_debug_endpoint()