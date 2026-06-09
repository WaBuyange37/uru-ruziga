"""
Image processing pipeline for handwriting evaluation.
Converts strokes to images and applies preprocessing.
"""

import base64
import io
import logging
from typing import List, Tuple, Dict, Any
from dataclasses import dataclass
import numpy as np
from PIL import Image, ImageDraw
import cv2
from skimage.morphology import skeletonize

logger = logging.getLogger(__name__)


@dataclass
class Point:
    x: float
    y: float
    timestamp: float
    pressure: float = 0.5


@dataclass
class ProcessedImage:
    """Container for processed image data"""
    original: np.ndarray
    grayscale: np.ndarray
    binary: np.ndarray
    normalized: np.ndarray
    skeleton: np.ndarray
    bounding_box: Tuple[int, int, int, int]
    center_offset: Tuple[int, int]
    processing_metadata: Dict[str, Any]


class ImageProcessor:
    """
    Image processing pipeline for handwriting evaluation.
    """
    
    def __init__(self, target_size: int = 256):
        self.target_size = target_size
        logger.info(f"ImageProcessor initialized with target_size={target_size}")
    
    def strokes_to_image(self, strokes: List[List[Dict]], canvas_size: int = 400) -> Image.Image:
        """
        Convert stroke data to PIL Image.
        
        Args:
            strokes: List of strokes, each stroke is a list of point dicts
            canvas_size: Original canvas size
            
        Returns:
            PIL Image with white background and black strokes
        """
        try:
            # Create white canvas
            img = Image.new('RGB', (canvas_size, canvas_size), 'white')
            draw = ImageDraw.Draw(img)
            
            # Draw each stroke
            for stroke in strokes:
                if len(stroke) < 2:
                    continue
                
                # Convert points to tuples
                points = [(p['x'], p['y']) for p in stroke]
                
                # Draw lines between consecutive points
                for i in range(len(points) - 1):
                    draw.line([points[i], points[i + 1]], fill='black', width=3)
            
            return img
            
        except Exception as e:
            logger.error(f"Failed to convert strokes to image: {e}")
            raise ValueError(f"Stroke to image conversion failed: {str(e)}")
    
    def base64_to_image(self, base64_data: str) -> Image.Image:
        """
        Convert base64 data URL to PIL Image.
        
        Args:
            base64_data: Base64 encoded image data URL
            
        Returns:
            PIL Image
        """
        try:
            # Extract base64 data
            if base64_data.startswith('data:image/'):
                base64_data = base64_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(base64_data)
            
            # Convert to PIL Image
            img = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            return img
            
        except Exception as e:
            logger.error(f"Failed to convert base64 to image: {e}")
            raise ValueError(f"Base64 to image conversion failed: {str(e)}")
    
    def preprocess_image(self, image: Image.Image) -> ProcessedImage:
        """
        Apply comprehensive preprocessing pipeline.
        
        Args:
            image: PIL Image to preprocess
            
        Returns:
            ProcessedImage with all processing stages
        """
        try:
            # Convert to numpy array
            original = np.array(image)
            
            # Resize to target size
            resized = self._resize_image(original, self.target_size)
            
            # Convert to grayscale
            grayscale = self._convert_to_grayscale(resized)
            
            # Apply binary threshold
            binary = self._apply_binary_threshold(grayscale)
            
            # Normalize and center
            normalized, bbox, center_offset = self._normalize_and_center(binary)
            
            # Generate skeleton
            skeleton = self._generate_skeleton(normalized)
            
            metadata = {
                'original_size': original.shape[:2],
                'target_size': self.target_size,
                'bounding_box': bbox,
                'center_offset': center_offset
            }
            
            return ProcessedImage(
                original=original,
                grayscale=grayscale,
                binary=normalized,
                normalized=normalized,
                skeleton=skeleton,
                bounding_box=bbox,
                center_offset=center_offset,
                processing_metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise ValueError(f"Failed to preprocess image: {str(e)}")
    
    def _resize_image(self, image: np.ndarray, target_size: int) -> np.ndarray:
        """Resize image to target size while preserving aspect ratio"""
        height, width = image.shape[:2]
        
        # Calculate scaling factor
        scale = min(target_size / width, target_size / height)
        
        new_width = int(width * scale)
        new_height = int(height * scale)
        
        # Resize image
        resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Create canvas with white background
        if len(image.shape) == 3:
            canvas = np.full((target_size, target_size, image.shape[2]), 255, dtype=np.uint8)
        else:
            canvas = np.full((target_size, target_size), 255, dtype=np.uint8)
        
        # Center the resized image
        y_offset = (target_size - new_height) // 2
        x_offset = (target_size - new_width) // 2
        
        if len(image.shape) == 3:
            canvas[y_offset:y_offset + new_height, x_offset:x_offset + new_width] = resized
        else:
            canvas[y_offset:y_offset + new_height, x_offset:x_offset + new_width] = resized
        
        return canvas
    
    def _convert_to_grayscale(self, image: np.ndarray) -> np.ndarray:
        """Convert image to grayscale if needed"""
        if len(image.shape) == 3:
            grayscale = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            grayscale = image.copy()
        
        return grayscale
    
    def _apply_binary_threshold(self, image: np.ndarray) -> np.ndarray:
        """Apply binary thresholding using Otsu's method"""
        _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Invert if needed (ensure text is white on black background)
        if np.mean(binary) > 127:
            binary = cv2.bitwise_not(binary)
        
        return binary
    
    def _normalize_and_center(self, image: np.ndarray) -> Tuple[np.ndarray, Tuple[int, int, int, int], Tuple[int, int]]:
        """Detect bounding box and center the content"""
        # Find bounding box of non-zero pixels
        coords = np.column_stack(np.where(image > 0))
        
        if len(coords) == 0:
            # Empty image
            height, width = image.shape
            return image, (0, 0, width, height), (0, 0)
        
        # Get bounding box
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        
        # Extract content
        content = image[y_min:y_max+1, x_min:x_max+1]
        
        # Calculate scaling
        content_height, content_width = content.shape
        target_size = self.target_size
        margin = target_size // 8
        available_size = target_size - 2 * margin
        
        scale = min(available_size / content_width, available_size / content_height)
        scale = min(scale, 1.0)
        
        # Resize content if needed
        if scale < 1.0:
            new_width = int(content_width * scale)
            new_height = int(content_height * scale)
            content = cv2.resize(content, (new_width, new_height), interpolation=cv2.INTER_AREA)
            content_height, content_width = content.shape
        
        # Create centered image
        centered = np.zeros((target_size, target_size), dtype=np.uint8)
        
        # Calculate centering position
        y_offset = (target_size - content_height) // 2
        x_offset = (target_size - content_width) // 2
        
        # Place content in center
        centered[y_offset:y_offset + content_height, x_offset:x_offset + content_width] = content
        
        # Calculate center offset
        original_center_x = target_size // 2
        original_center_y = target_size // 2
        new_center_x = x_offset + content_width // 2
        new_center_y = y_offset + content_height // 2
        
        center_offset = (new_center_x - original_center_x, new_center_y - original_center_y)
        bounding_box = (x_offset, y_offset, content_width, content_height)
        
        return centered, bounding_box, center_offset
    
    def _generate_skeleton(self, image: np.ndarray) -> np.ndarray:
        """Generate skeleton of the binary image"""
        # Convert to boolean for skeletonization
        binary_bool = image > 0
        skeleton_bool = skeletonize(binary_bool)
        skeleton = (skeleton_bool * 255).astype(np.uint8)
        
        return skeleton
