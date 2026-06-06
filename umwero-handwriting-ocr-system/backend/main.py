"""
FastAPI main application for Umwero Handwriting Evaluation System
Production-ready with comprehensive middleware, validation, and error handling.
"""

import os
import time
import logging
from datetime import datetime
from typing import Any, List, Optional
import uuid
import base64
import io
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from dotenv import dotenv_values
import uvicorn


def load_backend_env() -> None:
    """Load backend-local env values with root project env as fallback."""
    backend_dir = Path(__file__).resolve().parent
    backend_env = backend_dir / ".env"
    root_env = backend_dir.parent.parent / ".env"
    merged = {
        **dotenv_values(root_env),
        **dotenv_values(backend_env),
    }

    for key, value in merged.items():
        if value is not None and key not in os.environ:
            os.environ[key] = value


load_backend_env()

# Import our evaluation components
from src.evaluation_engine import EvaluationEngine, EvaluationResult
from src.font_renderer import FontRenderingService
from src.cache_service import CacheService, CacheConfig, get_cache_service
from src.performance_optimizer import PerformanceOptimizer
from src.image_processor import ImageProcessingPipeline
from src.comparison_algorithm import HybridComparisonAlgorithm
from src.database_service import db_service
from src.data_collector import data_collector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True,
)
logger = logging.getLogger(__name__)

# Pydantic models for request/response validation
class EvaluationRequest(BaseModel):
    character: str = Field(..., min_length=1, max_length=10, description="Character to evaluate")
    image: Optional[str] = Field(None, pattern=r'^data:image/(png|jpeg);base64,', description="Base64 encoded image")
    image_url: Optional[str] = Field(None, description="Supabase URL for the saved user drawing")
    reference_image_url: Optional[str] = Field(None, description="Supabase URL for the canonical reference image")
    character_id: Optional[str] = Field(None, description="Character ID from the main app database")
    latin_equivalent: Optional[str] = Field(None, description="Latin equivalent for metadata")
    session_id: Optional[str] = Field(None, description="Optional session identifier")
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    strokes: Optional[List[dict[str, Any]]] = Field(None, description="Raw learner canvas strokes")
    expected_stroke_count: Optional[int] = Field(None, ge=0, description="Canonical expected stroke count")

    @validator('character')
    def validate_character(cls, v):
        if not v.strip():
            raise ValueError('Character cannot be empty or whitespace')
        return v.strip()

    @validator('image')
    def validate_image_size(cls, v):
        if v is None:
            return v
        # Rough estimate of image size (base64 is ~33% larger than binary)
        base64_data = v.split(',')[1] if ',' in v else v
        estimated_size = (len(base64_data) * 3) / 4
        max_size = 5 * 1024 * 1024  # 5MB limit
        
        if estimated_size > max_size:
            raise ValueError(f'Image too large: {estimated_size/1024:.1f}KB (max: {max_size/1024}KB)')
        
        return v

    @validator('image_url')
    def validate_image_source(cls, v, values):
        if not v and not values.get('image'):
            raise ValueError('Either image or image_url is required')
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
    strengths: List[str] = Field(default_factory=list, description="What the learner did well")
    weaknesses: List[str] = Field(default_factory=list, description="Areas that need attention")
    practice_areas: List[str] = Field(default_factory=list, description="Specific improvement advice")
    detailed_feedback: List[FeedbackItem] = Field(..., description="Detailed feedback with categories")
    confidence: float = Field(..., ge=0, le=1, description="Confidence in the evaluation")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")


# ── New production response shape ─────────────────────────────────────────────

class MetricsPayload(BaseModel):
    ssim: float
    contour: float
    skeleton: float
    strokeDirection: float
    shapeAlignment: float


class FeedbackPayload(BaseModel):
    strengths: List[str]
    issues: List[str]
    tips: List[str]


