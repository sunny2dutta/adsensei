from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum

class Platform(str, Enum):
    INSTAGRAM = "instagram"
    INSTAGRAM_STORY = "instagram_story"
    TIKTOK = "tiktok"
    FACEBOOK = "facebook"
    PINTEREST = "pinterest"

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