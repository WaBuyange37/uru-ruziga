"""
FastAPI main application for Umwero Handwriting Evaluation System
Production-ready with comprehensive middleware, validation, and error handling.
"""

import os
import time
import logging
from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

# Import our evaluation components
from src.evaluation_engine import EvaluationEngine, EvaluationResult
from src.font_renderer import FontRenderingService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for request/response validation
class EvaluationRequest(BaseModel):
    character: str = Field(..., min_length=1, max_length=10, description="Character to evaluate")
    image: str = Field(..., regex=r'^data:image/(png|jpeg);base64,', description="Base64 encoded image")
    session_id: Optional[str] = Field(None, description="Optional session identifier")
    user_id: Optional[str] = Field(None, description="Optional user identifier")

    @validator('character')
    def validate_character(cls, v):
        if not v.strip():
            raise ValueError('Character cannot be empty or whitespace')
        return v.strip()

    @validator('image')
    def validate_image_size(cls, v):
        # Rough estimate of image size (base64 is ~33% larger than binary)
        base64_data = v.split(',')[1] if ',' in v else v
        estimated_size = (len(base64_data) * 3) / 4
        max_size = 5 * 1024 * 1024  # 5MB limit
        
        if estimated_size > max_size:
            raise ValueError(f'Image too large: {estimated_size/1024:.1f}KB (max: {max_size/1024}KB)')
        
        return v


class FeedbackItem(BaseModel):
    category: str
    severity: str
    message: str
    suggestion: str
    confidence: float = Field(..., ge=0, le=1)


class EvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100, description="Evaluation score (0-100)")
    passed: bool = Field(..., description="Whether the score meets passing criteria (>=70)")
    feedback: List[str] = Field(..., description="Human-readable feedback messages")
    detailed_feedback: List[FeedbackItem] = Field(..., description="Detailed feedback with categories")
    confidence: float = Field(..., ge=0, le=1, description="Confidence in the evaluation")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")


class ReferenceResponse(BaseModel):
    character: str
    image_url: str
    cached: bool


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str = "1.0.0"
    components: dict


class ErrorResponse(BaseModel):
    error: dict


# Custom exception handler
class EvaluationException(Exception):
    def __init__(self, code: str, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


# Create FastAPI application
app = FastAPI(
    title="Umwero Handwriting Evaluation API",
    description="Production-grade handwriting evaluation and OCR dataset system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for services (will be initialized on startup)
evaluation_engine: Optional[EvaluationEngine] = None
font_renderer: Optional[FontRenderingService] = None


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time and request ID to response headers"""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Add request ID to request state
    request.state.request_id = request_id
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = request_id
    
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for monitoring"""
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s - "
        f"Request ID: {getattr(request.state, 'request_id', 'unknown')}"
    )
    
    return response


@app.exception_handler(EvaluationException)
async def evaluation_exception_handler(request: Request, exc: EvaluationException):
    """Handle custom evaluation exceptions"""
    request_id = getattr(request.state, 'request_id', 'unknown')
    
    logger.error(f"Evaluation error [{request_id}]: {exc.code} - {exc.message}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id
            }
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle validation errors"""
    request_id = getattr(request.state, 'request_id', 'unknown')
    
    logger.error(f"Validation error [{request_id}]: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(exc),
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    request_id = getattr(request.state, 'request_id', 'unknown')
    
    logger.error(f"Unexpected error [{request_id}]: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id
            }
        }
    )


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global evaluation_engine, font_renderer
    
    logger.info("Starting Umwero Handwriting Evaluation API...")
    
    try:
        # Initialize font renderer
        font_path = os.getenv("UMWERO_FONT_PATH", "fonts/umwero.ttf")
        
        if not os.path.exists(font_path):
            logger.warning(f"Font file not found at {font_path}, using fallback")
            # For demo purposes, we'll continue without the font
            # In production, this should be a critical error
        
        font_renderer = FontRenderingService(font_path) if os.path.exists(font_path) else None
        
        # Initialize evaluation engine
        evaluation_engine = EvaluationEngine(font_renderer)
        
        logger.info("Services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Umwero Handwriting Evaluation API...")


@app.post("/api/evaluate-character", response_model=EvaluationResponse)
async def evaluate_character(request: EvaluationRequest):
    """
    Evaluate user handwriting against font reference.
    
    Returns evaluation score (0-100), feedback, and pass/fail status.
    """
    if not evaluation_engine:
        raise EvaluationException(
            "SERVICE_UNAVAILABLE",
            "Evaluation engine not initialized"
        )
    
    start_time = time.time()
    
    try:
        logger.info(f"Evaluating character '{request.character}' for session {request.session_id}")
        
        # Perform evaluation
        result = await evaluation_engine.evaluate_handwriting(
            character=request.character,
            user_image_data=request.image,
            session_id=request.session_id,
            user_id=request.user_id
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Convert to response format
        response = EvaluationResponse(
            score=result.score,
            passed=result.score >= 70.0,
            feedback=result.feedback,
            detailed_feedback=[
                FeedbackItem(
                    category=item.category,
                    severity=item.severity,
                    message=item.message,
                    suggestion=item.suggestion,
                    confidence=item.confidence
                )
                for item in result.detailed_feedback
            ],
            confidence=result.confidence,
            processing_time_ms=processing_time
        )
        
        logger.info(f"Evaluation completed: score={result.score:.1f}, time={processing_time}ms")
        
        return response
        
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        raise EvaluationException(
            "EVALUATION_FAILED",
            f"Failed to evaluate character: {str(e)}",
            {"character": request.character}
        )


@app.get("/api/reference/{character}", response_model=ReferenceResponse)
async def get_reference_image(character: str):
    """Get reference image for a character."""
    if not font_renderer:
        raise EvaluationException(
            "SERVICE_UNAVAILABLE",
            "Font renderer not initialized"
        )
    
    try:
        # This would generate/retrieve reference image
        # For now, return a placeholder response
        return ReferenceResponse(
            character=character,
            image_url=f"/static/references/{character}.png",
            cached=True
        )
        
    except Exception as e:
        logger.error(f"Failed to get reference for '{character}': {e}")
        raise EvaluationException(
            "REFERENCE_FAILED",
            f"Failed to get reference image: {str(e)}",
            {"character": character}
        )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for load balancers."""
    components = {
        "evaluation_engine": evaluation_engine is not None,
        "font_renderer": font_renderer is not None,
    }
    
    # Check if all critical components are healthy
    all_healthy = all(components.values())
    
    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        components=components
    )


@app.get("/metrics")
async def get_metrics():
    """Prometheus-compatible metrics endpoint."""
    # This would return metrics in Prometheus format
    # For now, return basic info
    return {
        "requests_total": "# Not implemented yet",
        "request_duration_seconds": "# Not implemented yet",
        "evaluation_scores_histogram": "# Not implemented yet"
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Umwero Handwriting Evaluation API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )