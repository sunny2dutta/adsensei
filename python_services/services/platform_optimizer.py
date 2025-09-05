from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np
from typing import Dict, Tuple, Any
from models.schemas import Platform

class PlatformOptimizer:
    """Optimize images for specific social media platforms"""
    
    def __init__(self):
        self.platform_specs = {
            Platform.INSTAGRAM: {
                "dimensions": (1080, 1080),
                "aspect_ratio": "1:1",
                "max_file_size_mb": 30,
                "recommended_formats": ["JPG", "PNG"],
                "color_profile": "sRGB",
                "compression": 85
            },
            Platform.INSTAGRAM_STORY: {
                "dimensions": (1080, 1920),
                "aspect_ratio": "9:16",
                "max_file_size_mb": 30,
                "recommended_formats": ["JPG", "PNG"],
                "color_profile": "sRGB",
                "compression": 85
            },
            Platform.TIKTOK: {
                "dimensions": (1080, 1920),
                "aspect_ratio": "9:16",
                "max_file_size_mb": 10,
                "recommended_formats": ["JPG"],
                "color_profile": "sRGB",
                "compression": 80,
                "saturation_boost": 1.2
            },
            Platform.FACEBOOK: {
                "dimensions": (1200, 630),
                "aspect_ratio": "1.91:1",
                "max_file_size_mb": 8,
                "recommended_formats": ["JPG"],
                "color_profile": "sRGB",
                "compression": 85
            },
            Platform.PINTEREST: {
                "dimensions": (1000, 1500),
                "aspect_ratio": "2:3",
                "max_file_size_mb": 20,
                "recommended_formats": ["PNG", "JPG"],
                "color_profile": "sRGB",
                "compression": 90,
                "brightness_boost": 1.1
            }
        }
    
    def resize_for_platform(self, image: Image.Image, platform: Platform) -> Image.Image:
        """Resize image to optimal dimensions for platform"""
        spec = self.platform_specs[platform]
        target_width, target_height = spec["dimensions"]
        
        # Calculate resize ratios
        width_ratio = target_width / image.width
        height_ratio = target_height / image.height
        
        # Use the smaller ratio to maintain aspect ratio
        ratio = min(width_ratio, height_ratio)
        
        # Calculate new dimensions
        new_width = int(image.width * ratio)
        new_height = int(image.height * ratio)
        
        # Resize image
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create final image with exact platform dimensions
        final_image = Image.new('RGB', (target_width, target_height), 'white')
        
        # Center the resized image
        x_offset = (target_width - new_width) // 2
        y_offset = (target_height - new_height) // 2
        
        final_image.paste(resized, (x_offset, y_offset))
        
        return final_image
    
    def enhance_for_platform(self, image: Image.Image, platform: Platform) -> Image.Image:
        """Apply platform-specific enhancements"""
        spec = self.platform_specs[platform]
        enhanced = image.copy()
        
        # TikTok: Boost saturation for vibrant look
        if platform == Platform.TIKTOK and "saturation_boost" in spec:
            enhancer = ImageEnhance.Color(enhanced)
            enhanced = enhancer.enhance(spec["saturation_boost"])
        
        # Pinterest: Slight brightness boost
        if platform == Platform.PINTEREST and "brightness_boost" in spec:
            enhancer = ImageEnhance.Brightness(enhanced)
            enhanced = enhancer.enhance(spec["brightness_boost"])
        
        # Instagram Story/TikTok: Add subtle sharpening
        if platform in [Platform.INSTAGRAM_STORY, Platform.TIKTOK]:
            enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
        
        return enhanced
    
    def optimize_file_size(self, image: Image.Image, platform: Platform, 
                          output_path: str) -> Dict[str, Any]:
        """Optimize file size for platform requirements"""
        spec = self.platform_specs[platform]
        max_size_bytes = spec["max_file_size_mb"] * 1024 * 1024
        compression = spec["compression"]
        
        # Try different quality settings to meet file size requirements
        quality = compression
        while quality > 10:
            image.save(output_path, "JPEG", quality=quality, optimize=True)
            
            # Check file size
            import os
            file_size = os.path.getsize(output_path)
            
            if file_size <= max_size_bytes:
                break
            
            quality -= 10
        
        return {
            "final_quality": quality,
            "file_size_mb": file_size / (1024 * 1024),
            "within_limits": file_size <= max_size_bytes
        }
    
    def generate_platform_variants(self, base_image: Image.Image, 
                                 output_base_path: str) -> Dict[Platform, str]:
        """Generate optimized variants for all platforms"""
        variants = {}
        
        for platform in Platform:
            # Resize for platform
            platform_image = self.resize_for_platform(base_image, platform)
            
            # Apply platform enhancements
            platform_image = self.enhance_for_platform(platform_image, platform)
            
            # Save optimized version
            variant_path = f"{output_base_path}_{platform.value}.jpg"
            optimization_result = self.optimize_file_size(
                platform_image, platform, variant_path
            )
            
            variants[platform] = {
                "path": variant_path,
                "optimization": optimization_result,
                "dimensions": self.platform_specs[platform]["dimensions"]
            }
        
        return variants
    
    def create_carousel_images(self, images: list[Image.Image], 
                             platform: Platform) -> Image.Image:
        """Create carousel-style image for platforms that support it"""
        if platform not in [Platform.INSTAGRAM, Platform.FACEBOOK]:
            raise ValueError("Carousel format not supported for this platform")
        
        spec = self.platform_specs[platform]
        target_width, target_height = spec["dimensions"]
        
        # Create carousel layout (horizontal for now)
        carousel_width = target_width * len(images)
        carousel = Image.new('RGB', (carousel_width, target_height), 'white')
        
        x_offset = 0
        for img in images:
            # Resize each image to fit
            resized = self.resize_for_platform(img, platform)
            carousel.paste(resized, (x_offset, 0))
            x_offset += target_width
        
        return carousel
    
    def add_platform_watermark(self, image: Image.Image, platform: Platform,
                             brand_name: str = None) -> Image.Image:
        """Add subtle platform-optimized branding"""
        from PIL import ImageDraw, ImageFont
        
        draw = ImageDraw.Draw(image)
        
        if brand_name:
            try:
                font = ImageFont.truetype("arial.ttf", 24)
            except:
                font = ImageFont.load_default()
            
            # Position watermark based on platform
            if platform in [Platform.INSTAGRAM_STORY, Platform.TIKTOK]:
                # Bottom right for vertical formats
                x = image.width - 150
                y = image.height - 50
            else:
                # Bottom right for other formats
                x = image.width - 120
                y = image.height - 30
            
            # Add semi-transparent background
            draw.rectangle([x-10, y-5, x+100, y+25], fill=(255, 255, 255, 128))
            draw.text((x, y), brand_name, fill=(0, 0, 0, 180), font=font)
        
        return image
    
    def validate_platform_compliance(self, image_path: str, 
                                   platform: Platform) -> Dict[str, Any]:
        """Validate if image meets platform requirements"""
        import os
        from PIL import Image
        
        spec = self.platform_specs[platform]
        image = Image.open(image_path)
        file_size = os.path.getsize(image_path) / (1024 * 1024)  # MB
        
        target_width, target_height = spec["dimensions"]
        
        compliance_report = {
            "compliant": True,
            "issues": [],
            "recommendations": []
        }
        
        # Check dimensions
        if image.size != (target_width, target_height):
            compliance_report["compliant"] = False
            compliance_report["issues"].append(
                f"Dimensions {image.size} don't match optimal {target_width}x{target_height}"
            )
            compliance_report["recommendations"].append(
                "Resize image to optimal dimensions"
            )
        
        # Check file size
        if file_size > spec["max_file_size_mb"]:
            compliance_report["compliant"] = False
            compliance_report["issues"].append(
                f"File size {file_size:.1f}MB exceeds limit of {spec['max_file_size_mb']}MB"
            )
            compliance_report["recommendations"].append(
                "Compress image or reduce quality"
            )
        
        # Check format
        format_name = image.format
        if format_name not in spec["recommended_formats"]:
            compliance_report["issues"].append(
                f"Format {format_name} not in recommended {spec['recommended_formats']}"
            )
            compliance_report["recommendations"].append(
                f"Convert to {spec['recommended_formats'][0]} format"
            )
        
        return compliance_report