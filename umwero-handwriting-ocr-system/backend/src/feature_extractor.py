"""
Feature Extractor for Umwero Handwriting OCR System

Extracts comprehensive geometric and topological features from processed images:
- Geometric features: area, aspect ratio, bounding box, perimeter, solidity
- Topological features: stroke count, loops, endpoints, intersections
- Shape complexity and symmetry analysis
- Complete feature vectors for ML training

Optimized for handwriting analysis and OCR training data preparation.
"""

import cv2
import numpy as np
import logging
from typing import Dict, List, Tuple, Any, Optional
from skimage import measure, morphology
from skimage.morphology import skeletonize
from scipy import ndimage

logger = logging.getLogger(__name__)

class FeatureExtractor:
    """Advanced feature extraction for handwriting analysis and ML training."""
    
    def __init__(self):
        """Initialize feature extractor with default parameters."""
        self.min_contour_area = 50  # Minimum contour area to consider
        self.skeleton_threshold = 0.5  # Threshold for skeleton analysis
        
    def extract_all_features(self, processed_image: np.ndarray) -> Dict[str, Any]:
        """
        Extract complete feature set from processed image.
        
        Args:
            processed_image: Binary processed image (0-255)
            
        Returns:
            Dictionary containing all extracted features
        """
        try:
            # Ensure binary image
            if len(processed_image.shape) == 3:
                processed_image = cv2.cvtColor(processed_image, cv2.COLOR_BGR2GRAY)
            
            # Normalize to binary
            binary_image = (processed_image > 127).astype(np.uint8) * 255
            
            # Extract different feature categories
            geometric_features = self.extract_geometric_features(binary_image)
            topological_features = self.extract_topological_features(binary_image)
            shape_features = self.extract_shape_features(binary_image)
            
            # Create complete feature vector
            feature_vector = self.create_feature_vector(
                geometric_features, topological_features, shape_features
            )
            
            return {
                "geometric": geometric_features,
                "topological": topological_features,
                "shape": shape_features,
                "vector": feature_vector,
                "extraction_success": True
            }
            
        except Exception as e:
            logger.error(f"❌ Feature extraction failed: {e}")
            return {
                "geometric": {},
                "topological": {},
                "shape": {},
                "vector": [],
                "extraction_success": False,
                "error": str(e)
            }
    
    def extract_geometric_features(self, binary_image: np.ndarray) -> Dict[str, float]:
        """Extract geometric features from binary image."""
        try:
            # Find main contour
            contours, _ = cv2.findContours(
                binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            if not contours:
                return self._empty_geometric_features()
            
            # Get largest contour (main character)
            main_contour = max(contours, key=cv2.contourArea)
            
            # Basic geometric measurements
            contour_area = cv2.contourArea(main_contour)
            perimeter = cv2.arcLength(main_contour, True)
            
            # Bounding box
            x, y, width, height = cv2.boundingRect(main_contour)
            bbox_area = width * height
            
            # Aspect ratio
            aspect_ratio = width / height if height > 0 else 1.0
            
            # Convex hull for solidity calculation
            hull = cv2.convexHull(main_contour)
            hull_area = cv2.contourArea(hull)
            
            # Solidity (area / convex hull area)
            solidity = contour_area / hull_area if hull_area > 0 else 0.0
            
            # Extent (area / bounding box area)
            extent = contour_area / bbox_area if bbox_area > 0 else 0.0
            
            # Equivalent diameter
            equiv_diameter = np.sqrt(4 * contour_area / np.pi) if contour_area > 0 else 0.0
            
            return {
                "contour_area": float(contour_area),
                "perimeter": float(perimeter),
                "aspect_ratio": float(aspect_ratio),
                "bbox_width": float(width),
                "bbox_height": float(height),
                "bbox_area": float(bbox_area),
                "solidity": float(solidity),
                "extent": float(extent),
                "equiv_diameter": float(equiv_diameter),
                "compactness": float(perimeter**2 / (4 * np.pi * contour_area)) if contour_area > 0 else 0.0
            }
            
        except Exception as e:
            logger.error(f"❌ Geometric feature extraction failed: {e}")
            return self._empty_geometric_features()
    
    def extract_topological_features(self, binary_image: np.ndarray) -> Dict[str, int]:
        """Extract topological features from binary image."""
        try:
            # Skeletonize for topology analysis
            skeleton = skeletonize(binary_image > 127)
            
            # Count strokes (connected components in skeleton)
            stroke_count = self._count_strokes(skeleton)
            
            # Count loops (holes in the image)
            loop_count = self._count_loops(binary_image)
            
            # Count endpoints and intersections
            endpoint_count, intersection_count = self._analyze_skeleton_points(skeleton)
            
            # Count branches
            branch_count = self._count_branches(skeleton)
            
            return {
                "stroke_count": int(stroke_count),
                "loop_count": int(loop_count),
                "endpoint_count": int(endpoint_count),
                "intersection_count": int(intersection_count),
                "branch_count": int(branch_count)
            }
            
        except Exception as e:
            logger.error(f"❌ Topological feature extraction failed: {e}")
            return {
                "stroke_count": 0,
                "loop_count": 0,
                "endpoint_count": 0,
                "intersection_count": 0,
                "branch_count": 0
            }
    
    def extract_shape_features(self, binary_image: np.ndarray) -> Dict[str, float]:
        """Extract shape complexity and symmetry features."""
        try:
            # Shape complexity based on contour approximation
            complexity_score = self._calculate_complexity(binary_image)
            
            # Symmetry analysis
            horizontal_symmetry = self._calculate_horizontal_symmetry(binary_image)
            vertical_symmetry = self._calculate_vertical_symmetry(binary_image)
            
            # Moments for shape analysis
            moments = cv2.moments(binary_image)
            
            # Hu moments for shape invariance
            hu_moments = cv2.HuMoments(moments).flatten()
            
            # Eccentricity from moments
            eccentricity = self._calculate_eccentricity(moments)
            
            return {
                "complexity_score": float(complexity_score),
                "horizontal_symmetry": float(horizontal_symmetry),
                "vertical_symmetry": float(vertical_symmetry),
                "eccentricity": float(eccentricity),
                "hu_moment_1": float(hu_moments[0]) if len(hu_moments) > 0 else 0.0,
                "hu_moment_2": float(hu_moments[1]) if len(hu_moments) > 1 else 0.0,
                "hu_moment_3": float(hu_moments[2]) if len(hu_moments) > 2 else 0.0
            }
            
        except Exception as e:
            logger.error(f"❌ Shape feature extraction failed: {e}")
            return {
                "complexity_score": 0.0,
                "horizontal_symmetry": 0.0,
                "vertical_symmetry": 0.0,
                "eccentricity": 0.0,
                "hu_moment_1": 0.0,
                "hu_moment_2": 0.0,
                "hu_moment_3": 0.0
            }
    
    def create_feature_vector(
        self,
        geometric: Dict[str, float],
        topological: Dict[str, int],
        shape: Dict[str, float]
    ) -> List[float]:
        """Create normalized feature vector for ML training."""
        try:
            # Combine all features into a single vector
            feature_vector = []
            
            # Geometric features (normalized)
            feature_vector.extend([
                geometric.get("contour_area", 0.0) / 10000.0,  # Normalize by typical area
                geometric.get("aspect_ratio", 1.0),
                geometric.get("solidity", 0.0),
                geometric.get("extent", 0.0),
                geometric.get("compactness", 0.0)
            ])
            
            # Topological features (normalized)
            feature_vector.extend([
                topological.get("stroke_count", 0) / 10.0,  # Normalize by max expected strokes
                topological.get("loop_count", 0) / 5.0,     # Normalize by max expected loops
                topological.get("endpoint_count", 0) / 20.0, # Normalize by max expected endpoints
                topological.get("intersection_count", 0) / 10.0,
                topological.get("branch_count", 0) / 15.0
            ])
            
            # Shape features (already mostly normalized)
            feature_vector.extend([
                shape.get("complexity_score", 0.0),
                shape.get("horizontal_symmetry", 0.0),
                shape.get("vertical_symmetry", 0.0),
                shape.get("eccentricity", 0.0),
                min(abs(shape.get("hu_moment_1", 0.0)), 1.0),  # Clamp Hu moments
                min(abs(shape.get("hu_moment_2", 0.0)), 1.0),
                min(abs(shape.get("hu_moment_3", 0.0)), 1.0)
            ])
            
            # Ensure all values are finite and in reasonable range
            feature_vector = [
                max(-10.0, min(10.0, float(val))) if np.isfinite(val) else 0.0
                for val in feature_vector
            ]
            
            return feature_vector
            
        except Exception as e:
            logger.error(f"❌ Feature vector creation failed: {e}")
            return [0.0] * 17  # Return zero vector with expected length
    
    # ─── Helper Methods ───────────────────────────────────────────────────────
    
    def _count_strokes(self, skeleton: np.ndarray) -> int:
        """Count number of strokes in skeleton."""
        try:
            # Label connected components in skeleton
            labeled_skeleton = measure.label(skeleton, connectivity=2)
            return len(np.unique(labeled_skeleton)) - 1  # Subtract background
        except:
            return 1  # Default to single stroke
    
    def _count_loops(self, binary_image: np.ndarray) -> int:
        """Count number of loops (holes) in the image."""
        try:
            # Invert image to find holes
            inverted = 255 - binary_image
            
            # Find contours in inverted image
            contours, hierarchy = cv2.findContours(
                inverted, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE
            )
            
            if hierarchy is None:
                return 0
            
            # Count internal contours (holes)
            loop_count = 0
            for i, h in enumerate(hierarchy[0]):
                if h[3] != -1:  # Has parent (is a hole)
                    area = cv2.contourArea(contours[i])
                    if area > self.min_contour_area:  # Significant hole
                        loop_count += 1
            
            return loop_count
            
        except:
            return 0
    
    def _analyze_skeleton_points(self, skeleton: np.ndarray) -> Tuple[int, int]:
        """Analyze skeleton to count endpoints and intersections."""
        try:
            # Create kernel for neighbor counting
            kernel = np.array([[1, 1, 1],
                              [1, 0, 1],
                              [1, 1, 1]], dtype=np.uint8)
            
            # Count neighbors for each skeleton pixel
            neighbor_count = cv2.filter2D(skeleton.astype(np.uint8), -1, kernel)
            
            # Endpoints have exactly 1 neighbor
            endpoints = np.logical_and(skeleton, neighbor_count == 1)
            endpoint_count = np.sum(endpoints)
            
            # Intersections have 3 or more neighbors
            intersections = np.logical_and(skeleton, neighbor_count >= 3)
            intersection_count = np.sum(intersections)
            
            return int(endpoint_count), int(intersection_count)
            
        except:
            return 0, 0
    
    def _count_branches(self, skeleton: np.ndarray) -> int:
        """Count number of branches in skeleton."""
        try:
            # Use morphological operations to find branch points
            # This is a simplified approach
            kernel = np.array([[1, 1, 1],
                              [1, 0, 1],
                              [1, 1, 1]], dtype=np.uint8)
            
            neighbor_count = cv2.filter2D(skeleton.astype(np.uint8), -1, kernel)
            branch_points = np.logical_and(skeleton, neighbor_count > 2)
            
            return int(np.sum(branch_points))
            
        except:
            return 0
    
    def _calculate_complexity(self, binary_image: np.ndarray) -> float:
        """Calculate shape complexity score (0-1)."""
        try:
            # Find contours
            contours, _ = cv2.findContours(
                binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            if not contours:
                return 0.0
            
            main_contour = max(contours, key=cv2.contourArea)
            
            # Approximate contour with different epsilon values
            epsilon_1 = 0.01 * cv2.arcLength(main_contour, True)
            epsilon_2 = 0.05 * cv2.arcLength(main_contour, True)
            
            approx_1 = cv2.approxPolyDP(main_contour, epsilon_1, True)
            approx_2 = cv2.approxPolyDP(main_contour, epsilon_2, True)
            
            # Complexity based on approximation difference
            complexity = (len(approx_1) - len(approx_2)) / max(len(approx_1), 1)
            
            return min(1.0, max(0.0, complexity))
            
        except:
            return 0.5  # Default medium complexity
    
    def _calculate_horizontal_symmetry(self, binary_image: np.ndarray) -> float:
        """Calculate horizontal symmetry score (0-1)."""
        try:
            height, width = binary_image.shape
            
            # Split image horizontally
            top_half = binary_image[:height//2, :]
            bottom_half = binary_image[height//2:, :]
            
            # Flip bottom half
            bottom_flipped = np.flipud(bottom_half)
            
            # Resize to match if needed
            min_height = min(top_half.shape[0], bottom_flipped.shape[0])
            top_half = top_half[:min_height, :]
            bottom_flipped = bottom_flipped[:min_height, :]
            
            # Calculate similarity
            if top_half.size == 0:
                return 0.0
            
            difference = np.sum(np.abs(top_half - bottom_flipped))
            total_pixels = top_half.size * 255
            
            symmetry = 1.0 - (difference / total_pixels) if total_pixels > 0 else 0.0
            
            return max(0.0, min(1.0, symmetry))
            
        except:
            return 0.0
    
    def _calculate_vertical_symmetry(self, binary_image: np.ndarray) -> float:
        """Calculate vertical symmetry score (0-1)."""
        try:
            height, width = binary_image.shape
            
            # Split image vertically
            left_half = binary_image[:, :width//2]
            right_half = binary_image[:, width//2:]
            
            # Flip right half
            right_flipped = np.fliplr(right_half)
            
            # Resize to match if needed
            min_width = min(left_half.shape[1], right_flipped.shape[1])
            left_half = left_half[:, :min_width]
            right_flipped = right_flipped[:, :min_width]
            
            # Calculate similarity
            if left_half.size == 0:
                return 0.0
            
            difference = np.sum(np.abs(left_half - right_flipped))
            total_pixels = left_half.size * 255
            
            symmetry = 1.0 - (difference / total_pixels) if total_pixels > 0 else 0.0
            
            return max(0.0, min(1.0, symmetry))
            
        except:
            return 0.0
    
    def _calculate_eccentricity(self, moments: Dict) -> float:
        """Calculate eccentricity from image moments."""
        try:
            # Central moments
            mu20 = moments.get('mu20', 0)
            mu02 = moments.get('mu02', 0)
            mu11 = moments.get('mu11', 0)
            
            # Calculate eccentricity
            if mu20 + mu02 == 0:
                return 0.0
            
            # Eigenvalues of covariance matrix
            trace = mu20 + mu02
            det = mu20 * mu02 - mu11 * mu11
            
            if det <= 0 or trace <= 0:
                return 0.0
            
            lambda1 = (trace + np.sqrt(trace*trace - 4*det)) / 2
            lambda2 = (trace - np.sqrt(trace*trace - 4*det)) / 2
            
            if lambda1 <= 0:
                return 0.0
            
            eccentricity = np.sqrt(1 - lambda2/lambda1)
            
            return max(0.0, min(1.0, eccentricity))
            
        except:
            return 0.0
    
    def _empty_geometric_features(self) -> Dict[str, float]:
        """Return empty geometric features dictionary."""
        return {
            "contour_area": 0.0,
            "perimeter": 0.0,
            "aspect_ratio": 1.0,
            "bbox_width": 0.0,
            "bbox_height": 0.0,
            "bbox_area": 0.0,
            "solidity": 0.0,
            "extent": 0.0,
            "equiv_diameter": 0.0,
            "compactness": 0.0
        }