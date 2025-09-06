import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Target, Instagram, ArrowRight, User, Mail, Lock, Store, Package } from "lucide-react";

const adCreationSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.string().min(1, "Target audience is required"),
  brandVoice: z.string().min(1, "Brand voice is required"),
  platform: z.string().min(1, "Platform is required"),
  budget: z.number().min(10, "Budget must be at least $10").max(10000, "Budget must be less than $10,000"),
});

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required"),
});

type AdCreationForm = z.infer<typeof adCreationSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

interface GeneratedAd {
  headline: string;
  body: string;
  cta: string;
  hashtags?: string[];
  platform: string;
  image?: {
    image_path: string;
    image_url: string;
    platform: string;
    dimensions: { width: number; height: number };
    generation_time: number;
    metadata: any;
  };
}

export default function CreateAd() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<'choose' | 'create' | 'preview' | 'signup' | 'saved'>('choose');
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [adData, setAdData] = useState<AdCreationForm | null>(null);

  const adForm = useForm<AdCreationForm>({
    resolver: zodResolver(adCreationSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      targetAudience: "",
      brandVoice: "professional",
      platform: "",
      budget: 100,
    },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      companyName: "",
    },
  });

  // Generate ad copy mutation
  const generateAdMutation = useMutation({
    mutationFn: async (data: AdCreationForm) => {
      // Generate ad copy
      const copyResponse = await apiRequest('POST', '/api/generate-ad-copy', {
        brandType: 'fashion',
        brandName: data.productName,
        productCategory: 'Fashion',
        targetAudience: data.targetAudience,
        platform: data.platform,
        campaignObjective: 'conversion',
        brandValues: data.productDescription,
        tone: data.brandVoice
      });
      const adCopy = await copyResponse.json();
      
      // Generate ad image
      let adImage = null;
      try {
        const imageResponse = await apiRequest('POST', '/api/generate-ad-image', {
          prompt: `${data.productName}, ${data.productDescription}`,
          platform: data.platform === 'meta' ? 'instagram' : data.platform,
          text_overlay: adCopy.headline,
          style: 'minimalist'
        });
        adImage = await imageResponse.json();
      } catch (error) {
        console.warn('Image generation failed, continuing with text only:', error);
      }
      
      return { ...adCopy, image: adImage };
    },
    onSuccess: (result: GeneratedAd) => {
      setGeneratedAd(result);
      setStep('preview');
      toast({
        title: "Ad Generated!",
        description: "Your AI-powered ad copy is ready for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate ad",
        variant: "destructive"
      });
    }
  });

  // Create account and save ad mutation
  const createAccountMutation = useMutation({
    mutationFn: async (signUpData: SignUpForm) => {
      // First create the account
      const signUpResponse = await apiRequest('POST', '/api/auth/register', signUpData);
      const userData = await signUpResponse.json();
      
      // Set authentication
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserId', userData.user.id);
      localStorage.setItem('currentUser', JSON.stringify(userData.user));
      
      // Save the campaign with the new user ID
      if (adData && generatedAd) {
        const campaignResponse = await apiRequest('POST', '/api/campaigns', {
          userId: userData.user.id,
          name: `${adData.productName} Campaign`,
          description: adData.productDescription,
          platform: adData.platform,
          status: 'draft',
          budget: Math.round(adData.budget * 100), // Convert to cents
          targetAudience: adData.targetAudience,
          adCopy: `${generatedAd.headline}\n\n${generatedAd.body}\n\n${generatedAd.cta}`,
          imageUrl: generatedAd.image?.image_url || null,
          expectedReach: null,
          duration: null,
        });
        
        return { user: userData.user, campaign: await campaignResponse.json() };
      }
      
      return { user: userData.user };
    },
    onSuccess: () => {
      setStep('saved');
      toast({
        title: "Account Created & Ad Saved!",
        description: "Welcome to AdSensEI! Your ad has been saved to your campaigns.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive"
      });
    }
  });

  const handleCreateAd = (data: AdCreationForm) => {
    setAdData(data);
    generateAdMutation.mutate(data);
  };

  const handleSaveAd = () => {
    if (isAuthenticated && user) {
      // User is already logged in, save directly
      // Implementation for saving ad for existing user
      setStep('saved');
    } else {
      // Prompt for sign up
      setStep('signup');
    }
  };

  const handleSignUp = (data: SignUpForm) => {
    createAccountMutation.mutate(data);
  };

  if (step === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-sage mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-navy mb-4">Create Your First Ad</h1>
              <p className="text-xl text-charcoal/70">
                Choose how you'd like to get started
              </p>
            </div>

            <div className="grid gap-6">
              {/* Manual Ad Creation Option */}
              <Card className="border-2 border-sage/20 hover:border-sage transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sage/10 rounded-lg flex items-center justify-center group-hover:bg-sage group-hover:text-white transition-colors">
                      <Zap className="h-6 w-6 text-sage group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-navy mb-2">Enter Product Details Manually</h3>
                      <p className="text-charcoal/70 mb-4">
                        Input your product information and let our AI generate platform-specific ads for Google, Meta, and TikTok.
                      </p>
                      <div className="flex items-center text-sm text-sage">
                        <Target className="h-4 w-4 mr-1" />
                        Quick setup, AI-powered copy generation
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setStep('create')}
                    className="w-full mt-4 bg-sage hover:bg-sage/90 text-white"
                    data-testid="button-manual-creation"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Enter Product Details
                  </Button>
                </CardContent>
              </Card>

              {/* Shopify Integration Option */}
              <Card className="border-2 border-coral/20 hover:border-coral transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center group-hover:bg-coral group-hover:text-white transition-colors">
                      <Store className="h-6 w-6 text-coral group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-navy mb-2">Import from Shopify Store</h3>
                      <p className="text-charcoal/70 mb-4">
                        Connect your Shopify store to import products with images, pricing, and descriptions automatically.
                      </p>
                      <div className="flex items-center text-sm text-coral">
                        <Package className="h-4 w-4 mr-1" />
                        Automatic import, bulk ad generation
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/products'}
                    className="w-full mt-4 bg-coral hover:bg-coral/90 text-white"
                    data-testid="button-shopify-integration"
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Connect Shopify Store
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-charcoal/60">
                Don't worry - you can always switch between methods later
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-sage mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-navy mb-4">Create Your First Ad</h1>
              <p className="text-xl text-charcoal/70">
                Tell us about your product and we'll generate platform-specific ad copy using AI
              </p>
            </div>

            <Card className="shadow-lg border-sage/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...adForm}>
                  <form onSubmit={adForm.handleSubmit(handleCreateAd)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={adForm.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Vintage Denim Jacket" {...field} data-testid="input-product-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={adForm.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-platform">
                                  <SelectValue placeholder="Choose platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="google">Google Ads</SelectItem>
                                <SelectItem value="meta">Facebook/Instagram</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={adForm.control}
                      name="productDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your product, its features, benefits, and what makes it special..."
                              className="min-h-[100px]"
                              {...field}
                              data-testid="textarea-product-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={adForm.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Fashion-forward women, 25-40" {...field} data-testid="input-target-audience" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={adForm.control}
                        name="brandVoice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Voice</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-brand-voice">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="luxury">Luxury</SelectItem>
                                <SelectItem value="playful">Playful</SelectItem>
                                <SelectItem value="edgy">Edgy</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={adForm.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Budget ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="10" 
                              max="10000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-budget"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-sage hover:bg-sage/90 text-white text-lg py-6"
                      disabled={generateAdMutation.isPending}
                      data-testid="button-generate-ad"
                    >
                      {generateAdMutation.isPending ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                          Generating Your Ad...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Generate My Ad with AI
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'preview' && generatedAd && adData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-coral mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-navy mb-4">Your Ad is Ready! ✨</h1>
              <p className="text-xl text-charcoal/70">
                Here's your AI-generated {adData.platform} ad copy
              </p>
            </div>

            <Card className="shadow-lg border-coral/20 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center capitalize">
                  <Instagram className="mr-2 h-5 w-5" />
                  {adData.platform} Ad Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display generated image if available */}
                {generatedAd.image && generatedAd.image.image_url && (
                  <div>
                    <h3 className="font-semibold text-navy mb-2">Generated Ad Image</h3>
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <img 
                        src={`http://localhost:8001${generatedAd.image.image_url}`}
                        alt="Generated ad image"
                        className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                        data-testid="img-generated-ad"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-navy mb-2">Headline</h3>
                  <p className="text-lg font-medium">{generatedAd.headline}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-navy mb-2">Body Copy</h3>
                  <p className="text-charcoal/80">{generatedAd.body}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-navy mb-2">Call to Action</h3>
                  <div className="inline-block bg-sage text-white px-4 py-2 rounded-lg font-medium">
                    {generatedAd.cta}
                  </div>
                </div>

                {generatedAd.hashtags && generatedAd.hashtags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-navy mb-2">Suggested Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedAd.hashtags.map((hashtag, index) => (
                        <span key={index} className="bg-sage/10 text-sage px-2 py-1 rounded-full text-sm">
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-golden/10 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 text-golden mr-2" />
                    <span className="font-medium text-golden">Campaign Details</span>
                  </div>
                  <div className="text-sm text-charcoal/70 space-y-1">
                    <p><strong>Product:</strong> {adData.productName}</p>
                    <p><strong>Target Audience:</strong> {adData.targetAudience}</p>
                    <p><strong>Daily Budget:</strong> ${adData.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('create')}
                className="flex-1"
                data-testid="button-edit-ad"
              >
                Edit Ad
              </Button>
              <Button 
                onClick={handleSaveAd}
                className="flex-1 bg-sage hover:bg-sage/90 text-white"
                data-testid="button-save-ad"
              >
                Save Ad & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-navy mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-navy mb-4">Save Your Ad</h1>
              <p className="text-charcoal/70">
                Create a free account to save your ad and access more features
              </p>
            </div>

            <Card className="shadow-lg border-navy/20">
              <CardContent className="pt-6">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} data-testid="input-signup-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} data-testid="input-signup-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a secure password" {...field} data-testid="input-signup-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Brand Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your brand name" {...field} data-testid="input-signup-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-navy hover:bg-navy/90 text-white"
                      disabled={createAccountMutation.isPending}
                      data-testid="button-create-account"
                    >
                      {createAccountMutation.isPending ? (
                        <>
                          <User className="mr-2 h-4 w-4 animate-pulse" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          Create Account & Save Ad
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-charcoal/60">
                    Already have an account? {" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sage"
                      onClick={() => window.location.href = '/login'}
                      data-testid="link-sign-in"
                    >
                      Sign in instead
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'saved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-navy mb-4">Welcome to AdSensEI! 🎉</h1>
            <p className="text-charcoal/70 mb-8">
              Your account has been created and your ad has been saved to your campaigns.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/campaigns'}
                className="w-full bg-sage hover:bg-sage/90 text-white"
                data-testid="button-view-campaigns"
              >
                View My Campaigns
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
                data-testid="button-go-dashboard"
              >
                Explore Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}