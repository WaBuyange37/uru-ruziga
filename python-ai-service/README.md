# Uruziga AI Service

Production-grade Python FastAPI service for handwriting evaluation and dataset collection.

## Features

- **Handwriting Evaluation**: Compare user handwriting against reference characters
- **Reference Generation**: Generate reference images from Umwero font
- **Dataset Collection**: Store handwriting data for ML training
- **Caching**: Redis-based caching for performance
- **Monitoring**: Health checks and metrics endpoints
- **Production-Ready**: Comprehensive logging, error handling, and middleware

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Uruziga AI Service                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   FastAPI    │  │    Redis     │  │   Storage    │     │
│  │   Endpoints  │──│    Cache     │  │   (Images)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                                                    │
│         ├─ /evaluate                                        │
│         ├─ /generate-reference                              │
│         ├─ /store-dataset                                   │
│         ├─ /health                                          │
│         └─ /metrics                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Image Processing Pipeline                   │  │
│  │  • Stroke to Image Conversion                        │  │
│  │  • Reference Image Generation                        │  │
│  │  • Comparison Algorithms (SSIM, Hu Moments, etc.)   │  │
│  │  • Heatmap Generation                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Python 3.10 or higher
- Redis (optional, for caching)
- Umwero font file

### Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create required directories:
```bash
mkdir -p storage/references storage/heatmaps storage/dataset fonts
```

5. Add Umwero font:
```bash
# Copy Umwero.ttf to fonts/ directory
cp /path/to/Umwero.ttf fonts/
```

## Running the Service

### Development

```bash
python main.py
```

The service will start on `http://localhost:8000`

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### With Docker

```bash
docker build -t uruziga-ai-service .
docker run -p 8000:8000 uruziga-ai-service
```

## API Endpoints

### POST /evaluate

Evaluate user handwriting against reference character.

**Request:**
```json
{
  "character_id": "char_123",
  "strokes": [
    [
      {"x": 100, "y": 150, "timestamp": 1234567890, "pressure": 0.8},
      {"x": 102, "y": 152, "timestamp": 1234567891, "pressure": 0.8}
    ]
  ],
  "options": {
    "include_heatmap": true,
    "include_stroke_analysis": true,
    "detail_level": "detailed"
  }
}
```

**Response:**
```json
{
  "score": 85.5,
  "accuracy_level": "advanced",
  "feedback": [
    {
      "type": "shape",
      "severity": "info",
      "message": "Good overall shape"
    }
  ],
  "heatmap_url": "/heatmaps/abc123.png",
  "reference_id": "char_123",
  "processing_time_ms": 150
}
```

### POST /generate-reference

Generate reference image for a character.

**Request:**
```json
{
  "character": "ᐁ",
  "size": 400,
  "format": "png",
  "include_stroke_order": true
}
```

**Response:**
```json
{
  "image_url": "/references/char_123.png",
  "character_id": "char_123",
  "metadata": {
    "font_version": "1.0",
    "size": 400,
    "format": "png",
    "generated_at": "2024-01-15T10:30:00Z"
  }
}
```

### POST /store-dataset

Store handwriting data for ML training.

**Request:**
```json
{
  "attempt_id": "attempt_123",
  "user_id": "user_456",
  "character_id": "char_789",
  "strokes": [...],
  "score": 85.5,
  "metadata": {
    "device_type": "mobile",
    "input_method": "touch"
  }
}
```

**Response:**
```json
{
  "dataset_entry_id": "dataset_abc123",
  "stored_at": "2024-01-15T10:30:00Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "components": {
    "api": true,
    "font_renderer": true,
    "cache": true,
    "image_processor": true
  }
}
```

### GET /metrics

Prometheus-compatible metrics.

**Response:**
```json
{
  "requests_total": 1234,
  "evaluation_count": 567,
  "average_processing_time_ms": 150,
  "cache_hit_rate": 0.85
}
```

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT`: Server port (default: 8000)
- `REDIS_URL`: Redis connection URL
- `UMWERO_FONT_PATH`: Path to Umwero font file
- `CORS_ORIGINS`: Allowed CORS origins
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

## Development

### Project Structure

```
python-ai-service/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment configuration template
├── README.md              # This file
├── src/                   # Source code (to be implemented)
│   ├── image_processor.py
│   ├── comparison.py
│   ├── font_renderer.py
│   └── cache.py
├── tests/                 # Test files
│   ├── test_api.py
│   ├── test_evaluation.py
│   └── test_reference.py
├── storage/               # Storage directories
│   ├── references/
│   ├── heatmaps/
│   └── dataset/
└── fonts/                 # Font files
    └── Umwero.ttf
```

### Running Tests

```bash
pytest tests/ -v
```

### Code Quality

```bash
# Format code
black main.py src/

# Lint code
flake8 main.py src/

# Type checking
mypy main.py src/
```

## Deployment

### Docker Deployment

1. Build image:
```bash
docker build -t uruziga-ai-service:latest .
```

2. Run container:
```bash
docker run -d \
  -p 8000:8000 \
  -e REDIS_URL=redis://redis:6379 \
  -v $(pwd)/fonts:/app/fonts \
  -v $(pwd)/storage:/app/storage \
  --name uruziga-ai \
  uruziga-ai-service:latest
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

### Environment-Specific Configuration

- **Development**: Use `.env` file
- **Staging**: Use environment variables in deployment
- **Production**: Use secrets management (e.g., AWS Secrets Manager, Kubernetes Secrets)

## Monitoring

### Health Checks

- **Liveness**: `GET /health`
- **Readiness**: `GET /health` (check components status)

### Metrics

Metrics are exposed at `/metrics` in Prometheus format.

Key metrics:
- Request count
- Processing time
- Error rate
- Cache hit rate

### Logging

Logs are structured JSON format for easy parsing:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "Evaluation complete",
  "request_id": "abc-123",
  "character_id": "char_789",
  "score": 85.5,
  "processing_time_ms": 150
}
```

## Performance

### Optimization Strategies

1. **Caching**: Redis cache for reference images and features
2. **Async Processing**: FastAPI async endpoints
3. **Image Optimization**: Efficient image processing pipelines
4. **Connection Pooling**: Reuse connections to external services

### Benchmarks

Target performance:
- Evaluation: < 2 seconds per request
- Reference generation: < 500ms (cached: < 50ms)
- Throughput: > 100 requests/second

## Security

### Best Practices

1. **Input Validation**: Pydantic models validate all inputs
2. **Rate Limiting**: Implement rate limiting for public endpoints
3. **CORS**: Configure CORS origins appropriately
4. **Secrets**: Never commit secrets to version control
5. **Dependencies**: Regularly update dependencies for security patches

## Troubleshooting

### Common Issues

**Service won't start:**
- Check Python version (3.10+)
- Verify all dependencies installed
- Check port 8000 is available

**Font not found:**
- Verify `UMWERO_FONT_PATH` in `.env`
- Ensure font file exists at specified path

**Redis connection failed:**
- Check Redis is running
- Verify `REDIS_URL` in `.env`
- Service will work without Redis (degraded performance)

**Slow evaluation:**
- Enable Redis caching
- Check image size (should be < 5MB)
- Review logs for bottlenecks

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

Copyright © 2024 Uruziga Project

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Email: support@uruziga.com
- Documentation: https://docs.uruziga.com

---

**Status**: Phase 4 Complete - Foundation Ready
**Next**: Implement image processing pipeline (Phase 5)
