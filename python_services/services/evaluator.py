import os
import cv2
import numpy as np
from PIL import Image, ImageStat
from typing import Dict, List, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
import openai
from models.schemas import Platform, AdEvaluation

class AdEvaluator:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    def analyze_color_distribution(self, image_path: str) -> Dict[str, Any]:
        """Analyze color distribution and harmony"""
        image = Image.open(image_path)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get color statistics
        stat = ImageStat.Stat(image)
        
        # Calculate dominant colors
        image_array = np.array(image)
        pixels = image_array.reshape(-1, 3)
        
        # Simple dominant color extraction using k-means clustering
        try:
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
            kmeans.fit(pixels)
            dominant_colors = kmeans.cluster_centers_.astype(int)
        except ImportError:
            # Fallback if sklearn not available
            dominant_colors = np.array([[128, 128, 128], [64, 64, 64], [192, 192, 192]])
        
        # Color harmony score (simplified)
        color_variance = np.var(stat.mean)
        harmony_score = max(0, 1 - (color_variance / 10000))  # Normalized
        
        return {
            "dominant_colors": dominant_colors.tolist(),
            "color_harmony": harmony_score,
            "brightness": np.mean(stat.mean),
            "contrast": np.std(stat.mean)
        }
    
    def analyze_composition(self, image_path: str) -> Dict[str, Any]:
        """Analyze image composition and balance"""
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Edge detection for complexity analysis
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Center of mass for balance analysis
        moments = cv2.moments(gray)
        if moments['m00'] != 0:
            cx = int(moments['m10'] / moments['m00'])
            cy = int(moments['m01'] / moments['m00'])
            
            # Calculate how centered the composition is
            center_x, center_y = image.shape[1] // 2, image.shape[0] // 2
            balance_score = 1 - (abs(cx - center_x) + abs(cy - center_y)) / (center_x + center_y)
        else:
            balance_score = 0.5
        
        # Rule of thirds analysis
        height, width = gray.shape
        third_x, third_y = width // 3, height // 3
        
        # Check if important elements are on rule of thirds lines
        thirds_lines = [
            gray[third_y:third_y+10, :],
            gray[2*third_y:2*third_y+10, :],
            gray[:, third_x:third_x+10],
            gray[:, 2*third_x:2*third_x+10]
        ]
        
        thirds_activity = np.mean([np.std(line) for line in thirds_lines])
        
        return {
            "edge_density": edge_density,
            "balance_score": max(0, min(1, balance_score)),
            "complexity": min(1, edge_density * 10),  # Normalized
            "rule_of_thirds_score": min(1, thirds_activity / 50)  # Normalized
        }
    
    def analyze_text_readability(self, image_path: str, text_content: str) -> Dict[str, Any]:
        """Analyze text readability and contrast"""
        if not text_content:
            return {"readability_score": 1.0, "contrast_ratio": 1.0}
        
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Find text regions using contour detection
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contrast in potential text areas
        text_areas = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Filter small areas
                x, y, w, h = cv2.boundingRect(contour)
                text_region = gray[y:y+h, x:x+w]
                text_areas.append(text_region)
        
        if text_areas:
            contrast_scores = []
            for area in text_areas:
                if area.size > 0:
                    contrast = np.std(area)
                    contrast_scores.append(contrast)
            
            avg_contrast = np.mean(contrast_scores) if contrast_scores else 50
            contrast_ratio = min(1, avg_contrast / 100)  # Normalized
        else:
            contrast_ratio = 0.7  # Default assumption
        
        # Text length analysis
        text_length_score = max(0, 1 - len(text_content) / 200)  # Penalize very long text
        
        return {
            "readability_score": (contrast_ratio + text_length_score) / 2,
            "contrast_ratio": contrast_ratio,
            "text_length_appropriate": len(text_content) <= 50  # For social media
        }
    
    def platform_optimization_score(self, image_path: str, platform: Platform) -> float:
        """Check platform-specific optimization"""
        image = Image.open(image_path)
        width, height = image.size
        
        optimal_dimensions = {
            Platform.INSTAGRAM: (1080, 1080),
            Platform.INSTAGRAM_STORY: (1080, 1920),
            Platform.TIKTOK: (1080, 1920),
            Platform.FACEBOOK: (1200, 630),
            Platform.PINTEREST: (1000, 1500)
        }
        
        target_width, target_height = optimal_dimensions.get(platform, (width, height))
        
        # Calculate dimension score
        width_ratio = min(width, target_width) / max(width, target_width)
        height_ratio = min(height, target_height) / max(height, target_height)
        dimension_score = (width_ratio + height_ratio) / 2
        
        # Resolution score
        total_pixels = width * height
        min_pixels = 1000000  # 1MP minimum
        resolution_score = min(1, total_pixels / min_pixels)
        
        return (dimension_score + resolution_score) / 2
    
    async def get_ai_evaluation(self, image_path: str, text_content: str, 
                              platform: Platform, target_audience: str,
                              brand_name: str = None) -> Dict[str, Any]:
        """Get AI-powered evaluation of the ad"""
        
        # Encode image to base64 for OpenAI API
        import base64
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        prompt = f"""
        Analyze this advertisement image for the following context:
        - Platform: {platform.value}
        - Target Audience: {target_audience}
        - Text Content: {text_content}
        - Brand: {brand_name or "Unknown"}
        
        Evaluate the ad on these criteria (score 0-10):
        1. Visual Appeal: How attractive and eye-catching is the image?
        2. Brand Alignment: Does it fit the brand aesthetic and values?
        3. Platform Optimization: Is it optimized for {platform.value}?
        4. Audience Relevance: How well does it target the specified audience?
        5. Call-to-Action Clarity: How clear and compelling is the message?
        
        Provide specific suggestions for improvement.
        
        Return a JSON response with:
        {{
            "visual_appeal": score,
            "brand_alignment": score,
            "platform_optimization": score,
            "audience_relevance": score,
            "cta_clarity": score,
            "overall_rating": average_score,
            "strengths": ["strength1", "strength2"],
            "improvements": ["improvement1", "improvement2"],
            "engagement_prediction": "high/medium/low"
        }}
        """
        
        try:
            response = await asyncio.create_task(
                asyncio.to_thread(
                    self.openai_client.chat.completions.create,
                    model="gpt-4-vision-preview",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/png;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=1000
                )
            )
            
            # Parse JSON response
            import json
            ai_result = json.loads(response.choices[0].message.content)
            return ai_result
            
        except Exception as e:
            print(f"AI evaluation failed: {e}")
            # Return default scores if AI fails
            return {
                "visual_appeal": 7.0,
                "brand_alignment": 7.0,
                "platform_optimization": 7.0,
                "audience_relevance": 7.0,
                "cta_clarity": 7.0,
                "overall_rating": 7.0,
                "strengths": ["Professional appearance"],
                "improvements": ["Could not analyze due to API limitation"],
                "engagement_prediction": "medium"
            }
    
    async def evaluate_ad(self, image_path: str, text_content: str,
                         platform: Platform, target_audience: str,
                         brand_name: str = None) -> AdEvaluation:
        """Comprehensive ad evaluation"""
        
        # Technical analysis
        color_analysis = self.analyze_color_distribution(image_path)
        composition_analysis = self.analyze_composition(image_path)
        text_analysis = self.analyze_text_readability(image_path, text_content)
        platform_score = self.platform_optimization_score(image_path, platform)
        
        # AI-powered analysis
        ai_evaluation = await self.get_ai_evaluation(
            image_path, text_content, platform, target_audience, brand_name
        )
        
        # Combine scores
        visual_appeal = (color_analysis["color_harmony"] * 0.3 + 
                        composition_analysis["balance_score"] * 0.4 +
                        ai_evaluation["visual_appeal"] / 10 * 0.3)
        
        text_readability = text_analysis["readability_score"]
        brand_alignment = ai_evaluation["brand_alignment"] / 10
        platform_optimization = platform_score
        
        # Engagement prediction based on all factors
        engagement_factors = [visual_appeal, text_readability, brand_alignment, platform_optimization]
        engagement_prediction = np.mean(engagement_factors)
        
        overall_score = np.mean([visual_appeal, text_readability, brand_alignment, 
                               platform_optimization, engagement_prediction])
        
        # Generate suggestions
        suggestions = []
        
        if visual_appeal < 0.7:
            suggestions.append("Improve visual composition and color harmony")
        if text_readability < 0.7:
            suggestions.append("Enhance text contrast and readability")
        if platform_optimization < 0.8:
            suggestions.append(f"Optimize dimensions for {platform.value}")
        if brand_alignment < 0.7:
            suggestions.append("Better align visual elements with brand identity")
        
        suggestions.extend(ai_evaluation.get("improvements", []))
        
        return AdEvaluation(
            overall_score=overall_score,
            visual_appeal=visual_appeal,
            text_readability=text_readability,
            brand_alignment=brand_alignment,
            platform_optimization=platform_optimization,
            engagement_prediction=engagement_prediction,
            suggestions=suggestions[:5],  # Limit to top 5 suggestions
            detailed_analysis={
                "color_analysis": color_analysis,
                "composition_analysis": composition_analysis,
                "text_analysis": text_analysis,
                "ai_evaluation": ai_evaluation,
                "technical_scores": {
                    "platform_optimization": platform_score,
                    "visual_appeal_technical": visual_appeal,
                    "engagement_factors": engagement_factors
                }
            }
        )