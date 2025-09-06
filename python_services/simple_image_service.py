import os
import openai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="Simple Image Generation Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ImageRequest(BaseModel):
    prompt: str
    platform: str = "instagram"
    style: Optional[str] = "minimalist"

@app.post("/generate-ad-image")
async def generate_ad_image(request: ImageRequest):
    """Generate an ad image using DALL-E"""
    try:
        # Platform dimensions
        platform_sizes = {
            "instagram": "1024x1024",
            "tiktok": "1024x1792", 
            "facebook": "1792x1024",
            "pinterest": "1024x1792"
        }
        
        # Style prompts
        style_prompts = {
            "minimalist": "clean, minimal, simple composition, modern",
            "luxury": "elegant, sophisticated, premium, high-end",
            "street": "urban, edgy, vibrant colors, contemporary",
            "sustainable": "natural, eco-friendly, organic",
            "bold": "vibrant colors, high contrast, dynamic"
        }
        
        size = platform_sizes.get(request.platform, "1024x1024")
        style_text = style_prompts.get(request.style, "minimalist")
        
        enhanced_prompt = f"{request.prompt}, {style_text}, advertising photography, professional quality, high resolution"
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size=size,
            quality="hd",
            n=1,
        )
        
        image_url = response.data[0].url
        dimensions = size.split('x')
        
        result = {
            "image_url": image_url,
            "platform": request.platform,
            "dimensions": {
                "width": int(dimensions[0]),
                "height": int(dimensions[1])
            }
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Simple Image Generation"}

@app.get("/")
async def root():
    return {"message": "Simple Image Generation Service", "status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)