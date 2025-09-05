#!/bin/bash

# Verification Script - Test both integration and standalone capabilities
# This script demonstrates that both use cases work properly

echo "🔍 Verifying AI Ad Generation Setup"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if setup was completed
check_setup() {
    echo "📋 Checking Setup Completion..."
    
    # Check Python environment
    if [ -d "python_services/venv" ]; then
        print_success "Python virtual environment found"
    else
        print_error "Python virtual environment missing"
        echo "Run: ./setup_ai_ads.sh"
        return 1
    fi
    
    # Check Node.js dependencies
    if [ -f "node_modules/.package-lock.json" ] || [ -d "node_modules" ]; then
        print_success "Node.js dependencies installed"
    else
        print_error "Node.js dependencies missing"
        echo "Run: npm install"
        return 1
    fi
    
    # Check environment file
    if [ -f ".env" ]; then
        print_success "Environment file exists"
        if grep -q "OPENAI_API_KEY=your_" .env; then
            print_warning "Please update OPENAI_API_KEY in .env file"
        fi
    else
        print_warning "No .env file found"
    fi
    
    return 0
}

# Test Python standalone capabilities
test_python_standalone() {
    echo ""
    echo "🐍 Testing Python Standalone Capabilities..."
    
    cd python_services
    source venv/bin/activate
    
    # Test imports
    print_info "Testing Python imports..."
    if python -c "
import sys
try:
    import torch
    import PIL
    import fastapi
    import cv2
    import numpy as np
    print('✅ Core dependencies available')
    
    # Test optional dependencies
    try:
        import diffusers
        print('✅ Stable Diffusion available')
    except ImportError:
        print('⚠️  Stable Diffusion not available (optional)')
        
    try:
        import openai
        print('✅ OpenAI library available')
    except ImportError:
        print('⚠️  OpenAI library not available')
        
except ImportError as e:
    print(f'❌ Missing dependency: {e}')
    sys.exit(1)
" 2>/dev/null; then
        print_success "Python dependencies verified"
    else
        print_error "Python dependency issues found"
        cd ..
        return 1
    fi
    
    # Test service classes
    print_info "Testing service initialization..."
    if python -c "
from services.ad_generator import AdImageGenerator
from services.evaluator import AdEvaluator
from services.platform_optimizer import PlatformOptimizer

generator = AdImageGenerator()
evaluator = AdEvaluator()
optimizer = PlatformOptimizer()
print('✅ All services initialize successfully')
" 2>/dev/null; then
        print_success "Service classes work properly"
    else
        print_error "Service initialization failed"
        cd ..
        return 1
    fi
    
    cd ..
    return 0
}

# Test API integration
test_api_integration() {
    echo ""
    echo "🌐 Testing API Integration Setup..."
    
    # Check if axios is installed (for Node.js integration)
    if node -e "require('axios')" 2>/dev/null; then
        print_success "Axios dependency available for Node.js integration"
    else
        print_error "Axios missing - required for API integration"
        echo "Run: npm install axios"
        return 1
    fi
    
    # Check Node.js routes integration
    if grep -q "generate-ad-image" server/routes.ts; then
        print_success "Node.js API routes configured"
    else
        print_error "API routes not configured"
        return 1
    fi
    
    # Check React component
    if [ -f "client/src/components/ai-image-generator.tsx" ]; then
        print_success "React component available"
    else
        print_error "React component missing"
        return 1
    fi
    
    # Check dashboard integration
    if grep -q "AIImageGenerator" client/src/pages/dashboard.tsx; then
        print_success "Component integrated in dashboard"
    else
        print_error "Component not integrated in dashboard"
        return 1
    fi
    
    return 0
}

# Test independent testing tools
test_independent_tools() {
    echo ""
    echo "🧪 Testing Independent Development Tools..."
    
    # Check test scripts
    local tools=("test_standalone.py" "test_api.py" "test_curl.sh" "start_standalone.sh")
    
    for tool in "${tools[@]}"; do
        if [ -f "python_services/$tool" ]; then
            print_success "$tool available"
        else
            print_error "$tool missing"
        fi
    done
    
    # Check if scripts are executable
    if [ -x "python_services/start_standalone.sh" ]; then
        print_success "Startup scripts are executable"
    else
        print_warning "Some scripts may need chmod +x"
    fi
    
    return 0
}

# Show usage examples
show_usage_examples() {
    echo ""
    echo "📚 Usage Examples"
    echo "=================="
    
    echo ""
    echo "🎯 Frontend Integration (Full Stack):"
    echo "  ./start_all_services.sh"
    echo "  # Visit http://localhost:5000"
    echo "  # Use AI Image Generator tab in dashboard"
    
    echo ""
    echo "🐍 Python Standalone Testing:"
    echo "  cd python_services"
    echo "  source venv/bin/activate"
    echo "  python test_standalone.py"
    
    echo ""
    echo "🌐 API Testing:"
    echo "  # Terminal 1:"
    echo "  cd python_services && ./start_standalone.sh"
    echo "  # Terminal 2:"
    echo "  python python_services/test_api.py"
    
    echo ""
    echo "📖 Interactive API Docs:"
    echo "  cd python_services && ./start_standalone.sh"
    echo "  # Visit http://localhost:8001/docs"
    
    echo ""
    echo "🔧 cURL Testing:"
    echo "  cd python_services"
    echo "  ./start_standalone.sh &"
    echo "  ./test_curl.sh"
}

# Main execution
main() {
    if ! check_setup; then
        echo ""
        print_error "Setup incomplete. Please run ./setup_ai_ads.sh first"
        exit 1
    fi
    
    python_ok=0
    api_ok=0
    
    if test_python_standalone; then
        python_ok=1
    fi
    
    if test_api_integration; then
        api_ok=1
    fi
    
    test_independent_tools
    
    echo ""
    echo "📊 Verification Results"
    echo "======================"
    
    if [ $python_ok -eq 1 ]; then
        print_success "✅ Python Standalone: Ready for independent development"
    else
        print_error "❌ Python Standalone: Issues found"
    fi
    
    if [ $api_ok -eq 1 ]; then
        print_success "✅ Frontend Integration: Ready for full-stack development"
    else
        print_error "❌ Frontend Integration: Issues found"
    fi
    
    show_usage_examples
    
    echo ""
    if [ $python_ok -eq 1 ] && [ $api_ok -eq 1 ]; then
        print_success "🎉 Both use cases are properly configured!"
        echo ""
        print_info "You can now:"
        echo "  • Develop AI features independently in Python"
        echo "  • Use the full-stack integration with React frontend"
        echo "  • Test APIs without touching frontend code"
        echo "  • Deploy as microservices or monolithic app"
    else
        print_warning "⚠️  Some issues found. Check the errors above."
    fi
}

main