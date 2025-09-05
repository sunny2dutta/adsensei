#!/usr/bin/env python3
"""
Startup script for the AI Ad Generation Python service.
This script initializes the required models and starts the FastAPI server.
"""

import os
import sys
import time
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import torch
        import diffusers
        import transformers
        import openai
        import fastapi
        import uvicorn
        import cv2
        import PIL
        import numpy as np
        import sklearn
        print("✅ All dependencies installed successfully")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return False

def check_environment():
    """Check environment variables and configuration"""
    required_vars = ["OPENAI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these variables in your .env file or environment")
        return False
    
    print("✅ Environment variables configured")
    return True

def initialize_directories():
    """Create necessary directories"""
    directories = [
        "generated_ads",
        "temp",
        "models_cache"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Directory created/verified: {directory}")

async def warm_up_models():
    """Pre-load models to improve first request performance"""
    print("🔥 Warming up AI models...")
    
    try:
        from services.ad_generator import AdImageGenerator
        from services.evaluator import AdEvaluator
        
        # Initialize services (this will load models in background)
        generator = AdImageGenerator()
        evaluator = AdEvaluator()
        
        # Trigger model loading
        await generator.initialize_pipeline()
        print("✅ Stable Diffusion pipeline loaded")
        
        print("✅ Models warmed up successfully")
        return True
        
    except Exception as e:
        print(f"⚠️  Warning: Model warm-up failed: {e}")
        print("Models will be loaded on first request instead")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting AI Ad Generation Service...")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Initialize directories
    initialize_directories()
    
    # Import and start the FastAPI app
    print("🌐 Starting FastAPI server...")
    
    try:
        import uvicorn
        from main import app
        
        # Configuration
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", "8001"))
        reload = os.getenv("DEBUG", "false").lower() == "true"
        
        print(f"📍 Server will be available at: http://{host}:{port}")
        print(f"📚 API docs: http://{host}:{port}/docs")
        print("=" * 50)
        
        # Start server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()