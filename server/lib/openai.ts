import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface GenerateAdCopyRequest {
  brandType: string;
  brandName: string;
  productCategory: string;
  targetAudience: string;
  platform: string;
  campaignObjective: string;
  brandValues?: string;
  tone?: string;
}

export interface GeneratedAdCopy {
  headline: string;
  body: string;
  cta: string;
  hashtags?: string[];
  platform: string;
}

export async function generateAdCopy(request: GenerateAdCopyRequest): Promise<GeneratedAdCopy> {
  try {
    const prompt = `Generate compelling ad copy for a ${request.brandType} fashion brand with the following details:

Brand Name: ${request.brandName}
Product Category: ${request.productCategory}
Target Audience: ${request.targetAudience}
Platform: ${request.platform}
Campaign Objective: ${request.campaignObjective}
Brand Values: ${request.brandValues || "Not specified"}
Tone: ${request.tone || "Professional"}

Create ad copy that:
1. Captures attention immediately
2. Speaks directly to the target audience
3. Highlights the unique value proposition
4. Includes a compelling call-to-action
5. Is optimized for ${request.platform}
6. Aligns with ${request.brandType} fashion brand positioning

Respond with JSON in this format:
{
  "headline": "Attention-grabbing headline (max 25 words)",
  "body": "Main ad copy body (max 90 words for ${request.platform})",
  "cta": "Clear call-to-action (max 15 words)",
  "hashtags": ["relevant", "hashtags", "for", "platform"],
  "platform": "${request.platform}"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert fashion marketing copywriter specializing in D2C brands. Create compelling, conversion-focused ad copy that resonates with fashion-conscious consumers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as GeneratedAdCopy;
  } catch (error) {
    throw new Error("Failed to generate ad copy: " + (error as Error).message);
  }
}

export interface CampaignSuggestionRequest {
  brandName: string;
  brandType: string; // luxury, sustainable, streetwear, etc.
  brandValues?: string;
  targetDemographic: {
    ageRange: string;
    gender: string;
    interests: string[];
    location: string;
  };
  budget?: number;
  platforms: string[];
  seasonality?: string;
}

export interface SuggestedCampaign {
  title: string;
  description: string;
  platform: string;
  targetAudience: string;
  campaignType: string;
  estimatedReach: string;
  budget: string;
  duration: string;
  keyMessages: string[];
  hashtags: string[];
  demographicInsights: string;
  performancePrediction: {
    expectedCTR: string;
    expectedConversions: string;
    confidence: string;
  };
}

export async function generateCampaignSuggestions(request: CampaignSuggestionRequest): Promise<{
  suggestions: SuggestedCampaign[];
  demographicAnalysis: string[];
  brandOptimization: string[];
}> {
  try {
    const prompt = `As an expert fashion marketing strategist, analyze this D2C fashion brand and suggest optimal campaigns:

Brand Profile:
- Name: ${request.brandName}
- Type: ${request.brandType}
- Values: ${request.brandValues || "Not specified"}
- Target Demographic: ${request.targetDemographic.ageRange}, ${request.targetDemographic.gender}, interests: ${request.targetDemographic.interests.join(', ')}, location: ${request.targetDemographic.location}
- Budget Range: ${request.budget ? `$${(request.budget / 100).toFixed(2)}` : "Not specified"}
- Available Platforms: ${request.platforms.join(', ')}
- Season/Timing: ${request.seasonality || "Year-round"}

Generate 3 highly targeted campaign suggestions that:
1. Align with the brand's values and positioning
2. Resonate with the specific demographic
3. Consider platform-specific best practices
4. Include performance predictions based on fashion industry benchmarks
5. Optimize for demographic engagement patterns

For each campaign, provide specific demographic insights and explain why it will work for this audience.

Also include:
- Demographic analysis: What works best for this audience segment in fashion marketing
- Brand optimization recommendations: How to better position campaigns for this brand type

Respond with JSON in this format:
{
  "suggestions": [
    {
      "title": "Campaign name",
      "description": "Detailed campaign concept",
      "platform": "Primary platform",
      "targetAudience": "Specific audience description",
      "campaignType": "e.g., Product Launch, Lifestyle, Seasonal Sale",
      "estimatedReach": "e.g., 15K-30K",
      "budget": "Suggested budget range",
      "duration": "Recommended duration",
      "keyMessages": ["message 1", "message 2", "message 3"],
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "demographicInsights": "Why this works for this demographic",
      "performancePrediction": {
        "expectedCTR": "e.g., 2.5-3.2%",
        "expectedConversions": "e.g., 180-250",
        "confidence": "High/Medium/Low"
      }
    }
  ],
  "demographicAnalysis": ["insight 1", "insight 2", "insight 3"],
  "brandOptimization": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert fashion marketing strategist with deep knowledge of demographic targeting, brand positioning, and D2C fashion marketing performance data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as { suggestions: SuggestedCampaign[]; demographicAnalysis: string[]; brandOptimization: string[] };
  } catch (error) {
    throw new Error("Failed to generate campaign suggestions: " + (error as Error).message);
  }
}

export async function generateCampaignInsights(campaignData: {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  platform: string;
}): Promise<{
  insights: string[];
  recommendations: string[];
}> {
  try {
    const ctr = campaignData.clicks / campaignData.impressions * 100;
    const conversionRate = campaignData.conversions / campaignData.clicks * 100;
    const cpc = campaignData.spend / campaignData.clicks;

    const prompt = `Analyze this fashion brand campaign performance and provide insights:

Platform: ${campaignData.platform}
Impressions: ${campaignData.impressions}
Clicks: ${campaignData.clicks}
Conversions: ${campaignData.conversions}
Spend: $${(campaignData.spend / 100).toFixed(2)}
CTR: ${ctr.toFixed(2)}%
Conversion Rate: ${conversionRate.toFixed(2)}%
CPC: $${(cpc / 100).toFixed(2)}

Provide 3 key insights and 3 actionable recommendations for improving this fashion brand campaign. Focus on fashion industry benchmarks and best practices.

Respond with JSON in this format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a fashion marketing analytics expert who provides data-driven insights for D2C fashion brands."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as { insights: string[]; recommendations: string[] };
  } catch (error) {
    throw new Error("Failed to generate insights: " + (error as Error).message);
  }
}
