"""
Hybrid comparison algorithm combining SSIM, contour matching, and skeletonization
for accurate handwriting evaluation with robust error handling.
"""

import logging
from typing import Tuple, List, Dict, Optional
from dataclasses import dataclass
import numpy as np
import cv2
from skimage.metrics import structural_similarity as ssim
from scipy.spatial.distance import directed_hausdorff

from .image_processor import ProcessedImage, FeatureVector

logger = logging.getLogger(__name__)


@dataclass
class ComparisonWeights:
    """Weights for different comparison metrics"""
    ssim_weight: float = 0.4
    contour_weight: float = 0.3
    skeleton_weight: float = 0.3
    
    def __post_init__(self):
        # Normalize weights to sum to 1.0
        total = self.ssim_weight + self.contour_weight + self.skeleton_weight
        if total > 0:
            self.ssim_weight /= total
            self.contour_weight /= total
            self.skeleton_weight /= total


@dataclass
class SkeletonAnalysis:
    """Detailed analysis of skeleton comparison"""
    structural_similarity: float
    topology_match: float
    stroke_connectivity: float
    missing_strokes: List[str]
    extra_strokes: List[str]
    endpoint_similarity: float
    intersection_similarity: float


@dataclass
class ComparisonResult:
    """Complete comparison result with all metrics"""
    ssim_score: float
    contour_score: float
    skeleton_score: float
    final_score: float
    confidence: float
    analysis: SkeletonAnalysis
    processing_metadata: Dict[str, any]
    
    # Individual metric success flags
    ssim_success: bool = True
    contour_success: bool = True
    skeleton_success: bool = True


