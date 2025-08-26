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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-sage to-coral rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="font-inter font-bold text-4xl bg-gradient-to-r from-sage to-coral bg-clip-text text-transparent">AdSensEI</span>
            </div>
            
            <h1 className="font-inter font-bold text-5xl lg:text-6xl text-navy mb-6 leading-tight">
              Your Fashion Marketing
              <span className="block bg-gradient-to-r from-sage via-coral to-golden bg-clip-text text-transparent">Command Center</span>
            </h1>
            
            <p className="text-xl text-charcoal/70 mb-8 leading-relaxed">
              Create compelling campaigns, generate AI-powered ad copy, and publish directly to Instagram. 
              Everything you need to grow your D2C fashion brand with intelligent marketing automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={() => navigate("/onboarding")}
                className="bg-gradient-to-r from-sage to-coral hover:from-sage/90 hover:to-coral/90 text-white px-8 py-6 text-lg shadow-lg"
                data-testid="button-get-started"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Clear any existing auth state to ensure clean login
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('currentUserId');
                  localStorage.removeItem('currentUser');
                  navigate("/login");
                }}
                className="border-2 border-sage text-sage hover:bg-sage hover:text-white px-8 py-6 text-lg"
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-6 text-center bg-gradient-to-r from-sage/10 via-coral/10 to-golden/10 rounded-2xl p-6">
              <div>
                <div className="text-2xl font-bold text-sage mb-1">247K</div>
                <div className="text-sm text-charcoal/60">Total Reach</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-coral mb-1">3.2%</div>
                <div className="text-sm text-charcoal/60">Conv. Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-golden mb-1">4.8x</div>
                <div className="text-sm text-charcoal/60">ROAS</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-sage/20 via-coral/20 to-golden/20 rounded-3xl p-8 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Fashion model in elegant studio setting" 
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              
              {/* Floating Campaign Stats */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-sage/20">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-sage mr-2" />
                  <span className="text-sm font-semibold text-navy">Live Campaign</span>
                </div>
                <div className="text-xs text-charcoal/60">+247% engagement today</div>
              </div>
              
              {/* Floating AI Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-coral to-golden text-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="text-sm font-semibold">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-white via-sage/5 to-coral/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-4xl text-navy mb-4">
              Everything You Need to 
              <span className="bg-gradient-to-r from-sage via-coral to-golden bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Powerful AI tools designed specifically for D2C fashion brands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity"
                       style={{
                         background: index % 4 === 0 ? 'linear-gradient(135deg, #8fbc8f, #ff7f7f)' :
                                   index % 4 === 1 ? 'linear-gradient(135deg, #ff7f7f, #ffd700)' :
                                   index % 4 === 2 ? 'linear-gradient(135deg, #ffd700, #8fbc8f)' :
                                   'linear-gradient(135deg, #1e3a8a, #8fbc8f)'
                       }} />
                  
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${feature.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-navy mb-3 text-lg relative z-10">{feature.title}</h3>
                  <p className="text-charcoal/70 leading-relaxed relative z-10">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-sage/10 via-coral/10 to-golden/10 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sage/5 via-coral/5 to-golden/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-inter font-bold text-4xl text-navy mb-6">
                Built for Fashion Brands 
                <span className="bg-gradient-to-r from-coral to-golden bg-clip-text text-transparent">Like Yours</span>
              </h2>
              <p className="text-lg text-charcoal/70 mb-8">
                Whether you're luxury, sustainable, or streetwear, our AI understands fashion industry nuances 
                and creates content that resonates with your target audience.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-colors">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      index % 3 === 0 ? 'bg-sage' : index % 3 === 1 ? 'bg-coral' : 'bg-golden'
                    }`}>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-charcoal/80 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sage via-coral to-golden rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-navy text-xl">Ready to Get Started?</h3>
                <p className="text-charcoal/70 mt-2">Join thousands of fashion brands already using AdSensEI</p>
              </div>
              
              <Button
                onClick={() => navigate("/onboarding")}
                className="w-full bg-gradient-to-r from-sage via-coral to-golden hover:from-sage/90 hover:via-coral/90 hover:to-golden/90 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
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
      <div className="bg-gradient-to-br from-navy via-navy/95 to-sage/20 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-coral/10 to-golden/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-inter font-bold text-3xl text-white mb-4">
            Transform Your Fashion Marketing 
            <span className="bg-gradient-to-r from-sage via-coral to-golden bg-clip-text text-transparent">Today</span>
          </h2>
          <p className="text-cream/80 text-lg mb-8">
            Join the AI revolution in fashion marketing. Generate campaigns, create content, and grow your brand.
          </p>
          <Button
            onClick={() => navigate("/onboarding")}
            className="bg-gradient-to-r from-sage via-coral to-golden hover:from-sage/90 hover:via-coral/90 hover:to-golden/90 text-white px-8 py-6 text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
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