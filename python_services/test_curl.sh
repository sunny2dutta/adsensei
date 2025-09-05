#!/bin/bash

# Simple cURL tests for the AI Ad Generation API
# Run these commands to test the service without any frontend code

BASE_URL="http://localhost:8001"

echo "🧪 Testing AI Ad Generation Service with cURL"
echo "=" * 50

# Test 1: Health Check
echo "🏥 Testing health endpoint..."
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Response received"

echo -e "\n"

# Test 2: Generate Instagram Ad
echo "📸 Testing Instagram ad generation..."
curl -X POST "$BASE_URL/generate-ad-image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Modern minimalist fashion ad with elegant woman in white dress",
    "platform": "instagram",
    "text_overlay": "New Collection",
    "brand_colors": ["#000000", "#FFFFFF"],
    "style": "minimalist"
  }' \
  | jq '.data | {image_url, platform, generation_time}' 2>/dev/null || echo "Generation request sent"

echo -e "\n"

# Test 3: Generate TikTok Ad
echo "📱 Testing TikTok ad generation..."
curl -X POST "$BASE_URL/generate-ad-image" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Vibrant streetwear campaign with urban energy and neon lights",
    "platform": "tiktok", 
    "text_overlay": "Limited Drop",
    "brand_colors": ["#FF6B35", "#1A1A1A"],
    "style": "street"
  }' \
  | jq '.data | {image_url, platform, generation_time}' 2>/dev/null || echo "Generation request sent"

echo -e "\n"

# Test 4: Evaluation (requires an existing image)
echo "🔍 Testing evaluation (you'll need to update the image_path)..."
echo "curl -X POST \"$BASE_URL/evaluate-ad\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"image_path\": \"/path/to/generated/image.png\","
echo "    \"text_content\": \"New Collection\","
echo "    \"platform\": \"instagram\","
echo "    \"target_audience\": \"Fashion-conscious millennials\","
echo "    \"brand_name\": \"TestBrand\""
echo "  }'"

echo -e "\n🎉 cURL tests completed!"
echo "📚 For interactive API docs: $BASE_URL/docs"
echo "🖼️  Generated images will be in: python_services/generated_ads/"