class ProductionEvaluationResponse(BaseModel):
    """
    Exact response shape required by the production API contract:

    {
      "success": true,
      "score": 87,
      "confidence": 0.91,
      "quality": "good",
      "metrics": { "ssim": 0.89, "contour": 0.84, "skeleton": 0.80,
                   "strokeDirection": 0.92, "shapeAlignment": 0.88 },
      "feedback": { "strengths": [...], "issues": [...], "tips": [...] }
    }
    """
    success: bool
    score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    quality: str          # "excellent" | "good" | "fair" | "poor"
    metrics: MetricsPayload
    feedback: FeedbackPayload
    processing_time_ms: int


class ReferenceResponse(BaseModel):
    character: str
    image_url: str
    cached: bool
    metadata: dict = {}


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
cache_service: Optional[CacheService] = None


def _supabase_storage_config():
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    supabase_key = service_role_key if service_role_key and len(service_role_key.split(".")) == 3 else anon_key

    if not supabase_url or not supabase_key:
        raise RuntimeError("Supabase URL and key are required for storage access")

    return supabase_url.rstrip("/"), supabase_key


def _fetch_url_as_data_url(url: str) -> str:
    headers = {"User-Agent": "uruziga-ocr/1.0"}
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    if supabase_url and url.startswith(supabase_url.rstrip("/")):
        _, supabase_key = _supabase_storage_config()
        headers.update({
            "Authorization": f"Bearer {supabase_key}",
            "apikey": supabase_key,
        })
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            content_type = response.headers.get("content-type", "image/png").split(";")[0]
            data = response.read()
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed to fetch image URL: {exc}") from exc

    logger.info("Remote image loaded: type=%s bytes=%d", content_type, len(data))
    encoded = base64.b64encode(data).decode("utf-8")
    return f"data:{content_type};base64,{encoded}"


