import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Store, Brain, Rocket, Crown, Leaf, Users, Lightbulb, Target, CheckCircle, Mail, Package, ShoppingBag, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import CampaignSuggestions from "@/components/campaign-suggestions";

const onboardingSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  brandDescription: z.string().optional(),
  targetMarket: z.string().optional(),
  monthlyBudget: z.string().optional(),
  primaryGoals: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Remove debug log

type OnboardingForm = z.infer<typeof onboardingSchema>;

const BRAND_TYPES = [
  { value: "luxury", label: "Luxury", icon: Crown, description: "High-end, premium fashion brands" },
  { value: "sustainable", label: "Sustainable", icon: Leaf, description: "Eco-friendly and ethical fashion" },
  { value: "streetwear", label: "Streetwear", icon: Users, description: "Urban, casual, trendy clothing" },
  { value: "minimalist", label: "Minimalist", icon: Store, description: "Clean, simple, timeless designs" },
];

const MARKETING_GOALS = [
  "Increase brand awareness",
  "Drive online sales",
  "Build email list",
  "Grow social media following",
  "Launch new products",
  "Improve customer retention"
];

export default function Onboarding() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [accountCreated, setAccountCreated] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  
  const totalSteps = 7; // Added step for choosing next action
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      brandType: "",
      brandDescription: "",
      targetMarket: "",
      monthlyBudget: "",
      primaryGoals: [],
    },
  });

  // State to track current field being checked to avoid stale data display
  const [currentCheckField, setCurrentCheckField] = useState<{email?: string; username?: string} | null>(null);

  // Check if email/username is available
  const checkAvailabilityMutation = useMutation({
    mutationFn: async (data: { email?: string; username?: string }) => {
      setCurrentCheckField(data);
      const response = await apiRequest("POST", "/api/auth/check-availability", data);
      const result = await response.json();
      console.log("Availability check result:", result, "for data:", data);
      return { ...result, checkedData: data };
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: OnboardingForm) => {
      const { confirmPassword, brandDescription, targetMarket, monthlyBudget, primaryGoals, ...userData } = data;
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      setTempUserId(data.user.id);
      sendVerificationEmailMutation.mutate({ userId: data.user.id });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send verification email mutation
  const sendVerificationEmailMutation = useMutation({
    mutationFn: async (data: { userId: string }) => {
      const response = await apiRequest("POST", "/api/auth/send-verification-email", data);
      return response.json();
    },
    onSuccess: (data) => {
      setVerificationToken(data.developmentToken); // For development only
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
      setCurrentStep(2); // Move to email verification step
    },
    onError: (error) => {
      toast({
        title: "Failed to send verification email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { token: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-email", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsEmailVerified(true);
      setAccountCreated(true);
      // Set authentication state and store user ID
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserId', data.user.id);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      // Store onboarding data for form pre-population
      const formData = form.getValues();
      localStorage.setItem('userOnboardingData', JSON.stringify({
        brandName: formData.companyName,
        brandType: formData.brandType,
        brandValues: formData.brandDescription,
        targetMarket: formData.targetMarket,
        monthlyBudget: formData.monthlyBudget,
        primaryGoals: selectedGoals
      }));
      toast({
        title: "Email verified successfully!",
        description: "Welcome to AdSensEI. Let's continue with your profile.",
      });
      setCurrentStep(3); // Move to next step
    },
    onError: (error) => {
      toast({
        title: "Failed to verify email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const nextStep = async () => {
    console.log("Next step clicked, current step:", currentStep);
    
    // Validate current step before proceeding
    let isStepValid = false;
    
    switch (currentStep) {
      case 1:
        isStepValid = await form.trigger(["username", "email", "password", "confirmPassword"]);
        
        // Always check availability during step validation
        if (isStepValid) {
          const formData = form.getValues();
          console.log("Checking availability for:", formData.email, formData.username);
          
          try {
            // Always do a fresh availability check
            const checkData: { email?: string; username?: string } = {};
            if (formData.email) checkData.email = formData.email;
            if (formData.username) checkData.username = formData.username;
            
            const availabilityResult = await checkAvailabilityMutation.mutateAsync(checkData);
            console.log("Availability result:", availabilityResult);
            
            if (availabilityResult.emailAvailable === false || 
                availabilityResult.usernameAvailable === false) {
              isStepValid = false;
              const errorMessage = [];
              if (availabilityResult.emailAvailable === false) {
                errorMessage.push(`The email "${formData.email}" is already registered`);
              }
              if (availabilityResult.usernameAvailable === false) {
                errorMessage.push(`The username "${formData.username}" is already taken`);
              }
              
              toast({
                title: "Account information not available",
                description: errorMessage.join(". "),
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Availability check failed:", error);
            toast({
              title: "Unable to verify availability",
              description: "Please try again",
              variant: "destructive",
            });
            isStepValid = false;
          }
        }
        
        console.log("Step 1 validation result:", isStepValid);
        console.log("Form errors:", form.formState.errors);
        
        // If valid, create the account and send verification email
        if (isStepValid) {
          const formData = form.getValues();
          createUserMutation.mutate(formData);
          return; // Don't increment step, mutation will handle navigation
        }
        break;
      case 2:
        // Email verification step - check if email is verified
        if (!isEmailVerified) {
          toast({
            title: "Email verification required",
            description: "Please verify your email before continuing.",
            variant: "destructive",
          });
          return;
        }
        isStepValid = true;
        break;
      case 3:
        isStepValid = await form.trigger(["companyName", "brandType"]);
        console.log("Step 3 validation result:", isStepValid);
        console.log("Form errors:", form.formState.errors);
        break;
      case 4:
        isStepValid = true; // Optional fields
        break;
      case 5:
        isStepValid = true; // Optional fields  
        break;
      case 6:
        isStepValid = true; // Choose action step
        break;
      case 7:
        // Move to dashboard - already logged in
        window.location.href = "/dashboard";
        return;
      default:
        isStepValid = true;
    }
    
    if (isStepValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!isStepValid) {
      console.log("Step validation failed, staying on current step");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: OnboardingForm) => {
    createUserMutation.mutate({ ...data, primaryGoals: selectedGoals });
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Store className="w-16 h-16 text-sage mx-auto mb-4" />
              <h2 className="font-inter font-bold text-2xl text-navy mb-2">Welcome to AdSensEI</h2>
              <p className="text-charcoal/70">Let's set up your fashion brand account</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  onBlur={(e) => {
                    const username = e.target.value.trim();
                    if (username && username.length >= 3) {
                      checkAvailabilityMutation.mutate({ username });
                    }
                  }}
                  data-testid="input-username"
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>
                )}
                {checkAvailabilityMutation.data?.usernameAvailable === false && 
                 checkAvailabilityMutation.data?.checkedData?.username === form.watch("username") && (
                  <p className="text-red-500 text-sm mt-1">This username is already taken</p>
                )}
                {checkAvailabilityMutation.data?.usernameAvailable === true && 
                 checkAvailabilityMutation.data?.checkedData?.username === form.watch("username") && 
                 form.watch("username") && form.watch("username").length >= 3 && (
                  <p className="text-green-500 text-sm mt-1">Username is available</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  onBlur={(e) => {
                    const email = e.target.value.trim();
                    if (email && email.includes('@')) {
                      checkAvailabilityMutation.mutate({ email });
                    }
                  }}
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
                {checkAvailabilityMutation.data?.emailAvailable === false && 
                 checkAvailabilityMutation.data?.checkedData?.email === form.watch("email") && (
                  <p className="text-red-500 text-sm mt-1">An account with this email already exists</p>
                )}
                {checkAvailabilityMutation.data?.emailAvailable === true && 
                 checkAvailabilityMutation.data?.checkedData?.email === form.watch("email") && 
                 form.watch("email") && form.watch("email").includes('@') && (
                  <p className="text-green-500 text-sm mt-1">Email is available</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  data-testid="input-confirm-password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Brain className="w-16 h-16 text-coral mx-auto mb-4" />
              <h2 className="font-inter font-bold text-2xl text-navy mb-2">Tell Us About Your Brand</h2>
              <p className="text-charcoal/70">Help us understand your fashion brand</p>
            </div>

            <div>
              <Label htmlFor="companyName">Brand/Company Name</Label>
              <Input
                id="companyName"
                {...form.register("companyName")}
                data-testid="input-company-name"
              />
              {form.formState.errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
              )}
            </div>

            <div>
              <Label>Brand Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {BRAND_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = form.watch("brandType") === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => form.setValue("brandType", type.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        isSelected 
                          ? "border-sage bg-sage/10 text-sage" 
                          : "border-gray-200 hover:border-sage text-charcoal"
                      }`}
                      data-testid={`brand-type-${type.value}`}
                    >
                      <IconComponent className="mb-2" />
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm opacity-70">{type.description}</div>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.brandType && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.brandType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brandDescription">Brand Description (Optional)</Label>
              <Textarea
                id="brandDescription"
                {...form.register("brandDescription")}
                placeholder="Tell us about your brand's story, values, and unique selling points..."
                data-testid="textarea-brand-description"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-golden mx-auto mb-4" />
              <h2 className="font-inter font-bold text-2xl text-navy mb-2">Target Market & Budget</h2>
              <p className="text-charcoal/70">Help us tailor campaigns to your audience</p>
            </div>

            <div>
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input
                id="targetMarket"
                {...form.register("targetMarket")}
                placeholder="e.g., Women 25-40, Fashion-conscious millennials"
                data-testid="input-target-market"
              />
            </div>

            <div>
              <Label htmlFor="monthlyBudget">Monthly Marketing Budget</Label>
              <Select onValueChange={(value) => form.setValue("monthlyBudget", value)}>
                <SelectTrigger data-testid="select-monthly-budget">
                  <SelectValue placeholder="Select your monthly budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-1k">Under $1,000</SelectItem>
                  <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25k-plus">$25,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Primary Marketing Goals</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {MARKETING_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                      selectedGoals.includes(goal)
                        ? "border-sage bg-sage/10 text-sage"
                        : "border-gray-200 hover:border-sage text-charcoal"
                    }`}
                    data-testid={`goal-${goal.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-navy mx-auto mb-4" />
              <h2 className="font-inter font-bold text-2xl text-navy mb-2">Ready to Launch!</h2>
              <p className="text-charcoal/70">Review your information and create your account</p>
            </div>

            <div className="bg-sage/5 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-charcoal/60">Email:</span>
                  <span className="font-medium text-charcoal ml-2">{form.watch("email")}</span>
                </div>
                <div>
                  <span className="text-charcoal/60">Username:</span>
                  <span className="font-medium text-charcoal ml-2">{form.watch("username")}</span>
                </div>
                <div>
                  <span className="text-charcoal/60">Brand:</span>
                  <span className="font-medium text-charcoal ml-2">{form.watch("companyName")}</span>
                </div>
                <div>
                  <span className="text-charcoal/60">Type:</span>
                  <span className="font-medium text-charcoal ml-2 capitalize">{form.watch("brandType")}</span>
                </div>
              </div>
              {selectedGoals.length > 0 && (
                <div>
                  <span className="text-charcoal/60">Goals:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedGoals.map((goal) => (
                      <span key={goal} className="bg-sage/20 text-sage px-2 py-1 rounded-full text-xs">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Rocket className="w-16 h-16 text-coral mx-auto mb-4" />
              <h2 className="font-inter font-bold text-2xl text-navy mb-2">How would you like to get started?</h2>
              <p className="text-charcoal/70">Choose the best way to create your first campaign</p>
            </div>

            <div className="grid gap-6">
              {/* Manual Ad Creation Option */}
              <Card className="border-2 border-sage/20 hover:border-sage transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sage/10 rounded-lg flex items-center justify-center group-hover:bg-sage group-hover:text-white transition-colors">
                      <ShoppingBag className="h-6 w-6 text-sage group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-navy mb-2">Create Ad Manually</h3>
                      <p className="text-charcoal/70 mb-4">
                        Input your product details manually and let our AI generate platform-specific ads for Google, Meta, and TikTok.
                      </p>
                      <div className="flex items-center text-sm text-sage">
                        <Zap className="h-4 w-4 mr-1" />
                        Quick setup, AI-powered copy generation
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/campaigns'}
                    className="w-full mt-4 bg-sage hover:bg-sage/90 text-white"
                    data-testid="button-manual-ad-creation"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Create My First Ad
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
                      <h3 className="font-semibold text-lg text-navy mb-2">Connect Shopify Store</h3>
                      <p className="text-charcoal/70 mb-4">
                        Import your entire product catalog from Shopify and generate ads automatically for each product with images, pricing, and descriptions.
                      </p>
                      <div className="flex items-center text-sm text-coral">
                        <Package className="h-4 w-4 mr-1" />
                        Bulk import, automated ad generation
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
              <p className="text-sm text-charcoal/60 mb-3">
                Don't worry - you can always switch between methods later
              </p>
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(6)}
                className="text-charcoal/70 border-charcoal/20"
                data-testid="button-skip-to-suggestions"
              >
                Skip for now, see campaign suggestions
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Lightbulb className="w-16 h-16 text-golden mx-auto mb-4" />
              <h2 className="font-inter font-bold text-2xl text-navy mb-2">Your Personalized Campaign Suggestions</h2>
              <p className="text-charcoal/70">Based on your brand profile, here are AI-generated campaign recommendations</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <CampaignSuggestions />
            </div>
            
            <div className="text-center bg-sage/5 rounded-lg p-4">
              <p className="text-sm text-charcoal/70 mb-3">
                ✨ Your campaigns are tailored to your <strong>{form.watch("brandType")}</strong> brand targeting <strong>{form.watch("targetMarket")}</strong>
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="bg-navy hover:bg-navy/90 text-white"
                data-testid="button-go-to-dashboard"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-sage/20">
        <CardHeader>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">{currentStep}</span>
              </div>
              <span className="text-charcoal/60">of {totalSteps} steps</span>
            </div>
            <Progress value={progress} className="w-full mb-4" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            {currentStep < 6 && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-sage hover:bg-sage/90 text-white"
                    data-testid="button-next"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={createUserMutation.isPending}
                    className="bg-navy hover:bg-navy/90 text-white"
                    data-testid="button-create-account"
                  >
                    {createUserMutation.isPending ? "Creating Account..." : "Create Account & Get Suggestions"}
                    <Rocket className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
