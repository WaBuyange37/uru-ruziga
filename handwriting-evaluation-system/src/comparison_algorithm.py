"""
Comparison Algorithm Component
Computes similarity between images using hybrid approach (SSIM + contour matching)
"""
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import logging
from typing import Optional
from .models import ComparisonResult

logger = logging.getLogger(__name__)

class ComparisonAlgorithm:
    def __init__(self):
        self.ssim_weight = 0.6
        self.contour_weight = 0.4
    
    def compare_images(self, reference: np.ndarray, user_drawing: np.ndarray) -> ComparisonResult:
        """
        Compare two processed images using hybrid algorithm
        
        Args:
            reference: Reference image (binary numpy array)
            user_drawing: User drawing (binary numpy array)
            
        Returns:
            ComparisonResult with individual scores and final score
        """
        # Check if images are valid
        ref_white_pixels = np.sum(reference == 255)  # White pixels in binary
        user_white_pixels = np.sum(user_drawing == 255)
        
        logger.info(f"Reference white pixels: {ref_white_pixels}")
        logger.info(f"User white pixels: {user_white_pixels}")
        
        if ref_white_pixels < 100:
            logger.warning("Reference image appears blank!")
        
        if user_white_pixels < 100:
            logger.warning("User drawing appears blank!")
        
        # Ensure images are the same size
        if reference.shape != user_drawing.shape:
            user_drawing = cv2.resize(user_drawing, (reference.shape[1], reference.shape[0]))
        
        # Compute SSIM
        ssim_score = self.compute_ssim(reference, user_drawing)
        
        # Compute contour similarity
        contour_score = self.compute_contour_similarity(reference, user_drawing)
        
        # Combine metrics
        final_score = self.combine_metrics(ssim_score, contour_score)
        
        logger.info(f"Comparison scores - SSIM: {ssim_score:.3f}, Contour: {contour_score:.3f}, Final: {final_score:.1f}")
        
        return ComparisonResult(
            ssim_score=ssim_score,
            contour_score=contour_score,
            final_score=final_score
        )
    
    def compute_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """
        Compute Structural Similarity Index between two images
        
        Args:
            img1: First image (numpy array)
            img2: Second image (numpy array)
            
        Returns:
            SSIM score (0-1)
        """
        try:
            # Compute SSIM
            score, _ = ssim(img1, img2, full=True)
            # Ensure score is between 0 and 1
            return max(0.0, min(1.0, score))
        except Exception:
            # Return 0 if SSIM computation fails
            return 0.0
    
    def compute_contour_similarity(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """
        Compute contour-based similarity using cv2.matchShapes
        
        Args:
            img1: First image (binary numpy array)
            img2: Second image (binary numpy array)
            
        Returns:
            Contour similarity score (0-1, where 1 is perfect match)
        """
        try:
            # Find contours in both images
            contours1, _ = cv2.findContours(img1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours2, _ = cv2.findContours(img2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours1 or not contours2:
                return 0.0
            
            # Get the largest contour from each image
            contour1 = max(contours1, key=cv2.contourArea)
            contour2 = max(contours2, key=cv2.contourArea)
            
            # Compute shape distance using Hu moments
            distance = cv2.matchShapes(contour1, contour2, cv2.CONTOURS_MATCH_I1, 0.0)
            
            # Convert distance to similarity score (lower distance = higher similarity)
            # Use exponential decay to map distance to 0-1 range
            similarity = np.exp(-distance)
            
            return max(0.0, min(1.0, similarity))
            
        except Exception:
            # Return 0 if contour matching fails
            return 0.0
    
    def combine_metrics(self, ssim_score: float, contour_score: float) -> float:
        """
        Combine SSIM and contour scores into final score
        
        Args:
            ssim_score: SSIM similarity score (0-1)
            contour_score: Contour similarity score (0-1)
            
        Returns:
            Final combined score (0-100)
        """
        # Weighted combination
        combined = (self.ssim_weight * ssim_score) + (self.contour_weight * contour_score)
        
        # Convert to 0-100 scale
        final_score = combined * 100
        
        return max(0.0, min(100.0, final_score))