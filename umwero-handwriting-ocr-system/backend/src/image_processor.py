"""
Advanced image processing pipeline for handwriting evaluation.
Applies sophisticated preprocessing to ensure fair and accurate image comparisons.
"""

import base64
import io
import logging
import re
from typing import Tuple, Optional, Dict, Any
from dataclasses import dataclass
import numpy as np
from PIL import Image
import cv2
from skimage import morphology, measure, filters
from skimage.morphology import skeletonize

logger = logging.getLogger(__name__)


@dataclass
class ProcessedImage:
    """Container for processed image data and metadata"""
    original: np.ndarray
    grayscale: np.ndarray
    binary: np.ndarray
    normalized: np.ndarray
    skeleton: np.ndarray
    bounding_box: Tuple[int, int, int, int]  # (x, y, width, height)
    center_offset: Tuple[int, int]  # (dx, dy) from original center
    processing_metadata: Dict[str, Any]


@dataclass
class FeatureVector:
    """Comprehensive geometric and structural properties"""
    # Geometric features
    contour_area: float
    aspect_ratio: float
    bounding_box: Tuple[int, int, int, int]
    
    # Topological features
    stroke_count: int
    loop_count: int
    endpoint_count: int
    intersection_count: int
    
    # Shape features
    perimeter: float
    solidity: float
    extent: float
    
    # Additional metrics
    fill_ratio: float
    centroid: Tuple[float, float]
    orientation: float


@dataclass
class ProcessingConfig:
    """Configuration for image processing pipeline"""
    target_size: int = 256
    gaussian_blur_sigma: float = 0.5
    binary_threshold_method: str = 'otsu'  # 'otsu', 'adaptive', 'fixed'
    binary_threshold_value: int = 127  # Used for 'fixed' method
    morphology_kernel_size: int = 3
    dilation_iterations: int = 1
    noise_removal_area_threshold: int = 10
    centering_enabled: bool = True
    skeleton_method: str = 'zhang_suen'  # 'zhang_suen', 'medial_axis'


