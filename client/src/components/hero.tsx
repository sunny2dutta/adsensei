import { Button } from "@/components/ui/button";
import { Rocket, Play, CheckCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function Hero() {
  const [, navigate] = useLocation();
  return (
    <section className="relative bg-gradient-to-br from-navy via-navy/90 to-sage/20 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'><path d='M 100 0 L 0 0 0 100' fill='none' stroke='white' stroke-width='1'/></pattern></defs><rect width='100%' height='100%' fill='url(%23grid)'/></svg>")`
          }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="mb-12 lg:mb-0">
            <h1 className="font-inter font-bold text-5xl lg:text-6xl mb-6 leading-tight">
              AI-Powered Marketing for{" "}
              <span className="text-golden">Fashion Brands</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Transform your D2C fashion brand with intelligent ad copy, stunning campaigns, and data-driven insights. Scale your marketing with AI that understands fashion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate("/onboarding")}
                size="lg" 
                className="bg-golden hover:bg-golden/90 text-navy px-8 py-4 text-lg font-semibold transition-all hover:scale-105 hover:shadow-xl"
                data-testid="button-start-trial"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button 
                onClick={() => navigate("/templates")}
                variant="outline" 
                size="lg" 
                className="border-2 border-white/30 hover:bg-white/10 text-white px-8 py-4 text-lg font-semibold transition-all"
                data-testid="button-watch-demo"
              >
                <Play className="mr-2 h-5 w-5" />
                View Templates
              </Button>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center">
                <CheckCircle className="text-golden mr-2 h-4 w-4" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center">
                <Clock className="text-golden mr-2 h-4 w-4" />
                <span>Setup in Minutes</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <img 
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500" 
                alt="Fashion model in elegant studio setting" 
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-golden font-semibold">AI Campaign Generator</span>
                  <div className="w-6 h-6 bg-golden/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-golden rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-gray-200">
                  "Elevate your style with sustainable fashion that speaks to your soul..."
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-sage/30 rounded-lg p-3 text-center">
                  <div className="text-golden font-bold">+247%</div>
                  <div className="text-xs text-gray-300">CTR Increase</div>
                </div>
                <div className="bg-coral/30 rounded-lg p-3 text-center">
                  <div className="text-golden font-bold">89%</div>
                  <div className="text-xs text-gray-300">Time Saved</div>
                </div>
                <div className="bg-golden/30 rounded-lg p-3 text-center">
                  <div className="text-navy font-bold">5.2x</div>
                  <div className="text-xs text-navy">ROAS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
