#!/usr/bin/env python3
"""
API Testing Script - Test the FastAPI endpoints directly
"""

import requests
import json
import time
import os

class APITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health(self):
        """Test health endpoint"""
        print("🏥 Testing Health Endpoint...")
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Service is healthy")
                print(f"Response: {response.json()}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_image_generation(self):
        """Test image generation endpoint"""
        print("\n🎨 Testing Image Generation API...")
        
        test_requests = [
            {
                "prompt": "Modern minimalist fashion ad with elegant model",
                "platform": "instagram",
                "text_overlay": "New Collection",
                "brand_colors": ["#000000", "#FFFFFF"],
                "style": "minimalist"
            },
            {
                "prompt": "Vibrant streetwear campaign with urban energy",
                "platform": "tiktok",
                "text_overlay": "Limited Drop",
                "brand_colors": ["#FF6B35", "#1A1A1A"],
                "style": "street"
            }
        ]
        
        generated_images = []
        
        for i, request_data in enumerate(test_requests, 1):
            print(f"\n📸 Test {i}: {request_data['platform']} - {request_data['style']}")
            print(f"Prompt: {request_data['prompt']}")
            
            start_time = time.time()
            
            try:
                response = self.session.post(
                    f"{self.base_url}/generate-ad-image",
                    json=request_data,
                    timeout=120  # 2 minutes timeout
                )
                
                generation_time = time.time() - start_time
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        data = result["data"]
                        print(f"✅ Generated in {generation_time:.2f}s")
                        print(f"📁 Image Path: {data['image_path']}")
                        print(f"🔗 Image URL: {data['image_url']}")
                        print(f"📐 Dimensions: {data['dimensions']}")
                        generated_images.append(data)
                    else:
                        print(f"❌ Generation failed: {result}")
                else:
                    print(f"❌ API Error: {response.status_code}")
                    print(f"Response: {response.text}")
                    
            except requests.exceptions.Timeout:
                print("⏰ Request timed out (this is normal for first generation)")
            except Exception as e:
                print(f"❌ Request error: {e}")
        
        return generated_images
    
    def test_evaluation(self, generated_images):
        """Test evaluation endpoint"""
        print("\n🔍 Testing Evaluation API...")
        
        for i, image_data in enumerate(generated_images, 1):
            print(f"\n📊 Evaluating Image {i}")
            
            eval_request = {
                "image_path": image_data["image_path"],
                "text_content": image_data["metadata"].get("text_overlay", ""),
                "platform": image_data["platform"],
                "target_audience": "Fashion-conscious millennials",
                "brand_name": "TestBrand"
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/evaluate-ad",
                    json=eval_request,
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        eval_data = result["data"]
                        print(f"✅ Evaluation completed")
                        print(f"📈 Overall Score: {eval_data['overall_score']:.2f}")
                        print(f"👁️  Visual Appeal: {eval_data['visual_appeal']:.2f}")
                        print(f"📱 Platform Optimization: {eval_data['platform_optimization']:.2f}")
                        print(f"💡 Top Suggestions: {', '.join(eval_data['suggestions'][:2])}")
                    else:
                        print(f"❌ Evaluation failed: {result}")
                else:
                    print(f"❌ API Error: {response.status_code}")
                    print(f"Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Evaluation error: {e}")

def main():
    """Main test function"""
    print("🧪 AI Ad Generation API Test Suite")
    print("=" * 50)
    
    # Check if service URL is provided
    service_url = os.getenv("PYTHON_SERVICE_URL", "http://localhost:8001")
    print(f"🎯 Testing service at: {service_url}")
    
    tester = APITester(service_url)
    
    # Test health first
    if not tester.test_health():
        print("❌ Service not available. Make sure it's running:")
        print("   cd python_services && python start.py")
        return
    
    # Test image generation
    generated_images = tester.test_image_generation()
    
    # Test evaluation if images were generated
    if generated_images:
        tester.test_evaluation(generated_images)
    else:
        print("⚠️  No images generated, skipping evaluation tests")
    
    print("\n🎉 API Testing completed!")
    print("📚 For interactive API docs, visit: http://localhost:8001/docs")

if __name__ == "__main__":
    main()