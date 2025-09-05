from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from services.ad_generator import AdImageGenerator
from services.evaluator import AdEvaluator
from models.schemas import AdGenerationRequest, AdEvaluationRequest

app = FastAPI(title="AI Ad Generation Service", version="1.0.0")

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
ad_evaluator = AdEvaluator()

@app.post("/generate-ad-image")
async def generate_ad_image(request: AdGenerationRequest):
    """Generate an ad image based on text prompt and platform specifications"""
    try:
        result = await ad_generator.generate_ad_image(
            prompt=request.prompt,
            platform=request.platform,
            brand_colors=request.brand_colors,
            text_overlay=request.text_overlay,
            style=request.style
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-ad")
async def evaluate_ad(request: AdEvaluationRequest):
    """Evaluate the quality and effectiveness of a generated ad"""
    try:
        result = await ad_evaluator.evaluate_ad(
            image_path=request.image_path,
            text_content=request.text_content,
            platform=request.platform,
            target_audience=request.target_audience
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "service": "AI Ad Generation Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "generate_ad": "/generate-ad-image",
            "evaluate_ad": "/evaluate-ad", 
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Ad Generation"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)