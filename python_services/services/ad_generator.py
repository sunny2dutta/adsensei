import os
import time
import uuid
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, List, Optional, Any
import requests
import asyncio
from concurrent.futures import ThreadPoolExecutor
import openai
from diffusers import StableDiffusionPipeline
import torch
from models.schemas import Platform, AdStyle, GeneratedAd

class AdImageGenerator:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipeline = None
        self.platform_dimensions = {
            Platform.INSTAGRAM: {"width": 1080, "height": 1080},
            Platform.INSTAGRAM_STORY: {"width": 1080, "height": 1920},
            Platform.TIKTOK: {"width": 1080, "height": 1920},
            Platform.FACEBOOK: {"width": 1200, "height": 630},
            Platform.PINTEREST: {"width": 1000, "height": 1500}
        }
        self.output_dir = "generated_ads"
        os.makedirs(self.output_dir, exist_ok=True)
        
    async def initialize_pipeline(self):
        """Initialize the Stable Diffusion pipeline"""
        if self.pipeline is None:
            def load_pipeline():
                return StableDiffusionPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                ).to(self.device)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                self.pipeline = await loop.run_in_executor(executor, load_pipeline)

    def enhance_prompt_for_ads(self, prompt: str, style: AdStyle, platform: Platform) -> str:
        """Enhance the user prompt with style and platform-specific details"""
        style_prompts = {
            AdStyle.MINIMALIST: "clean, minimal, simple composition, white space, modern",
            AdStyle.LUXURY: "elegant, sophisticated, premium materials, gold accents, high-end",
            AdStyle.STREET: "urban, edgy, graffiti-inspired, vibrant colors, contemporary",
            AdStyle.SUSTAINABLE: "natural, eco-friendly, green elements, organic textures",
            AdStyle.BOLD: "vibrant colors, high contrast, dynamic composition, energetic"
        }
        
        platform_prompts = {
            Platform.INSTAGRAM: "Instagram-ready, square format, eye-catching",
            Platform.INSTAGRAM_STORY: "vertical story format, mobile-optimized",
            Platform.TIKTOK: "vertical video-style, trendy, Gen-Z appealing",
            Platform.FACEBOOK: "horizontal format, professional, engaging",
            Platform.PINTEREST: "pin-worthy, vertical format, inspiring"
        }
        
        enhanced_prompt = f"{prompt}, {style_prompts[style]}, {platform_prompts[platform]}, advertising photography, professional quality, product photography style, commercial use, 4K resolution"
        
        return enhanced_prompt

    async def generate_base_image(self, prompt: str, dimensions: Dict[str, int]) -> Image.Image:
        """Generate base image using Stable Diffusion"""
        await self.initialize_pipeline()
        
        def generate():
            return self.pipeline(
                prompt=prompt,
                width=dimensions["width"],
                height=dimensions["height"],
                num_inference_steps=30,
                guidance_scale=7.5
            ).images[0]
        
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            image = await loop.run_in_executor(executor, generate)
        
        return image

    def add_text_overlay(self, image: Image.Image, text: str, 
                        brand_colors: List[str], platform: Platform) -> Image.Image:
        """Add text overlay to the generated image"""
        if not text:
            return image
        
        draw = ImageDraw.Draw(image)
        img_width, img_height = image.size
        
        # Platform-specific text positioning and sizing
        font_size = max(40, img_height // 20)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # Position based on platform
        if platform in [Platform.INSTAGRAM_STORY, Platform.TIKTOK]:
            # Bottom third for vertical formats
            x = (img_width - text_width) // 2
            y = img_height - img_height // 4 - text_height
        else:
            # Center for square/horizontal formats
            x = (img_width - text_width) // 2
            y = (img_height - text_height) // 2
        
        # Add background rectangle for text readability
        padding = 20
        bg_color = brand_colors[1] if len(brand_colors) > 1 else "#FFFFFF"
        text_color = brand_colors[0] if brand_colors else "#000000"
        
        draw.rectangle([
            x - padding, y - padding,
            x + text_width + padding, y + text_height + padding
        ], fill=bg_color, outline=text_color, width=2)
        
        draw.text((x, y), text, fill=text_color, font=font)
        
        return image

    def optimize_for_platform(self, image: Image.Image, platform: Platform) -> Image.Image:
        """Apply platform-specific optimizations"""
        # Enhance contrast and saturation for better social media performance
        from PIL import ImageEnhance
        
        # Slight saturation boost for social media
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.1)
        
        # Slight contrast boost
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.05)
        
        return image

    async def generate_ad_image(self, prompt: str, platform: Platform,
                              brand_colors: Optional[List[str]] = None,
                              text_overlay: Optional[str] = None,
                              style: Optional[AdStyle] = AdStyle.MINIMALIST,
                              dimensions: Optional[Dict[str, int]] = None) -> GeneratedAd:
        """Main method to generate a complete ad image"""
        start_time = time.time()
        
        # Set dimensions
        if dimensions is None:
            dimensions = self.platform_dimensions[platform]
        
        # Set default brand colors
        if brand_colors is None:
            brand_colors = ["#000000", "#FFFFFF"]
        
        # Enhance prompt
        enhanced_prompt = self.enhance_prompt_for_ads(prompt, style, platform)
        
        # Generate base image
        image = await self.generate_base_image(enhanced_prompt, dimensions)
        
        # Add text overlay
        if text_overlay:
            image = self.add_text_overlay(image, text_overlay, brand_colors, platform)
        
        # Platform optimization
        image = self.optimize_for_platform(image, platform)
        
        # Save image
        image_id = str(uuid.uuid4())
        image_filename = f"{image_id}_{platform.value}.png"
        image_path = os.path.join(self.output_dir, image_filename)
        image.save(image_path, "PNG", quality=95)
        
        generation_time = time.time() - start_time
        
        return GeneratedAd(
            image_path=image_path,
            image_url=f"/static/generated_ads/{image_filename}",
            platform=platform,
            dimensions=dimensions,
            generation_time=generation_time,
            metadata={
                "original_prompt": prompt,
                "enhanced_prompt": enhanced_prompt,
                "style": style.value,
                "brand_colors": brand_colors,
                "text_overlay": text_overlay,
                "image_id": image_id
            }
        )

    async def generate_variations(self, base_request: Dict[str, Any], count: int = 3) -> List[GeneratedAd]:
        """Generate multiple variations of an ad"""
        variations = []
        base_prompt = base_request["prompt"]
        
        prompt_variations = [
            f"{base_prompt}, professional photography style",
            f"{base_prompt}, artistic composition, creative angle",
            f"{base_prompt}, lifestyle photography, authentic feel"
        ]
        
        for i, varied_prompt in enumerate(prompt_variations[:count]):
            request_copy = base_request.copy()
            request_copy["prompt"] = varied_prompt
            
            variation = await self.generate_ad_image(**request_copy)
            variations.append(variation)
        
        return variations