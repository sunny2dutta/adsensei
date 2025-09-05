#!/usr/bin/env python3
"""
Standalone test script for AI Ad Generation Service
Test the service without needing Node.js or frontend
"""

import asyncio
import json
import time
from services.ad_generator import AdImageGenerator
from services.evaluator import AdEvaluator
from services.platform_optimizer import PlatformOptimizer
from models.schemas import Platform, AdStyle

async def test_image_generation():
    """Test image generation capabilities"""
    print("🎨 Testing Image Generation...")
    
    generator = AdImageGenerator()
    
    # Test cases
    test_cases = [
        {
            "prompt": "Modern minimalist fashion ad with elegant woman in white dress",
            "platform": Platform.INSTAGRAM,
            "style": AdStyle.MINIMALIST,
            "text_overlay": "New Collection",
            "brand_colors": ["#000000", "#FFFFFF"]
        },
        {
            "prompt": "Luxury streetwear collection with urban backdrop and neon lights",
            "platform": Platform.TIKTOK,
            "style": AdStyle.STREET,
            "text_overlay": "Limited Drop",
            "brand_colors": ["#FF6B35", "#1A1A1A"]
        },
        {
            "prompt": "Sustainable eco-friendly fashion with natural materials",
            "platform": Platform.PINTEREST,
            "style": AdStyle.SUSTAINABLE,
            "text_overlay": "Earth Friendly Fashion",
            "brand_colors": ["#4A7C59", "#F7F3E9"]
        }
    ]
    
    results = []
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📸 Test Case {i}: {test_case['platform'].value} - {test_case['style'].value}")
        print(f"Prompt: {test_case['prompt']}")
        
        start_time = time.time()
        
        try:
            result = await generator.generate_ad_image(**test_case)
            generation_time = time.time() - start_time
            
            print(f"✅ Generated in {generation_time:.2f}s")
            print(f"📁 Saved to: {result.image_path}")
            print(f"🖼️  Dimensions: {result.dimensions}")
            
            results.append(result)
            
        except Exception as e:
            print(f"❌ Generation failed: {e}")
    
    return results

async def test_evaluation(generated_ads):
    """Test evaluation capabilities"""
    print("\n🔍 Testing Evaluation System...")
    
    evaluator = AdEvaluator()
    
    for i, ad in enumerate(generated_ads, 1):
        print(f"\n📊 Evaluating Ad {i} ({ad.platform.value})")
        
        try:
            evaluation = await evaluator.evaluate_ad(
                image_path=ad.image_path,
                text_content=ad.metadata.get("text_overlay", ""),
                platform=Platform(ad.platform.value),
                target_audience="Fashion-conscious millennials aged 25-35",
                brand_name="TestBrand"
            )
            
            print(f"📈 Overall Score: {evaluation.overall_score:.2f}")
            print(f"👁️  Visual Appeal: {evaluation.visual_appeal:.2f}")
            print(f"📖 Text Readability: {evaluation.text_readability:.2f}")
            print(f"🎯 Platform Optimization: {evaluation.platform_optimization:.2f}")
            print(f"💡 Suggestions: {', '.join(evaluation.suggestions[:3])}")
            
        except Exception as e:
            print(f"❌ Evaluation failed: {e}")

def test_platform_optimization():
    """Test platform optimization features"""
    print("\n🔧 Testing Platform Optimization...")
    
    optimizer = PlatformOptimizer()
    
    # Test platform specifications
    for platform in Platform:
        specs = optimizer.platform_specs[platform]
        print(f"📱 {platform.value}:")
        print(f"   Dimensions: {specs['dimensions']}")
        print(f"   Aspect Ratio: {specs['aspect_ratio']}")
        print(f"   Max Size: {specs['max_file_size_mb']}MB")

async def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Comprehensive AI Ad Generation Test")
    print("=" * 60)
    
    # Test platform optimization (doesn't require models)
    test_platform_optimization()
    
    # Test image generation (requires models)
    generated_ads = await test_image_generation()
    
    # Test evaluation (requires generated ads)
    if generated_ads:
        await test_evaluation(generated_ads)
    
    print("\n🎉 Testing completed!")
    print(f"📁 Generated images saved in: generated_ads/")

if __name__ == "__main__":
    asyncio.run(run_comprehensive_test())