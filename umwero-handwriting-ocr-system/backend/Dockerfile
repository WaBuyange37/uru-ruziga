# Multi-stage Dockerfile for Umwero Handwriting OCR System
# Optimized for production deployment with comprehensive dependencies

# ─── Stage 1: Build Dependencies ─────────────────────────────────────────────
FROM python:3.11-slim as builder

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libfreetype6-dev \
    libfontconfig1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    libgdk-pixbuf2.0-dev \
    libgtk-3-dev \
    libgirepository1.0-dev \
    libpng-dev \
    libjpeg-dev \
    libopencv-dev \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Production Runtime ─────────────────────────────────────────────
FROM python:3.11-slim as production

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    libfreetype6 \
    libfontconfig1 \
    libcairo2 \
    libpango-1.0-0 \
    libglib2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libgirepository-1.0-1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libpng16-16 \
    libjpeg62-turbo \
    libopencv-core4.5 \
    libopencv-imgproc4.5 \
    libopencv-imgcodecs4.5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create app user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy application code
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY main.py .
COPY init_database.py .
COPY test_*.py .

# Create necessary directories with proper structure
RUN mkdir -p data/ocr_dataset/{raw_drawings,reference_images,processed_images,skeleton_images,exports,metadata}/{vowels,consonants,ligatures} && \
    mkdir -p fonts && \
    mkdir -p logs && \
    mkdir -p ml_exports && \
    chown -R appuser:appuser /app

# Copy font files if available (optional)
COPY fonts/ ./fonts/ 2>/dev/null || true

# Generate Prisma client (will be regenerated at runtime if needed)
RUN python -m prisma generate 2>/dev/null || echo "Prisma generation will be done at runtime"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Environment variables
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    WORKERS=1

# Start command with proper error handling
CMD ["sh", "-c", "python -m prisma generate 2>/dev/null || true && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1"]

# ─── Stage 3: Development Environment ────────────────────────────────────────
FROM production as development

# Switch back to root for development setup
USER root

# Install development dependencies
RUN apt-get update && apt-get install -y \
    vim \
    git \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install development Python packages
RUN pip install --no-cache-dir \
    pytest \
    pytest-asyncio \
    black \
    flake8 \
    mypy

# Switch back to app user
USER appuser

# Override command for development with auto-reload
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]