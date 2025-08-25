import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Target, TrendingUp, Instagram, Zap, Users, Crown } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-sage/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-inter font-bold text-xl text-navy">StyleAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/onboarding")}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/onboarding")}
                className="bg-sage hover:bg-sage/90 text-white"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-sage/10 text-sage border-sage/20 mb-6" data-testid="badge-ai-powered">
            <Sparkles className="mr-1 h-3 w-3" />
            AI-Powered Fashion Marketing
          </Badge>
          
          <h1 className="font-inter font-bold text-5xl md:text-6xl text-navy mb-6 leading-tight">
            Your Fashion Brand's
            <span className="block text-sage">Marketing Command Center</span>
          </h1>
          
          <p className="text-xl text-charcoal/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create compelling campaigns, generate AI-powered ad copy, and publish directly to Instagram. 
            Everything you need to grow your D2C fashion brand with intelligent marketing automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate("/onboarding")}
              className="bg-sage hover:bg-sage/90 text-white px-8 py-3 text-lg"
              data-testid="button-start-free-trial"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-sage text-sage hover:bg-sage/5 px-8 py-3 text-lg"
              data-testid="button-watch-demo"
            >
              Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl border border-sage/20 overflow-hidden">
              <div className="bg-gradient-to-r from-sage to-coral h-2"></div>
              <div className="p-8">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2015&q=80" 
                  alt="Fashion marketing dashboard interface" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-golden text-white px-4 py-2 rounded-full text-sm font-medium">
              <Crown className="inline mr-1 h-4 w-4" />
              Premium
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-4xl text-navy mb-4">
              Everything Your Fashion Brand Needs
            </h2>
            <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
              From AI-generated campaigns to instant Instagram publishing, 
              StyleAI gives you the tools to compete with the biggest brands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-sage/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-sage mb-4" />
                <CardTitle className="text-navy">AI Campaign Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal/70 mb-4">
                  Get personalized campaign recommendations based on your brand values, 
                  target demographics, and fashion industry trends.
                </p>
                <ul className="space-y-2 text-sm text-charcoal/60">
                  <li>• Demographic analysis & targeting</li>
                  <li>• Performance predictions</li>
                  <li>• Platform optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-coral/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-coral mb-4" />
                <CardTitle className="text-navy">AI Ad Copy Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal/70 mb-4">
                  Generate compelling, conversion-focused ad copy tailored to your brand voice 
                  and optimized for each social platform.
                </p>
                <ul className="space-y-2 text-sm text-charcoal/60">
                  <li>• Platform-specific optimization</li>
                  <li>• Brand voice consistency</li>
                  <li>• A/B testing variations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-golden/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Instagram className="h-12 w-12 text-golden mb-4" />
                <CardTitle className="text-navy">Instant Publishing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal/70 mb-4">
                  Connect your Instagram account and publish campaigns directly from the platform 
                  with optimized captions and hashtags.
                </p>
                <ul className="space-y-2 text-sm text-charcoal/60">
                  <li>• One-click Instagram posting</li>
                  <li>• Automated hashtag optimization</li>
                  <li>• Caption formatting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-sage/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-inter font-bold text-3xl text-navy mb-12">
            Trusted by Growing Fashion Brands
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <TrendingUp className="h-8 w-8 text-sage mx-auto mb-4" />
              <div className="text-2xl font-bold text-navy mb-2">150%</div>
              <div className="text-charcoal/70">Average CTR Improvement</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-8 w-8 text-coral mx-auto mb-4" />
              <div className="text-2xl font-bold text-navy mb-2">500+</div>
              <div className="text-charcoal/70">Fashion Brands Using StyleAI</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Sparkles className="h-8 w-8 text-golden mx-auto mb-4" />
              <div className="text-2xl font-bold text-navy mb-2">10M+</div>
              <div className="text-charcoal/70">Campaign Impressions Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy to-sage">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-inter font-bold text-4xl text-white mb-6">
            Ready to Transform Your Fashion Marketing?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join hundreds of fashion brands using AI to create better campaigns, 
            reach more customers, and grow faster.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/onboarding")}
            className="bg-white text-navy hover:bg-white/90 px-8 py-3 text-lg font-medium"
            data-testid="button-start-your-journey"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-inter font-bold text-xl text-navy">StyleAI</span>
            </div>
            <div className="text-sm text-charcoal/60">
              © 2025 StyleAI. Empowering fashion brands with AI.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}