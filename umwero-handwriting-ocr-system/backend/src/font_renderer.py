"""
Professional font rendering system with multi-engine support and quality validation.
Supports FreeType-py (primary), Cairo/Pycairo (fallback), and fontTools + Pillow (alternative).
"""

import os
import logging
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2

# Try importing professional rendering engines
try:
    import freetype
    FREETYPE_AVAILABLE = True
except ImportError:
    FREETYPE_AVAILABLE = False
    logging.warning("FreeType-py not available, falling back to alternative engines")

try:
    import cairo
    import gi
    gi.require_version('Pango', '1.0')
    gi.require_version('PangoCairo', '1.0')
    from gi.repository import Pango, PangoCairo
    CAIRO_AVAILABLE = True
except ImportError:
    CAIRO_AVAILABLE = False
    logging.warning("Cairo/Pango not available")

from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen


class RenderingEngine(Enum):
    FREETYPE = "freetype"
    CAIRO = "cairo"
    PILLOW = "pillow"
    AUTO = "auto"


@dataclass
class CharacterMetrics:
    """Character metrics extracted from font"""
    width: int
    height: int
    baseline: int
    ascent: int
    descent: int
    advance_width: int
    bounding_box: Tuple[int, int, int, int]


@dataclass
class ReferenceData:
    """Complete reference data for a character"""
    image: Image.Image
    processed_image: np.ndarray
    metrics: CharacterMetrics
    rendering_engine: str
    quality_score: float


@dataclass
class FontQualityReport:
    """Font quality assessment report"""
    is_valid: bool
    supported_characters: List[str]
    rendering_quality: float
    recommended_engine: RenderingEngine
    issues: List[str]


