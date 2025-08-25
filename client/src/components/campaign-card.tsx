import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Play, Pause, Instagram, ExternalLink } from "lucide-react";
import { Campaign } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CampaignCardProps {
  campaign: Campaign;
  onView?: (campaign: Campaign) => void;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  onToggleStatus?: (campaign: Campaign) => void;
  userInstagramConnected?: boolean;
}

export default function CampaignCard({ 
  campaign, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  userInstagramConnected = false
}: CampaignCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-golden/20 text-golden";
      case "draft": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "published": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Instagram publishing mutation
  const publishToInstagramMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/campaigns/${campaign.id}/publish-instagram`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Published to Instagram!",
        description: "Your campaign has been published to Instagram successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Publishing Failed",
        description: error.message || "Failed to publish to Instagram",
      });
    },
  });

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook": return "bg-blue-100 text-blue-800";
      case "instagram": return "bg-pink-100 text-pink-800";
      case "tiktok": return "bg-gray-100 text-gray-800";
      case "google": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatBudget = (budget: number | null) => {
    if (!budget) return "No budget set";
    return `$${(budget / 100).toLocaleString()}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-sage/20" data-testid={`campaign-card-${campaign.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-navy mb-2">{campaign.name}</CardTitle>
            <p className="text-sm text-charcoal/70 mb-3">{campaign.description}</p>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
              <Badge className={getPlatformColor(campaign.platform)}>
                {campaign.platform}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-charcoal/60">Budget:</span>
            <span className="font-medium text-charcoal">{formatBudget(campaign.budget)}</span>
          </div>
          {campaign.duration && (
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Duration:</span>
              <span className="font-medium text-charcoal">{campaign.duration} days</span>
            </div>
          )}
          {campaign.targetAudience && (
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Target:</span>
              <span className="font-medium text-charcoal">{campaign.targetAudience}</span>
            </div>
          )}
          {campaign.expectedReach && (
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Expected Reach:</span>
              <span className="font-medium text-charcoal">{campaign.expectedReach}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onView && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onView(campaign)}
              data-testid={`button-view-${campaign.id}`}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(campaign)}
              data-testid={`button-edit-${campaign.id}`}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onToggleStatus && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggleStatus(campaign)}
              data-testid={`button-toggle-${campaign.id}`}
            >
              {campaign.status === "active" ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(campaign)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid={`button-delete-${campaign.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Instagram Publishing Button */}
          {userInstagramConnected && campaign.platform === "instagram" && !campaign.publishedToInstagram && campaign.imageUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => publishToInstagramMutation.mutate()}
              disabled={publishToInstagramMutation.isPending}
              className="text-pink-600 border-pink-200 hover:bg-pink-50"
              data-testid={`button-publish-instagram-${campaign.id}`}
            >
              <Instagram className="h-4 w-4 mr-1" />
              {publishToInstagramMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
          
          {/* Instagram Post Link */}
          {campaign.publishedToInstagram && campaign.instagramPostId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(`https://www.instagram.com/p/${campaign.instagramPostId}/`, '_blank')}
              className="text-pink-600 border-pink-200 hover:bg-pink-50"
              data-testid={`button-view-instagram-${campaign.id}`}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Post
            </Button>
          )}
        </div>
        
        {/* Instagram Status */}
        {campaign.platform === "instagram" && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal/60">Instagram:</span>
              {campaign.publishedToInstagram ? (
                <Badge className="bg-green-100 text-green-800">
                  <Instagram className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : userInstagramConnected ? (
                <Badge className="bg-blue-100 text-blue-800">Ready to publish</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">Connect Instagram</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
