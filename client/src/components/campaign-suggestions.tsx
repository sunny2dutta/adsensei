import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lightbulb, Target, TrendingUp, Users, Sparkles, BarChart3, Eye, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const suggestionFormSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  brandType: z.string().min(1, "Brand type is required"),
  brandValues: z.string().optional(),
  targetDemographic: z.object({
    ageRange: z.string().min(1, "Age range is required"),
    gender: z.string().min(1, "Gender is required"),
    interests: z.array(z.string()).min(1, "At least one interest is required"),
    location: z.string().min(1, "Location is required")
  }),
  budget: z.number().optional(),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  seasonality: z.string().optional()
});

type SuggestionFormData = z.infer<typeof suggestionFormSchema>;

interface SuggestedCampaign {
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

interface SuggestionResponse {
  suggestions: SuggestedCampaign[];
  demographicAnalysis: string[];
  brandOptimization: string[];
}

export default function CampaignSuggestions() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [interestsInput, setInterestsInput] = useState("");
  const [platformsInput, setPlatformsInput] = useState<string[]>([]);

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      brandName: "",
      brandType: "",
      brandValues: "",
      targetDemographic: {
        ageRange: "",
        gender: "",
        interests: [],
        location: ""
      },
      budget: undefined,
      platforms: [],
      seasonality: ""
    }
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (data: SuggestionFormData) => {
      const response = await apiRequest("POST", "/api/generate-campaign-suggestions", {
        ...data,
        budget: data.budget ? Math.round(data.budget * 100) : undefined
      });
      return response.json();
    },
    onSuccess: (data: SuggestionResponse) => {
      setSuggestions(data);
      setIsDialogOpen(false);
      toast({
        title: "Campaign Suggestions Generated!",
        description: "AI has analyzed your brand and created personalized campaign recommendations.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Generate Suggestions",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: SuggestionFormData) => {
    generateSuggestionsMutation.mutate(data);
  };

  const addInterest = () => {
    if (interestsInput.trim()) {
      const currentInterests = form.getValues("targetDemographic.interests");
      form.setValue("targetDemographic.interests", [...currentInterests, interestsInput.trim()]);
      setInterestsInput("");
    }
  };

  const removeInterest = (index: number) => {
    const currentInterests = form.getValues("targetDemographic.interests");
    form.setValue("targetDemographic.interests", currentInterests.filter((_, i) => i !== index));
  };

  const togglePlatform = (platform: string) => {
    const currentPlatforms = form.getValues("platforms");
    if (currentPlatforms.includes(platform)) {
      form.setValue("platforms", currentPlatforms.filter(p => p !== platform));
    } else {
      form.setValue("platforms", [...currentPlatforms, platform]);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-golden" />
            AI Campaign Suggestions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Get personalized campaign recommendations based on your brand values and target demographics
          </p>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sage hover:bg-sage/90 text-white" data-testid="button-generate-suggestions">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Campaign Suggestions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Brand & Demographic Analysis</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Brand Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy">Brand Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-brand-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brandType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-brand-type">
                                  <SelectValue placeholder="Select brand type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="luxury">Luxury</SelectItem>
                                <SelectItem value="sustainable">Sustainable</SelectItem>
                                <SelectItem value="streetwear">Streetwear</SelectItem>
                                <SelectItem value="minimalist">Minimalist</SelectItem>
                                <SelectItem value="bohemian">Bohemian</SelectItem>
                                <SelectItem value="vintage">Vintage</SelectItem>
                                <SelectItem value="athletic">Athletic/Sportswear</SelectItem>
                                <SelectItem value="contemporary">Contemporary</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="brandValues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Values (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              placeholder="e.g., Sustainability, inclusivity, quality craftsmanship, ethical production..."
                              data-testid="textarea-brand-values"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Target Demographics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy">Target Demographics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targetDemographic.ageRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-age-range">
                                  <SelectValue placeholder="Select age range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="18-24">18-24</SelectItem>
                                <SelectItem value="25-34">25-34</SelectItem>
                                <SelectItem value="35-44">35-44</SelectItem>
                                <SelectItem value="45-54">45-54</SelectItem>
                                <SelectItem value="55+">55+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetDemographic.gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-gender">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="all">All genders</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="targetDemographic.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., United States, Europe, Global" data-testid="input-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Interests */}
                    <div>
                      <FormLabel>Target Interests</FormLabel>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={interestsInput}
                          onChange={(e) => setInterestsInput(e.target.value)}
                          placeholder="e.g., Fashion, Sustainability, Fitness"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                          data-testid="input-interests"
                        />
                        <Button type="button" onClick={addInterest} variant="outline" data-testid="button-add-interest">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.watch("targetDemographic.interests").map((interest, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer"
                            onClick={() => removeInterest(index)}
                          >
                            {interest} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Parameters */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy">Campaign Parameters</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Budget ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ""} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="e.g., 5000"
                                data-testid="input-budget"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="seasonality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seasonality (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-seasonality">
                                  <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="spring">Spring</SelectItem>
                                <SelectItem value="summer">Summer</SelectItem>
                                <SelectItem value="fall">Fall</SelectItem>
                                <SelectItem value="winter">Winter</SelectItem>
                                <SelectItem value="holiday">Holiday Season</SelectItem>
                                <SelectItem value="year-round">Year-round</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Platforms */}
                    <div>
                      <FormLabel>Target Platforms</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {["Instagram", "Facebook", "TikTok", "Pinterest", "Google Ads"].map((platform) => (
                          <Button
                            key={platform}
                            type="button"
                            variant={form.watch("platforms").includes(platform.toLowerCase()) ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePlatform(platform.toLowerCase())}
                            className={form.watch("platforms").includes(platform.toLowerCase()) ? "bg-sage text-white" : ""}
                            data-testid={`button-platform-${platform.toLowerCase()}`}
                          >
                            {platform}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-suggestions"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={generateSuggestionsMutation.isPending}
                      className="bg-sage hover:bg-sage/90 text-white"
                      data-testid="button-submit-suggestions"
                    >
                      {generateSuggestionsMutation.isPending ? "Generating..." : "Generate Suggestions"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Display Suggestions */}
      {suggestions && (
        <div className="space-y-6">
          {/* Demographic Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-coral" />
                Demographic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.demographicAnalysis.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-coral mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Brand Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-golden" />
                Brand Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.brandOptimization.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-golden mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Campaign Suggestions */}
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {suggestions.suggestions.map((campaign, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-navy mb-2">{campaign.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className="bg-sage/20 text-sage">{campaign.campaignType}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">{campaign.platform}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">{campaign.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="text-right">{campaign.targetAudience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reach:</span>
                      <span>{campaign.estimatedReach}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span>{campaign.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{campaign.duration}</span>
                    </div>
                  </div>

                  {/* Performance Prediction */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Performance Prediction</span>
                      <Badge className={getConfidenceColor(campaign.performancePrediction.confidence)}>
                        {campaign.performancePrediction.confidence}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">CTR:</span>
                        <span className="ml-1 font-medium">{campaign.performancePrediction.expectedCTR}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversions:</span>
                        <span className="ml-1 font-medium">{campaign.performancePrediction.expectedConversions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Messages */}
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Key Messages:</span>
                    <ul className="text-xs space-y-1">
                      {campaign.keyMessages.map((message, msgIndex) => (
                        <li key={msgIndex} className="flex items-start gap-1">
                          <span className="text-sage mt-1">•</span>
                          <span className="text-gray-600">{message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Suggested Hashtags:</span>
                    <div className="flex flex-wrap gap-1">
                      {campaign.hashtags.map((hashtag, hashIndex) => (
                        <Badge key={hashIndex} variant="outline" className="text-xs">
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Demographic Insights */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800 mb-1 block">Why This Works:</span>
                    <p className="text-xs text-blue-700">{campaign.demographicInsights}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}