class HybridComparisonAlgorithm:
    """
    Sophisticated multi-metric comparison system for handwriting evaluation.
    Combines SSIM, contour matching, and skeleton analysis with robust error handling.
    """
    
    def __init__(self, weights: ComparisonWeights = None):
        self.weights = weights or ComparisonWeights()
        self.min_contour_area = 10  # Minimum area for valid contour
        self.min_skeleton_pixels = 5  # Minimum pixels for valid skeleton
        
        logger.info(f"HybridComparisonAlgorithm initialized with weights: "
                   f"SSIM={self.weights.ssim_weight:.2f}, "
                   f"Contour={self.weights.contour_weight:.2f}, "
                   f"Skeleton={self.weights.skeleton_weight:.2f}")
    
    def compare_images(self, reference: ProcessedImage, user_drawing: ProcessedImage) -> ComparisonResult:
        """
        Compare reference and user images using hybrid algorithm.
        
        Args:
            reference: Processed reference image from font
            user_drawing: Processed user drawing
            
        Returns:
            ComparisonResult with scores and detailed analysis
        """
        try:
            # Initialize result tracking
            ssim_score = 0.0
            contour_score = 0.0
            skeleton_score = 0.0
            
            ssim_success = False
            contour_success = False
            skeleton_success = False
            
            processing_metadata = {
                'reference_shape': reference.normalized.shape,
                'user_shape': user_drawing.normalized.shape,
                'algorithm_version': '1.0.0'
            }
            
            # 1. SSIM Analysis (40% weight)
            try:
                ssim_score = self.compute_ssim(reference.normalized, user_drawing.normalized)
                ssim_success = True
                logger.debug(f"SSIM computation successful: {ssim_score:.3f}")
            except Exception as e:
                logger.warning(f"SSIM computation failed: {e}")
                ssim_score = 0.0
                processing_metadata['ssim_error'] = str(e)
            
            # 2. Contour Matching (30% weight)
            try:
                contour_score = self.compute_contour_similarity(reference.normalized, user_drawing.normalized)
                contour_success = True
                logger.debug(f"Contour computation successful: {contour_score:.3f}")
            except Exception as e:
                logger.warning(f"Contour computation failed: {e}")
                contour_score = 0.0
                processing_metadata['contour_error'] = str(e)
            
            # 3. Skeleton Analysis (30% weight)
            skeleton_analysis = None
            try:
                skeleton_score, skeleton_analysis = self.compute_skeleton_similarity(
                    reference.skeleton, user_drawing.skeleton
                )
                skeleton_success = True
                logger.debug(f"Skeleton computation successful: {skeleton_score:.3f}")
            except Exception as e:
                logger.warning(f"Skeleton computation failed: {e}")
                skeleton_score = 0.0
                skeleton_analysis = self._create_empty_skeleton_analysis()
                processing_metadata['skeleton_error'] = str(e)
            
            # 4. Adjust weights based on successful computations
            adjusted_weights = self._adjust_weights_for_failures(
                ssim_success, contour_success, skeleton_success
            )
            
            # 5. Calculate final score using exact formula
            final_score = (
                adjusted_weights.ssim_weight * ssim_score +
                adjusted_weights.contour_weight * contour_score +
                adjusted_weights.skeleton_weight * skeleton_score
            )
            
            # 6. Normalize to 0-100 range and clamp
            final_score = np.clip(final_score * 100, 0.0, 100.0)
            
            # 7. Calculate confidence based on successful metrics
            confidence = self._calculate_confidence(
                ssim_success, contour_success, skeleton_success,
                ssim_score, contour_score, skeleton_score
            )
            
            processing_metadata.update({
                'adjusted_weights': adjusted_weights.__dict__,
                'successful_metrics': sum([ssim_success, contour_success, skeleton_success]),
                'total_metrics': 3
            })
            
            return ComparisonResult(
                ssim_score=ssim_score,
                contour_score=contour_score,
                skeleton_score=skeleton_score,
                final_score=final_score,
                confidence=confidence,
                analysis=skeleton_analysis,
                processing_metadata=processing_metadata,
                ssim_success=ssim_success,
                contour_success=contour_success,
                skeleton_success=skeleton_success
            )
            
        except Exception as e:
            logger.error(f"Comparison algorithm failed: {e}")
            # Return minimal result in case of complete failure
            return ComparisonResult(
                ssim_score=0.0,
                contour_score=0.0,
                skeleton_score=0.0,
                final_score=0.0,
                confidence=0.0,
                analysis=self._create_empty_skeleton_analysis(),
                processing_metadata={'error': str(e)},
                ssim_success=False,
                contour_success=False,
                skeleton_success=False
            )
    
    def compute_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """
        Compute Structural Similarity Index (SSIM) between two images.
        
        Args:
            img1: Reference image (normalized binary)
            img2: User drawing (normalized binary)
            
        Returns:
            SSIM score (0.0 to 1.0)
        """
        # Ensure images are the same size
        if img1.shape != img2.shape:
            raise ValueError(f"Image shapes don't match: {img1.shape} vs {img2.shape}")
        
        # Convert to float for SSIM computation
        img1_float = img1.astype(np.float64) / 255.0
        img2_float = img2.astype(np.float64) / 255.0
        
        # Compute SSIM with appropriate parameters for binary images
        ssim_score, _ = ssim(
            img1_float, 
            img2_float, 
            data_range=1.0,
            win_size=min(7, min(img1.shape) // 4 * 2 + 1),  # Adaptive window size
            gaussian_weights=True,
            sigma=1.5,
            use_sample_covariance=False
        )
        
        # Ensure score is in valid range
        ssim_score = np.clip(ssim_score, -1.0, 1.0)
        
        # Convert from [-1, 1] to [0, 1] range
        normalized_ssim = (ssim_score + 1.0) / 2.0
        
        return float(normalized_ssim)
    
    def compute_contour_similarity(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """
        Compute contour-based similarity using shape matching.
        
        Args:
            img1: Reference image (binary)
            img2: User drawing (binary)
            
        Returns:
            Contour similarity score (0.0 to 1.0)
        """
        # Find contours in both images
        contours1, _ = cv2.findContours(img1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours2, _ = cv2.findContours(img2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter out very small contours
        contours1 = [c for c in contours1 if cv2.contourArea(c) >= self.min_contour_area]
        contours2 = [c for c in contours2 if cv2.contourArea(c) >= self.min_contour_area]
        
        if len(contours1) == 0 and len(contours2) == 0:
            return 1.0  # Both empty
        
        if len(contours1) == 0 or len(contours2) == 0:
            return 0.0  # One empty, one not
        
        # Use largest contours for comparison
        main_contour1 = max(contours1, key=cv2.contourArea)
        main_contour2 = max(contours2, key=cv2.contourArea)
        
        # Method 1: Hu moments comparison
        hu_similarity = self._compare_hu_moments(main_contour1, main_contour2)
        
        # Method 2: Hausdorff distance
        hausdorff_similarity = self._compare_hausdorff_distance(main_contour1, main_contour2)
        
        # Method 3: Area and perimeter similarity
        geometric_similarity = self._compare_geometric_properties(main_contour1, main_contour2)
        
        # Combine methods with weights
        combined_score = (
            0.4 * hu_similarity +
            0.3 * hausdorff_similarity +
            0.3 * geometric_similarity
        )
        
        return float(np.clip(combined_score, 0.0, 1.0))
    
    def _compare_hu_moments(self, contour1: np.ndarray, contour2: np.ndarray) -> float:
        """Compare contours using Hu moments"""
        try:
            # Calculate Hu moments
            moments1 = cv2.moments(contour1)
            moments2 = cv2.moments(contour2)
            
            hu1 = cv2.HuMoments(moments1).flatten()
            hu2 = cv2.HuMoments(moments2).flatten()
            
            # Use cv2.matchShapes for comparison
            match_score = cv2.matchShapes(contour1, contour2, cv2.CONTOURS_MATCH_I1, 0.0)
            
            # Convert match score to similarity (lower is better for matchShapes)
            # Use exponential decay to convert distance to similarity
            similarity = np.exp(-match_score)
            
            return float(np.clip(similarity, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Hu moments comparison failed: {e}")
            return 0.0
    
    def _compare_hausdorff_distance(self, contour1: np.ndarray, contour2: np.ndarray) -> float:
        """Compare contours using Hausdorff distance"""
        try:
            # Convert contours to point sets
            points1 = contour1.reshape(-1, 2).astype(np.float64)
            points2 = contour2.reshape(-1, 2).astype(np.float64)
            
            # Calculate bidirectional Hausdorff distance
            dist1 = directed_hausdorff(points1, points2)[0]
            dist2 = directed_hausdorff(points2, points1)[0]
            
            # Use maximum distance
            hausdorff_dist = max(dist1, dist2)
            
            # Convert distance to similarity (normalize by image diagonal)
            image_diagonal = np.sqrt(256**2 + 256**2)  # Assuming 256x256 images
            normalized_dist = hausdorff_dist / image_diagonal
            
            # Convert to similarity score
            similarity = np.exp(-normalized_dist * 5)  # Exponential decay
            
            return float(np.clip(similarity, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Hausdorff distance comparison failed: {e}")
            return 0.0
    
    def _compare_geometric_properties(self, contour1: np.ndarray, contour2: np.ndarray) -> float:
        """Compare geometric properties of contours"""
        try:
            # Calculate areas
            area1 = cv2.contourArea(contour1)
            area2 = cv2.contourArea(contour2)
            
            # Calculate perimeters
            perimeter1 = cv2.arcLength(contour1, True)
            perimeter2 = cv2.arcLength(contour2, True)
            
            # Area similarity
            if area1 == 0 and area2 == 0:
                area_sim = 1.0
            elif area1 == 0 or area2 == 0:
                area_sim = 0.0
            else:
                area_ratio = min(area1, area2) / max(area1, area2)
                area_sim = area_ratio
            
            # Perimeter similarity
            if perimeter1 == 0 and perimeter2 == 0:
                perimeter_sim = 1.0
            elif perimeter1 == 0 or perimeter2 == 0:
                perimeter_sim = 0.0
            else:
                perimeter_ratio = min(perimeter1, perimeter2) / max(perimeter1, perimeter2)
                perimeter_sim = perimeter_ratio
            
            # Combine area and perimeter similarities
            geometric_sim = (area_sim + perimeter_sim) / 2.0
            
            return float(np.clip(geometric_sim, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Geometric properties comparison failed: {e}")
            return 0.0
    
    def compute_skeleton_similarity(self, skel1: np.ndarray, skel2: np.ndarray) -> Tuple[float, SkeletonAnalysis]:
        """
        Compute skeleton-based similarity with detailed topological analysis.
        
        Args:
            skel1: Reference skeleton
            skel2: User drawing skeleton
            
        Returns:
            Tuple of (similarity_score, detailed_analysis)
        """
        try:
            # Check if skeletons have sufficient content
            skel1_pixels = np.sum(skel1 > 0)
            skel2_pixels = np.sum(skel2 > 0)
            
            if skel1_pixels < self.min_skeleton_pixels and skel2_pixels < self.min_skeleton_pixels:
                # Both skeletons are essentially empty
                return 1.0, SkeletonAnalysis(
                    structural_similarity=1.0,
                    topology_match=1.0,
                    stroke_connectivity=1.0,
                    missing_strokes=[],
                    extra_strokes=[],
                    endpoint_similarity=1.0,
                    intersection_similarity=1.0
                )
            
            if skel1_pixels < self.min_skeleton_pixels or skel2_pixels < self.min_skeleton_pixels:
                # One skeleton is empty, the other is not
                return 0.0, self._create_empty_skeleton_analysis()
            
            # 1. Structural similarity using SSIM on skeletons
            structural_sim = self.compute_ssim(skel1, skel2)
            
            # 2. Topological analysis
            topology_sim = self._analyze_skeleton_topology(skel1, skel2)
            
            # 3. Stroke connectivity analysis
            connectivity_sim = self._analyze_stroke_connectivity(skel1, skel2)
            
            # 4. Endpoint analysis
            endpoint_sim = self._analyze_endpoints(skel1, skel2)
            
            # 5. Intersection analysis
            intersection_sim = self._analyze_intersections(skel1, skel2)
            
            # Combine all skeleton metrics
            overall_skeleton_score = (
                0.3 * structural_sim +
                0.25 * topology_sim +
                0.25 * connectivity_sim +
                0.1 * endpoint_sim +
                0.1 * intersection_sim
            )
            
            analysis = SkeletonAnalysis(
                structural_similarity=structural_sim,
                topology_match=topology_sim,
                stroke_connectivity=connectivity_sim,
                missing_strokes=[],  # Would be populated with detailed analysis
                extra_strokes=[],    # Would be populated with detailed analysis
                endpoint_similarity=endpoint_sim,
                intersection_similarity=intersection_sim
            )
            
            return float(np.clip(overall_skeleton_score, 0.0, 1.0)), analysis
            
        except Exception as e:
            logger.warning(f"Skeleton similarity computation failed: {e}")
            return 0.0, self._create_empty_skeleton_analysis()
    
    def _analyze_skeleton_topology(self, skel1: np.ndarray, skel2: np.ndarray) -> float:
        """Analyze topological similarity between skeletons"""
        try:
            # Count connected components
            _, labels1 = cv2.connectedComponents(skel1)
            _, labels2 = cv2.connectedComponents(skel2)
            
            components1 = np.max(labels1)
            components2 = np.max(labels2)
            
            # Component count similarity
            if components1 == 0 and components2 == 0:
                component_sim = 1.0
            elif components1 == 0 or components2 == 0:
                component_sim = 0.0
            else:
                component_sim = min(components1, components2) / max(components1, components2)
            
            return float(component_sim)
            
        except Exception as e:
            logger.warning(f"Skeleton topology analysis failed: {e}")
            return 0.0
    
    def _analyze_stroke_connectivity(self, skel1: np.ndarray, skel2: np.ndarray) -> float:
        """Analyze stroke connectivity patterns"""
        # This is a simplified implementation
        # In a full implementation, this would analyze the graph structure
        try:
            # Use pixel density as a proxy for connectivity
            density1 = np.sum(skel1 > 0) / (skel1.shape[0] * skel1.shape[1])
            density2 = np.sum(skel2 > 0) / (skel2.shape[0] * skel2.shape[1])
            
            if density1 == 0 and density2 == 0:
                return 1.0
            elif density1 == 0 or density2 == 0:
                return 0.0
            else:
                return min(density1, density2) / max(density1, density2)
                
        except Exception as e:
            logger.warning(f"Stroke connectivity analysis failed: {e}")
            return 0.0
    
    def _analyze_endpoints(self, skel1: np.ndarray, skel2: np.ndarray) -> float:
        """Analyze endpoint similarity"""
        try:
            endpoints1 = self._count_endpoints(skel1)
            endpoints2 = self._count_endpoints(skel2)
            
            if endpoints1 == 0 and endpoints2 == 0:
                return 1.0
            elif endpoints1 == 0 or endpoints2 == 0:
                return 0.0
            else:
                return min(endpoints1, endpoints2) / max(endpoints1, endpoints2)
                
        except Exception as e:
            logger.warning(f"Endpoint analysis failed: {e}")
            return 0.0
    
    def _analyze_intersections(self, skel1: np.ndarray, skel2: np.ndarray) -> float:
        """Analyze intersection similarity"""
        try:
            intersections1 = self._count_intersections(skel1)
            intersections2 = self._count_intersections(skel2)
            
            if intersections1 == 0 and intersections2 == 0:
                return 1.0
            elif intersections1 == 0 or intersections2 == 0:
                return 0.0
            else:
                return min(intersections1, intersections2) / max(intersections1, intersections2)
                
        except Exception as e:
            logger.warning(f"Intersection analysis failed: {e}")
            return 0.0
    
    def _count_endpoints(self, skeleton: np.ndarray) -> int:
        """Count endpoints in skeleton"""
        endpoints = 0
        for y in range(1, skeleton.shape[0] - 1):
            for x in range(1, skeleton.shape[1] - 1):
                if skeleton[y, x] > 0:
                    # Count 8-connected neighbors
                    neighbors = np.sum(skeleton[y-1:y+2, x-1:x+2] > 0) - 1
                    if neighbors == 1:
                        endpoints += 1
        return endpoints
    
    def _count_intersections(self, skeleton: np.ndarray) -> int:
        """Count intersections in skeleton"""
        intersections = 0
        for y in range(1, skeleton.shape[0] - 1):
            for x in range(1, skeleton.shape[1] - 1):
                if skeleton[y, x] > 0:
                    # Count 8-connected neighbors
                    neighbors = np.sum(skeleton[y-1:y+2, x-1:x+2] > 0) - 1
                    if neighbors > 2:
                        intersections += 1
        return intersections
    
    def _adjust_weights_for_failures(self, ssim_success: bool, contour_success: bool, skeleton_success: bool) -> ComparisonWeights:
        """Adjust weights proportionally when some metrics fail"""
        if ssim_success and contour_success and skeleton_success:
            # All metrics successful, use original weights
            return self.weights
        
        # Calculate new weights based on successful metrics
        successful_weights = []
        if ssim_success:
            successful_weights.append(self.weights.ssim_weight)
        if contour_success:
            successful_weights.append(self.weights.contour_weight)
        if skeleton_success:
            successful_weights.append(self.weights.skeleton_weight)
        
        if not successful_weights:
            # All metrics failed - return zero weights
            return ComparisonWeights(0.0, 0.0, 0.0)
        
        # Normalize successful weights
        total_successful = sum(successful_weights)
        
        new_ssim = (self.weights.ssim_weight / total_successful) if ssim_success else 0.0
        new_contour = (self.weights.contour_weight / total_successful) if contour_success else 0.0
        new_skeleton = (self.weights.skeleton_weight / total_successful) if skeleton_success else 0.0
        
        return ComparisonWeights(new_ssim, new_contour, new_skeleton)
    
    def _calculate_confidence(self, ssim_success: bool, contour_success: bool, skeleton_success: bool,
                            ssim_score: float, contour_score: float, skeleton_score: float) -> float:
        """Calculate confidence based on successful metrics and their agreement"""
        successful_count = sum([ssim_success, contour_success, skeleton_success])
        
        if successful_count == 0:
            return 0.0
        
        # Base confidence from number of successful metrics
        base_confidence = successful_count / 3.0
        
        # Agreement bonus: if successful metrics agree, increase confidence
        successful_scores = []
        if ssim_success:
            successful_scores.append(ssim_score)
        if contour_success:
            successful_scores.append(contour_score)
        if skeleton_success:
            successful_scores.append(skeleton_score)
        
        if len(successful_scores) > 1:
            # Calculate standard deviation of successful scores
            score_std = np.std(successful_scores)
            # Lower std means better agreement, higher confidence
            agreement_bonus = np.exp(-score_std * 5) * 0.3  # Max 30% bonus
            base_confidence = min(1.0, base_confidence + agreement_bonus)
        
        return float(base_confidence)
    
    def _create_empty_skeleton_analysis(self) -> SkeletonAnalysis:
        """Create empty skeleton analysis for error cases"""
        return SkeletonAnalysis(
            structural_similarity=0.0,
            topology_match=0.0,
            stroke_connectivity=0.0,
            missing_strokes=[],
            extra_strokes=[],
            endpoint_similarity=0.0,
            intersection_similarity=0.0
        )
    
    def calibrate_score(self, raw_score: float, character: str) -> float:
        """
        Apply character-specific calibration to raw score.
        This is a placeholder for future character-specific calibration.
        """
        # For Phase 1, return raw score without calibration
        # Phase 2 will implement character-specific calibration
        return np.clip(raw_score, 0.0, 100.0)


# Example usage and testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Create test images
    ref_img = np.zeros((256, 256), dtype=np.uint8)
    cv2.rectangle(ref_img, (50, 50), (200, 200), 255, 3)
    
    user_img = np.zeros((256, 256), dtype=np.uint8)
    cv2.rectangle(user_img, (55, 55), (195, 195), 255, 3)  # Slightly different
    
    # Create mock processed images
    from .image_processor import ProcessedImage
    
    ref_processed = ProcessedImage(
        original=ref_img, grayscale=ref_img, binary=ref_img,
        normalized=ref_img, skeleton=ref_img,
        bounding_box=(50, 50, 150, 150), center_offset=(0, 0),
        processing_metadata={}
    )
    
    user_processed = ProcessedImage(
        original=user_img, grayscale=user_img, binary=user_img,
        normalized=user_img, skeleton=user_img,
        bounding_box=(55, 55, 140, 140), center_offset=(5, 5),
        processing_metadata={}
    )
    
    # Test comparison
    algorithm = HybridComparisonAlgorithm()
    result = algorithm.compare_images(ref_processed, user_processed)
    
    print(f"Comparison Result:")
    print(f"  SSIM Score: {result.ssim_score:.3f}")
    print(f"  Contour Score: {result.contour_score:.3f}")
    print(f"  Skeleton Score: {result.skeleton_score:.3f}")
    print(f"  Final Score: {result.final_score:.1f}")
    print(f"  Confidence: {result.confidence:.3f}")
    print(f"  Successful Metrics: SSIM={result.ssim_success}, Contour={result.contour_success}, Skeleton={result.skeleton_success}")