class ImageProcessingPipeline:
    """
    Advanced image processing pipeline ensuring consistent preprocessing
    for both reference and user images.
    """
    
    def __init__(self, config: ProcessingConfig = None):
        self.config = config or ProcessingConfig()
        logger.info(f"ImageProcessingPipeline initialized with config: {self.config}")
    
    def preprocess_image(self, image_input: str | np.ndarray | Image.Image) -> ProcessedImage:
        """
        Apply comprehensive preprocessing pipeline to input image.
        
        Args:
            image_input: Base64 string, numpy array, or PIL Image
            
        Returns:
            ProcessedImage with all processing stages and metadata
        """
        try:
            # Step 1: Load and validate input
            original = self._load_image(image_input)
            
            # Step 2: Resize to target size with aspect ratio preservation
            resized = self._resize_image(original, self.config.target_size)
            
            # Step 3: Convert to grayscale
            grayscale = self._convert_to_grayscale(resized)
            
            # Step 4: Apply noise reduction
            denoised = self._apply_noise_reduction(grayscale)
            
            # Step 5: Binary thresholding
            binary = self._apply_binary_threshold(denoised)
            
            # Step 6: Morphological operations
            morphed = self._apply_morphological_operations(binary)
            
            # Step 7: Remove small noise components
            cleaned = self._remove_noise_components(morphed)
            
            # Step 8: Detect bounding box and center content
            normalized, bbox, center_offset = self._normalize_and_center(cleaned)
            
            # Step 9: Generate skeleton
            skeleton = self._generate_skeleton(normalized)
            
            # Collect processing metadata
            metadata = {
                'original_size': original.shape[:2],
                'target_size': self.config.target_size,
                'bounding_box': bbox,
                'center_offset': center_offset,
                'processing_config': self.config.__dict__
            }
            
            return ProcessedImage(
                original=original,
                grayscale=grayscale,
                binary=normalized,  # Use normalized binary as the main binary
                normalized=normalized,
                skeleton=skeleton,
                bounding_box=bbox,
                center_offset=center_offset,
                processing_metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise ValueError(f"Failed to preprocess image: {str(e)}")

    def _load_image(self, image_input: str | np.ndarray | Image.Image) -> np.ndarray:
        """Load image from various input formats"""
        if isinstance(image_input, str):
            # Base64 data URL
            if image_input.startswith('data:image/'):
                header, base64_data = image_input.split(',', 1)
                mime_match = re.match(r'data:([^;]+);base64$', header)
                mime_type = mime_match.group(1).lower() if mime_match else 'application/octet-stream'
                image_bytes = base64.b64decode(base64_data)
                logger.info("Image loaded: type=%s bytes=%d", mime_type, len(image_bytes))

                if mime_type == 'image/svg+xml' or image_bytes.lstrip().startswith(b'<svg'):
                    try:
                        import cairosvg
                    except ImportError as exc:
                        raise ValueError("SVG reference requires CairoSVG") from exc

                    image_bytes = cairosvg.svg2png(
                        bytestring=image_bytes,
                        output_width=self.config.target_size * 2,
                        output_height=self.config.target_size * 2,
                    )
                    logger.info("SVG reference rasterized successfully")

                pil_image = Image.open(io.BytesIO(image_bytes))
                return self._pil_to_white_background(pil_image)
            else:
                raise ValueError("String input must be base64 data URL")
                
        elif isinstance(image_input, Image.Image):
            return self._pil_to_white_background(image_input)
            
        elif isinstance(image_input, np.ndarray):
            return image_input.copy()
            
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

    def _pil_to_white_background(self, image: Image.Image) -> np.ndarray:
        """Composite transparency onto white and return a stable RGB image."""
        image.load()
        if image.mode in ('RGBA', 'LA') or 'transparency' in image.info:
            rgba = image.convert('RGBA')
            background = Image.new('RGBA', rgba.size, (255, 255, 255, 255))
            background.alpha_composite(rgba)
            image = background.convert('RGB')
        elif image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')
        return np.array(image)
    
    def _resize_image(self, image: np.ndarray, target_size: int) -> np.ndarray:
        """Resize image to target size while preserving aspect ratio"""
        height, width = image.shape[:2]
        
        # Calculate scaling factor to fit within target size
        scale = min(target_size / width, target_size / height)
        
        new_width = int(width * scale)
        new_height = int(height * scale)
        
        # Resize image
        if len(image.shape) == 3:
            resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        else:
            resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Create target-sized canvas with white background
        if len(image.shape) == 3:
            canvas = np.full((target_size, target_size, image.shape[2]), 255, dtype=np.uint8)
        else:
            canvas = np.full((target_size, target_size), 255, dtype=np.uint8)
        
        # Center the resized image on the canvas
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
            # Convert RGB/BGR to grayscale using weighted average
            if image.shape[2] == 3:
                # Assume RGB
                grayscale = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            elif image.shape[2] == 4:
                # RGBA - convert to RGB first
                rgb = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
                grayscale = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
            else:
                raise ValueError(f"Unsupported number of channels: {image.shape[2]}")
        else:
            grayscale = image.copy()
        
        return grayscale
    
    def _apply_noise_reduction(self, image: np.ndarray) -> np.ndarray:
        """Apply Gaussian blur for noise reduction"""
        if self.config.gaussian_blur_sigma > 0:
            return cv2.GaussianBlur(
                image, 
                (0, 0), 
                self.config.gaussian_blur_sigma
            )
        return image
    
    def _apply_binary_threshold(self, image: np.ndarray) -> np.ndarray:
        """Apply binary thresholding using specified method"""
        if self.config.binary_threshold_method == 'otsu':
            _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        elif self.config.binary_threshold_method == 'adaptive':
            binary = cv2.adaptiveThreshold(
                image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
        elif self.config.binary_threshold_method == 'fixed':
            _, binary = cv2.threshold(
                image, self.config.binary_threshold_value, 255, cv2.THRESH_BINARY
            )
        else:
            raise ValueError(f"Unknown threshold method: {self.config.binary_threshold_method}")
        
        # Invert if needed (ensure text is white on black background for processing)
        if np.mean(binary) > 127:
            binary = cv2.bitwise_not(binary)
        
        return binary
    
    def _apply_morphological_operations(self, image: np.ndarray) -> np.ndarray:
        """Apply morphological operations to clean up the binary image"""
        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE, 
            (self.config.morphology_kernel_size, self.config.morphology_kernel_size)
        )
        
        # Apply closing to connect nearby components
        closed = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
        
        # Apply dilation if specified
        if self.config.dilation_iterations > 0:
            dilated = cv2.dilate(closed, kernel, iterations=self.config.dilation_iterations)
            return dilated
        
        return closed
    
    def _remove_noise_components(self, image: np.ndarray) -> np.ndarray:
        """Remove small connected components (noise)"""
        # Find connected components
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
            image, connectivity=8
        )
        
        # Create output image
        cleaned = np.zeros_like(image)
        
        # Keep components larger than threshold (skip background label 0)
        for i in range(1, num_labels):
            area = stats[i, cv2.CC_STAT_AREA]
            if area >= self.config.noise_removal_area_threshold:
                cleaned[labels == i] = 255
        
        return cleaned
    
    def _normalize_and_center(self, image: np.ndarray) -> Tuple[np.ndarray, Tuple[int, int, int, int], Tuple[int, int]]:
        """Detect bounding box and center the content"""
        if not self.config.centering_enabled:
            height, width = image.shape
            return image, (0, 0, width, height), (0, 0)
        
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
        
        # Calculate scaling to fit in target area (leave some margin)
        content_height, content_width = content.shape
        target_size = self.config.target_size
        margin = target_size // 8  # 12.5% margin
        available_size = target_size - 2 * margin
        
        scale = min(available_size / content_width, available_size / content_height)
        
        # Scale every cropped glyph to the same comparison area. This removes
        # irrelevant differences caused by font viewBox size or canvas zoom.
        if abs(scale - 1.0) > 1e-6:
            new_width = max(1, int(round(content_width * scale)))
            new_height = max(1, int(round(content_height * scale)))
            interpolation = cv2.INTER_AREA if scale < 1.0 else cv2.INTER_NEAREST
            content = cv2.resize(content, (new_width, new_height), interpolation=interpolation)
            content_height, content_width = content.shape
        
        # Create centered image
        centered = np.zeros((target_size, target_size), dtype=np.uint8)
        
        # Calculate centering position
        y_offset = (target_size - content_height) // 2
        x_offset = (target_size - content_width) // 2
        
        # Place content in center
        centered[y_offset:y_offset + content_height, x_offset:x_offset + content_width] = content
        
        # Calculate center offset from original
        original_center_x = target_size // 2
        original_center_y = target_size // 2
        new_center_x = x_offset + content_width // 2
        new_center_y = y_offset + content_height // 2
        
        center_offset = (new_center_x - original_center_x, new_center_y - original_center_y)
        bounding_box = (x_offset, y_offset, content_width, content_height)
        
        return centered, bounding_box, center_offset
    
    def _generate_skeleton(self, image: np.ndarray) -> np.ndarray:
        """Generate skeleton of the binary image"""
        if self.config.skeleton_method == 'zhang_suen':
            # Convert to boolean for skeletonization
            binary_bool = image > 0
            skeleton_bool = skeletonize(binary_bool)
            skeleton = (skeleton_bool * 255).astype(np.uint8)
        elif self.config.skeleton_method == 'medial_axis':
            # Use medial axis transform
            binary_bool = image > 0
            skeleton_bool = morphology.medial_axis(binary_bool)
            skeleton = (skeleton_bool * 255).astype(np.uint8)
        else:
            raise ValueError(f"Unknown skeleton method: {self.config.skeleton_method}")
        
        return skeleton
    
    def extract_features(self, processed_image: ProcessedImage) -> FeatureVector:
        """Extract comprehensive feature vector from processed image"""
        binary = processed_image.normalized
        skeleton = processed_image.skeleton
        
        # Find contours for geometric analysis
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            # Empty image - return zero features
            return FeatureVector(
                contour_area=0.0, aspect_ratio=1.0, bounding_box=(0, 0, 0, 0),
                stroke_count=0, loop_count=0, endpoint_count=0, intersection_count=0,
                perimeter=0.0, solidity=0.0, extent=0.0, fill_ratio=0.0,
                centroid=(0.0, 0.0), orientation=0.0
            )
        
        # Use largest contour for main analysis
        main_contour = max(contours, key=cv2.contourArea)
        
        # Geometric features
        area = cv2.contourArea(main_contour)
        perimeter = cv2.arcLength(main_contour, True)
        
        # Bounding rectangle
        x, y, w, h = cv2.boundingRect(main_contour)
        aspect_ratio = w / h if h > 0 else 1.0
        
        # Convex hull for solidity
        hull = cv2.convexHull(main_contour)
        hull_area = cv2.contourArea(hull)
        solidity = area / hull_area if hull_area > 0 else 0.0
        
        # Extent (ratio of contour area to bounding rectangle area)
        rect_area = w * h
        extent = area / rect_area if rect_area > 0 else 0.0
        
        # Centroid
        M = cv2.moments(main_contour)
        if M['m00'] != 0:
            cx = M['m10'] / M['m00']
            cy = M['m01'] / M['m00']
        else:
            cx, cy = x + w/2, y + h/2
        
        # Orientation (angle of fitted ellipse)
        if len(main_contour) >= 5:
            ellipse = cv2.fitEllipse(main_contour)
            orientation = ellipse[2]  # Angle in degrees
        else:
            orientation = 0.0
        
        # Fill ratio (proportion of image that is foreground)
        total_pixels = binary.shape[0] * binary.shape[1]
        foreground_pixels = np.sum(binary > 0)
        fill_ratio = foreground_pixels / total_pixels
        
        # Topological features from skeleton
        skeleton_features = self._analyze_skeleton_topology(skeleton)
        
        return FeatureVector(
            contour_area=float(area),
            aspect_ratio=aspect_ratio,
            bounding_box=(x, y, w, h),
            stroke_count=skeleton_features['stroke_count'],
            loop_count=skeleton_features['loop_count'],
            endpoint_count=skeleton_features['endpoint_count'],
            intersection_count=skeleton_features['intersection_count'],
            perimeter=float(perimeter),
            solidity=solidity,
            extent=extent,
            fill_ratio=fill_ratio,
            centroid=(cx, cy),
            orientation=orientation
        )
    
    def _analyze_skeleton_topology(self, skeleton: np.ndarray) -> Dict[str, int]:
        """Analyze topological properties of skeleton"""
        if np.sum(skeleton) == 0:
            return {
                'stroke_count': 0,
                'loop_count': 0,
                'endpoint_count': 0,
                'intersection_count': 0
            }
        
        # Convert to binary
        skel_binary = skeleton > 0
        
        # Find connected components (strokes)
        labeled_skel = measure.label(skel_binary)
        stroke_count = np.max(labeled_skel)
        
        # Analyze each pixel's neighborhood to find endpoints and intersections
        endpoints = 0
        intersections = 0
        
        # 3x3 kernel for neighborhood analysis
        kernel = np.ones((3, 3), dtype=np.uint8)
        
        for y in range(1, skeleton.shape[0] - 1):
            for x in range(1, skeleton.shape[1] - 1):
                if skel_binary[y, x]:
                    # Count neighbors
                    neighborhood = skel_binary[y-1:y+2, x-1:x+2]
                    neighbor_count = np.sum(neighborhood) - 1  # Exclude center pixel
                    
                    if neighbor_count == 1:
                        endpoints += 1
                    elif neighbor_count > 2:
                        intersections += 1
        
        # Estimate loop count using Euler characteristic
        # For a planar graph: V - E + F = 2, where F includes the outer face
        # So loops = E - V + 1 (for connected components)
        vertices = endpoints + intersections
        # Rough estimate of edges (this is approximate)
        edges = np.sum(skel_binary) // 2  # Very rough approximation
        
        loop_count = max(0, edges - vertices + stroke_count - 1) if vertices > 0 else 0
        
        return {
            'stroke_count': stroke_count,
            'loop_count': loop_count,
            'endpoint_count': endpoints,
            'intersection_count': intersections
        }


