"""
Evaluation Engine
Orchestrates the complete evaluation process
"""
from .reference_generator import ReferenceGenerator
from .image_processor import ImageProcessor
from .comparison_algorithm import ComparisonAlgorithm
from .models import EvaluationRequest, EvaluationResponse
import logging

logger = logging.getLogger(__name__)

class EvaluationEngine:
    def __init__(self, font_path: str):
        """
        Initialize the evaluation engine
        
        Args:
            font_path: Path to the Umwero font file
        """
        self.reference_generator = ReferenceGenerator(font_path)
        self.image_processor = ImageProcessor()
        self.comparison_algorithm = ComparisonAlgorithm()
    
    async def evaluate_character(self, request: EvaluationRequest) -> EvaluationResponse:
        """
        Evaluate a user-drawn character against the font reference
        
        Args:
            request: EvaluationRequest containing character and image
            
        Returns:
            EvaluationResponse with similarity score
        """
        try:
            # Generate reference image
            reference_image = self.reference_generator.generate_reference(request.character)
            
            # Decode user drawing
            user_image = self.image_processor.decode_base64_image(request.image)
            
            # Process both images
            processed_reference = self.image_processor.preprocess_image(reference_image)
            processed_user = self.image_processor.preprocess_image(user_image)
            
            # Compare images
            comparison_result = self.comparison_algorithm.compare_images(
                processed_reference.binary,
                processed_user.binary
            )
            
            logger.info(f"Evaluation completed for character '{request.character}': "
                       f"SSIM={comparison_result.ssim_score:.3f}, "
                       f"Contour={comparison_result.contour_score:.3f}, "
                       f"Final={comparison_result.final_score:.1f}")
            
            return EvaluationResponse(score=comparison_result.final_score)
            
        except Exception as e:
            logger.error(f"Evaluation failed for character '{request.character}': {str(e)}")
            raise