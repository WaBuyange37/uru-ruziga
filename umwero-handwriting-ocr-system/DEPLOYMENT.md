# Umwero Handwriting OCR System - Deployment Guide

This guide covers deployment options for the Umwero Handwriting OCR System, from development to production environments.

## 📋 Prerequisites

### System Requirements
- **CPU**: 2+ cores (4+ recommended for production)
- **RAM**: 4GB minimum (8GB+ recommended for production)
- **Storage**: 10GB minimum (50GB+ recommended for production with dataset storage)
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2

### Software Dependencies
- Docker 20.10+
- Docker Compose 2.0+
- Git
- (Optional) Node.js 18+ for frontend development

## 🚀 Quick Start (Development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd umwero-handwriting-ocr-system

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Start Development Environment
```bash
# Start core services (backend + database + redis)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check service health
curl http://localhost:8000/health
```

### 3. Initialize Database
```bash
# Run database initialization
docker-compose exec backend python init_database.py

# Verify database setup
docker-compose exec backend python test_database_integration.py
```

## 🏭 Production Deployment

### Option 1: Docker Compose (Recommended)

#### 1. Production Environment Setup
```bash
# Create production directory
mkdir -p /opt/umwero-ocr
cd /opt/umwero-ocr

# Clone repository
git clone <repository-url> .

# Setup production environment
cp .env.example .env.production
```

#### 2. Configure Production Environment
Edit `.env.production`:
```bash
# Database
DATABASE_URL=postgresql://umwero_user:STRONG_PASSWORD@postgres:5432/umwero_ocr
POSTGRES_PASSWORD=STRONG_PASSWORD

# Redis
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# Security
CORS_ORIGINS=https://yourdomain.com
SECRET_KEY=GENERATE_STRONG_SECRET_KEY

# Performance
ENVIRONMENT=production
WORKERS=4
LOG_LEVEL=WARNING

# Domain
DOMAIN=yourdomain.com
```

#### 3. Deploy Production Stack
```bash
# Start production services
docker-compose --env-file .env.production --profile production up -d

# Initialize database
docker-compose --env-file .env.production exec backend python init_database.py

# Verify deployment
curl https://yourdomain.com/health
```

### Option 2: Kubernetes Deployment

#### 1. Create Kubernetes Manifests
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: umwero-ocr
---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: umwero-config
  namespace: umwero-ocr
data:
  ENVIRONMENT: "production"
  LOG_LEVEL: "INFO"
  WORKERS: "4"
---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: umwero-secrets
  namespace: umwero-ocr
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@postgres:5432/umwero_ocr"
  REDIS_URL: "redis://:password@redis:6379/0"
  SECRET_KEY: "your-secret-key"
```

#### 2. Deploy to Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n umwero-ocr

# View logs
kubectl logs -f deployment/umwero-backend -n umwero-ocr
```

### Option 3: Cloud Platform Deployment

#### AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t umwero-ocr ./backend
docker tag umwero-ocr:latest <account>.dkr.ecr.us-east-1.amazonaws.com/umwero-ocr:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/umwero-ocr:latest

# Deploy using ECS CLI or CloudFormation
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/umwero-ocr ./backend
gcloud run deploy umwero-ocr --image gcr.io/PROJECT-ID/umwero-ocr --platform managed --region us-central1
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `REDIS_URL` | Redis connection string | - | Yes |
| `UMWERO_FONT_PATH` | Path to Umwero font file | `/app/fonts/umwero.ttf` | No |
| `WORKERS` | Number of worker processes | 1 | No |
| `LOG_LEVEL` | Logging level | INFO | No |
| `CORS_ORIGINS` | Allowed CORS origins | * | No |
| `MAX_REQUEST_SIZE` | Maximum request size in bytes | 10485760 | No |

### Database Configuration

#### PostgreSQL Setup
```sql
-- Create database and user
CREATE DATABASE umwero_ocr;
CREATE USER umwero_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE umwero_ocr TO umwero_user;

-- Enable required extensions
\c umwero_ocr
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Database Initialization
```bash
# Run initialization script
python init_database.py

# Verify setup
python -c "
import asyncio
from src.database_service import db_service

