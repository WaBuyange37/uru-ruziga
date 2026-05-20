"""
Feedback generation system for handwriting evaluation.
"""

import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class FeedbackGenerator:
    """
    Generate user-friendly feedback based on evaluation results.
    """
    
    def __init__(self):
        logger.info("FeedbackGenerator initialized")
    
    def generate_feedback(self, score: float, ssim_score: float, 
                         contour_score: float, skeleton_score: float) -> List[Dict[str, str]]:
        """
        Generate feedback items based on evaluation scores.
        
        Args:
            score: Final score (0-100)
            ssim_score: SSIM score (0-1)
            contour_score: Contour score (0-1)
            skeleton_score: Skeleton score (0-1)
            
        Returns:
            List of feedback items
        """
        feedback = []
        
        # Overall feedback based on score
        if score >= 90:
            feedback.append({
                'type': 'overall',
                'severity': 'info',
                'message': 'Excellent! Your handwriting closely matches the reference character.',
                'visual_aid': None
            })
        elif score >= 75:
            feedback.append({
                'type': 'overall',
                'severity': 'info',
                'message': 'Good work! Your character is recognizable with minor differences.',
                'visual_aid': None
            })
        elif score >= 60:
            feedback.append({
                'type': 'overall',
                'severity': 'warning',
                'message': 'Fair attempt. Focus on matching the reference shape more closely.',
                'visual_aid': None
            })
        else:
            feedback.append({
                'type': 'overall',
                'severity': 'error',
                'message': 'Keep practicing! Try to follow the reference character more carefully.',
                'visual_aid': None
            })
        
        # Shape feedback (based on SSIM)
        if ssim_score < 0.6:
            feedback.append({
                'type': 'shape',
                'severity': 'warning',
                'message': 'The overall shape needs improvement. Pay attention to the character proportions.',
                'visual_aid': None
            })
        elif ssim_score >= 0.8:
            feedback.append({
                'type': 'shape',
                'severity': 'info',
                'message': 'Great shape accuracy!',
                'visual_aid': None
            })
        
        # Contour feedback
        if contour_score < 0.6:
            feedback.append({
                'type': 'proportion',
                'severity': 'warning',
                'message': 'The proportions of your character differ from the reference. Check the size and spacing.',
                'visual_aid': None
            })
        
        # Skeleton feedback (stroke structure)
        if skeleton_score < 0.6:
            feedback.append({
                'type': 'stroke_order',
                'severity': 'warning',
                'message': 'The stroke structure needs work. Ensure strokes are connected properly.',
                'visual_aid': None
            })
        elif skeleton_score >= 0.8:
            feedback.append({
                'type': 'stroke_order',
                'severity': 'info',
                'message': 'Excellent stroke structure!',
                'visual_aid': None
            })
        
        return feedback
    
    def get_accuracy_level(self, score: float) -> str:
        """
        Get accuracy level label based on score.
        
        Args:
            score: Final score (0-100)
            
        Returns:
            Accuracy level string
        """
        if score >= 90:
            return 'expert'
        elif score >= 75:
            return 'advanced'
        elif score >= 60:
            return 'intermediate'
        else:
            return 'beginner'