def _image_to_png_bytes(image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _safe_path_segment(value: str) -> str:
    safe = "".join(char if char.isalnum() or char in ("-", "_") else "-" for char in value)
    safe = "-".join(part for part in safe.split("-") if part)
    return safe or "unknown"


def _upload_reference_image(image, path: str) -> str:
    supabase_url, supabase_key = _supabase_storage_config()
    bucket = "character-images"
    encoded_path = "/".join(urllib.parse.quote(part) for part in path.split("/"))
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{encoded_path}"
    data = _image_to_png_bytes(image)
    request = urllib.request.Request(
        upload_url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {supabase_key}",
            "apikey": supabase_key,
            "Content-Type": "image/png",
            "Cache-Control": "3600",
            "x-upsert": "true",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=15):
            pass
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase reference upload failed: {exc.code} {details}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Supabase reference upload failed: {exc}") from exc

    return f"{supabase_url}/storage/v1/object/public/{bucket}/{encoded_path}"


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
    global evaluation_engine, font_renderer, cache_service
    
    logger.info("Starting Umwero Handwriting Evaluation API...")
    
    try:
        # Initialize database connection
        db_connected = await db_service.connect()
        if not db_connected:
            logger.error("Failed to connect to database")
            raise Exception("Database connection failed")
        
        logger.info("Database connected successfully")
        
        # Initialize cache service
        cache_config = CacheConfig(
            redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
            default_ttl=int(os.getenv("CACHE_DEFAULT_TTL", "3600")),
            reference_ttl=int(os.getenv("CACHE_REFERENCE_TTL", "86400")),
            feature_ttl=int(os.getenv("CACHE_FEATURE_TTL", "43200"))
        )
        
        cache_service = await get_cache_service(cache_config)
        logger.info("Cache service initialized")
        
        # Initialize font renderer
        font_path = os.getenv("UMWERO_FONT_PATH", "fonts/Umwero.ttf")
        
        if not os.path.exists(font_path):
            logger.warning(f"Font file not found at {font_path}, using fallback")
            # For demo purposes, we'll continue without the font
            # In production, this should be a critical error
        
        font_renderer = FontRenderingService(font_path, cache_service=cache_service) if os.path.exists(font_path) else None
        
        # Initialize evaluation engine
        # Initialize evaluation engine with performance optimizer
        performance_optimizer = PerformanceOptimizer(
            font_renderer=font_renderer,
            image_processor=ImageProcessingPipeline(),
            comparison_algorithm=HybridComparisonAlgorithm(),
            cache_service=cache_service
        )
        
        await performance_optimizer.initialize()
        
        evaluation_engine = EvaluationEngine(
            font_renderer, 
            cache_service=cache_service, 
            performance_optimizer=performance_optimizer,
            collect_training_data=os.getenv("PYTHON_LOCAL_DATASET_COLLECTION", "false").lower() == "true"
        )
        
        # Warm cache with common characters if font renderer is available
        if font_renderer and cache_service:
            common_characters = ['"', "|", "}", "{", ":"] + list("BCDFGHJKLMNPRSTVWYZ")
            logger.info("Starting cache warming for common characters...")
            warm_results = await cache_service.warm_cache(common_characters, font_renderer)
            successful_count = sum(1 for success in warm_results.values() if success)
            logger.info(f"Cache warming completed: {successful_count}/{len(common_characters)} characters cached")
        
        logger.info("Services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global cache_service
    
    logger.info("Shutting down Umwero Handwriting Evaluation API...")
    
    # Close database connection
    await db_service.disconnect()
    logger.info("Database disconnected")
    
    # Close cache service
    if cache_service:
        await cache_service.close()
        logger.info("Cache service closed")


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
        
        user_image_data = _fetch_url_as_data_url(request.image_url) if request.image_url else request.image
        reference_image_data = (
            _fetch_url_as_data_url(request.reference_image_url)
            if request.reference_image_url
            else None
        )

        if not user_image_data:
            raise EvaluationException(
                "INVALID_REQUEST",
                "Either image or image_url is required"
            )

        # Perform evaluation
        result = await evaluation_engine.evaluate_handwriting(
            character=request.character,
            user_image_data=user_image_data,
            reference_image_data=reference_image_data,
            session_id=request.session_id,
            user_id=request.user_id,
            user_strokes=request.strokes,
            expected_stroke_count=request.expected_stroke_count,
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Convert to response format
        detailed_items = [
            FeedbackItem(
                category=item.category,
                severity=item.severity,
                message=item.message,
                suggestion=item.suggestion,
                confidence=item.confidence
            )
            for item in result.detailed_feedback
        ]
        strengths = [item.message for item in detailed_items if item.severity in ("success", "info") and item.confidence >= 0.7]
        weaknesses = [item.message for item in detailed_items if item.severity in ("warning", "error")]
        practice_areas = [item.suggestion for item in detailed_items if item.suggestion]

        response = EvaluationResponse(
            score=result.score,
            passed=result.score >= 70.0,
            feedback=result.feedback,
            strengths=strengths,
            weaknesses=weaknesses,
            practice_areas=practice_areas,
            detailed_feedback=detailed_items,
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
async def get_reference_image(
    character: str,
    upload: bool = Query(False),
    character_id: Optional[str] = Query(None),
    latin_equivalent: Optional[str] = Query(None),
    character_type: Optional[str] = Query(None),
):
    """Get reference image for a character."""
    if not font_renderer:
        raise EvaluationException(
            "SERVICE_UNAVAILABLE",
            "Font renderer not initialized"
        )
    
    try:
        reference_image = await font_renderer.render_character_cached(character, 256)
        image_url = f"/static/references/{urllib.parse.quote(character)}.png"
        metadata = {
            "font_path": font_renderer.font_path,
            "rendering_engine": font_renderer.selected_engine.value,
            "size": 256,
            "generated_at": datetime.utcnow().isoformat(),
            "character_id": character_id,
            "latin_equivalent": latin_equivalent,
            "character_type": character_type,
        }

        if upload:
            reference_key = _safe_path_segment(character_id or latin_equivalent or character)
            image_url = _upload_reference_image(
                reference_image,
                f"characters/references/{reference_key}.png"
            )

        return ReferenceResponse(
            character=character,
            image_url=image_url,
            cached=False,
            metadata=metadata
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
        "cache_service": cache_service is not None,
        "database": db_service._connected,
    }
    
    # Get cache service health if available
    if cache_service:
        try:
            cache_health = await cache_service.health_check()
            components["cache_service_details"] = cache_health
        except Exception as e:
            components["cache_service_error"] = str(e)
    
    # Get database statistics if available
    try:
        db_stats = await db_service.get_dataset_statistics()
        components["database_stats"] = db_stats
    except Exception as e:
        components["database_error"] = str(e)
    
    # Informational dictionaries such as database_stats may be empty even when
    # the underlying component is healthy, so only evaluate critical booleans.
    all_healthy = all(
        components[name]
        for name in ("evaluation_engine", "font_renderer", "cache_service", "database")
    )
    
    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        components=components
    )


@app.get("/metrics")
async def get_metrics():
    """Prometheus-compatible metrics endpoint."""
    metrics = {
        "requests_total": "# Not implemented yet",
        "request_duration_seconds": "# Not implemented yet",
        "evaluation_scores_histogram": "# Not implemented yet"
    }
    
    # Add cache metrics if available
    if cache_service:
        try:
            cache_stats = cache_service.get_cache_stats()
            metrics["cache_hits_total"] = cache_stats.get('hits', 0)
            metrics["cache_misses_total"] = cache_stats.get('misses', 0)
            metrics["cache_hit_rate_percent"] = cache_stats.get('hit_rate_percent', 0)
        except Exception as e:
            metrics["cache_metrics_error"] = str(e)
    
    return metrics


@app.post("/api/cache/warm")
async def warm_cache(characters: List[str] = None):
    """Warm cache with specified characters or common characters."""
    if not cache_service or not font_renderer:
        raise EvaluationException(
            "SERVICE_UNAVAILABLE",
            "Cache service or font renderer not available"
        )
    
    # Use provided characters or default to common ones
    if not characters:
        characters = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    
    try:
        logger.info(f"Starting cache warming for {len(characters)} characters")
        results = await cache_service.warm_cache(characters, font_renderer)
        successful_count = sum(1 for success in results.values() if success)
        
        return {
            "message": f"Cache warming completed",
            "total_characters": len(characters),
            "successful": successful_count,
            "failed": len(characters) - successful_count,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Cache warming failed: {e}")
        raise EvaluationException(
            "CACHE_WARM_FAILED",
            f"Failed to warm cache: {str(e)}"
        )


@app.delete("/api/cache/clear")
async def clear_cache():
    """Clear all cached data."""
    if not cache_service:
        raise EvaluationException(
            "SERVICE_UNAVAILABLE",
            "Cache service not available"
        )
    
    try:
        success = await cache_service.clear_all_cache()
        
        if success:
            return {"message": "Cache cleared successfully"}
        else:
            raise EvaluationException(
                "CACHE_CLEAR_FAILED",
                "Failed to clear cache"
            )
            
    except Exception as e:
        logger.error(f"Cache clearing failed: {e}")
        raise EvaluationException(
            "CACHE_CLEAR_FAILED",
            f"Failed to clear cache: {str(e)}"
        )


@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache performance statistics."""
    if not cache_service:
        raise EvaluationException(
            "SERVICE_UNAVAILABLE",
            "Cache service not available"
        )
    
    try:
        stats = cache_service.get_cache_stats()
        health = await cache_service.health_check()
        
        return {
            "stats": stats,
            "health": health
        }
        
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        raise EvaluationException(
            "CACHE_STATS_FAILED",
            f"Failed to get cache statistics: {str(e)}"
        )


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


# ─── Dataset Management Endpoints ────────────────────────────────────────────

@app.get("/api/dataset/stats")
async def get_dataset_statistics():
    """Get comprehensive dataset statistics for admin dashboard."""
    try:
        stats = await db_service.get_dataset_statistics()
        return {
            "success": True,
            "statistics": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get dataset statistics: {e}")
        raise EvaluationException(
            "DATASET_STATS_FAILED",
            f"Failed to get dataset statistics: {str(e)}"
        )


@app.post("/api/dataset/export")
async def export_dataset(
    export_format: str = "json",
    character_types: Optional[List[str]] = None,
    quality_labels: Optional[List[str]] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    limit: Optional[int] = None
):
    """Export dataset in specified format for ML frameworks."""
    try:
        # Validate export format
        valid_formats = ["json", "csv", "tensorflow", "pytorch"]
        if export_format not in valid_formats:
            raise ValueError(f"Invalid export format. Must be one of: {valid_formats}")
        
        # Create filters
        filters = {}
        if character_types:
            filters["character_types"] = character_types
        if quality_labels:
            filters["quality_labels"] = quality_labels
        if min_score is not None:
            filters["min_score"] = min_score
        if max_score is not None:
            filters["max_score"] = max_score
        if limit is not None:
            filters["limit"] = limit
        
        # Generate export filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"umwero_dataset_{export_format}_{timestamp}"
        
        if export_format in ["json", "csv"]:
            output_filename += f".{export_format}"
        
        output_path = f"exports/{output_filename}"
        
        # Export dataset
        exported_path = await data_collector.export_dataset(
            export_format=export_format,
            output_path=output_path,
            filters=filters
        )
        
        return {
            "success": True,
            "export_path": exported_path,
            "format": export_format,
            "filters": filters,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Dataset export failed: {e}")
        raise EvaluationException(
            "DATASET_EXPORT_FAILED",
            f"Failed to export dataset: {str(e)}"
        )


@app.get("/api/dataset/training-data")
async def get_training_data(
    character_types: Optional[str] = None,
    quality_labels: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    limit: Optional[int] = 100
):
    """Get filtered training data for analysis."""
    try:
        # Parse comma-separated values
        character_type_list = character_types.split(",") if character_types else None
        quality_label_list = quality_labels.split(",") if quality_labels else None
        
        # Get training data
        training_data = await db_service.get_training_data(
            character_types=character_type_list,
            quality_labels=quality_label_list,
            min_score=min_score,
            max_score=max_score,
            limit=limit
        )
        
        # Convert to JSON-serializable format
        serialized_data = []
        for attempt in training_data:
            data = {
                "id": attempt.id,
                "character": attempt.character,
                "character_type": attempt.characterType,
                "final_score": attempt.finalScore,
                "is_correct": attempt.isCorrect,
                "quality_label": attempt.qualityLabel,
                "submitted_at": attempt.submittedAt.isoformat(),
                "user_drawing_path": attempt.userDrawing,
                "reference_image_path": attempt.referenceImage
            }
            
            # Add feature vector if available
            if attempt.featureVector:
                data["features"] = {
                    "contour_area": attempt.featureVector.contourArea,
                    "aspect_ratio": attempt.featureVector.aspectRatio,
                    "stroke_count": attempt.featureVector.strokeCount,
                    "complexity_score": attempt.featureVector.complexityScore
                }
            
            serialized_data.append(data)
        
        return {
            "success": True,
            "data": serialized_data,
            "count": len(serialized_data),
            "filters": {
                "character_types": character_type_list,
                "quality_labels": quality_label_list,
                "min_score": min_score,
                "max_score": max_score,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get training data: {e}")
        raise EvaluationException(
            "TRAINING_DATA_FAILED",
            f"Failed to get training data: {str(e)}"
        )


# ─── Performance Metrics Endpoints ───────────────────────────────────────────

@app.post("/api/metrics/record")
async def record_performance_metric(
    metric_type: str,
    component: str,
    value: float,
    unit: str,
    character_type: Optional[str] = None
):
    """Record system performance metrics."""
    try:
        await db_service.record_performance_metric(
            metric_type=metric_type,
            component=component,
            value=value,
            unit=unit,
            character_type=character_type
        )
        
        return {
            "success": True,
            "message": "Performance metric recorded",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to record performance metric: {e}")
        raise EvaluationException(
            "METRIC_RECORD_FAILED",
            f"Failed to record performance metric: {str(e)}"
        )

# ─── ML Pipeline Endpoints ───────────────────────────────────────────────────

@app.post("/api/ml/prepare-dataset")
async def prepare_training_dataset(
    character_types: Optional[str] = None,
    quality_labels: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    stratify_by: str = "character_type",
    random_seed: int = 42
):
    """Prepare training dataset with train/validation/test splits."""
    try:
        # Import ML pipeline service
        from ml_pipeline_service import ml_pipeline_service
        
        # Parse comma-separated values
        character_type_list = character_types.split(",") if character_types else None
        quality_label_list = quality_labels.split(",") if quality_labels else None
        
        # Prepare dataset
        result = await ml_pipeline_service.prepare_training_dataset(
            character_types=character_type_list,
            quality_labels=quality_label_list,
            min_score=min_score,
            max_score=max_score,
            train_ratio=train_ratio,
            val_ratio=val_ratio,
            test_ratio=test_ratio,
            stratify_by=stratify_by,
            random_seed=random_seed
        )
        
        return {
            "success": True,
            "dataset": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Dataset preparation failed: {e}")
        raise EvaluationException(
            "DATASET_PREPARATION_FAILED",
            f"Failed to prepare training dataset: {str(e)}"
        )


@app.post("/api/ml/export-framework")
async def export_for_framework(
    framework: str,
    output_dir: str = "ml_exports",
    include_images: bool = True,
    include_features: bool = True,
    normalize_features: bool = True,
    # Dataset preparation parameters
    character_types: Optional[str] = None,
    quality_labels: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15
):
    """Export dataset for specific ML framework."""
    try:
        from ml_pipeline_service import ml_pipeline_service
        
        # Parse parameters
        character_type_list = character_types.split(",") if character_types else None
        quality_label_list = quality_labels.split(",") if quality_labels else None
        
        # Prepare dataset first
        dataset_result = await ml_pipeline_service.prepare_training_dataset(
            character_types=character_type_list,
            quality_labels=quality_label_list,
            min_score=min_score,
            max_score=max_score,
            train_ratio=train_ratio,
            val_ratio=val_ratio,
            test_ratio=test_ratio
        )
        
        # Export for framework
        export_paths = await ml_pipeline_service.export_for_framework(
            dataset_splits=dataset_result["splits"],
            framework=framework,
            output_dir=output_dir,
            include_images=include_images,
            include_features=include_features,
            normalize_features=normalize_features
        )
        
        return {
            "success": True,
            "framework": framework,
            "export_paths": export_paths,
            "dataset_metadata": dataset_result["metadata"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Framework export failed: {e}")
        raise EvaluationException(
            "FRAMEWORK_EXPORT_FAILED",
            f"Failed to export for {framework}: {str(e)}"
        )


@app.get("/api/ml/supported-frameworks")
async def get_supported_frameworks():
    """Get list of supported ML frameworks."""
    try:
        from ml_pipeline_service import ml_pipeline_service
        
        return {
            "success": True,
            "frameworks": ml_pipeline_service.supported_frameworks,
            "descriptions": {
                "tensorflow": "TensorFlow TFRecord format for deep learning",
                "pytorch": "PyTorch Dataset format for deep learning",
                "sklearn": "NumPy arrays for scikit-learn models",
                "xgboost": "Optimized format for XGBoost models"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get supported frameworks: {e}")
        raise EvaluationException(
            "FRAMEWORKS_FAILED",
            f"Failed to get supported frameworks: {str(e)}"
        )


@app.post("/api/ml/validate-quality")
async def validate_data_quality(
    character_types: Optional[str] = None,
    quality_labels: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None
):
    """Validate data quality for ML training."""
    try:
        from ml_pipeline_service import ml_pipeline_service
        
        # Parse parameters
        character_type_list = character_types.split(",") if character_types else None
        quality_label_list = quality_labels.split(",") if quality_labels else None
        
        # Get training data
        training_data = await db_service.get_training_data(
            character_types=character_type_list,
            quality_labels=quality_label_list,
            min_score=min_score,
            max_score=max_score
        )
        
        if not training_data:
            return {
                "success": False,
                "message": "No training data found with specified filters"
            }
        
        # Convert to structured format
        dataset = await ml_pipeline_service._convert_to_structured_dataset(training_data)
        
        # Validate quality
        quality_report = ml_pipeline_service._validate_data_quality(dataset)
        
        return {
            "success": True,
            "quality_report": quality_report,
            "recommendations": ml_pipeline_service._generate_quality_recommendations(quality_report),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Data quality validation failed: {e}")
        raise EvaluationException(
            "QUALITY_VALIDATION_FAILED",
            f"Failed to validate data quality: {str(e)}"
        )
