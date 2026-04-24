#!/usr/bin/env python3
"""
Test script for reference generation
"""
import sys
import os
sys.path.append('./src')

from src.reference_generator import ReferenceGenerator
import logging

logging.basicConfig(level=logging.INFO)

def test_reference_generation():
    """Test character generation"""
    font_path = "./fonts/umwero.otf"
    
    if not os.path.exists(font_path):
        print(f"❌ Font file not found: {font_path}")
        return False
    
    try:
        gen = ReferenceGenerator(font_path)
        print(f"✅ Font loaded successfully from {font_path}")
    except Exception as e:
        print(f"❌ Failed to load font: {e}")
        return False
    
    # Test with vowel 'A' (Umwero character: ")
    # Note: The user is learning Latin 'A' which maps to Umwero '"'
    characters = ['"', ':', '{', '|', '}']  # Umwero vowels: a, u, o, e, i
    latin_chars = ['a', 'u', 'o', 'e', 'i']  # Corresponding Latin characters
    
    print("\nTesting reference generation:")
    print("=" * 50)
    
    for i, char in enumerate(characters):
        try:
            image = gen.generate_reference(char)
            output_path = f"/tmp/test_ref_{latin_chars[i]}_{ord(char)}.png"
            image.save(output_path)
            print(f"✅ Generated reference for '{char}' (Latin: {latin_chars[i]}) → {output_path}")
        except Exception as e:
            print(f"❌ Failed for '{char}': {e}")
    
    print("\nTest complete! Check /tmp/ for generated images.")
    return True

if __name__ == "__main__":
    test_reference_generation()