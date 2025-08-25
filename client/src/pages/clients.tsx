import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, History, Eye, Edit, Check, Clock, Upload, User, Send } from "lucide-react";
import { type Campaign, type Message } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Mock data - in real app this would come from API with proper user authentication
  const mockCampaign: Campaign = {
    id: "mock-campaign-1",
    userId: "mock-user-1",
    name: "Fall Fashion Campaign",
    description: "Cozy fall collection featuring sustainable materials and timeless designs",
    platform: "Instagram",
    status: "pending",
    budget: 250000, // $2,500 in cents
    targetAudience: "Women 25-40",
    expectedReach: "50K-75K",
    duration: 14,
    adCopy: "Embrace Autumn Elegance 🍂\n\nDiscover our cozy fall collection featuring sustainable materials and timeless designs. Limited quantities available - shop now for 20% off your first order!",
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockMessages: Message[] = [
    {
      id: "msg-1",
      campaignId: "mock-campaign-1",
      senderId: "agency-user",
      content: "Hi! I've prepared the fall campaign creative. The copy focuses on sustainability which aligns perfectly with your brand values. Let me know your thoughts!",
      isFromClient: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: "msg-2",
      campaignId: "mock-campaign-1",
      senderId: "client-user",
      content: "Love the direction! Could we adjust the CTA to be more urgency-focused? Maybe mention the limited quantities?",
      isFromClient: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    }
  ];

  const mockActivity = [
    {
      id: "act-1",
      type: "upload",
      title: "Campaign created",
      description: "Fall Fashion Campaign • 3 hours ago",
      icon: Upload,
      color: "sage"
    },
    {
      id: "act-2",
      type: "review",
      title: "Campaign reviewed",
      description: "Summer Collection • Yesterday",
      icon: Eye,
      color: "golden"
    },
    {
      id: "act-3",
      type: "approval",
      title: "Campaign approved",
      description: "Sustainable Line • 2 days ago",
      icon: Check,
      color: "green-500"
    }
  ];

  const handleApproveCampaign = () => {
    toast({
      title: "Campaign Approved!",
      description: "The campaign has been approved and will go live shortly.",
    });
  };

  const handleRequestChanges = () => {
    toast({
      title: "Changes Requested",
      description: "Your feedback has been sent to the team.",
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: "Message sent!",
      description: "Your message has been sent to the team.",
    });
    setNewMessage("");
  };

  const formatBudget = (budget: number | null) => {
    if (!budget) return "No budget set";
    return `$${(budget / 100).toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-inter font-bold text-4xl text-navy mb-4">Client Collaboration</h1>
        <p className="text-xl text-charcoal/80">Streamlined approval process and client communication</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Campaign Review Interface */}
        <div>
          <Card className="shadow-lg border-sage/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-inter text-2xl text-navy">Campaign Review</CardTitle>
                <Badge className="bg-golden/20 text-golden">
                  <Clock className="mr-1 h-3 w-3" />
                  Pending Approval
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Campaign Preview */}
              <div className="bg-gradient-to-br from-sage/10 to-coral/10 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg text-navy">{mockCampaign.name}</h4>
                  <div className="flex space-x-2">
                    <Badge className="bg-sage text-white">Facebook</Badge>
                    <Badge className="bg-coral text-white">Instagram</Badge>
                  </div>
                </div>
                
                {/* Mock ad preview */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  {mockCampaign.imageUrl && (
                    <img 
                      src={mockCampaign.imageUrl} 
                      alt="Fall collection preview"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="text-sm">
                    <div className="font-semibold text-charcoal mb-2">Embrace Autumn Elegance 🍂</div>
                    <p className="text-charcoal/70 mb-3">
                      "Discover our cozy fall collection featuring sustainable materials and timeless designs. 
                      Limited quantities available - shop now for 20% off your first order!"
                    </p>
                    <Button className="bg-sage text-white w-full" size="sm">
                      Shop Collection
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-charcoal/60">Budget:</span>
                    <span className="font-semibold text-charcoal ml-2" data-testid="campaign-budget">
                      {formatBudget(mockCampaign.budget)}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal/60">Duration:</span>
                    <span className="font-semibold text-charcoal ml-2" data-testid="campaign-duration">
                      {mockCampaign.duration} days
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal/60">Target Audience:</span>
                    <span className="font-semibold text-charcoal ml-2" data-testid="campaign-audience">
                      {mockCampaign.targetAudience}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal/60">Expected Reach:</span>
                    <span className="font-semibold text-charcoal ml-2" data-testid="campaign-reach">
                      {mockCampaign.expectedReach}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Actions */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleApproveCampaign}
                  className="flex-1 bg-sage hover:bg-sage/90 text-white"
                  data-testid="button-approve-campaign"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve Campaign
                </Button>
                <Button 
                  onClick={handleRequestChanges}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral hover:text-white"
                  data-testid="button-request-changes"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communication & History */}
        <div className="space-y-8">
          {/* Messages */}
          <Card className="shadow-lg border-sage/20">
            <CardHeader>
              <CardTitle className="font-inter text-lg text-navy">
                <MessageCircle className="mr-2 inline" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {mockMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex space-x-3 ${message.isFromClient ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback className={message.isFromClient ? "bg-coral" : "bg-sage"}>
                        <User className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className={`rounded-lg p-3 ${message.isFromClient ? 'bg-coral/10' : 'bg-sage/10'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-charcoal text-sm">
                            {message.isFromClient ? "You" : "Sarah (Account Manager)"}
                          </span>
                          <span className="text-xs text-charcoal/60">
                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : ""}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal/80">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  data-testid="input-new-message"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-sage hover:bg-sage/90 text-white"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaign History */}
          <Card className="shadow-lg border-sage/20">
            <CardHeader>
              <CardTitle className="font-inter text-lg text-navy">
                <History className="mr-2 inline" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivity.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div 
                      key={activity.id} 
                      className={`flex items-center space-x-3 p-3 bg-${activity.color}/5 rounded-lg`}
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className={`w-8 h-8 bg-${activity.color} rounded-full flex items-center justify-center`}>
                        <IconComponent className="text-white text-xs" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-charcoal text-sm">{activity.title}</div>
                        <div className="text-xs text-charcoal/60">{activity.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
