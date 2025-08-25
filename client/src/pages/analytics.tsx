import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, MousePointer, ShoppingCart, DollarSign, TrendingUp, Brain } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7");

  // Mock performance data - in real app this would come from API
  const performanceMetrics = {
    impressions: 247800,
    clicks: 12400,
    conversions: 892,
    roas: 4.8,
    impressionsChange: 18.5,
    clicksChange: 24.8,
    conversionsChange: 31.2,
    roasChange: 12.3
  };

  const topCampaigns = [
    { name: "Summer Collection", category: "Fashion", platform: "Instagram", roas: 5.2 },
    { name: "Sustainable Line", category: "Eco", platform: "Facebook", roas: 4.8 },
    { name: "Weekend Sale", category: "Sale", platform: "TikTok", roas: 4.1 }
  ];

  const aiInsights = [
    {
      type: "timing",
      title: "Optimize Timing",
      message: "Your audience is most active between 7-9 PM. Consider shifting ad schedules.",
      color: "sage"
    },
    {
      type: "creative",
      title: "Creative Refresh",
      message: "Campaign fatigue detected. Try new visuals for 23% performance boost.",
      color: "coral"
    },
    {
      type: "budget",
      title: "Budget Allocation",
      message: "Shift 15% more budget to Instagram for optimal ROAS.",
      color: "golden"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-inter font-bold text-4xl text-navy mb-4">Performance Analytics</h1>
        <p className="text-xl text-charcoal/80">Data-driven insights to optimize your fashion campaigns</p>
      </div>

      {/* Metric Cards */}
      <div className="grid lg:grid-cols-4 gap-8 mb-8">
        <Card className="shadow-lg border-sage/20 text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="text-sage text-2xl" />
            </div>
            <div className="text-3xl font-bold text-navy mb-2" data-testid="metric-impressions">
              {performanceMetrics.impressions.toLocaleString()}
            </div>
            <div className="text-charcoal/70 font-medium">Total Impressions</div>
            <div className="text-sage text-sm mt-2">
              <TrendingUp className="inline mr-1 h-3 w-3" />
              +{performanceMetrics.impressionsChange}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-coral/20 text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MousePointer className="text-coral text-2xl" />
            </div>
            <div className="text-3xl font-bold text-navy mb-2" data-testid="metric-clicks">
              {performanceMetrics.clicks.toLocaleString()}
            </div>
            <div className="text-charcoal/70 font-medium">Total Clicks</div>
            <div className="text-coral text-sm mt-2">
              <TrendingUp className="inline mr-1 h-3 w-3" />
              +{performanceMetrics.clicksChange}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-golden/20 text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-golden text-2xl" />
            </div>
            <div className="text-3xl font-bold text-navy mb-2" data-testid="metric-conversions">
              {performanceMetrics.conversions}
            </div>
            <div className="text-charcoal/70 font-medium">Conversions</div>
            <div className="text-golden text-sm mt-2">
              <TrendingUp className="inline mr-1 h-3 w-3" />
              +{performanceMetrics.conversionsChange}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-navy/20 text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-navy text-2xl" />
            </div>
            <div className="text-3xl font-bold text-navy mb-2" data-testid="metric-roas">
              {performanceMetrics.roas}x
            </div>
            <div className="text-charcoal/70 font-medium">ROAS</div>
            <div className="text-navy text-sm mt-2">
              <TrendingUp className="inline mr-1 h-3 w-3" />
              +{performanceMetrics.roasChange}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Campaign Performance Chart */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-sage/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-inter text-2xl text-navy">Campaign Performance</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={timeRange === "7" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("7")}
                    className={timeRange === "7" ? "bg-sage/20 text-sage" : ""}
                    data-testid="filter-7-days"
                  >
                    7 Days
                  </Button>
                  <Button
                    variant={timeRange === "30" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("30")}
                    className={timeRange === "30" ? "bg-sage/20 text-sage" : ""}
                    data-testid="filter-30-days"
                  >
                    30 Days
                  </Button>
                  <Button
                    variant={timeRange === "90" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("90")}
                    className={timeRange === "90" ? "bg-sage/20 text-sage" : ""}
                    data-testid="filter-90-days"
                  >
                    90 Days
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chart placeholder */}
              <div className="h-64 bg-gradient-to-br from-sage/10 to-coral/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300" 
                  alt="Detailed business analytics dashboard" 
                  className="w-full h-full object-cover rounded-xl opacity-80"
                />
                <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="text-sage text-4xl mb-3 mx-auto" />
                    <p className="text-charcoal/70 font-medium">Interactive Performance Chart</p>
                    <p className="text-sm text-charcoal/50">Real-time campaign analytics</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-8 text-sm mt-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-sage rounded-full mr-2" />
                  <span className="text-charcoal/70">Impressions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-coral rounded-full mr-2" />
                  <span className="text-charcoal/70">Clicks</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-golden rounded-full mr-2" />
                  <span className="text-charcoal/70">Conversions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Campaigns & AI Insights */}
        <div className="space-y-8">
          {/* Top Campaigns */}
          <Card className="shadow-lg border-sage/20">
            <CardHeader>
              <CardTitle className="font-inter text-lg text-navy">
                <TrendingUp className="inline mr-2" />
                Top Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-sage/5 rounded-lg"
                  data-testid={`top-campaign-${index}`}
                >
                  <div>
                    <div className="font-medium text-charcoal">{campaign.name}</div>
                    <div className="text-sm text-charcoal/60">{campaign.category} • {campaign.platform}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sage">{campaign.roas}x</div>
                    <div className="text-sm text-charcoal/60">ROAS</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="shadow-lg border-sage/20">
            <CardHeader>
              <CardTitle className="font-inter text-lg text-navy">
                <Brain className="inline mr-2 text-sage" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-3 bg-${insight.color}/5 rounded-lg border-l-3 border-${insight.color}`}
                  data-testid={`ai-insight-${index}`}
                >
                  <div className="text-sm font-medium text-charcoal mb-1">{insight.title}</div>
                  <div className="text-xs text-charcoal/70">{insight.message}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
