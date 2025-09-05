import os
import time
import uuid
import requests
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from typing import Dict, List, Optional, Any
import openai
from models.schemas import Platform, AdStyle, GeneratedAd, PLATFORM_SPECS

class AdImageGenerator:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.output_dir = "generated_ads"
        os.makedirs(self.output_dir, exist_ok=True)
        
    def enhance_prompt_for_ads(self, prompt: str, style: AdStyle, platform: Platform) -> str:
        """Enhance the user prompt with style and platform-specific details"""
        style_prompts = {
            AdStyle.MINIMALIST: "clean, minimal, simple composition, white space, modern",
            AdStyle.LUXURY: "elegant, sophisticated, premium materials, gold accents, high-end",
            AdStyle.STREET: "urban, edgy, graffiti-inspired, vibrant colors, contemporary",
            AdStyle.SUSTAINABLE: "natural, eco-friendly, green elements, organic textures",
            AdStyle.BOLD: "vibrant colors, high contrast, dynamic composition, energetic"
        }
        
        platform_suffix = PLATFORM_SPECS[platform]["prompt_suffix"]
        style_suffix = style_prompts[style]
        
        enhanced_prompt = f"{prompt}, {style_suffix}, {platform_suffix}, advertising photography, professional quality, product photography style, commercial use, high resolution"
        
        return enhanced_prompt

    async def generate_base_image(self, prompt: str, dimensions: Dict[str, int]) -> Image.Image:
        """Generate base image using OpenAI DALL-E"""
        # DALL-E 3 supports 1024x1024, 1024x1792, or 1792x1024
        width, height = dimensions["width"], dimensions["height"]
        
        # Map to closest DALL-E supported size
        if width == height:
            dalle_size = "1024x1024"
        elif height > width:
            dalle_size = "1024x1792"
        else:
            dalle_size = "1792x1024"
        
        try:
            response = self.openai_client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size=dalle_size,
                quality="hd",
                n=1,
            )
            
            image_url = response.data[0].url
            
            # Download the image
            img_response = requests.get(image_url)
            img_response.raise_for_status()
            
            # Open and resize to exact dimensions if needed
            image = Image.open(requests.get(image_url, stream=True).raw)
            
            if image.size != (width, height):
                image = self.resize_and_crop(image, width, height)
            
            return image
            
        except Exception as e:
            print(f"DALL-E generation failed: {e}")
            # Fallback to solid color placeholder
            return Image.new('RGB', (width, height), color='lightblue')

    def resize_and_crop(self, image: Image.Image, target_width: int, target_height: int) -> Image.Image:
        """Resize and crop image to exact dimensions while maintaining aspect ratio"""
        # Calculate ratios
        img_width, img_height = image.size
        width_ratio = target_width / img_width
        height_ratio = target_height / img_height
        
        # Use the larger ratio to ensure the image covers the target area
        ratio = max(width_ratio, height_ratio)
        
        # Resize
        new_width = int(img_width * ratio)
        new_height = int(img_height * ratio)
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop to exact dimensions from center
        left = (new_width - target_width) // 2
        top = (new_height - target_height) // 2
        right = left + target_width
        bottom = top + target_height
        
        return resized.crop((left, top, right, bottom))

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
        spec = PLATFORM_SPECS[platform]
        
        # Apply platform-specific enhancements
        if "saturation_boost" in spec:
            enhancer = ImageEnhance.Color(image)
            image = enhancer.enhance(spec["saturation_boost"])
        
        if "brightness_boost" in spec:
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(spec["brightness_boost"])
        
        # General social media optimization
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.05)
        
        return image

    def save_optimized_image(self, image: Image.Image, image_path: str, platform: Platform) -> Dict[str, Any]:
        """Save image with platform-specific optimization"""
        spec = PLATFORM_SPECS[platform]
        max_size_bytes = spec["max_file_size_mb"] * 1024 * 1024
        compression = spec["compression"]
        
        # Try different quality settings to meet file size requirements
        quality = compression
        while quality > 10:
            image.save(image_path, "PNG", quality=quality, optimize=True)
            
            # Check file size
            file_size = os.path.getsize(image_path)
            
            if file_size <= max_size_bytes:
                break
            
            quality -= 10
        
        return {
            "final_quality": quality,
            "file_size_mb": file_size / (1024 * 1024),
            "within_limits": file_size <= max_size_bytes
        }

    async def generate_ad_image(self, prompt: str, platform: Platform,
                              brand_colors: Optional[List[str]] = None,
                              text_overlay: Optional[str] = None,
                              style: Optional[AdStyle] = AdStyle.MINIMALIST,
                              dimensions: Optional[Dict[str, int]] = None) -> GeneratedAd:
        """Main method to generate a complete ad image"""
        start_time = time.time()
        
        # Get platform specs
        spec = PLATFORM_SPECS[platform]
        
        # Set dimensions
        if dimensions is None:
            dimensions = {"width": spec["dimensions"][0], "height": spec["dimensions"][1]}
        
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
        
        save_result = self.save_optimized_image(image, image_path, platform)
        
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
                "image_id": image_id,
                "optimization_result": save_result
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