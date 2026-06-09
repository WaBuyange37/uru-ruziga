# Handwriting Evaluation System

A production-ready system for evaluating user-drawn Umwero characters against font-generated references using advanced image processing and machine learning techniques.

## Features

- **Dynamic Reference Generation**: Renders characters from Umwero font files (.ttf/.otf)
- **Hybrid Comparison Algorithm**: Combines SSIM and contour matching for accurate scoring
- **FastAPI REST API**: Clean, documented API endpoints
- **Image Processing Pipeline**: Consistent preprocessing for fair comparisons
- **Performance Optimized**: Sub-500ms response times

## Quick Start

### Prerequisites

- Python 3.8+
- Umwero font file (.ttf or .otf)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Place your Umwero font file in the project directory

### Running the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Usage

### Evaluate Character

**POST** `/api/evaluate-character`

Request:
```json
{
  "character": "A",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

Response:
```json
{
  "score": 85.7
}
```

### Health Check

**GET** `/health`

Response:
```json
{
  "status": "healthy"
}
```

## Architecture

The system uses a layered architecture with four core components:

- **Reference Generator**: Dynamically renders font characters using PIL
- **Image Processor**: Normalizes and preprocesses images
- **Comparison Algorithm**: Computes similarity using SSIM (60%) + contour matching (40%)
- **Evaluation Engine**: Orchestrates the complete evaluation process

## Testing

Run tests with:
```bash
pytest
```

## Performance

- Target response time: < 500ms
- Scoring range: 0-100
- Expected accuracy: 90-100 (perfect), 60-85 (variations), <50 (wrong shapes)

## Development

This is Phase 1 implementation focusing on core evaluation functionality. Future phases will add:
- Data storage for OCR training
- Intelligent feedback system
- Advanced caching and optimization
- Comprehensive monitoring and logging