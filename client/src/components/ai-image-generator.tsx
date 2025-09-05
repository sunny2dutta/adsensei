import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Download, Share, Eye, BarChart3, Palette, Wand2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface GeneratedAdImage {
  image_path: string;
  image_url: string;
  platform: string;
  dimensions: { width: number; height: number };
  generation_time: number;
  metadata: {
    image_id: string;
    style: string;
    brand_colors: string[];
    text_overlay?: string;
  };
}

interface AdEvaluation {
  overall_score: number;
  visual_appeal: number;
  text_readability: number;
  brand_alignment: number;
  platform_optimization: number;
  engagement_prediction: number;
  suggestions: string[];
}

export default function AIImageGenerator() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [generatedImages, setGeneratedImages] = useState<GeneratedAdImage[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, AdEvaluation>>({});
  const [formData, setFormData] = useState({
    prompt: "",
    platform: "",
    text_overlay: "",
    brand_colors: ["#000000", "#FFFFFF"],
    style: ""
  });

  const generateImageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/generate-ad-image", data);
      return response.json();
    },
    onSuccess: (newImage: GeneratedAdImage) => {
      setGeneratedImages(prev => [newImage, ...prev]);
      toast({
        title: "Ad image generated!",
        description: `Created ${newImage.platform} ad in ${newImage.generation_time.toFixed(1)}s`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const evaluateAdMutation = useMutation({
    mutationFn: async (data: { image_path: string; text_content: string; platform: string; target_audience: string }) => {
      const response = await apiRequest("POST", "/api/evaluate-ad", data);
      return response.json();
    },
    onSuccess: (evaluation: AdEvaluation, variables) => {
      const imageId = variables.image_path.split('/').pop()?.split('.')[0] || '';
      setEvaluations(prev => ({ ...prev, [imageId]: evaluation }));
      toast({
        title: "Ad evaluated!",
        description: `Overall score: ${(evaluation.overall_score * 100).toFixed(1)}%`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Evaluation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate AI ad images.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.prompt || !formData.platform) {
      toast({
        title: "Missing information",
        description: "Please provide a prompt and select a platform.",
        variant: "destructive",
      });
      return;
    }
    
    generateImageMutation.mutate(formData);
  };

  const handleEvaluate = (image: GeneratedAdImage) => {
    evaluateAdMutation.mutate({
      image_path: image.image_path,
      text_content: image.metadata.text_overlay || formData.text_overlay || "",
      platform: image.platform,
      target_audience: "Fashion-conscious millennials" // Could be made configurable
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getPlatformDimensionsText = (platform: string) => {
    const dimensionMap: Record<string, string> = {
      instagram: "1080×1080 (Square)",
      instagram_story: "1080×1920 (Vertical)",
      tiktok: "1080×1920 (Vertical)",
      facebook: "1200×630 (Horizontal)",
      pinterest: "1000×1500 (Vertical)"
    };
    return dimensionMap[platform] || "Optimized";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-sage/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-inter text-2xl text-navy flex items-center">
              <ImageIcon className="mr-2" />
              AI Ad Image Generator
            </CardTitle>
            <div className="flex items-center space-x-2 bg-sage/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-sage rounded-full animate-pulse" />
              <span className="text-sage text-sm font-medium">Stable Diffusion</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe the ad image you want to generate (e.g., 'Modern minimalist fashion ad with elegant woman in sustainable clothing')"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram (Square)</SelectItem>
                  <SelectItem value="instagram_story">Instagram Story</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="pinterest">Pinterest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={formData.style} onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="sustainable">Sustainable</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="text-overlay">Text Overlay (Optional)</Label>
              <Input
                id="text-overlay"
                value={formData.text_overlay}
                onChange={(e) => setFormData(prev => ({ ...prev, text_overlay: e.target.value }))}
                placeholder="Text to add on the image"
              />
            </div>

            <div>
              <Label>Brand Colors</Label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={formData.brand_colors[0]}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    brand_colors: [e.target.value, prev.brand_colors[1]] 
                  }))}
                  className="w-12 h-10 rounded border"
                />
                <input
                  type="color"
                  value={formData.brand_colors[1]}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    brand_colors: [prev.brand_colors[0], e.target.value] 
                  }))}
                  className="w-12 h-10 rounded border"
                />
                <span className="text-sm text-gray-500 self-center">Primary & Secondary</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={generateImageMutation.isPending}
            className="w-full bg-sage hover:bg-sage/90 text-white"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {generateImageMutation.isPending ? "Generating..." : "Generate Ad Image"}
          </Button>
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-navy">Generated Ad Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image, index) => {
              const evaluation = evaluations[image.metadata.image_id];
              return (
                <Card key={image.metadata.image_id} className="overflow-hidden">
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={image.image_url}
                      alt="Generated ad"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjNmMyIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90">
                        {image.platform}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-sage">
                        {getPlatformDimensionsText(image.platform)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {image.generation_time.toFixed(1)}s
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Palette className="h-4 w-4" />
                        <span className="text-sm">{image.metadata.style}</span>
                      </div>
                      {image.metadata.text_overlay && (
                        <p className="text-sm text-gray-600 italic">
                          "{image.metadata.text_overlay}"
                        </p>
                      )}
                    </div>

                    {evaluation && (
                      <div className="bg-gray-50 p-3 rounded mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Quality Score</span>
                          <span className={`font-bold ${getScoreColor(evaluation.overall_score)}`}>
                            {(evaluation.overall_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Visual: {(evaluation.visual_appeal * 100).toFixed(0)}%</div>
                          <div>Platform: {(evaluation.platform_optimization * 100).toFixed(0)}%</div>
                          <div>Readability: {(evaluation.text_readability * 100).toFixed(0)}%</div>
                          <div>Engagement: {(evaluation.engagement_prediction * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEvaluate(image)}
                        disabled={evaluateAdMutation.isPending}
                      >
                        <BarChart3 className="mr-1 h-3 w-3" />
                        {evaluation ? "Re-evaluate" : "Evaluate"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-3 w-3" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}