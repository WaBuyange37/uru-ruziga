"""
Data models for the Handwriting Evaluation System
"""
from pydantic import BaseModel
from typing import List, Optional, Tuple
import numpy as np
from dataclasses import dataclass

class EvaluationRequest(BaseModel):
    character: str
    image: str  # base64 encoded image

class EvaluationResponse(BaseModel):
    score: float  # 0-100

class ErrorResponse(BaseModel):
    error: str

@dataclass
class ProcessedImage:
    grayscale: np.ndarray
    binary: np.ndarray
    bounding_box: Tuple[int, int, int, int]

@dataclass
class ComparisonResult:
    ssim_score: float
    contour_score: float
    final_score: float