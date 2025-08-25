// Client-side OpenAI utilities and types

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

export interface CampaignInsights {
  insights: string[];
  recommendations: string[];
}

export interface AdCopyVariation {
  id: string;
  headline: string;
  body: string;
  cta: string;
  platform: string;
  tone: string;
  timestamp: Date;
}

// Client-side utility functions for working with AI-generated content
export class AIContentManager {
  private static readonly STORAGE_KEY = 'styleai_generated_content';

  static saveGeneratedCopy(copy: GeneratedAdCopy): AdCopyVariation {
    const variation: AdCopyVariation = {
      id: crypto.randomUUID(),
      ...copy,
      tone: 'professional', // default tone
      timestamp: new Date()
    };

    const saved = this.getSavedCopies();
    saved.push(variation);
    
    // Keep only last 50 variations
    if (saved.length > 50) {
      saved.splice(0, saved.length - 50);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
    return variation;
  }

  static getSavedCopies(): AdCopyVariation[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static deleteSavedCopy(id: string): void {
    const saved = this.getSavedCopies();
    const filtered = saved.filter(copy => copy.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static clearAllSavedCopies(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Utility functions for formatting AI content
export const formatAdCopyForPlatform = (copy: GeneratedAdCopy): string => {
  switch (copy.platform.toLowerCase()) {
    case 'instagram':
      return `${copy.headline}\n\n${copy.body}\n\n${copy.cta}${copy.hashtags ? `\n\n${copy.hashtags.map(tag => `#${tag}`).join(' ')}` : ''}`;
    
    case 'facebook':
      return `${copy.headline}\n\n${copy.body}\n\n${copy.cta}`;
    
    case 'tiktok':
      return `${copy.body} ${copy.cta}${copy.hashtags ? ` ${copy.hashtags.map(tag => `#${tag}`).join(' ')}` : ''}`;
    
    case 'google':
      return `${copy.headline}\n${copy.body}\n${copy.cta}`;
    
    default:
      return `${copy.headline}\n\n${copy.body}\n\n${copy.cta}`;
  }
};

export const getPlatformCharacterLimits = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return { caption: 2200, hashtags: 30 };
    case 'facebook':
      return { text: 63206 };
    case 'tiktok':
      return { caption: 2200, hashtags: 20 };
    case 'google':
      return { headline: 30, description: 90 };
    case 'pinterest':
      return { description: 500 };
    default:
      return { text: 280 };
  }
};

export const validateAdCopyLength = (copy: GeneratedAdCopy): { isValid: boolean; errors: string[] } => {
  const limits = getPlatformCharacterLimits(copy.platform);
  const errors: string[] = [];

  if (copy.platform.toLowerCase() === 'google') {
    if (copy.headline.length > limits.headline!) {
      errors.push(`Headline too long for Google Ads (${copy.headline.length}/${limits.headline} characters)`);
    }
    if (copy.body.length > limits.description!) {
      errors.push(`Description too long for Google Ads (${copy.body.length}/${limits.description} characters)`);
    }
  } else if (copy.platform.toLowerCase() === 'instagram') {
    const totalLength = copy.headline.length + copy.body.length + copy.cta.length;
    if (totalLength > limits.caption!) {
      errors.push(`Caption too long for Instagram (${totalLength}/${limits.caption} characters)`);
    }
    if (copy.hashtags && copy.hashtags.length > limits.hashtags!) {
      errors.push(`Too many hashtags for Instagram (${copy.hashtags.length}/${limits.hashtags})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Brand voice presets for consistent AI generation
export const BRAND_VOICE_PRESETS = {
  luxury: {
    tone: "sophisticated, elegant, exclusive",
    keywords: ["premium", "exquisite", "refined", "artisanal", "curated"],
    avoid: ["cheap", "discount", "basic", "ordinary"]
  },
  sustainable: {
    tone: "conscious, authentic, responsible",
    keywords: ["eco-friendly", "sustainable", "ethical", "organic", "responsible"],
    avoid: ["fast fashion", "disposable", "trend-driven"]
  },
  streetwear: {
    tone: "edgy, urban, trendy",
    keywords: ["fresh", "bold", "street-ready", "authentic", "culture"],
    avoid: ["formal", "traditional", "conservative"]
  },
  minimalist: {
    tone: "clean, simple, timeless",
    keywords: ["essential", "timeless", "versatile", "clean", "effortless"],
    avoid: ["flashy", "complicated", "ornate", "busy"]
  }
};

export const getBrandVoicePreset = (brandType: string) => {
  return BRAND_VOICE_PRESETS[brandType as keyof typeof BRAND_VOICE_PRESETS] || BRAND_VOICE_PRESETS.minimalist;
};
