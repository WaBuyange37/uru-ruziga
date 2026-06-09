#!/usr/bin/env python3
"""
Test the new reference endpoint
"""
import requests
import json

def test_reference_endpoint():
    """Test the get-reference endpoint"""
    print("Testing reference endpoint...")
    
    # Test with Umwero character for 'A' (which is '"')
    payload = {
        "character": '"',  # Umwero character for 'A'
        "image": "data:image/png;base64,dummy"  # Required but not used
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/get-reference",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Reference endpoint successful!")
            print(f"Character: {data['character']}")
            print(f"Image data length: {len(data['reference_image'])} chars")
            print(f"Image starts with: {data['reference_image'][:50]}...")
            
            # Save the reference image for inspection
            import base64
            image_data = data['reference_image'].split(',')[1]  # Remove data URL prefix
            with open('/tmp/frontend_reference_test.png', 'wb') as f:
                f.write(base64.b64decode(image_data))
                
            print("Reference image saved to /tmp/frontend_reference_test.png")
            
        else:
            print(f"❌ Reference endpoint failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_reference_endpoint()