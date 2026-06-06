"""
Hybrid comparison algorithm combining SSIM, contour matching, skeletonization,
stroke direction, and shape alignment for accurate handwriting evaluation.

Weights (production):
  SSIM            30 %
  Contour         25 %
  Skeleton        20 %
  Stroke Direction 15 %
  Shape Alignment  10 %
"""

import logging
from typing import Tuple, List, Dict, Optional
from dataclasses import dataclass, field
import numpy as np
import cv2
from skimage.metrics import structural_similarity as ssim
from scipy.spatial.distance import directed_hausdorff

from .image_processor import ProcessedImage, FeatureVector
from .stroke_analyzer import compute_stroke_direction_score, compute_shape_alignment_score

logger = logging.getLogger(__name__)


@dataclass
class ComparisonWeights:
    """Weights for the five comparison metrics (must sum to 1.0)."""
    ssim_weight: float = 0.30
    contour_weight: float = 0.25
    skeleton_weight: float = 0.20
    stroke_direction_weight: float = 0.15
    shape_alignment_weight: float = 0.10

    def __post_init__(self):
        total = (
            self.ssim_weight
            + self.contour_weight
            + self.skeleton_weight
            + self.stroke_direction_weight
            + self.shape_alignment_weight
        )
        if total > 0 and abs(total - 1.0) > 1e-6:
            self.ssim_weight /= total
            self.contour_weight /= total
            self.skeleton_weight /= total
            self.stroke_direction_weight /= total
            self.shape_alignment_weight /= total


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
    """Complete comparison result with all five metrics."""
    ssim_score: float
    contour_score: float
    skeleton_score: float
    stroke_direction_score: float
    shape_alignment_score: float
    final_score: float
    confidence: float
    analysis: SkeletonAnalysis
    processing_metadata: Dict[str, object]

    # Individual metric success flags
    ssim_success: bool = True
    contour_success: bool = True
    skeleton_success: bool = True
    stroke_direction_success: bool = True
    shape_alignment_success: bool = True


