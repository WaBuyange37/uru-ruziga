"""
Reference Generator Component
Dynamically generates reference character images from Umwero font files
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

class ReferenceGenerator:
    def __init__(self, font_path: str):
        """
        Initialize the reference generator with a font file
        
        Args:
            font_path: Path to the Umwero font file (.ttf or .otf)
        """
        self.font_path = font_path
        self.font_size = 200  # Large size for 256x256 canvas
        self.canvas_size = (256, 256)
        self._font = None
        self._load_font()
    
    def _load_font(self):
        """Load the font file and validate it"""
        if not os.path.exists(self.font_path):
            raise FileNotFoundError(f"Font file not found: {self.font_path}")
        
        try:
            self._font = ImageFont.truetype(self.font_path, self.font_size)
        except Exception as e:
            raise ValueError(f"Failed to load font file {self.font_path}: {str(e)}")
    
    def generate_reference(self, character: str) -> Image.Image:
        """
        Generate a reference image for the given character
        
        Args:
            character: The character to render
            
        Returns:
            PIL Image of the rendered character (256x256, white background, black text)
        """
        if not character:
            raise ValueError("Character cannot be empty")
        
        logger.info(f"Generating reference for character: '{character}'")
        
        # Create WHITE background (not transparent!)
        image = Image.new('RGB', self.canvas_size, (255, 255, 255))
        draw = ImageDraw.Draw(image)
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), character, font=self._font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        logger.info(f"Character bbox: {bbox}, width: {text_width}, height: {text_height}")
        
        # Center the text
        x = (self.canvas_size[0] - text_width) // 2 - bbox[0]
        y = (self.canvas_size[1] - text_height) // 2 - bbox[1]
        
        logger.info(f"Drawing at position: ({x}, {y})")
        
        # Draw in BLACK
        draw.text((x, y), character, font=self._font, fill=(0, 0, 0))
        
        # SAVE DEBUG IMAGE
        debug_path = f"/tmp/reference_{ord(character)}.png"
        image.save(debug_path)
        logger.info(f"Reference image saved to: {debug_path}")
        
        return image