class FontRenderingService:
    """
    Professional font rendering service with automatic engine selection
    and quality validation for optimal character extraction.
    """
    
    def __init__(self, font_path: str, rendering_engine: RenderingEngine = RenderingEngine.AUTO):
        self.font_path = font_path
        self.rendering_engine = rendering_engine
        self.cache: Dict[str, ReferenceData] = {}
        
        # Validate font file exists
        if not os.path.exists(font_path):
            raise FileNotFoundError(f"Font file not found: {font_path}")
        
        # Load font and determine best rendering engine
        self._load_font()
        self._select_rendering_engine()
        
        logging.info(f"FontRenderingService initialized with {self.selected_engine.value} engine")
    
    def _load_font(self):
        """Load font file and extract basic information"""
        try:
            # Use fontTools to read font metadata
            self.font_data = TTFont(self.font_path)
            self.character_map = self.font_data.getBestCmap()
            
            # Get font metrics
            self.units_per_em = self.font_data['head'].unitsPerEm
            self.ascent = self.font_data['hhea'].ascent
            self.descent = self.font_data['hhea'].descent
            
        except Exception as e:
            raise ValueError(f"Failed to load font file: {e}")
    
    def _select_rendering_engine(self):
        """Select the best available rendering engine"""
        if self.rendering_engine == RenderingEngine.AUTO:
            # Automatic selection based on availability and quality
            if FREETYPE_AVAILABLE:
                self.selected_engine = RenderingEngine.FREETYPE
            elif CAIRO_AVAILABLE:
                self.selected_engine = RenderingEngine.CAIRO
            else:
                self.selected_engine = RenderingEngine.PILLOW
        else:
            self.selected_engine = self.rendering_engine
        
        # Validate selected engine is available
        if self.selected_engine == RenderingEngine.FREETYPE and not FREETYPE_AVAILABLE:
            raise RuntimeError("FreeType engine selected but not available")
        if self.selected_engine == RenderingEngine.CAIRO and not CAIRO_AVAILABLE:
            raise RuntimeError("Cairo engine selected but not available")
    
    def render_character(self, character: str, size: int = 256) -> Image.Image:
        """
        Render a character using the selected engine with high quality.
        
        Args:
            character: Unicode character to render
            size: Output image size (size x size pixels)
            
        Returns:
            PIL Image with rendered character, centered and properly scaled
        """
        # Check if character is supported
        char_code = ord(character)
        if char_code not in self.character_map:
            raise ValueError(f"Character '{character}' not supported by font")
        
        # Use appropriate rendering engine
        if self.selected_engine == RenderingEngine.FREETYPE:
            return self._render_freetype(character, size)
        elif self.selected_engine == RenderingEngine.CAIRO:
            return self._render_cairo(character, size)
        else:
            return self._render_pillow(character, size)
    
    def _render_freetype(self, character: str, size: int) -> Image.Image:
        """Render using FreeType-py for professional quality"""
        if not FREETYPE_AVAILABLE:
            raise RuntimeError("FreeType not available")
        
        # Load face
        face = freetype.Face(self.font_path)
        
        # Set character size (64ths of a point)
        face.set_char_size(size * 64)
        
        # Load character
        face.load_char(character)
        
        # Get glyph
        glyph = face.glyph
        bitmap = glyph.bitmap
        
        # Create image from bitmap
        if bitmap.width == 0 or bitmap.rows == 0:
            # Empty glyph, create blank image
            img = Image.new('L', (size, size), 0)
        else:
            # Convert bitmap to numpy array
            bitmap_array = np.array(bitmap.buffer, dtype=np.uint8).reshape(
                bitmap.rows, bitmap.width
            )
            
            # Create PIL image
            glyph_img = Image.fromarray(bitmap_array, mode='L')
            
            # Center the glyph in the target size
            img = Image.new('L', (size, size), 0)
            
            # Calculate centering position
            x_offset = (size - glyph_img.width) // 2
            y_offset = (size - glyph_img.height) // 2
            
            # Ensure offsets are not negative
            x_offset = max(0, x_offset)
            y_offset = max(0, y_offset)
            
            # Paste glyph onto centered image
            img.paste(glyph_img, (x_offset, y_offset))
        
        return img
    
    def _render_cairo(self, character: str, size: int) -> Image.Image:
        """Render using Cairo/Pango for complex font features"""
        if not CAIRO_AVAILABLE:
            raise RuntimeError("Cairo not available")
        
        # Create Cairo surface
        surface = cairo.ImageSurface(cairo.FORMAT_A8, size, size)
        ctx = cairo.Context(surface)
        
        # Set up Pango layout
        layout = PangoCairo.create_layout(ctx)
        
        # Load font
        font_desc = Pango.FontDescription()
        font_desc.set_family("serif")  # Will be overridden by font file
        font_desc.set_size(int(size * 0.8 * Pango.SCALE))
        layout.set_font_description(font_desc)
        
        # Set text
        layout.set_text(character, -1)
        
        # Get text extents
        text_width, text_height = layout.get_pixel_size()
        
        # Center text
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # Render text
        ctx.move_to(x, y)
        ctx.set_source_rgba(1, 1, 1, 1)  # White text
        PangoCairo.show_layout(ctx, layout)
        
        # Convert to PIL Image
        buf = surface.get_data()
        img_array = np.ndarray(shape=(size, size), dtype=np.uint8, buffer=buf)
        img = Image.fromarray(img_array, mode='L')
        
        return img
    
    def _render_pillow(self, character: str, size: int) -> Image.Image:
        """Render using Pillow as fallback option"""
        try:
            # Load font with Pillow
            font_size = int(size * 0.8)  # Leave some margin
            font = ImageFont.truetype(self.font_path, font_size)
            
            # Create image
            img = Image.new('L', (size, size), 0)
            draw = ImageDraw.Draw(img)
            
            # Get text bounding box
            bbox = draw.textbbox((0, 0), character, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Center text
            x = (size - text_width) // 2
            y = (size - text_height) // 2
            
            # Draw text
            draw.text((x, y), character, font=font, fill=255)
            
            return img
            
        except Exception as e:
            logging.error(f"Pillow rendering failed: {e}")
            # Return blank image as last resort
            return Image.new('L', (size, size), 0)
    
    def get_character_metrics(self, character: str) -> CharacterMetrics:
        """Extract detailed metrics for a character"""
        char_code = ord(character)
        if char_code not in self.character_map:
            raise ValueError(f"Character '{character}' not supported by font")
        
        if self.selected_engine == RenderingEngine.FREETYPE and FREETYPE_AVAILABLE:
            return self._get_freetype_metrics(character)
        else:
            return self._get_fallback_metrics(character)
    
    def _get_freetype_metrics(self, character: str) -> CharacterMetrics:
        """Get precise metrics using FreeType"""
        face = freetype.Face(self.font_path)
        face.set_char_size(256 * 64)  # 256pt size
        face.load_char(character)
        
        glyph = face.glyph
        metrics = glyph.metrics
        
        return CharacterMetrics(
            width=metrics.width // 64,
            height=metrics.height // 64,
            baseline=0,  # Will be calculated relative to image
            ascent=face.ascender // 64,
            descent=face.descender // 64,
            advance_width=metrics.horiAdvance // 64,
            bounding_box=(
                metrics.horiBearingX // 64,
                metrics.horiBearingY // 64,
                (metrics.horiBearingX + metrics.width) // 64,
                (metrics.horiBearingY - metrics.height) // 64
            )
        )
    
    def _get_fallback_metrics(self, character: str) -> CharacterMetrics:
        """Get basic metrics using fallback methods"""
        # Render character to get dimensions
        img = self.render_character(character, 256)
        img_array = np.array(img)
        
        # Find bounding box of non-zero pixels
        coords = np.column_stack(np.where(img_array > 0))
        if len(coords) > 0:
            y_min, x_min = coords.min(axis=0)
            y_max, x_max = coords.max(axis=0)
            
            return CharacterMetrics(
                width=x_max - x_min,
                height=y_max - y_min,
                baseline=y_max,  # Approximate baseline
                ascent=256 - y_min,
                descent=y_max - 256,
                advance_width=x_max - x_min,
                bounding_box=(x_min, y_min, x_max, y_max)
            )
        else:
            # Empty character
            return CharacterMetrics(0, 0, 0, 0, 0, 0, (0, 0, 0, 0))
    
    def validate_font_quality(self) -> FontQualityReport:
        """Assess font quality and rendering capabilities"""
        issues = []
        supported_chars = []
        
        # Test common Umwero characters
        test_chars = ['A', 'B', 'C', 'a', 'b', 'c']  # Add actual Umwero chars
        
        quality_scores = []
        
        for char in test_chars:
            try:
                char_code = ord(char)
                if char_code in self.character_map:
                    supported_chars.append(char)
                    
                    # Render and assess quality
                    img = self.render_character(char, 256)
                    quality = self._assess_rendering_quality(img)
                    quality_scores.append(quality)
                    
            except Exception as e:
                issues.append(f"Failed to render '{char}': {e}")
        
        avg_quality = np.mean(quality_scores) if quality_scores else 0.0
        
        # Determine recommended engine
        recommended_engine = RenderingEngine.FREETYPE
        if not FREETYPE_AVAILABLE:
            recommended_engine = RenderingEngine.CAIRO if CAIRO_AVAILABLE else RenderingEngine.PILLOW
        
        return FontQualityReport(
            is_valid=len(supported_chars) > 0 and avg_quality > 0.5,
            supported_characters=supported_chars,
            rendering_quality=avg_quality,
            recommended_engine=recommended_engine,
            issues=issues
        )
    
    def _assess_rendering_quality(self, img: Image.Image) -> float:
        """Assess the quality of a rendered character image"""
        img_array = np.array(img)
        
        # Check if image has content
        if np.sum(img_array) == 0:
            return 0.0
        
        # Calculate quality metrics
        # 1. Edge sharpness
        edges = cv2.Canny(img_array, 50, 150)
        edge_ratio = np.sum(edges > 0) / (img_array.shape[0] * img_array.shape[1])
        
        # 2. Contrast
        contrast = np.std(img_array) / 255.0
        
        # 3. Fill ratio (how much of the image is used)
        fill_ratio = np.sum(img_array > 0) / (img_array.shape[0] * img_array.shape[1])
        
        # Combine metrics
        quality = (edge_ratio * 0.4 + contrast * 0.4 + fill_ratio * 0.2)
        return min(1.0, quality)
    
    def precompute_references(self, characters: List[str]) -> Dict[str, ReferenceData]:
        """Precompute reference data for multiple characters"""
        references = {}
        
        for char in characters:
            try:
                # Render character
                img = self.render_character(char, 256)
                
                # Get metrics
                metrics = self.get_character_metrics(char)
                
                # Assess quality
                quality = self._assess_rendering_quality(img)
                
                # Convert to processed format (grayscale numpy array)
                processed = np.array(img, dtype=np.float32) / 255.0
                
                references[char] = ReferenceData(
                    image=img,
                    processed_image=processed,
                    metrics=metrics,
                    rendering_engine=self.selected_engine.value,
                    quality_score=quality
                )
                
                # Cache the result
                self.cache[char] = references[char]
                
            except Exception as e:
                logging.error(f"Failed to precompute reference for '{char}': {e}")
        
        return references


# Example usage and testing
if __name__ == "__main__":
    # This would be used for testing with an actual Umwero font file
    logging.basicConfig(level=logging.INFO)
    
    # Example font path (would be actual Umwero font)
    font_path = "fonts/umwero.ttf"
    
    if os.path.exists(font_path):
        try:
            renderer = FontRenderingService(font_path)
            
            # Validate font
            quality_report = renderer.validate_font_quality()
            print(f"Font quality report: {quality_report}")
            
            # Test rendering
            test_char = 'A'
            img = renderer.render_character(test_char)
            print(f"Rendered character '{test_char}': {img.size}")
            
            # Get metrics
            metrics = renderer.get_character_metrics(test_char)
            print(f"Character metrics: {metrics}")
            
        except Exception as e:
            print(f"Error: {e}")
    else:
        print(f"Font file not found: {font_path}")
        print("Please add Umwero font file to test the renderer")