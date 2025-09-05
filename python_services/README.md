# AI Ad Generation Service

A Python-based microservice that generates and evaluates advertising images using AI models including Stable Diffusion and GPT-4 Vision.

## Features

- **Text-to-Image Generation**: Create ads from text prompts using Stable Diffusion
- **Platform Optimization**: Automatically format ads for Instagram, TikTok, Facebook, Pinterest
- **Text Overlay**: Add branded text overlays with custom colors and positioning
- **Quality Evaluation**: AI-powered evaluation using technical analysis and GPT-4 Vision
- **Multi-format Export**: Generate platform-specific variants automatically

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Node.js API   │───▶│  Python Service │───▶│   AI Models     │
│   (Express)     │    │   (FastAPI)     │    │  (Stable Diff)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        │              │  Evaluation     │              │
        └─────────────▶│   System        │◀─────────────┘
                       │ (GPT-4 Vision)  │
                       └─────────────────┘
```

## Installation

### Prerequisites

- Python 3.11+
- CUDA-compatible GPU (recommended for Stable Diffusion)
- OpenAI API key

### Setup

1. **Install Dependencies**
   ```bash
   cd python_services
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your keys
   OPENAI_API_KEY=your_openai_api_key_here
   PYTHON_SERVICE_URL=http://localhost:8001
   ```

3. **Start the Service**
   ```bash
   # Development mode
   python start.py
   
   # Or using uvicorn directly
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

## Docker Deployment

### Quick Start
```bash
# Build and run
docker-compose up --build

# Background mode
docker-compose up -d
```

### Production Deployment
```bash
# With resource limits
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## API Endpoints

### Generate Ad Image
```http
POST /generate-ad-image
Content-Type: application/json

{
  "prompt": "Modern minimalist fashion ad with elegant woman",
  "platform": "instagram",
  "text_overlay": "New Collection Available",
  "brand_colors": ["#000000", "#FFFFFF"],
  "style": "minimalist"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "image_path": "/app/generated_ads/uuid_instagram.png",
    "image_url": "/static/generated_ads/uuid_instagram.png",
    "platform": "instagram",
    "dimensions": {"width": 1080, "height": 1080},
    "generation_time": 12.5,
    "metadata": {
      "image_id": "uuid-here",
      "style": "minimalist",
      "brand_colors": ["#000000", "#FFFFFF"],
      "text_overlay": "New Collection Available"
    }
  }
}
```

### Evaluate Ad
```http
POST /evaluate-ad
Content-Type: application/json

{
  "image_path": "/app/generated_ads/uuid_instagram.png",
  "text_content": "New Collection Available",
  "platform": "instagram",
  "target_audience": "Fashion-conscious millennials",
  "brand_name": "YourBrand"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": 0.85,
    "visual_appeal": 0.90,
    "text_readability": 0.80,
    "brand_alignment": 0.85,
    "platform_optimization": 0.95,
    "engagement_prediction": 0.78,
    "suggestions": [
      "Increase text contrast for better readability",
      "Consider adding brand colors to background"
    ],
    "detailed_analysis": {
      "color_analysis": {...},
      "composition_analysis": {...},
      "ai_evaluation": {...}
    }
  }
}
```

## Platform Specifications

| Platform | Dimensions | Aspect Ratio | Max File Size |
|----------|-----------|--------------|---------------|
| Instagram | 1080×1080 | 1:1 | 30MB |
| Instagram Story | 1080×1920 | 9:16 | 30MB |
| TikTok | 1080×1920 | 9:16 | 10MB |
| Facebook | 1200×630 | 1.91:1 | 8MB |
| Pinterest | 1000×1500 | 2:3 | 20MB |

## Style Options

- **Minimalist**: Clean, simple composition with white space
- **Luxury**: Elegant, sophisticated with premium materials
- **Street**: Urban, edgy with vibrant colors
- **Sustainable**: Natural, eco-friendly with green elements
- **Bold**: High contrast, dynamic composition

## Evaluation Metrics

The evaluation system analyzes ads across multiple dimensions:

1. **Visual Appeal** (0-1): Color harmony, composition balance
2. **Text Readability** (0-1): Contrast, font size appropriateness
3. **Brand Alignment** (0-1): Style consistency with brand
4. **Platform Optimization** (0-1): Dimension and format compliance
5. **Engagement Prediction** (0-1): Predicted social media performance

## Integration with Main App

The Python service integrates with the Node.js backend through HTTP APIs:

```typescript
// In your Node.js routes
app.post("/api/generate-ad-image", async (req, res) => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
  const response = await axios.post(`${pythonServiceUrl}/generate-ad-image`, req.body);
  res.json(response.data);
});
```

## Performance Considerations

- **GPU Acceleration**: Stable Diffusion benefits significantly from CUDA GPUs
- **Model Caching**: Models are cached after first load (~5GB storage needed)
- **Generation Time**: 10-30 seconds per image depending on hardware
- **Memory Usage**: 4-8GB RAM recommended for optimal performance

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**
   - Reduce batch size or use CPU mode
   - Set `device = "cpu"` in ad_generator.py

2. **Model Download Issues**
   - Ensure stable internet connection
   - Models are downloaded to `models_cache/` directory

3. **API Timeout**
   - Increase timeout in Node.js client
   - Consider running generation in background

### Logs
```bash
# View service logs
docker-compose logs -f ai-ad-service

# Debug mode
DEBUG=true python start.py
```

## Development

### Project Structure
```
python_services/
├── main.py              # FastAPI application
├── start.py            # Startup script
├── requirements.txt    # Python dependencies
├── models/
│   └── schemas.py     # Pydantic models
├── services/
│   ├── ad_generator.py        # Image generation
│   ├── evaluator.py          # Quality evaluation
│   └── platform_optimizer.py # Platform optimization
├── generated_ads/     # Output directory
├── models_cache/      # AI model cache
└── temp/             # Temporary files
```

### Adding New Platforms

1. Add platform to `Platform` enum in `schemas.py`
2. Add platform specifications to `PlatformOptimizer`
3. Update prompt enhancement in `AdImageGenerator`
4. Test with various image dimensions

### Custom Styles

1. Add style to `AdStyle` enum
2. Update style prompts in `enhance_prompt_for_ads()`
3. Add platform-specific enhancements if needed

## License

This project is part of the AdSensei platform and follows the same licensing terms.