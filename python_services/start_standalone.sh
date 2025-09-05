#!/bin/bash

# Standalone Python Service Startup
# Run the AI ad generation service independently

echo "🐍 Starting AI Ad Generation Service (Standalone Mode)"
echo "=" * 60

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run the setup script first:"
    echo "  cd .. && ./setup_ai_ads.sh"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if required packages are installed
echo "🔍 Checking dependencies..."
python -c "
try:
    import torch, diffusers, openai, fastapi
    print('✅ All dependencies available')
except ImportError as e:
    print(f'❌ Missing dependency: {e}')
    print('Run: pip install -r requirements.txt')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Check for environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. Evaluation features may not work."
    echo "Set it in .env file or environment:"
    echo "export OPENAI_API_KEY='your-key-here'"
fi

# Create directories
mkdir -p generated_ads temp models_cache

# Start the service
echo "🚀 Starting service on http://localhost:8001"
echo "📚 API documentation: http://localhost:8001/docs"
echo "🖼️  Generated images will be saved in: generated_ads/"
echo ""
echo "Test the service:"
echo "  python test_standalone.py  # Direct Python testing"
echo "  python test_api.py         # API endpoint testing" 
echo "  ./test_curl.sh             # cURL testing"
echo ""
echo "Press Ctrl+C to stop the service"
echo "=" * 60

python start.py