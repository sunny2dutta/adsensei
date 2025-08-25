import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Zap, Users, ArrowRight, CheckCircle, Instagram, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Target,
      title: "AI Campaign Suggestions",
      description: "Get personalized campaign recommendations based on your brand values and target demographics.",
      color: "bg-sage/10 text-sage"
    },
    {
      icon: Zap,
      title: "AI Ad Copy Generator",
      description: "Generate compelling, conversion-focused ad copy tailored to your brand voice and platform.",
      color: "bg-coral/10 text-coral"
    },
    {
      icon: Instagram,
      title: "Direct Instagram Publishing",
      description: "Connect your Instagram account and publish campaigns instantly with optimized captions.",
      color: "bg-golden/10 text-golden"
    },
    {
      icon: Users,
      title: "Demographic Targeting",
      description: "Reach the right audience with smart demographic analysis and targeting recommendations.",
      color: "bg-navy/10 text-navy"
    }
  ];

  const benefits = [
    "AI-powered campaign creation in minutes",
    "Direct Instagram publishing integration",
    "Smart demographic targeting",
    "Campaign performance analytics",
    "Brand-specific content generation",
    "Template library for quick starts"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-sage rounded-2xl flex items-center justify-center mr-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <span className="font-inter font-bold text-4xl text-navy">StyleAI</span>
          </div>
          
          <h1 className="font-inter font-bold text-5xl lg:text-6xl text-navy mb-6 leading-tight">
            Your Fashion Marketing
            <span className="block text-sage">Command Center</span>
          </h1>
          
          <p className="text-xl text-charcoal/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create compelling campaigns, generate AI-powered ad copy, and publish directly to Instagram. 
            Everything you need to grow your D2C fashion brand with intelligent marketing automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => navigate("/onboarding")}
              className="bg-sage hover:bg-sage/90 text-white px-8 py-6 text-lg"
              data-testid="button-get-started"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-sage text-sage hover:bg-sage hover:text-white px-8 py-6 text-lg"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </div>

          {/* Demo Visual */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-sage/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-sage mr-2" />
                <span className="font-semibold text-navy">Campaign Performance</span>
              </div>
              <span className="text-sm text-sage bg-sage/10 px-3 py-1 rounded-full">Live Demo</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-sage mb-1">247K</div>
                <div className="text-charcoal/60">Total Reach</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-coral mb-1">3.2%</div>
                <div className="text-charcoal/60">Conversion Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-golden mb-1">4.8x</div>
                <div className="text-charcoal/60">ROAS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-4xl text-navy mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Powerful AI tools designed specifically for D2C fashion brands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-sage/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-navy mb-3 text-lg">{feature.title}</h3>
                  <p className="text-charcoal/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-sage/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-inter font-bold text-4xl text-navy mb-6">
                Built for Fashion Brands Like Yours
              </h2>
              <p className="text-lg text-charcoal/70 mb-8">
                Whether you're luxury, sustainable, or streetwear, our AI understands fashion industry nuances 
                and creates content that resonates with your target audience.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-sage mr-3 flex-shrink-0" />
                    <span className="text-charcoal/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-navy text-xl">Ready to Get Started?</h3>
                <p className="text-charcoal/70 mt-2">Join thousands of fashion brands already using StyleAI</p>
              </div>
              
              <Button
                onClick={() => navigate("/onboarding")}
                className="w-full bg-sage hover:bg-sage/90 text-white py-6 text-lg"
                data-testid="button-cta-get-started"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-charcoal/50 mt-4">
                No credit card required • Setup in 2 minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-inter font-bold text-3xl text-white mb-4">
            Transform Your Fashion Marketing Today
          </h2>
          <p className="text-cream/80 text-lg mb-8">
            Join the AI revolution in fashion marketing. Generate campaigns, create content, and grow your brand.
          </p>
          <Button
            onClick={() => navigate("/onboarding")}
            className="bg-sage hover:bg-sage/90 text-white px-8 py-6 text-lg"
            data-testid="button-footer-cta"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}