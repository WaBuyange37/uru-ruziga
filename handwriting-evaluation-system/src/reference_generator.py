"""
Reference Generator Component
Dynamically generates reference character images from Umwero font files
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from typing import Optional
import os

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
            PIL Image of the rendered character (256x256, transparent background)
        """
        if not character:
            raise ValueError("Character cannot be empty")
        
        # Create transparent canvas
        image = Image.new('RGBA', self.canvas_size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(image)
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), character, font=self._font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (self.canvas_size[0] - text_width) // 2 - bbox[0]
        y = (self.canvas_size[1] - text_height) // 2 - bbox[1]
        
        # Draw the character in black
        draw.text((x, y), character, font=self._font, fill=(0, 0, 0, 255))
        
        return image