#!/bin/bash

# AI Ad Generation Setup Script
# This script sets up the Python-based AI ad generation service

echo "🚀 Setting up AI Ad Generation System..."
echo "=" * 50

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Python is installed
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "Python $PYTHON_VERSION found"
        
        # Check if version is 3.11 or higher
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
            print_status "Python version is compatible"
        else
            print_error "Python 3.11+ required. Current version: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 not found. Please install Python 3.11 or higher"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js $NODE_VERSION found"
    else
        print_error "Node.js not found. Please install Node.js"
        exit 1
    fi
}

# Install Node.js dependencies
install_node_deps() {
    print_info "Installing Node.js dependencies..."
    if npm install; then
        print_status "Node.js dependencies installed"
    else
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi
}

# Set up Python environment
setup_python_env() {
    print_info "Setting up Python environment..."
    
    cd python_services
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
        print_status "Virtual environment created"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install requirements
    print_info "Installing Python dependencies... (this may take several minutes)"
    if pip install -r requirements.txt; then
        print_status "Python dependencies installed"
    else
        print_error "Failed to install Python dependencies"
        exit 1
    fi
    
    cd ..
}

# Create environment file
setup_env_file() {
    print_info "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOL
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Python Service Configuration
PYTHON_SERVICE_URL=http://localhost:8001

# Database Configuration (existing)
DATABASE_URL=your_database_url_here

# Instagram API (existing)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Other existing environment variables...
EOL
        print_warning "Created .env file. Please update with your API keys!"
    else
        # Add Python service URL to existing .env if not present
        if ! grep -q "PYTHON_SERVICE_URL" .env; then
            echo "" >> .env
            echo "# Python Service Configuration" >> .env
            echo "PYTHON_SERVICE_URL=http://localhost:8001" >> .env
            print_status "Added Python service configuration to .env"
        fi
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_info "Creating startup scripts..."
    
    # Create start_python_service.sh
    cat > start_python_service.sh << 'EOL'
#!/bin/bash
echo "🐍 Starting Python AI Service..."
cd python_services
source venv/bin/activate
python start.py
EOL
    
    # Create start_all_services.sh
    cat > start_all_services.sh << 'EOL'
#!/bin/bash
echo "🚀 Starting all services..."

# Start Python service in background
echo "Starting Python AI service..."
cd python_services
source venv/bin/activate
python start.py &
PYTHON_PID=$!
cd ..

# Wait a moment for Python service to start
sleep 5

# Start Node.js service
echo "Starting Node.js service..."
npm run dev &
NODE_PID=$!

echo "🎉 All services started!"
echo "Python AI Service: http://localhost:8001"
echo "Main Application: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
wait $NODE_PID $PYTHON_PID
EOL
    
    chmod +x start_python_service.sh start_all_services.sh
    print_status "Startup scripts created"
}

# Test the setup
test_setup() {
    print_info "Testing setup..."
    
    # Test Python imports
    cd python_services
    source venv/bin/activate
    
    if python -c "
import torch
import diffusers
import openai
import fastapi
print('✅ All Python dependencies working')
"; then
        print_status "Python setup test passed"
    else
        print_error "Python setup test failed"
        exit 1
    fi
    
    cd ..
}

# Main execution
main() {
    echo "🎯 AI Ad Generation Setup for AdSensei"
    echo ""
    
    check_python
    check_node
    
    echo ""
    print_info "Installing dependencies..."
    install_node_deps
    setup_python_env
    
    echo ""
    print_info "Configuring environment..."
    setup_env_file
    create_startup_scripts
    
    echo ""
    print_info "Testing setup..."
    test_setup
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Edit .env file with your API keys:"
    echo "   - OPENAI_API_KEY (required for image evaluation)"
    echo "   - DEEPSEEK_API_KEY (optional, for enhanced text generation)"
    echo ""
    echo "2. Start the services:"
    echo "   ./start_all_services.sh    # Start both services"
    echo "   ./start_python_service.sh  # Start only Python AI service"
    echo ""
    echo "3. Access the application:"
    echo "   - Main App: http://localhost:5000"
    echo "   - Python AI API: http://localhost:8001/docs"
    echo ""
    print_warning "Note: First image generation will take longer as models are downloaded (~5GB)"
    echo ""
}

# Run main function
main