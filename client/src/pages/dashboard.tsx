import Hero from "@/components/hero";
import AICopyGenerator from "@/components/ai-copy-generator";
import CampaignSuggestions from "@/components/campaign-suggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, TrendingUp, Store, Brain, Rocket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  // Mock performance data - in real app this would come from API
  const performanceData = {
    activeCampaigns: 12,
    totalReach: "247K",
    conversionRate: "3.2%",
    roas: "4.8x"
  };

  return (
    <div className="min-h-screen bg-cream">
      <Hero />
      
      {/* Onboarding Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-inter font-bold text-4xl text-navy mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-xl text-charcoal/80">From setup to your first campaign in under 10 minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-sage to-sage/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Store className="text-white text-2xl" />
              </div>
              <h3 className="font-inter font-semibold text-xl text-navy mb-3">Connect Your Brand</h3>
              <p className="text-charcoal/70 mb-6">Tell us about your fashion brand, target audience, and brand voice in our intuitive setup wizard.</p>
              <div className="bg-sage/10 rounded-lg p-4">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                  alt="Modern office workspace" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <div className="text-left">
                  <div className="bg-white rounded p-2 shadow-sm mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-sage rounded-full" />
                      <span className="text-sm text-charcoal">Brand Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-coral to-coral/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Brain className="text-white text-2xl" />
              </div>
              <h3 className="font-inter font-semibold text-xl text-navy mb-3">AI Learns Your Style</h3>
              <p className="text-charcoal/70 mb-6">Our AI analyzes your brand aesthetics, voice, and successful fashion campaigns to understand your unique style.</p>
              <div className="bg-coral/10 rounded-lg p-4">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                  alt="Digital marketing team analyzing data" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <div className="text-left">
                  <div className="bg-white rounded p-2 shadow-sm mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal">Learning Progress</span>
                      <span className="text-sm text-coral font-semibold">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-coral h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-golden to-golden/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="text-white text-2xl" />
              </div>
              <h3 className="font-inter font-semibold text-xl text-navy mb-3">Launch Campaigns</h3>
              <p className="text-charcoal/70 mb-6">Generate compelling ad copy, create stunning visuals, and launch data-driven campaigns across all platforms.</p>
              <div className="bg-golden/10 rounded-lg p-4">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                  alt="Business analytics dashboard with growth charts" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <div className="text-left">
                  <div className="bg-white rounded p-2 shadow-sm mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal">Campaign Status</span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-16 bg-gradient-to-br from-cream to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-inter font-bold text-4xl text-navy mb-4">Your Fashion Marketing Command Center</h2>
            <p className="text-xl text-charcoal/80">Everything you need to create, manage, and optimize fashion campaigns</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <AICopyGenerator />

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <Card className="shadow-lg border-sage/20">
                <CardHeader>
                  <CardTitle className="font-inter text-lg text-navy">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/70">Active Campaigns</span>
                    <span className="font-bold text-sage" data-testid="stat-active-campaigns">{performanceData.activeCampaigns}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/70">Total Reach</span>
                    <span className="font-bold text-coral" data-testid="stat-total-reach">{performanceData.totalReach}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/70">Conv. Rate</span>
                    <span className="font-bold text-golden" data-testid="stat-conversion-rate">{performanceData.conversionRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/70">ROAS</span>
                    <span className="font-bold text-navy" data-testid="stat-roas">{performanceData.roas}</span>
                  </div>
                  <div className="mt-6">
                    <div className="bg-gradient-to-r from-sage/20 to-coral/20 rounded-lg p-4">
                      <img 
                        src="https://images.unsplash.com/photo-1590479773265-7464e5d48118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                        alt="Analytics dashboard with trending upward charts" 
                        className="w-full h-24 object-cover rounded opacity-75"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-sage/20">
                <CardHeader>
                  <CardTitle className="font-inter text-lg text-navy">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => navigate("/campaigns")}
                    variant="ghost" 
                    className="w-full justify-start p-3 h-auto border border-gray-200 hover:border-sage hover:bg-sage/5 group"
                    data-testid="button-quick-new-campaign"
                  >
                    <PlusCircle className="text-sage mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-medium text-charcoal">New Campaign</div>
                      <div className="text-sm text-charcoal/60">Start from template</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate("/clients")}
                    variant="ghost" 
                    className="w-full justify-start p-3 h-auto border border-gray-200 hover:border-coral hover:bg-coral/5 group"
                    data-testid="button-quick-review-pending"
                  >
                    <Eye className="text-coral mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-medium text-charcoal">Review Pending</div>
                      <div className="text-sm text-charcoal/60">3 campaigns need approval</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate("/analytics")}
                    variant="ghost" 
                    className="w-full justify-start p-3 h-auto border border-gray-200 hover:border-golden hover:bg-golden/5 group"
                    data-testid="button-quick-view-analytics"
                  >
                    <TrendingUp className="text-golden mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-medium text-charcoal">View Analytics</div>
                      <div className="text-sm text-charcoal/60">Detailed performance report</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Campaign Suggestions Section */}
        <div className="mt-12">
          <CampaignSuggestions />
        </div>
      </section>
    </div>
  );
}