class HybridComparisonAlgorithm:
    """
    Five-metric comparison system for production handwriting evaluation.

    Metrics and weights:
      SSIM             30 % — pixel-level structural similarity
      Contour          25 % — shape outline matching
      Skeleton         20 % — topological stroke structure
      Stroke Direction 15 % — dominant angle histogram comparison
      Shape Alignment  10 % — spatial mass distribution
    """

    def __init__(self, weights: ComparisonWeights = None):
        self.weights = weights or ComparisonWeights()
        self.min_contour_area = 10
        self.min_skeleton_pixels = 5

        logger.info(
            "HybridComparisonAlgorithm initialised — "
            f"SSIM={self.weights.ssim_weight:.2f}, "
            f"Contour={self.weights.contour_weight:.2f}, "
            f"Skeleton={self.weights.skeleton_weight:.2f}, "
            f"StrokeDir={self.weights.stroke_direction_weight:.2f}, "
            f"ShapeAlign={self.weights.shape_alignment_weight:.2f}"
        )

    # ── Public entry point ────────────────────────────────────────────────────

    def compare_images(
        self, reference: ProcessedImage, user_drawing: ProcessedImage
    ) -> ComparisonResult:
        """
        Compare reference and user images using the five-metric hybrid algorithm.

        Args:
            reference:    Processed reference image from font renderer.
            user_drawing: Processed user drawing.

        Returns:
            ComparisonResult with all five scores, final score, and analysis.
        """
        try:
            ssim_score = contour_score = skeleton_score = 0.0
            stroke_dir_score = shape_align_score = 0.0
            ssim_ok = contour_ok = skeleton_ok = stroke_dir_ok = shape_align_ok = False
            skeleton_analysis = self._create_empty_skeleton_analysis()

            meta: Dict[str, object] = {
                "reference_shape": reference.normalized.shape,
                "user_shape": user_drawing.normalized.shape,
                "algorithm_version": "2.0.0",
            }

            # 1. SSIM (30 %)
            try:
                ssim_score = self.compute_ssim(reference.normalized, user_drawing.normalized)
                ssim_ok = True
                logger.debug(f"SSIM: {ssim_score:.3f}")
            except Exception as exc:
                logger.warning(f"SSIM failed: {exc}")
                meta["ssim_error"] = str(exc)

            # 2. Contour (25 %)
            try:
                contour_score = self.compute_contour_similarity(
                    reference.normalized, user_drawing.normalized
                )
                contour_ok = True
                logger.debug(f"Contour: {contour_score:.3f}")
            except Exception as exc:
                logger.warning(f"Contour failed: {exc}")
                meta["contour_error"] = str(exc)

            # 3. Skeleton (20 %)
            try:
                skeleton_score, skeleton_analysis = self.compute_skeleton_similarity(
                    reference.skeleton, user_drawing.skeleton
                )
                skeleton_ok = True
                logger.debug(f"Skeleton: {skeleton_score:.3f}")
            except Exception as exc:
                logger.warning(f"Skeleton failed: {exc}")
                meta["skeleton_error"] = str(exc)

            # 4. Stroke Direction (15 %)
            try:
                stroke_dir_score = compute_stroke_direction_score(
                    reference.normalized, user_drawing.normalized
                )
                stroke_dir_ok = True
                logger.debug(f"StrokeDir: {stroke_dir_score:.3f}")
            except Exception as exc:
                logger.warning(f"StrokeDir failed: {exc}")
                meta["stroke_direction_error"] = str(exc)

            # 5. Shape Alignment (10 %)
            try:
                shape_align_score = compute_shape_alignment_score(
                    reference.normalized, user_drawing.normalized
                )
                shape_align_ok = True
                logger.debug(f"ShapeAlign: {shape_align_score:.3f}")
            except Exception as exc:
                logger.warning(f"ShapeAlign failed: {exc}")
                meta["shape_alignment_error"] = str(exc)

            # Adjust weights for any failed metrics
            aw = self._adjust_weights_for_failures(
                ssim_ok, contour_ok, skeleton_ok, stroke_dir_ok, shape_align_ok
            )

            # Weighted sum → 0-100
            raw = (
                aw.ssim_weight * ssim_score
                + aw.contour_weight * contour_score
                + aw.skeleton_weight * skeleton_score
                + aw.stroke_direction_weight * stroke_dir_score
                + aw.shape_alignment_weight * shape_align_score
            )
            final_score = float(np.clip(raw * 100.0, 0.0, 100.0))

            # Strongly different topology must not pass merely because the
            # centered canvases share blank background or coarse proportions.
            if contour_score < 0.30 and skeleton_score < 0.45:
                final_score = min(final_score, 45.0)
                meta["structural_cap"] = 45.0
            elif contour_score < 0.45 and skeleton_score < 0.55:
                final_score = min(final_score, 60.0)
                meta["structural_cap"] = 60.0

            confidence = self._calculate_confidence(
                ssim_ok, contour_ok, skeleton_ok, stroke_dir_ok, shape_align_ok,
                ssim_score, contour_score, skeleton_score,
                stroke_dir_score, shape_align_score,
            )

            meta.update({
                "adjusted_weights": aw.__dict__,
                "successful_metrics": sum(
                    [ssim_ok, contour_ok, skeleton_ok, stroke_dir_ok, shape_align_ok]
                ),
                "total_metrics": 5,
            })

            return ComparisonResult(
                ssim_score=ssim_score,
                contour_score=contour_score,
                skeleton_score=skeleton_score,
                stroke_direction_score=stroke_dir_score,
                shape_alignment_score=shape_align_score,
                final_score=final_score,
                confidence=confidence,
                analysis=skeleton_analysis,
                processing_metadata=meta,
                ssim_success=ssim_ok,
                contour_success=contour_ok,
                skeleton_success=skeleton_ok,
                stroke_direction_success=stroke_dir_ok,
                shape_alignment_success=shape_align_ok,
            )

        except Exception as exc:
            logger.error(f"Comparison algorithm failed: {exc}")
            return ComparisonResult(
                ssim_score=0.0,
                contour_score=0.0,
                skeleton_score=0.0,
                stroke_direction_score=0.0,
                shape_alignment_score=0.0,
                final_score=0.0,
                confidence=0.0,
                analysis=self._create_empty_skeleton_analysis(),
                processing_metadata={"error": str(exc)},
                ssim_success=False,
                contour_success=False,
                skeleton_success=False,
                stroke_direction_success=False,
                shape_alignment_success=False,
            )

    def apply_stroke_evidence(
        self,
        result: ComparisonResult,
        user_strokes: Optional[List[dict]] = None,
        expected_stroke_count: Optional[int] = None,
    ) -> ComparisonResult:
        """Apply canvas-stroke evidence without replacing image-shape scoring."""
        if not user_strokes:
            result.processing_metadata["stroke_evidence"] = "unavailable"
            return result

        point_sets = [
            stroke.get("points", [])
            for stroke in user_strokes
            if isinstance(stroke, dict) and stroke.get("points")
        ]
        points = [
            point
            for stroke_points in point_sets
            for point in stroke_points
            if isinstance(point, dict) and isinstance(point.get("x"), (int, float))
            and isinstance(point.get("y"), (int, float))
        ]
        actual_count = len(point_sets)
        if len(points) < 2:
            result.final_score = min(result.final_score, 35.0)
            result.processing_metadata["stroke_evidence"] = {
                "actual_strokes": actual_count,
                "point_count": len(points),
                "cap": 35.0,
            }
            return result

        xs = np.array([point["x"] for point in points], dtype=np.float64)
        ys = np.array([point["y"] for point in points], dtype=np.float64)
        width = max(float(xs.max() - xs.min()), 1.0)
        height = max(float(ys.max() - ys.min()), 1.0)
        normalized_points = np.column_stack(((xs - xs.min()) / width, (ys - ys.min()) / height))

        direction_bins = np.zeros(12, dtype=np.float64)
        for stroke_points in point_sets:
            for start, end in zip(stroke_points, stroke_points[1:]):
                dx = float(end["x"] - start["x"])
                dy = float(end["y"] - start["y"])
                length = float(np.hypot(dx, dy))
                if length <= 0:
                    continue
                angle = (np.arctan2(dy, dx) + 2 * np.pi) % (2 * np.pi)
                direction_bins[min(int(angle / (2 * np.pi) * len(direction_bins)), len(direction_bins) - 1)] += length

        direction_diversity = float(np.count_nonzero(direction_bins) / len(direction_bins))
        count_score = 1.0
        count_difference = None
        if expected_stroke_count is not None and expected_stroke_count > 0:
            count_difference = abs(actual_count - expected_stroke_count)
            count_score = min(actual_count, expected_stroke_count) / max(actual_count, expected_stroke_count)
            result.final_score *= 0.70 + 0.30 * count_score
            if count_difference >= max(2, expected_stroke_count):
                result.final_score = min(result.final_score, 60.0)

        result.final_score = float(np.clip(result.final_score, 0.0, 100.0))
        result.processing_metadata["stroke_evidence"] = {
            "actual_strokes": actual_count,
            "expected_strokes": expected_stroke_count,
            "stroke_count_difference": count_difference,
            "stroke_count_score": count_score,
            "normalized_point_count": int(normalized_points.shape[0]),
            "direction_diversity": direction_diversity,
        }
        return result

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
        ssim_score = ssim(
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
    
    def _adjust_weights_for_failures(
        self,
        ssim_ok: bool,
        contour_ok: bool,
        skeleton_ok: bool,
        stroke_dir_ok: bool,
        shape_align_ok: bool,
    ) -> ComparisonWeights:
        """Redistribute weight from failed metrics proportionally to successful ones."""
        if all([ssim_ok, contour_ok, skeleton_ok, stroke_dir_ok, shape_align_ok]):
            return self.weights

        pairs = [
            (ssim_ok,        self.weights.ssim_weight),
            (contour_ok,     self.weights.contour_weight),
            (skeleton_ok,    self.weights.skeleton_weight),
            (stroke_dir_ok,  self.weights.stroke_direction_weight),
            (shape_align_ok, self.weights.shape_alignment_weight),
        ]
        total_ok = sum(w for ok, w in pairs if ok)
        if total_ok == 0:
            return ComparisonWeights(0.0, 0.0, 0.0, 0.0, 0.0)

        def _w(ok, w):
            return (w / total_ok) if ok else 0.0

        return ComparisonWeights(
            ssim_weight=_w(ssim_ok, self.weights.ssim_weight),
            contour_weight=_w(contour_ok, self.weights.contour_weight),
            skeleton_weight=_w(skeleton_ok, self.weights.skeleton_weight),
            stroke_direction_weight=_w(stroke_dir_ok, self.weights.stroke_direction_weight),
            shape_alignment_weight=_w(shape_align_ok, self.weights.shape_alignment_weight),
        )

    def _calculate_confidence(
        self,
        ssim_ok: bool,
        contour_ok: bool,
        skeleton_ok: bool,
        stroke_dir_ok: bool,
        shape_align_ok: bool,
        ssim_score: float,
        contour_score: float,
        skeleton_score: float,
        stroke_dir_score: float,
        shape_align_score: float,
    ) -> float:
        """Confidence = fraction of successful metrics × agreement bonus."""
        flags = [ssim_ok, contour_ok, skeleton_ok, stroke_dir_ok, shape_align_ok]
        scores = [
            s for ok, s in zip(
                flags,
                [ssim_score, contour_score, skeleton_score, stroke_dir_score, shape_align_score],
            )
            if ok
        ]
        n_ok = sum(flags)
        if n_ok == 0:
            return 0.0

        base = n_ok / 5.0
        if len(scores) > 1:
            agreement_bonus = float(np.exp(-np.std(scores) * 5)) * 0.3
            base = min(1.0, base + agreement_bonus)
        return float(base)
    
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
