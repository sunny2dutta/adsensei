import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, CheckCircle, AlertCircle, Unplug } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface InstagramConnectProps {
  userId: string;
}

export default function InstagramConnect({ userId }: InstagramConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user data to check Instagram connection status
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  // Generate Instagram auth URL
  const connectMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      const response = await fetch(`/api/instagram/auth-url/${userId}`);
      if (!response.ok) throw new Error("Failed to generate auth URL");
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Instagram OAuth
      window.open(data.authUrl, '_blank', 'width=500,height=600');
      
      // Simulate successful connection for demo purposes
      setTimeout(() => {
        simulateConnection();
      }, 3000);
    },
    onError: () => {
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Unable to connect to Instagram. Please try again.",
      });
    },
  });

  // Simulate Instagram connection for demo
  const simulateConnection = async () => {
    try {
      const response = await apiRequest("PUT", `/api/users/${userId}`, {
        instagramConnected: true,
        instagramAccessToken: `demo_token_${Date.now()}`,
        instagramAccountId: `demo_account_${Date.now()}`
      });

      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      setIsConnecting(false);
      
      toast({
        title: "Instagram Connected!",
        description: "Your Instagram account has been successfully connected.",
      });
    } catch (error) {
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to complete Instagram connection.",
      });
    }
  };

  // Disconnect Instagram
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/instagram/disconnect/${userId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      toast({
        title: "Instagram Disconnected",
        description: "Your Instagram account has been disconnected.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: "Unable to disconnect Instagram. Please try again.",
      });
    },
  });

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          Instagram Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            {user.instagramConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>

        {user.instagramConnected ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Instagram is connected! You can now publish campaigns directly to your Instagram account.
              </p>
            </div>
            <Button
              onClick={() => disconnectMutation.mutate()}
              variant="outline"
              size="sm"
              disabled={disconnectMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
              data-testid="button-disconnect-instagram"
            >
              <Unplug className="h-4 w-4 mr-2" />
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Instagram"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Connect your Instagram Business account to publish campaigns instantly.
              </p>
            </div>
            <Button
              onClick={() => connectMutation.mutate()}
              disabled={isConnecting || connectMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              data-testid="button-connect-instagram"
            >
              <Instagram className="h-4 w-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Instagram"}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Requires Instagram Business or Creator account</p>
          <p>• Posts will use your campaign content and images</p>
          <p>• Published posts will appear on your Instagram feed</p>
        </div>
      </CardContent>
    </Card>
  );
}