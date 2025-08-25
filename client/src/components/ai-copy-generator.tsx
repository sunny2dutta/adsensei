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
import { Wand2, Copy, Edit, Share, Plus, Save, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface GeneratedCopy {
  headline: string;
  body: string;
  cta: string;
  hashtags?: string[];
  platform: string;
}

export default function AICopyGenerator() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);
  const [formData, setFormData] = useState({
    brandType: "",
    brandName: "",
    productCategory: "",
    targetAudience: "",
    platform: "",
    campaignObjective: "",
    brandValues: "",
    tone: ""
  });

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/generate-ad-copy", data);
      return response.json();
    },
    onSuccess: (newCopy: GeneratedCopy) => {
      setGeneratedCopies(prev => [newCopy, ...prev]);
      toast({
        title: "Ad copy generated!",
        description: "Your new ad copy is ready for review.",
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

  const handleGenerate = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate AI ad copy.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!formData.brandType || !formData.brandName || !formData.platform) {
      toast({
        title: "Missing information",
        description: "Please fill in brand type, name, and platform at minimum.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(formData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Ad copy copied to clipboard.",
    });
  };

  return (
    <div className="lg:col-span-2">
      <Card className="shadow-lg border-sage/20 hover:shadow-xl transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-inter text-2xl text-navy">AI Ad Copy Generator</CardTitle>
            <div className="flex items-center space-x-2 bg-sage/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-sage rounded-full animate-pulse" />
              <span className="text-sage text-sm font-medium">AI Powered</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand-type">Brand Style</Label>
              <Select value={formData.brandType} onValueChange={(value) => setFormData(prev => ({ ...prev, brandType: value }))}>
                <SelectTrigger id="brand-type" data-testid="select-brand-type">
                  <SelectValue placeholder="Select brand style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="sustainable">Sustainable</SelectItem>
                  <SelectItem value="streetwear">Streetwear</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger id="platform" data-testid="select-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="pinterest">Pinterest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={formData.brandName}
                onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="Enter your brand name"
                data-testid="input-brand-name"
              />
            </div>

            <div>
              <Label htmlFor="product-category">Product Category</Label>
              <Input
                id="product-category"
                value={formData.productCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, productCategory: e.target.value }))}
                placeholder="e.g., Women's Dresses, Men's Sneakers"
                data-testid="input-product-category"
              />
            </div>

            <div>
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="e.g., Women 25-40, Fashion-conscious millennials"
                data-testid="input-target-audience"
              />
            </div>

            <div>
              <Label htmlFor="campaign-objective">Campaign Objective</Label>
              <Input
                id="campaign-objective"
                value={formData.campaignObjective}
                onChange={(e) => setFormData(prev => ({ ...prev, campaignObjective: e.target.value }))}
                placeholder="e.g., Drive sales, Brand awareness"
                data-testid="input-campaign-objective"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="brand-values">Brand Values (Optional)</Label>
            <Textarea
              id="brand-values"
              value={formData.brandValues}
              onChange={(e) => setFormData(prev => ({ ...prev, brandValues: e.target.value }))}
              placeholder="Describe your brand values, sustainability practices, etc."
              data-testid="textarea-brand-values"
            />
          </div>

          {/* Generated Copies */}
          {generatedCopies.length > 0 && (
            <div className="bg-sage/5 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Wand2 className="text-sage mr-2" />
                <span className="font-medium text-charcoal">Generated Ad Copy</span>
              </div>
              <div className="space-y-4">
                {generatedCopies.map((copy, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-sage">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-navy">
                        {copy.platform} Campaign - {copy.headline}
                      </span>
                      <span className="text-xs text-sage bg-sage/20 px-2 py-1 rounded">
                        Generated now
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-charcoal/80 font-medium">{copy.headline}</p>
                      <p className="text-charcoal/80">{copy.body}</p>
                      <p className="text-sage font-medium">{copy.cta}</p>
                      {copy.hashtags && copy.hashtags.length > 0 && (
                        <p className="text-sm text-charcoal/60">
                          {copy.hashtags.map(tag => `#${tag}`).join(' ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${copy.headline}\n\n${copy.body}\n\n${copy.cta}`)}
                        data-testid="button-copy-ad"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm" data-testid="button-edit-ad">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" data-testid="button-use-campaign">
                        <Share className="mr-1 h-3 w-3" />
                        Use in Campaign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <Button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="flex-1 bg-sage hover:bg-sage/90 text-white"
              data-testid="button-generate-copy"
            >
              {!isAuthenticated ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign In to Generate
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {generateMutation.isPending ? "Generating..." : "Generate New Copy"}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="border-sage text-sage hover:bg-sage hover:text-white"
              data-testid="button-save-all"
            >
              <Save className="mr-2 h-4 w-4" />
              Save All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