async def test():
    connected = await db_service.connect()
    if connected:
        stats = await db_service.get_dataset_statistics()
        print(f'Database ready: {stats}')
    await db_service.disconnect()

asyncio.run(test())
"
```

### Redis Configuration

#### Redis Setup
```bash
# Redis configuration for production
redis-server --requirepass your_password \
             --maxmemory 512mb \
             --maxmemory-policy allkeys-lru \
             --appendonly yes \
             --save 900 1 \
             --save 300 10 \
             --save 60 10000
```

## 🔒 Security

### SSL/TLS Configuration

#### Nginx SSL Setup
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Best Practices

1. **Use strong passwords** for database and Redis
2. **Enable SSL/TLS** for all external connections
3. **Configure CORS** properly for your domain
4. **Use secrets management** for sensitive configuration
5. **Regular security updates** for base images
6. **Network isolation** using Docker networks or VPCs
7. **Rate limiting** to prevent abuse
8. **Input validation** and sanitization

## 📊 Monitoring

### Health Checks

#### Application Health
```bash
# Check application health
curl http://localhost:8000/health

# Check detailed metrics
curl http://localhost:8000/metrics

# Check cache statistics
curl http://localhost:8000/api/cache/stats
```

#### Database Health
```bash
# Check database connectivity
docker-compose exec postgres pg_isready -U umwero_user -d umwero_ocr

# Check database statistics
curl http://localhost:8000/api/dataset/stats
```

### Logging

#### Application Logs
```bash
# View application logs
docker-compose logs -f backend

# View specific log levels
docker-compose logs backend | grep ERROR

# Export logs for analysis
docker-compose logs --no-color backend > app.log
```

#### Log Configuration
```python
# Structured logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "json": {
            "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "/app/logs/app.log",
            "formatter": "json",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U umwero_user umwero_ocr > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups/umwero-ocr"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T postgres pg_dump -U umwero_user umwero_ocr | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Dataset backup
docker-compose exec -T backend tar -czf - /app/data | cat > $BACKUP_DIR/dataset_$DATE.tar.gz

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

### Restore from Backup
```bash
# Restore database
gunzip -c backup_20240101_120000.sql.gz | docker-compose exec -T postgres psql -U umwero_user umwero_ocr

# Restore dataset
docker-compose exec -T backend tar -xzf - -C / < dataset_20240101_120000.tar.gz
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
docker-compose exec backend python -c "
import asyncio
from src.database_service import db_service
asyncio.run(db_service.connect())
"

# Check database logs
docker-compose logs postgres
```

#### Redis Connection Issues
```bash
# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Check application metrics
curl http://localhost:8000/metrics

# Profile application
docker-compose exec backend python -m cProfile -o profile.stats main.py
```

### Performance Tuning

#### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM drawing_attempts WHERE character = 'A';

-- Update statistics
ANALYZE;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'drawing_attempts';
```

#### Application Optimization
```python
# Enable connection pooling
DATABASE_URL = "postgresql://user:pass@host:5432/db?pool_size=20&max_overflow=0"

# Configure worker processes
WORKERS = min(4, (os.cpu_count() or 1) + 1)

# Enable caching
CACHE_CONFIG = {
    "default_ttl": 3600,
    "reference_ttl": 86400,
    "feature_ttl": 43200
}
```

## 📈 Scaling

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

#### Auto-scaling with Kubernetes
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: umwero-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: umwero-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Vertical Scaling

#### Resource Limits
```yaml
# Docker Compose
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

## 📞 Support

For deployment issues or questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review application logs
3. Check system resources
4. Verify configuration
5. Contact support with detailed error information

## 🔄 Updates

### Rolling Updates
```bash
# Pull latest changes
git pull origin main

# Build new image
docker-compose build backend

# Rolling update (zero downtime)
docker-compose up -d --no-deps backend

# Verify deployment
curl http://localhost:8000/health
```

### Database Migrations
```bash
# Run migrations
docker-compose exec backend python -m prisma db push

# Verify migration
docker-compose exec backend python -c "
import asyncio
from src.database_service import db_service
asyncio.run(db_service.get_dataset_statistics())
"
```