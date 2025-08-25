import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight, Users, Target, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your Fashion Marketing Command Center.",
      });
      // Store auth state and user info
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserId', data.user.id);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleSignup = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10 flex items-center justify-center py-12">
      <div className="w-full max-w-6xl mx-4 flex items-center justify-center gap-12">
        {/* Left side - Branding & Features */}
        <div className="hidden lg:block flex-1 max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="font-inter font-bold text-2xl text-navy">AdSensEI</span>
            </div>
            <h1 className="font-inter font-bold text-4xl text-navy mb-4 leading-tight">
              Your Fashion Marketing
              <span className="block text-sage">Command Center</span>
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Create compelling campaigns, generate AI-powered ad copy, and publish directly to Instagram. 
              Everything you need to grow your D2C fashion brand with intelligent marketing automation.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-sage" />
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">AI Campaign Suggestions</h3>
                <p className="text-charcoal/70">Get personalized campaign recommendations based on your brand values and target demographics.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-coral" />
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">AI Ad Copy Generator</h3>
                <p className="text-charcoal/70">Generate compelling, conversion-focused ad copy tailored to your brand voice and platform.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-golden" />
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">Instagram Publishing</h3>
                <p className="text-charcoal/70">Connect your Instagram account and publish campaigns directly with optimized captions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-sage/20">
            <CardHeader className="text-center">
              <div className="lg:hidden mb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center mr-3">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-inter font-bold text-xl text-navy">AdSensEI</span>
                </div>
              </div>
              <CardTitle className="text-2xl text-navy">
                {isLogin ? "Welcome Back" : "Get Started"}
              </CardTitle>
              <p className="text-charcoal/70">
                {isLogin 
                  ? "Sign in to your Fashion Marketing Command Center" 
                  : "Create your account to start building amazing campaigns"
                }
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

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

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-sage hover:bg-sage/90 text-white"
                  data-testid="button-login"
                >
                  {loginMutation.isPending 
                    ? "Signing in..." 
                    : isLogin 
                      ? "Sign In" 
                      : "Create Account"
                  }
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-charcoal/60">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </p>
                {isLogin ? (
                  <Button
                    variant="link"
                    onClick={handleSignup}
                    className="text-sage hover:text-sage/80 p-0 h-auto"
                    data-testid="button-signup"
                  >
                    Sign up for free
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(true)}
                    className="text-sage hover:text-sage/80 p-0 h-auto"
                    data-testid="button-switch-login"
                  >
                    Sign in here
                  </Button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-charcoal/50">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}