# Developer Guide: AI Ad Generation System

## 🎯 Overview

The AI Ad Generation system provides **dual functionality**:
1. **Frontend Integration** - React components call Node.js API which proxies to Python service
2. **Independent Testing** - Direct Python testing without any frontend dependencies

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │───▶│   Node.js API   │───▶│  Python Service │
│  (Port 5000)    │    │   (Port 5000)   │    │   (Port 8001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐             │
                       │ Independent     │◀────────────┘
                       │ Testing Tools   │
                       └─────────────────┘
```

## 🚀 Quick Setup

### Option 1: Full System Setup
```bash
# Automated setup for both frontend and backend
./setup_ai_ads.sh
./start_all_services.sh
```

### Option 2: Python Service Only
```bash
cd python_services
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="your-key-here"
./start_standalone.sh
```

## 📋 Frontend Integration

### API Endpoints Available in Node.js

The Node.js backend (`server/routes.ts`) provides these endpoints that proxy to Python:

```typescript
// Generate ad image
POST /api/generate-ad-image
{
  "prompt": "Modern minimalist fashion ad",
  "platform": "instagram",
  "text_overlay": "New Collection", 
  "brand_colors": ["#000000", "#FFFFFF"],
  "style": "minimalist"
}

// Evaluate ad quality
POST /api/evaluate-ad
{
  "image_path": "/path/to/image.png",
  "text_content": "New Collection",
  "platform": "instagram",
  "target_audience": "Fashion-conscious millennials"
}
```

### React Component Usage

```tsx
import AIImageGenerator from "@/components/ai-image-generator";

// In your page/component
<AIImageGenerator />
```

The component is already integrated in:
- **Dashboard**: `client/src/pages/dashboard.tsx` (tabs interface)
- **Standalone**: Available as separate component

### Frontend Development

```bash
# Start Node.js development server
npm run dev

# The Python service should be running on port 8001
# Node.js will proxy requests to it
```

## 🧪 Independent Testing (No Frontend Required)

### 1. Direct Python Testing
```bash
cd python_services
source venv/bin/activate
python test_standalone.py
```

**What it tests:**
- Direct AI model integration
- Image generation pipeline
- Evaluation system
- Platform optimization

### 2. API Testing
```bash
# Terminal 1: Start Python service
./start_standalone.sh

# Terminal 2: Test the API
python test_api.py
```

**What it tests:**
- FastAPI endpoints
- HTTP request/response
- JSON serialization
- Error handling

### 3. cURL Testing
```bash
./test_curl.sh
```

**What it tests:**
- Raw HTTP API calls
- Command-line integration
- Quick endpoint verification

### 4. Interactive API Documentation
```bash
# Start the Python service, then visit:
http://localhost:8001/docs
```

**What it provides:**
- Swagger UI interface
- Interactive endpoint testing
- Request/response examples
- Schema documentation

## 🔧 Development Workflows

### For Frontend Developers

```bash
# 1. Start Python service (once)
cd python_services && ./start_standalone.sh

# 2. Develop frontend (separate terminal)
npm run dev

# 3. Test integration
# Visit http://localhost:5000 and use the AI Image Generator tab
```

### For Python/AI Developers

```bash
# 1. Independent development
cd python_services
source venv/bin/activate

# 2. Test changes directly
python test_standalone.py

# 3. Test API endpoints
python test_api.py

# 4. No need to touch frontend code!
```

### For Full-Stack Development

```bash
# Test entire pipeline
./start_all_services.sh

# Frontend: http://localhost:5000
# Python API: http://localhost:8001/docs
```

## 📁 File Structure

```
adsensei/
├── python_services/           # Independent Python service
│   ├── main.py               # FastAPI app
│   ├── start.py              # Startup script
│   ├── services/
│   │   ├── ad_generator.py   # Image generation
│   │   ├── evaluator.py      # Quality evaluation
│   │   └── platform_optimizer.py
│   ├── models/schemas.py     # Data models
│   ├── test_standalone.py    # Direct testing
│   ├── test_api.py          # API testing
│   ├── test_curl.sh         # cURL testing
│   └── start_standalone.sh  # Independent startup
│
├── server/routes.ts          # Node.js API proxy
├── client/src/components/
│   └── ai-image-generator.tsx # React component
└── setup_ai_ads.sh          # Full setup script
```

## 🔑 Environment Variables

### Required
```bash
OPENAI_API_KEY=sk-your-openai-key-here
```

### Optional
```bash
DEEPSEEK_API_KEY=your-deepseek-key-here  # For enhanced text generation
PYTHON_SERVICE_URL=http://localhost:8001  # Custom service URL
DEBUG=true                                # Enable debug logging
```

## 🧪 Testing Scenarios

### Scenario 1: Frontend Developer
```bash
# I want to build UI components
cd python_services && ./start_standalone.sh &
npm run dev
# Develop React components, API calls work automatically
```

### Scenario 2: AI/Python Developer
```bash
# I want to improve image generation
cd python_services
source venv/bin/activate
python test_standalone.py
# Modify services/ad_generator.py, test directly
```

### Scenario 3: API Developer
```bash
# I want to test API integration
cd python_services && ./start_standalone.sh &
python test_api.py
# Test HTTP endpoints, JSON responses
```

### Scenario 4: DevOps/Deployment
```bash
cd python_services
docker-compose up
# Test containerized deployment
```

## 🐛 Troubleshooting

### Python Service Won't Start
```bash
# Check dependencies
cd python_services
source venv/bin/activate
python -c "import torch, diffusers; print('OK')"

# Reinstall if needed
pip install -r requirements.txt
```

### Frontend Can't Connect to Python Service
```bash
# Check if Python service is running
curl http://localhost:8001/health

# Check Node.js environment
echo $PYTHON_SERVICE_URL  # Should be http://localhost:8001
```

### Image Generation Takes Too Long
```bash
# First generation downloads models (~5GB)
# Subsequent generations should be faster
# Check available disk space and GPU/CPU resources
```

### Evaluation Fails
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY
# Test with simple evaluation
python -c "import openai; print('API key configured')"
```

## 📊 Performance Considerations

### Hardware Requirements
- **CPU**: Multi-core recommended (image processing)
- **RAM**: 8GB minimum, 16GB recommended
- **GPU**: Optional but significantly faster for Stable Diffusion
- **Storage**: 5GB+ for AI models cache

### Generation Times
- **First Run**: 30-60s (model download)
- **Subsequent**: 10-30s depending on hardware
- **GPU vs CPU**: 5-10x performance difference

### Scaling
- **Horizontal**: Multiple Python service instances
- **Vertical**: Better GPU, more RAM
- **Caching**: Generated images, model weights

## 🚀 Deployment Options

### Development
```bash
./start_all_services.sh
```

### Production - Docker
```bash
cd python_services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Production - Kubernetes
```yaml
# Helm charts and K8s manifests available in deployment/
```

## 📚 API Documentation

### Python Service (Port 8001)
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **OpenAPI Schema**: http://localhost:8001/openapi.json

### Node.js Integration (Port 5000)
- **Endpoints**: `/api/generate-ad-image`, `/api/evaluate-ad`
- **Frontend**: React components handle API calls automatically

---

## ✅ Both Use Cases Covered!

✅ **Frontend Integration**: React → Node.js → Python (seamless UX)  
✅ **Independent Testing**: Direct Python testing (rapid development)  
✅ **API Documentation**: Interactive Swagger UI  
✅ **Multiple Test Methods**: Python, HTTP, cURL, Interactive  
✅ **Containerized**: Docker support for deployment  
✅ **Development Friendly**: Hot reload, error handling, debugging