"""
Font rendering service for generating reference character images.
"""

import os
import logging
from typing import Optional
import numpy as np
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)


class FontRenderer:
    """
    Font rendering service for Umwero characters.
    """
    
    def __init__(self, font_path: str):
        self.font_path = font_path
        
        # Validate font file exists
        if not os.path.exists(font_path):
            logger.warning(f"Font file not found: {font_path}")
            self.font_available = False
        else:
            self.font_available = True
            logger.info(f"FontRenderer initialized with font: {font_path}")
    
    def render_character(self, character: str, size: int = 256) -> Image.Image:
        """
        Render a character using the Umwero font.
        
        Args:
            character: Unicode character to render
            size: Output image size (size x size pixels)
            
        Returns:
            PIL Image with rendered character
        """
        try:
            if not self.font_available:
                # Return placeholder image if font not available
                return self._create_placeholder_image(character, size)
            
            # Load font
            font_size = int(size * 0.8)
            font = ImageFont.truetype(self.font_path, font_size)
            
            # Create image with white background
            img = Image.new('L', (size, size), 255)
            draw = ImageDraw.Draw(img)
            
            # Get text bounding box
            bbox = draw.textbbox((0, 0), character, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Center text
            x = (size - text_width) // 2
            y = (size - text_height) // 2
            
            # Draw text in black
            draw.text((x, y), character, font=font, fill=0)
            
            return img
            
        except Exception as e:
            logger.error(f"Failed to render character '{character}': {e}")
            return self._create_placeholder_image(character, size)
    
    def _create_placeholder_image(self, character: str, size: int) -> Image.Image:
        """Create a placeholder image when font rendering fails"""
        img = Image.new('L', (size, size), 255)
        draw = ImageDraw.Draw(img)
        
        # Draw a simple placeholder
        margin = size // 4
        draw.rectangle([margin, margin, size - margin, size - margin], outline=0, width=2)
        
        # Try to draw the character with default font
        try:
            font = ImageFont.load_default()
            text = character
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (size - text_width) // 2
            y = (size - text_height) // 2
            draw.text((x, y), text, font=font, fill=0)
        except:
            pass
        
        return img
