from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum

class Platform(str, Enum):
    INSTAGRAM = "instagram"
    INSTAGRAM_STORY = "instagram_story"
    TIKTOK = "tiktok"
    FACEBOOK = "facebook"
    PINTEREST = "pinterest"

# Consolidated platform specifications
PLATFORM_SPECS = {
    Platform.INSTAGRAM: {
        "dimensions": (1080, 1080),
        "aspect_ratio": "1:1",
        "max_file_size_mb": 30,
        "recommended_formats": ["JPG", "PNG"],
        "color_profile": "sRGB",
        "compression": 85,
        "prompt_suffix": "Instagram-ready, square format, eye-catching"
    },
    Platform.INSTAGRAM_STORY: {
        "dimensions": (1080, 1920),
        "aspect_ratio": "9:16",
        "max_file_size_mb": 30,
        "recommended_formats": ["JPG", "PNG"],
        "color_profile": "sRGB",
        "compression": 85,
        "prompt_suffix": "vertical story format, mobile-optimized"
    },
    Platform.TIKTOK: {
        "dimensions": (1080, 1920),
        "aspect_ratio": "9:16",
        "max_file_size_mb": 10,
        "recommended_formats": ["JPG"],
        "color_profile": "sRGB",
        "compression": 80,
        "saturation_boost": 1.2,
        "prompt_suffix": "vertical video-style, trendy, Gen-Z appealing"
    },
    Platform.FACEBOOK: {
        "dimensions": (1200, 630),
        "aspect_ratio": "1.91:1",
        "max_file_size_mb": 8,
        "recommended_formats": ["JPG"],
        "color_profile": "sRGB",
        "compression": 85,
        "prompt_suffix": "horizontal format, professional, engaging"
    },
    Platform.PINTEREST: {
        "dimensions": (1000, 1500),
        "aspect_ratio": "2:3",
        "max_file_size_mb": 20,
        "recommended_formats": ["PNG", "JPG"],
        "color_profile": "sRGB",
        "compression": 90,
        "brightness_boost": 1.1,
        "prompt_suffix": "pin-worthy, vertical format, inspiring"
    }
}

class AdStyle(str, Enum):
    MINIMALIST = "minimalist"
    LUXURY = "luxury"
    STREET = "street"
    SUSTAINABLE = "sustainable"
    BOLD = "bold"

class AdGenerationRequest(BaseModel):
    prompt: str
    platform: Platform
    text_overlay: Optional[str] = None
    brand_colors: Optional[List[str]] = ["#000000", "#FFFFFF"]
    style: Optional[AdStyle] = AdStyle.MINIMALIST
    dimensions: Optional[Dict[str, int]] = None

class AdEvaluationRequest(BaseModel):
    image_path: str
    text_content: str
    platform: Platform
    target_audience: str
    brand_name: Optional[str] = None

class GeneratedAd(BaseModel):
    image_path: str
    image_url: str
    platform: Platform
    dimensions: Dict[str, int]
    generation_time: float
    metadata: Dict[str, Any]

class AdEvaluation(BaseModel):
    overall_score: float
    visual_appeal: float
    text_readability: float
    brand_alignment: float
    platform_optimization: float
    engagement_prediction: float
    suggestions: List[str]
    detailed_analysis: Dict[str, Any]