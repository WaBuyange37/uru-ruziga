#!/usr/bin/env python3
"""
Show comprehensive overview of image storage in the handwriting evaluation system
"""
import os
import glob
from PIL import Image

def analyze_image_storage():
    """Analyze all stored images"""
    print("🖼️  HANDWRITING EVALUATION SYSTEM - IMAGE STORAGE OVERVIEW")
    print("=" * 70)
    
    # 1. Font-Generated Reference Images
    print("\n📝 1. FONT-GENERATED REFERENCE IMAGES")
    print("   Location: /tmp/reference_*.png")
    print("   Purpose: Clean Umwero characters rendered from font")
    print("   Format: 256x256 RGB, white background, black text")
    print("-" * 50)
    
    reference_files = glob.glob("/tmp/reference_*.png")
    char_map = {
        34: '"  (Latin: A)',
        58: ':  (Latin: U)', 
        123: '{ (Latin: O)',
        124: '| (Latin: E)',
        125: '} (Latin: I)'
    }
    
    for file_path in sorted(reference_files):
        filename = os.path.basename(file_path)
        try:
            # Extract unicode number from filename
            unicode_num = int(filename.split('_')[1].split('.')[0])
            char_info = char_map.get(unicode_num, f"Unicode {unicode_num}")
            
            # Get image info
            with Image.open(file_path) as img:
                size = f"{img.size[0]}x{img.size[1]}"
                mode = img.mode
                file_size = os.path.getsize(file_path)
                
            print(f"   ✅ {filename}")
            print(f"      Character: {char_info}")
            print(f"      Size: {size}, Mode: {mode}, File: {file_size} bytes")
            
        except Exception as e:
            print(f"   ❌ {filename} - Error: {e}")
    
    # 2. Binary Processed Images  
    print("\n🔲 2. BINARY PROCESSED IMAGES")
    print("   Location: /tmp/binary_*.png")
    print("   Purpose: Adaptive threshold applied for comparison")
    print("   Format: Binary (white=strokes, black=background)")
    print("-" * 50)
    
    binary_files = glob.glob("/tmp/binary_*.png")
    for file_path in sorted(binary_files)[-3:]:  # Show last 3
        filename = os.path.basename(file_path)
        try:
            with Image.open(file_path) as img:
                size = f"{img.size[0]}x{img.size[1]}"
                mode = img.mode
                file_size = os.path.getsize(file_path)
                
            print(f"   ✅ {filename}")
            print(f"      Size: {size}, Mode: {mode}, File: {file_size} bytes")
            
        except Exception as e:
            print(f"   ❌ {filename} - Error: {e}")
    
    # 3. Debug Comparison Images
    print("\n🔍 3. DEBUG COMPARISON IMAGES")
    print("   Location: /tmp/debug_*_binary.png")
    print("   Purpose: Side-by-side comparison for debugging")
    print("   Format: Binary processed versions of reference vs user")
    print("-" * 50)
    
    debug_files = glob.glob("/tmp/debug_*_binary.png")
    for file_path in sorted(debug_files):
        filename = os.path.basename(file_path)
        try:
            with Image.open(file_path) as img:
                size = f"{img.size[0]}x{img.size[1]}"
                mode = img.mode
                file_size = os.path.getsize(file_path)
                
            print(f"   ✅ {filename}")
            print(f"      Size: {size}, Mode: {mode}, File: {file_size} bytes")
            
        except Exception as e:
            print(f"   ❌ {filename} - Error: {e}")
    
    # 4. Processing Pipeline Overview
    print("\n🔄 4. IMAGE PROCESSING PIPELINE")
    print("-" * 50)
    print("   User Canvas Drawing (browser)")
    print("   ↓ (sent as base64 data URL)")
    print("   📥 API receives image")
    print("   ↓ (decode base64)")
    print("   🖼️  PIL Image (RGBA/RGB)")
    print("   ↓ (convert to RGB, white background)")
    print("   📐 Resize & center (256x256)")
    print("   ↓ (convert to grayscale)")
    print("   ⚫ Apply adaptive threshold")
    print("   ↓ (save debug binary image)")
    print("   🔍 Compare with reference binary")
    print("   ↓ (SSIM + contour matching)")
    print("   📊 Final score (0-100)")
    
    # 5. Current Storage Stats
    print("\n📊 5. STORAGE STATISTICS")
    print("-" * 50)
    
    total_files = len(reference_files) + len(binary_files) + len(debug_files)
    total_size = 0
    
    for pattern in ["/tmp/reference_*.png", "/tmp/binary_*.png", "/tmp/debug_*_binary.png"]:
        files = glob.glob(pattern)
        for file_path in files:
            total_size += os.path.getsize(file_path)
    
    print(f"   Total Images: {total_files}")
    print(f"   Total Size: {total_size / 1024:.1f} KB")
    print(f"   Reference Images: {len(reference_files)}")
    print(f"   Binary Images: {len(binary_files)}")
    print(f"   Debug Images: {len(debug_files)}")
    
    print("\n✅ All images are stored in /tmp/ for debugging purposes")
    print("   In production, you may want to disable debug image saving")
    print("   or store them in a proper logging directory.")

if __name__ == "__main__":
    analyze_image_storage()