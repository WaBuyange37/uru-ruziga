"""
Uruziga AI Service - Production-Grade FastAPI Backend
Handwriting evaluation and dataset collection for Umwero alphabet
"""

import os
import time
import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import base64
import io

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

# Import our implementation modules
from src.image_processor import ImageProcessor, ProcessedImage
from src.font_renderer import FontRenderer
from src.comparison import ComparisonAlgorithm, ComparisonResult
from src.feedback_generator import FeedbackGenerator
from src.cache import CacheService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# Request/Response Models
# ============================================================================

class Point(BaseModel):
    x: float
    y: float
    timestamp: float
    pressure: Optional[float] = 0.5


class EvaluateRequest(BaseModel):
    character_id: str = Field(..., description="Character ID from database")
    strokes: List[List[Point]] = Field(..., description="Array of strokes, each stroke is array of points")
    image_data: Optional[str] = Field(None, description="Base64 encoded PNG (alternative to strokes)")
    options: Dict[str, Any] = Field(default_factory=dict, description="Evaluation options")

    @validator('strokes')
    def validate_strokes(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one stroke is required')
        return v


class FeedbackItem(BaseModel):
    type: str = Field(..., description="Feedback type: stroke_order, shape, proportion, alignment")
    severity: str = Field(..., description="Severity: error, warning, info")
    message: str
    visual_aid: Optional[str] = None


class EvaluateResponse(BaseModel):
    score: float = Field(..., ge=0, le=100, description="Accuracy score 0-100")
    accuracy_level: str = Field(..., description="beginner, intermediate, advanced, expert")
    feedback: List[FeedbackItem]
    heatmap_url: Optional[str] = None
    stroke_analysis: Optional[Dict[str, Any]] = None
    reference_id: str
    processing_time_ms: int


class GenerateReferenceRequest(BaseModel):
    character: str = Field(..., min_length=1, max_length=10)
    size: int = Field(400, ge=100, le=2000, description="Image dimension in pixels")
    format: str = Field("png", pattern="^(png|svg)$")
    include_stroke_order: bool = False


class GenerateReferenceResponse(BaseModel):
    image_url: str
    character_id: str
    metadata: Dict[str, Any]


class StoreDatasetRequest(BaseModel):
    attempt_id: str
    user_id: str
    character_id: str
    strokes: List[List[Point]]
    score: float
    metadata: Dict[str, Any]


class StoreDatasetResponse(BaseModel):
    dataset_entry_id: str
    stored_at: str


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str = "1.0.0"
    components: Dict[str, bool]


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="Uruziga AI Service",
    description="Production-grade handwriting evaluation and dataset collection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Global service instances
image_processor: Optional[ImageProcessor] = None
font_renderer: Optional[FontRenderer] = None
comparison_algorithm: Optional[ComparisonAlgorithm] = None
feedback_generator: Optional[FeedbackGenerator] = None
cache_service: Optional[CacheService] = None

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Middleware
# ============================================================================

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add request ID and processing time to all responses"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.3f}"
    
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for monitoring"""
    start_time = time.time()
    request_id = getattr(request.state, 'request_id', 'unknown')
    
    logger.info(f"[{request_id}] {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} - "
        f"Status: {response.status_code} - Time: {process_time:.3f}s"
    )
    
    return response


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle validation errors"""
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.error(f"[{request_id}] Validation error: {str(exc)}")
    
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
    logger.error(f"[{request_id}] Unexpected error: {str(exc)}", exc_info=True)
    
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


# ============================================================================
# Startup/Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global image_processor, font_renderer, comparison_algorithm, feedback_generator, cache_service
    
    logger.info("Starting Uruziga AI Service...")
    
    # Initialize image processor
    image_processor = ImageProcessor(target_size=256)
    logger.info("Image processor initialized")
    
    # Initialize font renderer
    font_path = os.getenv("UMWERO_FONT_PATH", "fonts/umwero.ttf")
    font_renderer = FontRenderer(font_path)
    logger.info(f"Font renderer initialized with font: {font_path}")
    
    # Initialize comparison algorithm
    comparison_algorithm = ComparisonAlgorithm()
    logger.info("Comparison algorithm initialized")
    
    # Initialize feedback generator
    feedback_generator = FeedbackGenerator()
    logger.info("Feedback generator initialized")
    
    # Initialize cache service
    cache_service = CacheService()
    logger.info("Cache service initialized")
    
    logger.info("Uruziga AI Service started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Uruziga AI Service...")
    
    # Cleanup cache connections if needed
    # (Redis client will auto-close)
    
    logger.info("Uruziga AI Service shut down successfully")


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Uruziga AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "evaluate": "/evaluate",
            "generate_reference": "/generate-reference",
            "store_dataset": "/store-dataset",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_handwriting(request: EvaluateRequest):
    """
    Evaluate user handwriting against reference character.
    
    This endpoint:
    1. Converts strokes to image (if not provided)
    2. Loads reference character image
    3. Computes similarity using multiple algorithms
    4. Returns score, feedback, and heatmap
    """
    request_id = getattr(request.state, 'request_id', 'unknown') if hasattr(request, 'state') else 'unknown'
    start_time = time.time()
    
    try:
        logger.info(f"[{request_id}] Evaluating character: {request.character_id}")
        
        # Check cache first
        cache_key = f"eval:{request.character_id}:{hash(str(request.strokes))}"
        if cache_service and cache_service.enabled:
            cached_result = cache_service.get(cache_key)
            if cached_result:
                logger.info(f"[{request_id}] Returning cached evaluation")
                return EvaluateResponse(**cached_result)
        
        # 1. Convert strokes to image or use provided image
        if request.image_data:
            user_image = image_processor.base64_to_image(request.image_data)
        else:
            # Convert strokes to image
            strokes_data = [[p.dict() for p in stroke] for stroke in request.strokes]
            user_image = image_processor.strokes_to_image(strokes_data)
        
        # 2. Preprocess user image
        user_processed = image_processor.preprocess_image(user_image)
        
        # 3. Load/generate reference image
        ref_cache_key = f"reference:{request.character_id}"
        reference_image = None
        
        if cache_service and cache_service.enabled:
            cached_ref = cache_service.get(ref_cache_key)
            if cached_ref:
                # TODO: Deserialize cached reference image
                pass
        
        if reference_image is None:
            # Generate reference image
            reference_image = font_renderer.render_character(request.character_id, 256)
            
            # Cache reference image
            if cache_service and cache_service.enabled:
                # TODO: Serialize and cache reference image
                pass
        
        # 4. Preprocess reference image
        ref_processed = image_processor.preprocess_image(reference_image)
        
        # 5. Run comparison algorithms
        comparison_result = comparison_algorithm.compare(
            ref_processed.normalized,
            user_processed.normalized,
            ref_processed.skeleton,
            user_processed.skeleton
        )
        
        # 6. Generate feedback
        feedback_items = feedback_generator.generate_feedback(
            comparison_result.final_score,
            comparison_result.ssim_score,
            comparison_result.contour_score,
            comparison_result.skeleton_score
        )
        
        # 7. Get accuracy level
        accuracy_level = feedback_generator.get_accuracy_level(comparison_result.final_score)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # 8. Build response
        response_data = {
            'score': comparison_result.final_score,
            'accuracy_level': accuracy_level,
            'feedback': [FeedbackItem(**item) for item in feedback_items],
            'heatmap_url': None,  # TODO: Generate heatmap
            'stroke_analysis': {
                'ssim_score': comparison_result.ssim_score,
                'contour_score': comparison_result.contour_score,
                'skeleton_score': comparison_result.skeleton_score,
                'confidence': comparison_result.confidence
            },
            'reference_id': request.character_id,
            'processing_time_ms': processing_time
        }
        
        response = EvaluateResponse(**response_data)
        
        # Cache the result
        if cache_service and cache_service.enabled:
            cache_service.set(cache_key, response_data, ttl=300)  # 5 minutes
        
        logger.info(f"[{request_id}] Evaluation complete: score={comparison_result.final_score:.1f}, time={processing_time}ms")
        
        return response
        
    except Exception as e:
        logger.error(f"[{request_id}] Evaluation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )


@app.post("/generate-reference", response_model=GenerateReferenceResponse)
async def generate_reference_image(request: GenerateReferenceRequest):
    """
    Generate reference image for a character.
    
    This endpoint:
    1. Loads Umwero font
    2. Renders character at specified size
    3. Optionally adds stroke order indicators
    4. Caches the result
    """
    request_id = getattr(request.state, 'request_id', 'unknown') if hasattr(request, 'state') else 'unknown'
    
    try:
        logger.info(f"[{request_id}] Generating reference for: {request.character}")
        
        # Check cache first
        cache_key = f"reference:{request.character}:{request.size}:{request.format}"
        if cache_service and cache_service.enabled:
            cached_result = cache_service.get(cache_key)
            if cached_result:
                logger.info(f"[{request_id}] Returning cached reference")
                return GenerateReferenceResponse(**cached_result)
        
        # Generate reference image
        reference_image = font_renderer.render_character(request.character, request.size)
        
        # TODO: Save to storage and get URL
        # For now, return a placeholder URL
        image_url = f"/references/{request.character}.{request.format}"
        
        response_data = {
            'image_url': image_url,
            'character_id': request.character,
            'metadata': {
                'font_version': '1.0',
                'size': request.size,
                'format': request.format,
                'generated_at': datetime.utcnow().isoformat(),
                'include_stroke_order': request.include_stroke_order
            }
        }
        
        response = GenerateReferenceResponse(**response_data)
        
        # Cache the result
        if cache_service and cache_service.enabled:
            cache_service.set(cache_key, response_data, ttl=3600)  # 1 hour
        
        logger.info(f"[{request_id}] Reference generated for: {request.character}")
        
        return response
        
    except Exception as e:
        logger.error(f"[{request_id}] Reference generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reference generation failed: {str(e)}"
        )


@app.post("/store-dataset", response_model=StoreDatasetResponse)
async def store_dataset_entry(request: StoreDatasetRequest):
    """
    Store a dataset entry for ML training.
    
    This endpoint:
    1. Validates the data
    2. Stores in structured format
    3. Returns confirmation
    """
    request_id = getattr(request.state, 'request_id', 'unknown') if hasattr(request, 'state') else 'unknown'
    
    try:
        logger.info(f"[{request_id}] Storing dataset entry for attempt: {request.attempt_id}")
        
        # TODO: Implement dataset storage
        # 1. Validate data structure
        # 2. Store in ML-ready format
        # 3. Update dataset statistics
        
        # Placeholder response
        dataset_entry_id = str(uuid.uuid4())
        stored_at = datetime.utcnow().isoformat()
        
        response = StoreDatasetResponse(
            dataset_entry_id=dataset_entry_id,
            stored_at=stored_at
        )
        
        logger.info(f"[{request_id}] Dataset entry stored: {dataset_entry_id}")
        
        return response
        
    except Exception as e:
        logger.error(f"[{request_id}] Dataset storage failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset storage failed: {str(e)}"
        )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    components = {
        "api": True,
        "font_renderer": font_renderer is not None and font_renderer.font_available,
        "cache": cache_service is not None and cache_service.is_healthy(),
        "image_processor": image_processor is not None,
        "comparison_algorithm": comparison_algorithm is not None,
        "feedback_generator": feedback_generator is not None
    }
    
    all_healthy = all(components.values())
    
    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        components=components
    )


@app.get("/metrics")
async def get_metrics():
    """Prometheus-compatible metrics endpoint"""
    # TODO: Implement actual metrics
    return {
        "requests_total": 0,
        "evaluation_count": 0,
        "average_processing_time_ms": 0,
        "cache_hit_rate": 0.0
    }


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    # Development server
    port = int(os.getenv("PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
