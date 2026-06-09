"""
Image Processor Component
Handles preprocessing and normalization of images for comparison
"""
import cv2
import numpy as np
from PIL import Image
import base64
import io
import time
import logging
from typing import Tuple
from .models import ProcessedImage

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.target_size = (256, 256)
    
    def preprocess_image(self, image: Image.Image) -> ProcessedImage:
        """
        Apply identical preprocessing to both reference and user images
        
        Args:
            image: PIL Image to process
            
        Returns:
            ProcessedImage with grayscale, binary, and bounding box
        """
        # 1. Convert to RGB (in case it's RGBA or other format)
        if image.mode != 'RGB':
            # Create white background
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'RGBA':
                rgb_image.paste(image, mask=image.split()[3])  # Use alpha as mask
            else:
                rgb_image.paste(image)
            image = rgb_image
        
        # 2. Resize to 256x256
        resized = self.resize_and_center(image)
        
        # 3. Convert to grayscale
        grayscale = self.convert_to_grayscale(resized)
        
        # 4. Convert to numpy array
        gray_array = np.array(grayscale)
        
        # 5. Apply binary threshold
        binary = self.apply_binary_threshold(gray_array)
        
        # 6. Extract bounding box
        bbox = self.extract_bounding_box(binary)
        
        logger.info(f"Preprocessing complete: bbox={bbox}, binary_shape={binary.shape}")
        
        return ProcessedImage(
            grayscale=gray_array,
            binary=binary,
            bounding_box=bbox
        )
    
    def decode_base64_image(self, base64_string: str) -> Image.Image:
        """
        Decode base64 image string to PIL Image
        
        Args:
            base64_string: Base64 encoded image (with or without data URL prefix)
            
        Returns:
            PIL Image
        """
        # Remove data URL prefix if present
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        try:
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            return image
        except Exception as e:
            raise ValueError(f"Failed to decode base64 image: {str(e)}")
    
    def resize_and_center(self, image: Image.Image) -> Image.Image:
        """
        Resize image to target size while preserving aspect ratio and centering
        
        Args:
            image: PIL Image to resize (must be RGB)
            
        Returns:
            Resized and centered PIL Image (RGB with white background)
        """
        # Calculate scaling to fit within target size
        img_width, img_height = image.size
        target_width, target_height = self.target_size
        
        scale = min(target_width / img_width, target_height / img_height)
        new_width = int(img_width * scale)
        new_height = int(img_height * scale)
        
        # Resize image
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create new image with target size and WHITE background
        result = Image.new('RGB', self.target_size, (255, 255, 255))
        
        # Center the resized image
        x_offset = (target_width - new_width) // 2
        y_offset = (target_height - new_height) // 2
        result.paste(resized, (x_offset, y_offset))
        
        return result
    
    def convert_to_grayscale(self, image: Image.Image) -> Image.Image:
        """
        Convert image to grayscale
        
        Args:
            image: PIL Image to convert
            
        Returns:
            Grayscale PIL Image
        """
        return image.convert('L')
    
    def apply_binary_threshold(self, image: np.ndarray) -> np.ndarray:
        """
        Apply adaptive threshold - works for both font and hand-drawn images
        
        Args:
            image: Grayscale numpy array
            
        Returns:
            Binary numpy array
        """
        # Apply adaptive threshold
        binary = cv2.adaptiveThreshold(
            image,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,  # Invert: black becomes white, white becomes black
            11,  # Block size
            2    # Constant subtracted from mean
        )
        
        # SAVE DEBUG IMAGE
        debug_path = f"/tmp/binary_{int(time.time())}.png"
        cv2.imwrite(debug_path, binary)
        logger.info(f"Binary threshold saved to: {debug_path}")
        
        return binary
    
    def extract_bounding_box(self, binary_image: np.ndarray) -> Tuple[int, int, int, int]:
        """
        Extract bounding box of the main content
        
        Args:
            binary_image: Binary numpy array
            
        Returns:
            Tuple of (x, y, width, height)
        """
        # Find contours
        contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            # Return full image if no contours found
            return (0, 0, binary_image.shape[1], binary_image.shape[0])
        
        # Get bounding box of all contours combined
        x_min, y_min = float('inf'), float('inf')
        x_max, y_max = 0, 0
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            x_min = min(x_min, x)
            y_min = min(y_min, y)
            x_max = max(x_max, x + w)
            y_max = max(y_max, y + h)
        
        return (int(x_min), int(y_min), int(x_max - x_min), int(y_max - y_min))