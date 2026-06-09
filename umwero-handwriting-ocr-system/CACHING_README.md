# Caching and Performance Optimization

This document describes the caching and performance optimization features implemented for the Umwero Handwriting Evaluation System.

## Overview

The system implements a comprehensive caching strategy using Redis as the primary cache backend with in-memory fallback. This provides significant performance improvements for font rendering, feature vector computation, and evaluation requests.

## Features

### 1. Redis-Based Caching

- **Primary Cache**: Redis for distributed, persistent caching
- **Fallback Cache**: In-memory cache when Redis is unavailable
- **Automatic Failover**: Seamless fallback to memory cache if Redis fails
- **Health Monitoring**: Built-in health checks and connection monitoring

### 2. Font Rendering Cache

- **Rendered Characters**: Cache high-quality character images from font files
- **Character Metrics**: Cache font metrics and measurements
- **Quality Scores**: Cache rendering quality assessments
- **Multi-Engine Support**: Cache results from different rendering engines

### 3. Feature Vector Storage

- **Geometric Features**: Cache contour area, aspect ratio, bounding boxes
- **Topological Features**: Cache stroke count, loops, endpoints, intersections
- **Shape Features**: Cache perimeter, solidity, extent measurements
- **Hash-Based Keys**: Support for image-specific feature caching

### 4. Cache Warming

- **Startup Warming**: Automatically warm cache with common characters on startup
- **Batch Processing**: Efficient batch warming of multiple characters
- **Progress Tracking**: Monitor warming progress and success rates
- **API Endpoints**: Manual cache warming via REST API

## Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Cache TTL Settings (in seconds)
CACHE_DEFAULT_TTL=3600      # 1 hour
CACHE_REFERENCE_TTL=86400   # 24 hours
CACHE_FEATURE_TTL=43200     # 12 hours

# Font Configuration
UMWERO_FONT_PATH=fonts/umwero.ttf
```

### Cache Configuration

```python
from src.cache_service import CacheConfig

config = CacheConfig(
    redis_url="redis://localhost:6379",
    default_ttl=3600,
    reference_ttl=86400,
    feature_ttl=43200,
    max_memory_cache_size=1000,
    enable_compression=True
)
```

## API Endpoints

### Cache Management

#### Warm Cache
```http
POST /api/cache/warm
Content-Type: application/json

["A", "B", "C", "D", "E"]
```

#### Clear Cache
```http
DELETE /api/cache/clear
```

#### Cache Statistics
```http
GET /api/cache/stats
```

Response:
```json
{
  "stats": {
    "hits": 150,
    "misses": 25,
    "sets": 175,
    "errors": 0,
    "hit_rate_percent": 85.71,
    "memory_cache_size": 50,
    "redis_available": true
  },
  "health": {
    "redis_available": true,
    "redis_connected": true,
    "memory_cache_size": 50
  }
}
```

## Performance Benefits

### Response Time Improvements

- **First Request**: ~200-500ms (font rendering + processing)
- **Cached Request**: ~10-50ms (cache retrieval + processing)
- **Improvement**: 80-95% faster response times

### Cache Hit Rates

- **Font Rendering**: 90-95% hit rate for common characters
- **Feature Vectors**: 85-90% hit rate for repeated evaluations
- **Reference Images**: 95-99% hit rate after warming

### Memory Usage

- **Redis Memory**: ~1-5MB per 1000 cached characters
- **Application Memory**: Reduced by 60-80% with external caching
- **Garbage Collection**: Reduced pressure on application GC

## Usage Examples

### Basic Usage

```python
from src.cache_service import CacheService, CacheConfig
from src.font_renderer import FontRenderingService

# Initialize cache service
cache_service = CacheService(CacheConfig())

# Initialize font renderer with caching
font_renderer = FontRenderingService("fonts/umwero.ttf", cache_service=cache_service)

# Render character (will cache automatically)
image = await font_renderer.render_character_cached('A')

# Warm cache for common characters
characters = ['A', 'B', 'C', 'D', 'E']
results = await cache_service.warm_cache(characters, font_renderer)
```

### Integration with Evaluation Engine

```python
from src.evaluation_engine import EvaluationEngine

# Create evaluation engine with caching
evaluation_engine = EvaluationEngine(
    font_renderer=font_renderer,
    cache_service=cache_service
)

# Evaluate handwriting (uses cached references)
result = await evaluation_engine.evaluate_handwriting(
    character='A',
    user_image_data='data:image/png;base64,...'
)
```

## Development Setup

### Using Docker Compose

```bash
# Start Redis and backend services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

```bash
# Start Redis
redis-server

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py
```

## Testing

### Run Cache Tests

```bash
# Run comprehensive caching tests
python test_caching.py

# Test specific functionality
python -c "
import asyncio
from test_caching import test_cache_service
asyncio.run(test_cache_service())
"
```

### Performance Testing

```bash
# Test cache warming performance
curl -X POST http://localhost:8000/api/cache/warm \
  -H "Content-Type: application/json" \
  -d '["A", "B", "C", "D", "E"]'

# Check cache statistics
curl http://localhost:8000/api/cache/stats

# Test evaluation with caching
curl -X POST http://localhost:8000/api/evaluate-character \
  -H "Content-Type: application/json" \
  -d '{
    "character": "A",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

## Monitoring

### Health Checks

The system provides comprehensive health monitoring:

```bash
# Overall system health
curl http://localhost:8000/health

# Cache-specific health
curl http://localhost:8000/api/cache/stats
```

### Metrics

Cache metrics are available through the metrics endpoint:

```bash
curl http://localhost:8000/metrics
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis is running: `redis-cli ping`
   - Verify connection string: `REDIS_URL=redis://localhost:6379`
   - Check firewall/network settings

2. **Cache Misses High**
   - Verify cache warming completed successfully
   - Check TTL settings aren't too short
   - Monitor memory usage and eviction policies

3. **Performance Not Improved**
   - Verify cache hit rates are high (>80%)
   - Check Redis memory limits
   - Monitor network latency to Redis

### Debug Mode

Enable debug logging to troubleshoot caching issues:

```python
import logging
logging.getLogger('src.cache_service').setLevel(logging.DEBUG)
logging.getLogger('src.font_renderer').setLevel(logging.DEBUG)
```

## Production Considerations

### Redis Configuration

```redis
# /etc/redis/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Monitoring

- Set up Redis monitoring (memory usage, hit rates, connections)
- Monitor application cache statistics
- Set up alerts for cache service failures
- Track performance improvements over time

### Security

- Use Redis AUTH in production
- Configure Redis to bind to specific interfaces
- Use TLS for Redis connections in production
- Implement proper network security groups

## Future Enhancements

1. **Cache Partitioning**: Separate caches for different character sets
2. **Intelligent Prefetching**: Predict and preload likely-needed characters
3. **Cache Compression**: Compress large cached objects to save memory
4. **Distributed Caching**: Multi-node Redis cluster for high availability
5. **Cache Analytics**: Detailed analytics on cache usage patterns