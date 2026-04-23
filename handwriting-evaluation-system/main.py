"""
Handwriting Evaluation System - Complete FastAPI Application
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path

from src.evaluation_engine import EvaluationEngine
from src.models import EvaluationRequest, EvaluationResponse, ErrorResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Umwero Handwriting Evaluation API",
    description="Evaluate user-drawn Umwero characters against font-generated references",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "https://uruziga.rw",     # Production domain
        "https://*.uruziga.rw",   # Subdomains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Evaluation Engine
# Font path from environment variable or default
FONT_PATH = os.getenv("UMWERO_FONT_PATH", "./fonts/umwero.otf")

try:
    evaluation_engine = EvaluationEngine(font_path=FONT_PATH)
    logger.info(f"Evaluation engine initialized with font: {FONT_PATH}")
except Exception as e:
    logger.error(f"Failed to initialize evaluation engine: {e}")
    evaluation_engine = None

# Root endpoint
@app.get("/")
async def root():
    """API root - returns basic information"""
    return {
        "service": "Umwero Handwriting Evaluation API",
        "version": "1.0.0",
        "status": "operational" if evaluation_engine else "degraded",
        "endpoints": {
            "evaluate": "/api/evaluate-character",
            "health": "/health",
            "docs": "/docs"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancing"""
    health_status = {
        "status": "healthy" if evaluation_engine else "unhealthy",
        "components": {
            "evaluation_engine": "operational" if evaluation_engine else "failed",
            "font_loaded": evaluation_engine is not None
        }
    }
    
    status_code = status.HTTP_200_OK if evaluation_engine else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=health_status, status_code=status_code)

# Main evaluation endpoint
@app.post(
    "/api/evaluate-character",
    response_model=EvaluationResponse,
    responses={
        200: {
            "description": "Successful evaluation",
            "content": {
                "application/json": {
                    "example": {"score": 85.7}
                }
            }
        },
        400: {"description": "Invalid input", "model": ErrorResponse},
        500: {"description": "Server error", "model": ErrorResponse},
        503: {"description": "Service unavailable", "model": ErrorResponse}
    },
    summary="Evaluate character drawing",
    description="""
    Evaluates a user-drawn Umwero character against a font-generated reference.
    
    **Algorithm**: Hybrid scoring using 60% SSIM (structural similarity) + 40% contour matching
    
    **Input**:
    - `character`: The Umwero character to evaluate (e.g., "a", "u", "o", "e", "i")
    - `image`: Base64-encoded image of the user's drawing
    
    **Output**:
    - `score`: Similarity score from 0-100 (90-100 = excellent, 70-89 = good, 50-69 = fair, <50 = needs practice)
    
    **Performance**: Sub-500ms response time guaranteed
    """
)
async def evaluate_character(request: EvaluationRequest):
    """
    Evaluate a user-drawn character against font reference
    
    Args:
        request: EvaluationRequest containing character and base64 image
        
    Returns:
        EvaluationResponse with similarity score (0-100)
        
    Raises:
        HTTPException: For invalid input or processing errors
    """
    # Check if service is available
    if evaluation_engine is None:
        logger.error("Evaluation engine not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Evaluation service is currently unavailable. Font file may be missing."
        )
    
    # Validate input
    if not request.character:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Character field is required and cannot be empty"
        )
    
    if not request.image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image field is required and cannot be empty"
        )
    
    # Validate base64 format
    if not request.image.startswith("data:image/") and not _is_valid_base64(request.image):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be a valid base64-encoded string or data URL"
        )
    
    try:
        # Perform evaluation
        logger.info(f"Evaluating character: '{request.character}'")
        result = await evaluation_engine.evaluate_character(request)
        logger.info(f"Evaluation successful - Score: {result.score:.1f}")
        return result
        
    except ValueError as e:
        # Input validation errors
        logger.warning(f"Invalid input: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected errors
        logger.error(f"Evaluation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation processing failed: {str(e)}"
        )

# Error handler for global exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error occurred. Please try again later."}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("=" * 50)
    logger.info("Umwero Handwriting Evaluation API Starting")
    logger.info(f"Font Path: {FONT_PATH}")
    logger.info(f"Font Loaded: {evaluation_engine is not None}")
    logger.info("=" * 50)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Umwero Handwriting Evaluation API")

# Utility function
def _is_valid_base64(s: str) -> bool:
    """Check if string is valid base64"""
    import base64
    try:
        # Remove data URL prefix if present
        if ',' in s:
            s = s.split(',')[1]
        base64.b64decode(s, validate=True)
        return True
    except Exception:
        return False

# Run with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info", access_log=True)