# Utility functions for testing and debugging
def visualize_processing_stages(processed_image: ProcessedImage) -> Dict[str, np.ndarray]:
    """Return all processing stages for visualization"""
    return {
        'original': processed_image.original,
        'grayscale': processed_image.grayscale,
        'binary': processed_image.binary,
        'normalized': processed_image.normalized,
        'skeleton': processed_image.skeleton
    }


def create_processing_config(
    target_size: int = 256,
    blur_sigma: float = 0.5,
    threshold_method: str = 'otsu',
    enable_centering: bool = True
) -> ProcessingConfig:
    """Create a processing configuration with common parameters"""
    return ProcessingConfig(
        target_size=target_size,
        gaussian_blur_sigma=blur_sigma,
        binary_threshold_method=threshold_method,
        centering_enabled=enable_centering
    )


# Backward-compatible name used by dataset collection code.
ImageProcessor = ImageProcessingPipeline


# Example usage and testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Create processor with default config
    processor = ImageProcessingPipeline()
    
    # Test with a simple synthetic image
    test_image = np.zeros((100, 100), dtype=np.uint8)
    cv2.rectangle(test_image, (20, 20), (80, 80), 255, 2)
    
    try:
        processed = processor.preprocess_image(test_image)
        features = processor.extract_features(processed)
        
        print(f"Processing successful!")
        print(f"Bounding box: {processed.bounding_box}")
        print(f"Center offset: {processed.center_offset}")
        print(f"Features: {features}")
        
    except Exception as e:
        print(f"Processing failed: {e}")
