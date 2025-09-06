from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from services.ad_generator import AdImageGenerator
# from services.evaluator import AdEvaluator  # Temporarily disabled
from models.schemas import AdGenerationRequest, AdEvaluationRequest, ProductImageRequest
from services.logger import log_request_context, db_logger
from services.scheduler import log_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    log_scheduler.start_scheduler()
    db_logger.logger.info("AI Ad Generation Service starting up...")
    
    yield
    
    # Shutdown
    log_scheduler.stop_scheduler()
    db_logger.logger.info("AI Ad Generation Service shutting down...")

app = FastAPI(
    title="AI Ad Generation Service", 
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for connecting with the main Node.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ad_generator = AdImageGenerator()
# ad_evaluator = AdEvaluator()  # Temporarily disabled

@app.post("/generate-product-image")
async def generate_product_image(request: ProductImageRequest, http_request: Request):
    """Generate product ad image from product details"""
    # Extract request metadata
    user_agent = http_request.headers.get("user-agent", "")
    ip_address = http_request.client.host if http_request.client else "unknown"
    
    with log_request_context(
        endpoint="/generate-product-image",
        method="POST",
        user_agent=user_agent,
        ip_address=ip_address,
        product_name=request.product_name,
        product_category=request.product_category,
        platform=request.platform.value,
        style=request.style.value
    ) as request_id:
        result = await ad_generator.generate_product_image(request, request_id)
        return {"success": True, "data": result}

@app.post("/generate-ad-image")
async def generate_ad_image(request: AdGenerationRequest, http_request: Request):
    """Generate an ad image based on text prompt and platform specifications"""
    # Extract request metadata
    user_agent = http_request.headers.get("user-agent", "")
    ip_address = http_request.client.host if http_request.client else "unknown"
    
    with log_request_context(
        endpoint="/generate-ad-image",
        method="POST",
        user_agent=user_agent,
        ip_address=ip_address,
        platform=request.platform.value,
        style=request.style.value
    ) as request_id:
        result = await ad_generator.generate_ad_image(
            prompt=request.prompt,
            platform=request.platform,
            brand_colors=request.brand_colors,
            text_overlay=request.text_overlay,
            style=request.style,
            request_id=request_id
        )
        return {"success": True, "data": result}

# @app.post("/evaluate-ad")
# async def evaluate_ad(request: AdEvaluationRequest):
#     """Evaluate the quality and effectiveness of a generated ad"""
#     try:
#         result = await ad_evaluator.evaluate_ad(
#             image_path=request.image_path,
#             text_content=request.text_content,
#             platform=request.platform,
#             target_audience=request.target_audience
#         )
#         return {"success": True, "data": result}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "service": "AI Ad Generation Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "generate_product_image": "/generate-product-image",
            "generate_ad": "/generate-ad-image",
            "evaluate_ad": "/evaluate-ad", 
            "health": "/health",
            "log_stats": "/logs/stats",
            "log_cleanup": "/logs/cleanup",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Ad Generation"}

@app.get("/logs/stats")
async def get_log_stats():
    """Get logging statistics"""
    try:
        stats = db_logger.get_log_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logs/cleanup")
async def manual_log_cleanup():
    """Manually trigger log cleanup"""
    try:
        deleted_count = log_scheduler.cleanup_now()
        return {
            "success": True, 
            "message": f"Cleanup completed: {deleted_count} old log entries removed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)