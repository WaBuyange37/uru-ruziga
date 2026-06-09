"""
Hybrid comparison algorithm for handwriting evaluation.
Combines SSIM, contour matching, and skeleton analysis.
"""

import logging
from typing import Tuple, Dict, Any
from dataclasses import dataclass
import numpy as np
import cv2
from skimage.metrics import structural_similarity as ssim

logger = logging.getLogger(__name__)


@dataclass
class ComparisonResult:
    """Complete comparison result with all metrics"""
    ssim_score: float
    contour_score: float
    skeleton_score: float
    final_score: float
    confidence: float
    details: Dict[str, Any]


class ComparisonAlgorithm:
    """
    Hybrid comparison algorithm combining multiple metrics.
    """
    
    def __init__(self):
        # Weights for different metrics
        self.ssim_weight = 0.4
        self.contour_weight = 0.3
        self.skeleton_weight = 0.3
        
        logger.info("ComparisonAlgorithm initialized")
    
    def compare(self, reference: np.ndarray, user_drawing: np.ndarray, 
                reference_skeleton: np.ndarray, user_skeleton: np.ndarray) -> ComparisonResult:
        """
        Compare reference and user images using hybrid algorithm.
        
        Args:
            reference: Reference image (binary)
            user_drawing: User drawing (binary)
            reference_skeleton: Reference skeleton
            user_skeleton: User skeleton
            
        Returns:
            ComparisonResult with scores and analysis
        """
        try:
            # 1. SSIM Analysis
            ssim_score = self._compute_ssim(reference, user_drawing)
            
            # 2. Contour Matching
            contour_score = self._compute_contour_similarity(reference, user_drawing)
            
            # 3. Skeleton Analysis
            skeleton_score = self._compute_skeleton_similarity(reference_skeleton, user_skeleton)
            
            # 4. Calculate final score
            final_score = (
                self.ssim_weight * ssim_score +
                self.contour_weight * contour_score +
                self.skeleton_weight * skeleton_score
            )
            
            # Normalize to 0-100 range
            final_score = np.clip(final_score * 100, 0.0, 100.0)
            
            # Calculate confidence
            confidence = self._calculate_confidence(ssim_score, contour_score, skeleton_score)
            
            details = {
                'ssim_weight': self.ssim_weight,
                'contour_weight': self.contour_weight,
                'skeleton_weight': self.skeleton_weight
            }
            
            return ComparisonResult(
                ssim_score=ssim_score,
                contour_score=contour_score,
                skeleton_score=skeleton_score,
                final_score=final_score,
                confidence=confidence,
                details=details
            )
            
        except Exception as e:
            logger.error(f"Comparison failed: {e}")
            return ComparisonResult(
                ssim_score=0.0,
                contour_score=0.0,
                skeleton_score=0.0,
                final_score=0.0,
                confidence=0.0,
                details={'error': str(e)}
            )
    
    def _compute_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Compute Structural Similarity Index"""
        try:
            # Ensure images are the same size
            if img1.shape != img2.shape:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
            
            # Convert to float
            img1_float = img1.astype(np.float64) / 255.0
            img2_float = img2.astype(np.float64) / 255.0
            
            # Compute SSIM
            ssim_result = ssim(
                img1_float,
                img2_float,
                data_range=1.0,
                win_size=7,
                gaussian_weights=True,
                full=True  # Return full SSIM image
            )
            
            # Extract score (handle both tuple and scalar returns)
            if isinstance(ssim_result, tuple):
                ssim_score = ssim_result[0]
            else:
                ssim_score = ssim_result
            
            # Normalize to [0, 1]
            normalized_ssim = (ssim_score + 1.0) / 2.0
            
            return float(np.clip(normalized_ssim, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"SSIM computation failed: {e}")
            return 0.0
    
    def _compute_contour_similarity(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Compute contour-based similarity"""
        try:
            # Find contours
            contours1, _ = cv2.findContours(img1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours2, _ = cv2.findContours(img2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter small contours
            contours1 = [c for c in contours1 if cv2.contourArea(c) >= 10]
            contours2 = [c for c in contours2 if cv2.contourArea(c) >= 10]
            
            if len(contours1) == 0 and len(contours2) == 0:
                return 1.0
            
            if len(contours1) == 0 or len(contours2) == 0:
                return 0.0
            
            # Use largest contours
            main_contour1 = max(contours1, key=cv2.contourArea)
            main_contour2 = max(contours2, key=cv2.contourArea)
            
            # Hu moments comparison
            hu_similarity = self._compare_hu_moments(main_contour1, main_contour2)
            
            # Geometric similarity
            geometric_similarity = self._compare_geometric_properties(main_contour1, main_contour2)
            
            # Combine
            combined_score = 0.6 * hu_similarity + 0.4 * geometric_similarity
            
            return float(np.clip(combined_score, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Contour similarity computation failed: {e}")
            return 0.0
    
    def _compare_hu_moments(self, contour1: np.ndarray, contour2: np.ndarray) -> float:
        """Compare contours using Hu moments"""
        try:
            # Use cv2.matchShapes
            match_score = cv2.matchShapes(contour1, contour2, cv2.CONTOURS_MATCH_I1, 0.0)
            
            # Convert to similarity
            similarity = np.exp(-match_score)
            
            return float(np.clip(similarity, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Hu moments comparison failed: {e}")
            return 0.0
    
    def _compare_geometric_properties(self, contour1: np.ndarray, contour2: np.ndarray) -> float:
        """Compare geometric properties"""
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
                area_sim = min(area1, area2) / max(area1, area2)
            
            # Perimeter similarity
            if perimeter1 == 0 and perimeter2 == 0:
                perimeter_sim = 1.0
            elif perimeter1 == 0 or perimeter2 == 0:
                perimeter_sim = 0.0
            else:
                perimeter_sim = min(perimeter1, perimeter2) / max(perimeter1, perimeter2)
            
            # Combine
            geometric_sim = (area_sim + perimeter_sim) / 2.0
            
            return float(np.clip(geometric_sim, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Geometric properties comparison failed: {e}")
            return 0.0
    
    def _compute_skeleton_similarity(self, skel1: np.ndarray, skel2: np.ndarray) -> float:
        """Compute skeleton-based similarity"""
        try:
            # Check if skeletons have content
            skel1_pixels = np.sum(skel1 > 0)
            skel2_pixels = np.sum(skel2 > 0)
            
            if skel1_pixels < 5 and skel2_pixels < 5:
                return 1.0
            
            if skel1_pixels < 5 or skel2_pixels < 5:
                return 0.0
            
            # Structural similarity on skeletons
            structural_sim = self._compute_ssim(skel1, skel2)
            
            # Topology analysis
            topology_sim = self._analyze_skeleton_topology(skel1, skel2)
            
            # Combine
            skeleton_score = 0.6 * structural_sim + 0.4 * topology_sim
            
            return float(np.clip(skeleton_score, 0.0, 1.0))
            
        except Exception as e:
            logger.warning(f"Skeleton similarity computation failed: {e}")
            return 0.0
    
    def _analyze_skeleton_topology(self, skel1: np.ndarray, skel2: np.ndarray) -> float:
        """Analyze topological similarity"""
        try:
            # Count connected components
            _, labels1 = cv2.connectedComponents(skel1)
            _, labels2 = cv2.connectedComponents(skel2)
            
            components1 = np.max(labels1)
            components2 = np.max(labels2)
            
            if components1 == 0 and components2 == 0:
                return 1.0
            elif components1 == 0 or components2 == 0:
                return 0.0
            else:
                return min(components1, components2) / max(components1, components2)
                
        except Exception as e:
            logger.warning(f"Skeleton topology analysis failed: {e}")
            return 0.0
    
    def _calculate_confidence(self, ssim_score: float, contour_score: float, skeleton_score: float) -> float:
        """Calculate confidence based on metric agreement"""
        scores = [ssim_score, contour_score, skeleton_score]
        
        # Base confidence from average
        avg_score = np.mean(scores)
        
        # Agreement bonus
        score_std = np.std(scores)
        agreement_bonus = np.exp(-score_std * 5) * 0.3
        
        confidence = min(1.0, avg_score + agreement_bonus)
        
        return float(confidence)
