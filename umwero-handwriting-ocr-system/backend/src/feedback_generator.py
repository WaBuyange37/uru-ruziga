"""
Intelligent feedback generation system for handwriting evaluation.
Generates actionable, human-readable feedback for handwriting improvement.
"""

import logging
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import numpy as np

from .image_processor import ProcessedImage, FeatureVector
from .comparison_algorithm import ComparisonResult, SkeletonAnalysis

logger = logging.getLogger(__name__)


class FeedbackCategory(Enum):
    STRUCTURE = "structure"
    POSITIONING = "positioning"
    PROPORTIONS = "proportions"
    STROKES = "strokes"
    TOPOLOGY = "topology"
    QUALITY = "quality"


class FeedbackSeverity(Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    POSITIVE = "positive"


@dataclass
class FeedbackItem:
    """Individual feedback item with detailed information"""
    category: str
    severity: str
    message: str
    suggestion: str
    confidence: float
    
    def __post_init__(self):
        # Ensure confidence is in valid range
        self.confidence = max(0.0, min(1.0, self.confidence))


@dataclass
class FeedbackReport:
    """Complete feedback report for a handwriting evaluation"""
    score: float
    passed: bool
    primary_feedback: List[str]
    detailed_feedback: List[FeedbackItem]
    positive_aspects: List[str]
    improvement_priority: List[str]


@dataclass
class FeedbackConfig:
    """Configuration for feedback generation"""
    min_confidence_threshold: float = 0.6
    max_feedback_items: int = 5
    include_positive_feedback: bool = True
    prioritize_critical_issues: bool = True
    character_specific_feedback: bool = True


class FeedbackGenerator:
    """
    Intelligent feedback generation system that analyzes drawing comparison results
    and generates actionable, human-readable improvement suggestions.
    """
    
    def __init__(self, feedback_config: FeedbackConfig = None):
        self.config = feedback_config or FeedbackConfig()
        
        # Feedback templates for different issues
        self._initialize_feedback_templates()
        
        logger.info(f"FeedbackGenerator initialized with config: {self.config}")
    
    def _initialize_feedback_templates(self):
        """Initialize feedback message templates"""
        self.feedback_templates = {
            # Structural issues
            'missing_strokes': {
                'message': "Some strokes appear to be missing from your character",
                'suggestion': "Make sure to include all the essential strokes that make up this character",
                'category': FeedbackCategory.STRUCTURE,
                'severity': FeedbackSeverity.CRITICAL
            },
            'extra_strokes': {
                'message': "Your drawing has additional strokes not present in the reference",
                'suggestion': "Focus on the essential strokes and avoid adding unnecessary marks",
                'category': FeedbackCategory.STRUCTURE,
                'severity': FeedbackSeverity.MAJOR
            },
            'incomplete_strokes': {
                'message': "Some strokes appear incomplete or disconnected",
                'suggestion': "Ensure all strokes are fully drawn and properly connected",
                'category': FeedbackCategory.STROKES,
                'severity': FeedbackSeverity.MAJOR
            },
            
            # Positioning issues
            'off_center': {
                'message': "Your character is not centered properly",
                'suggestion': "Try to center your character within the drawing area",
                'category': FeedbackCategory.POSITIONING,
                'severity': FeedbackSeverity.MINOR
            },
            'rotation_error': {
                'message': "Your character appears to be rotated or tilted",
                'suggestion': "Keep your character upright and aligned properly",
                'category': FeedbackCategory.POSITIONING,
                'severity': FeedbackSeverity.MINOR
            },
            
            # Proportional issues
            'size_too_small': {
                'message': "Your character is drawn too small",
                'suggestion': "Make your character larger to fill more of the available space",
                'category': FeedbackCategory.PROPORTIONS,
                'severity': FeedbackSeverity.MINOR
            },
            'size_too_large': {
                'message': "Your character is drawn too large",
                'suggestion': "Make your character smaller to fit better within the boundaries",
                'category': FeedbackCategory.PROPORTIONS,
                'severity': FeedbackSeverity.MINOR
            },
            'aspect_ratio_error': {
                'message': "The proportions of your character are not quite right",
                'suggestion': "Pay attention to the width-to-height ratio of the character",
                'category': FeedbackCategory.PROPORTIONS,
                'severity': FeedbackSeverity.MAJOR
            },
            
            # Topology issues
            'open_vs_closed': {
                'message': "Some parts that should be closed appear open, or vice versa",
                'suggestion': "Check if loops and enclosed areas are properly formed",
                'category': FeedbackCategory.TOPOLOGY,
                'severity': FeedbackSeverity.MAJOR
            },
            'connection_issues': {
                'message': "Some strokes don't connect properly where they should",
                'suggestion': "Make sure strokes meet cleanly at intersection points",
                'category': FeedbackCategory.STROKES,
                'severity': FeedbackSeverity.MAJOR
            },
            
            # Quality issues
            'stroke_thickness': {
                'message': "Your stroke thickness varies too much",
                'suggestion': "Try to maintain consistent stroke width throughout",
                'category': FeedbackCategory.QUALITY,
                'severity': FeedbackSeverity.MINOR
            },
            'stroke_smoothness': {
                'message': "Some strokes appear jagged or uneven",
                'suggestion': "Practice drawing smoother, more confident strokes",
                'category': FeedbackCategory.QUALITY,
                'severity': FeedbackSeverity.MINOR
            },
            
            # Positive feedback
            'good_structure': {
                'message': "Excellent structural accuracy!",
                'suggestion': "Your character structure is very well executed",
                'category': FeedbackCategory.STRUCTURE,
                'severity': FeedbackSeverity.POSITIVE
            },
            'good_proportions': {
                'message': "Great proportions and sizing!",
                'suggestion': "Your character proportions are spot-on",
                'category': FeedbackCategory.PROPORTIONS,
                'severity': FeedbackSeverity.POSITIVE
            },
            'good_positioning': {
                'message': "Perfect positioning and alignment!",
                'suggestion': "Your character is beautifully centered and aligned",
                'category': FeedbackCategory.POSITIONING,
                'severity': FeedbackSeverity.POSITIVE
            }
        }
    
    def generate_feedback(self, comparison_result: ComparisonResult, 
                         processed_images: Tuple[ProcessedImage, ProcessedImage],
                         character: str = None) -> FeedbackReport:
        """
        Generate comprehensive feedback report based on comparison results.
        
        Args:
            comparison_result: Results from hybrid comparison algorithm
            processed_images: Tuple of (reference, user_drawing) processed images
            character: Optional character being evaluated for specific feedback
            
        Returns:
            FeedbackReport with actionable feedback and suggestions
        """
        try:
            reference_img, user_img = processed_images
            
            # Collect all feedback items
            feedback_items = []
            
            # 1. Analyze structural issues
            structural_feedback = self.analyze_structural_issues(
                comparison_result.analysis, comparison_result
            )
            feedback_items.extend(structural_feedback)
            
            # 2. Analyze positioning issues
            positioning_feedback = self.analyze_positioning_issues(reference_img, user_img)
            feedback_items.extend(positioning_feedback)
            
            # 3. Analyze proportional issues
            proportional_feedback = self.analyze_proportional_issues(reference_img, user_img)
            feedback_items.extend(proportional_feedback)
            
            # 4. Analyze stroke quality
            stroke_feedback = self.analyze_stroke_quality(comparison_result, user_img)
            feedback_items.extend(stroke_feedback)
            
            # 5. Generate positive feedback for good aspects
            if self.config.include_positive_feedback:
                positive_feedback = self.analyze_positive_aspects(comparison_result)
                feedback_items.extend(positive_feedback)
            
            # 6. Filter by confidence threshold
            filtered_feedback = [
                item for item in feedback_items 
                if item.confidence >= self.config.min_confidence_threshold
            ]
            
            # 7. Prioritize and limit feedback
            prioritized_feedback = self.prioritize_feedback(filtered_feedback)
            
            # 8. Generate summary messages
            primary_feedback = self._generate_primary_feedback(prioritized_feedback, comparison_result.final_score)
            positive_aspects = self._extract_positive_aspects(prioritized_feedback)
            improvement_priority = self._generate_improvement_priority(prioritized_feedback)
            
            return FeedbackReport(
                score=comparison_result.final_score,
                passed=comparison_result.final_score >= 70.0,
                primary_feedback=primary_feedback,
                detailed_feedback=prioritized_feedback,
                positive_aspects=positive_aspects,
                improvement_priority=improvement_priority
            )
            
        except Exception as e:
            logger.error(f"Feedback generation failed: {e}")
            # Return minimal feedback in case of error
            return FeedbackReport(
                score=comparison_result.final_score,
                passed=comparison_result.final_score >= 70.0,
                primary_feedback=["Unable to generate detailed feedback"],
                detailed_feedback=[],
                positive_aspects=[],
                improvement_priority=[]
            )
    
    def analyze_structural_issues(self, skeleton_analysis: SkeletonAnalysis, 
                                comparison_result: ComparisonResult) -> List[FeedbackItem]:
        """Analyze structural issues from skeleton analysis"""
        feedback_items = []
        
        # Check for missing or extra strokes
        if skeleton_analysis.missing_strokes:
            feedback_items.append(self._create_feedback_item(
                'missing_strokes',
                confidence=0.8
            ))
        
        if skeleton_analysis.extra_strokes:
            feedback_items.append(self._create_feedback_item(
                'extra_strokes',
                confidence=0.8
            ))
        
        # Check structural similarity
        if skeleton_analysis.structural_similarity < 0.5:
            feedback_items.append(self._create_feedback_item(
                'incomplete_strokes',
                confidence=skeleton_analysis.structural_similarity
            ))
        
        # Check topology issues
        if skeleton_analysis.topology_match < 0.6:
            feedback_items.append(self._create_feedback_item(
                'open_vs_closed',
                confidence=1.0 - skeleton_analysis.topology_match
            ))
        
        # Check stroke connectivity
        if skeleton_analysis.stroke_connectivity < 0.7:
            feedback_items.append(self._create_feedback_item(
                'connection_issues',
                confidence=1.0 - skeleton_analysis.stroke_connectivity
            ))
        
        return feedback_items
    
    def analyze_positioning_issues(self, reference: ProcessedImage, user: ProcessedImage) -> List[FeedbackItem]:
        """Analyze positioning and alignment issues"""
        feedback_items = []
        
        # Check centering
        ref_center = (reference.bounding_box[0] + reference.bounding_box[2] // 2,
                     reference.bounding_box[1] + reference.bounding_box[3] // 2)
        user_center = (user.bounding_box[0] + user.bounding_box[2] // 2,
                      user.bounding_box[1] + user.bounding_box[3] // 2)
        
        center_distance = np.sqrt((ref_center[0] - user_center[0])**2 + 
                                 (ref_center[1] - user_center[1])**2)
        
        # Normalize by image size
        max_distance = np.sqrt(256**2 + 256**2) / 4  # Quarter of diagonal
        
        if center_distance > max_distance * 0.3:  # 30% of max acceptable distance
            confidence = min(1.0, center_distance / max_distance)
            feedback_items.append(self._create_feedback_item(
                'off_center',
                confidence=confidence
            ))
        
        # Check for rotation (simplified check using bounding box aspect ratio difference)
        ref_aspect = reference.bounding_box[2] / max(1, reference.bounding_box[3])
        user_aspect = user.bounding_box[2] / max(1, user.bounding_box[3])
        
        aspect_diff = abs(ref_aspect - user_aspect) / max(ref_aspect, user_aspect)
        
        if aspect_diff > 0.3:  # 30% difference in aspect ratio
            feedback_items.append(self._create_feedback_item(
                'rotation_error',
                confidence=min(1.0, aspect_diff)
            ))
        
        return feedback_items
    
    def analyze_proportional_issues(self, reference: ProcessedImage, user: ProcessedImage) -> List[FeedbackItem]:
        """Analyze proportional and sizing issues"""
        feedback_items = []
        
        # Calculate areas
        ref_area = reference.bounding_box[2] * reference.bounding_box[3]
        user_area = user.bounding_box[2] * user.bounding_box[3]
        
        if ref_area > 0 and user_area > 0:
            size_ratio = user_area / ref_area
            
            # Check if too small
            if size_ratio < 0.5:  # User drawing is less than 50% of reference size
                confidence = min(1.0, (0.5 - size_ratio) / 0.5)
                feedback_items.append(self._create_feedback_item(
                    'size_too_small',
                    confidence=confidence
                ))
            
            # Check if too large
            elif size_ratio > 2.0:  # User drawing is more than 200% of reference size
                confidence = min(1.0, (size_ratio - 2.0) / 2.0)
                feedback_items.append(self._create_feedback_item(
                    'size_too_large',
                    confidence=confidence
                ))
        
        # Check aspect ratio
        ref_aspect = reference.bounding_box[2] / max(1, reference.bounding_box[3])
        user_aspect = user.bounding_box[2] / max(1, user.bounding_box[3])
        
        aspect_error = abs(ref_aspect - user_aspect) / max(ref_aspect, user_aspect)
        
        if aspect_error > 0.25:  # 25% aspect ratio error
            confidence = min(1.0, aspect_error)
            feedback_items.append(self._create_feedback_item(
                'aspect_ratio_error',
                confidence=confidence
            ))
        
        return feedback_items
    
    def analyze_stroke_quality(self, comparison_result: ComparisonResult, user_img: ProcessedImage) -> List[FeedbackItem]:
        """Analyze stroke quality issues"""
        feedback_items = []
        
        # Use SSIM score as a proxy for stroke quality
        if comparison_result.ssim_score < 0.6:
            # Low SSIM might indicate stroke quality issues
            confidence = 1.0 - comparison_result.ssim_score
            
            # Randomly choose between thickness and smoothness issues
            # In a full implementation, this would use more sophisticated analysis
            if np.random.random() > 0.5:
                feedback_items.append(self._create_feedback_item(
                    'stroke_thickness',
                    confidence=confidence * 0.7  # Lower confidence for inferred issues
                ))
            else:
                feedback_items.append(self._create_feedback_item(
                    'stroke_smoothness',
                    confidence=confidence * 0.7
                ))
        
        return feedback_items
    
    def analyze_positive_aspects(self, comparison_result: ComparisonResult) -> List[FeedbackItem]:
        """Identify positive aspects to reinforce good practices"""
        feedback_items = []
        
        # Good structural similarity
        if comparison_result.skeleton_score > 0.8:
            feedback_items.append(self._create_feedback_item(
                'good_structure',
                confidence=comparison_result.skeleton_score
            ))
        
        # Good overall similarity (SSIM)
        if comparison_result.ssim_score > 0.8:
            feedback_items.append(self._create_feedback_item(
                'good_proportions',
                confidence=comparison_result.ssim_score
            ))
        
        # Good contour matching
        if comparison_result.contour_score > 0.8:
            feedback_items.append(self._create_feedback_item(
                'good_positioning',
                confidence=comparison_result.contour_score
            ))
        
        return feedback_items
    
    def prioritize_feedback(self, feedback_items: List[FeedbackItem]) -> List[FeedbackItem]:
        """Prioritize feedback items by importance and limit count"""
        if not feedback_items:
            return []
        
        # Sort by severity and confidence
        severity_order = {
            FeedbackSeverity.CRITICAL.value: 0,
            FeedbackSeverity.MAJOR.value: 1,
            FeedbackSeverity.MINOR.value: 2,
            FeedbackSeverity.POSITIVE.value: 3
        }
        
        sorted_feedback = sorted(
            feedback_items,
            key=lambda x: (severity_order.get(x.severity, 999), -x.confidence)
        )
        
        # Limit to max feedback items
        return sorted_feedback[:self.config.max_feedback_items]
    
    def _create_feedback_item(self, template_key: str, confidence: float) -> FeedbackItem:
        """Create a feedback item from a template"""
        template = self.feedback_templates.get(template_key)
        if not template:
            logger.warning(f"Unknown feedback template: {template_key}")
            return FeedbackItem(
                category=FeedbackCategory.QUALITY.value,
                severity=FeedbackSeverity.MINOR.value,
                message="General improvement needed",
                suggestion="Keep practicing to improve your handwriting",
                confidence=confidence
            )
        
        return FeedbackItem(
            category=template['category'].value,
            severity=template['severity'].value,
            message=template['message'],
            suggestion=template['suggestion'],
            confidence=confidence
        )
    
    def _generate_primary_feedback(self, feedback_items: List[FeedbackItem], score: float) -> List[str]:
        """Generate primary feedback messages"""
        primary_messages = []
        
        # Score-based message
        if score >= 90:
            primary_messages.append("Excellent work! Your handwriting is very accurate.")
        elif score >= 70:
            primary_messages.append("Good job! Your handwriting meets the passing criteria.")
        elif score >= 50:
            primary_messages.append("You're making progress, but there's room for improvement.")
        else:
            primary_messages.append("Keep practicing! Focus on the key areas for improvement.")
        
        # Add top critical/major issues
        critical_issues = [
            item for item in feedback_items 
            if item.severity in [FeedbackSeverity.CRITICAL.value, FeedbackSeverity.MAJOR.value]
        ]
        
        for issue in critical_issues[:2]:  # Top 2 critical issues
            primary_messages.append(issue.message)
        
        return primary_messages
    
    def _extract_positive_aspects(self, feedback_items: List[FeedbackItem]) -> List[str]:
        """Extract positive feedback messages"""
        return [
            item.message for item in feedback_items 
            if item.severity == FeedbackSeverity.POSITIVE.value
        ]
    
    def _generate_improvement_priority(self, feedback_items: List[FeedbackItem]) -> List[str]:
        """Generate prioritized improvement suggestions"""
        improvement_items = [
            item for item in feedback_items 
            if item.severity != FeedbackSeverity.POSITIVE.value
        ]
        
        # Sort by severity and return suggestions
        severity_order = {
            FeedbackSeverity.CRITICAL.value: 0,
            FeedbackSeverity.MAJOR.value: 1,
            FeedbackSeverity.MINOR.value: 2
        }
        
        sorted_items = sorted(
            improvement_items,
            key=lambda x: severity_order.get(x.severity, 999)
        )
        
        return [item.suggestion for item in sorted_items[:3]]  # Top 3 priorities


# Example usage and testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # This would be used with actual comparison results
    print("FeedbackGenerator initialized successfully")
    print("Ready to generate feedback for handwriting evaluations")