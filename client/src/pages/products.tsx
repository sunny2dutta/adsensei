import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Store, Zap, Package, Eye, Globe, Sparkles, RefreshCw, Download, CheckCircle } from "lucide-react";

interface ShopifyProduct {
  id: string;
  shopifyProductId: string;
  title: string;
  description: string | null;
  vendor: string | null;
  productType: string | null;
  tags: string[] | null;
  images: Array<{
    id: number;
    src: string;
    alt: string | null;
  }>;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice: number | null;
    inventoryQuantity: number | null;
  }>;
  price: number;
  handle: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface GeneratedAds {
  product: {
    id: string;
    title: string;
    price: number;
    images: Array<{
      id: number;
      src: string;
      alt: string | null;
    }>;
  };
  generatedAds: Array<{
    platform: string;
    language: string;
    adCopy: {
      headline: string;
      body: string;
      cta: string;
      hashtags?: string[];
      platform: string;
    };
    seoDescription: string;
    productImages: Array<{
      id: number;
      src: string;
      alt: string | null;
    }>;
    suggestedBudget: number;
    targetKeywords: string[];
  }>;
  bundleSuggestions: Array<{
    id: string;
    title: string;
    price: number;
    commonTags: string[];
  }>;
  message: string;
}

export default function Products() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["meta"]);
  const [targetAudience, setTargetAudience] = useState("");
  const [brandVoice, setBrandVoice] = useState("professional");
  const [languages, setLanguages] = useState<string[]>(["en"]);

  // Query for Shopify products
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<ShopifyProduct[]>({
    queryKey: ['/api/shopify/products', user?.id],
    enabled: !!user?.id
  });

  // Mutation for connecting Shopify
  const connectShopifyMutation = useMutation({
    mutationFn: async (data: { userId: string; storeDomain: string; accessToken: string }) => {
      const response = await apiRequest('POST', '/api/shopify/connect', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shopify store connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect Shopify store",
        variant: "destructive"
      });
    }
  });

  // Mutation for syncing products
  const syncProductsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('POST', '/api/shopify/sync-products', { userId });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: data.message || "Products synced successfully!",
      });
      refetchProducts();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync products",
        variant: "destructive"
      });
    }
  });

  // Mutation for generating ads
  const generateAdsMutation = useMutation<GeneratedAds, Error, {
    productId: string;
    platforms: string[];
    targetAudience?: string;
    brandVoice?: string;
    languages?: string[];
  }>({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/shopify/generate-product-ads', data);
      return response.json();
    },
    onSuccess: (data: GeneratedAds) => {
      toast({
        title: "Ads Generated",
        description: `Generated ${data.generatedAds.length} ads for ${data.product.title}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate ads",
        variant: "destructive"
      });
    }
  });

  const handleShopifyConnect = () => {
    if (!user?.id || !shopifyDomain || !accessToken) return;
    
    const cleanDomain = shopifyDomain.replace(/https?:\/\//, '').replace('.myshopify.com', '');
    
    connectShopifyMutation.mutate({
      userId: user.id,
      storeDomain: cleanDomain,
      accessToken
    });
  };

  const handleSyncProducts = () => {
    if (!user?.id) return;
    syncProductsMutation.mutate(user.id);
  };

  const handleGenerateAds = () => {
    if (!selectedProduct) return;
    
    generateAdsMutation.mutate({
      productId: selectedProduct.id,
      platforms: selectedPlatforms,
      targetAudience,
      brandVoice,
      languages
    });
  };

  const isShopifyConnected = user?.shopifyConnected;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Products</h1>
          <p className="text-charcoal/70 mt-1">Connect your Shopify store and generate platform-specific ads from your products</p>
        </div>
        {isShopifyConnected && (
          <Button 
            onClick={handleSyncProducts} 
            disabled={syncProductsMutation.isPending}
            className="bg-sage hover:bg-sage/90"
            data-testid="button-sync-products"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncProductsMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Products
          </Button>
        )}
      </div>

      <Tabs defaultValue={isShopifyConnected ? "products" : "connect"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connect" data-testid="tab-connect">
            <Store className="mr-2 h-4 w-4" />
            Shopify Connection
          </TabsTrigger>
          <TabsTrigger value="products" disabled={!isShopifyConnected} data-testid="tab-products">
            <Package className="mr-2 h-4 w-4" />
            Products ({products.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5" />
                Connect Your Shopify Store
              </CardTitle>
              <CardDescription>
                Connect your Shopify store to automatically import products and generate platform-specific ads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isShopifyConnected ? (
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Shopify Connected</p>
                    <p className="text-sm text-green-700">
                      Store: {user.shopifyStoreDomain}.myshopify.com
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="shopify-domain">Store Domain</Label>
                    <Input
                      type="text"
                      id="shopify-domain"
                      placeholder="your-store-name"
                      value={shopifyDomain}
                      onChange={(e) => setShopifyDomain(e.target.value)}
                      data-testid="input-shopify-domain"
                    />
                    <p className="text-xs text-charcoal/60">.myshopify.com</p>
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="access-token">Private App Access Token</Label>
                    <Input
                      type="password"
                      id="access-token"
                      placeholder="shpat_..."
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      data-testid="input-access-token"
                    />
                    <p className="text-xs text-charcoal/60">
                      Create a private app in your Shopify admin with read permissions for products
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleShopifyConnect}
                    disabled={!shopifyDomain || !accessToken || connectShopifyMutation.isPending}
                    className="w-full max-w-sm bg-sage hover:bg-sage/90"
                    data-testid="button-connect-shopify"
                  >
                    {connectShopifyMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Store className="mr-2 h-4 w-4" />
                        Connect Shopify Store
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-charcoal/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                  <p className="text-charcoal/60 text-center mb-4">
                    Sync your Shopify products to get started generating ads
                  </p>
                  <Button 
                    onClick={handleSyncProducts}
                    disabled={syncProductsMutation.isPending}
                    data-testid="button-sync-first-time"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Import Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product: ShopifyProduct) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {product.images?.[0] && (
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={product.images[0].src} 
                            alt={product.images[0].alt || product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-navy mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg font-bold text-sage">
                          ${(product.price / 100).toFixed(2)}
                        </p>
                        {product.vendor && (
                          <Badge variant="secondary" className="text-xs">
                            {product.vendor}
                          </Badge>
                        )}
                      </div>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {product.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-sage hover:bg-sage/90"
                            onClick={() => setSelectedProduct(product)}
                            data-testid={`button-generate-ads-${product.id}`}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Ads
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Zap className="mr-2 h-5 w-5" />
                              Generate Ads for {selectedProduct?.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Platforms</Label>
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {['google', 'meta', 'tiktok'].map((platform) => (
                                  <div key={platform} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={platform}
                                      checked={selectedPlatforms.includes(platform)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedPlatforms([...selectedPlatforms, platform]);
                                        } else {
                                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                                        }
                                      }}
                                      data-testid={`checkbox-${platform}`}
                                    />
                                    <Label htmlFor={platform} className="capitalize">
                                      {platform === 'meta' ? 'Facebook/Instagram' : platform}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="target-audience">Target Audience</Label>
                              <Input
                                id="target-audience"
                                placeholder="Fashion-forward women, 25-40"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                data-testid="input-target-audience"
                              />
                            </div>

                            <div>
                              <Label htmlFor="brand-voice">Brand Voice</Label>
                              <Select value={brandVoice} onValueChange={setBrandVoice}>
                                <SelectTrigger data-testid="select-brand-voice">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="professional">Professional</SelectItem>
                                  <SelectItem value="casual">Casual</SelectItem>
                                  <SelectItem value="luxury">Luxury</SelectItem>
                                  <SelectItem value="playful">Playful</SelectItem>
                                  <SelectItem value="edgy">Edgy</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Languages</Label>
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {[
                                  { code: 'en', label: 'English' },
                                  { code: 'es', label: 'Spanish' },
                                  { code: 'fr', label: 'French' },
                                  { code: 'de', label: 'German' }
                                ].map((lang) => (
                                  <div key={lang.code} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={lang.code}
                                      checked={languages.includes(lang.code)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setLanguages([...languages, lang.code]);
                                        } else {
                                          setLanguages(languages.filter(l => l !== lang.code));
                                        }
                                      }}
                                      data-testid={`checkbox-lang-${lang.code}`}
                                    />
                                    <Label htmlFor={lang.code} className="text-sm">
                                      {lang.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Button 
                              onClick={handleGenerateAds}
                              disabled={selectedPlatforms.length === 0 || languages.length === 0 || generateAdsMutation.isPending}
                              className="w-full bg-sage hover:bg-sage/90"
                              data-testid="button-generate-ads-submit"
                            >
                              {generateAdsMutation.isPending ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Generating Ads...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Generate {selectedPlatforms.length * languages.length} Ads
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Ads Results */}
      {generateAdsMutation.data && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Generated Ads Results
            </CardTitle>
            <CardDescription>
              {generateAdsMutation.data.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {generateAdsMutation.data.generatedAds.map((ad, index) => (
                <Card key={index} className="border-l-4 border-l-sage">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        {ad.platform} - {ad.language.toUpperCase()}
                      </CardTitle>
                      <Badge className="bg-sage/10 text-sage">
                        ${ad.suggestedBudget}/day
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-charcoal/80 mb-1">Headline</h4>
                      <p className="font-medium">{ad.adCopy.headline}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-charcoal/80 mb-1">Body</h4>
                      <p className="text-sm">{ad.adCopy.body}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-charcoal/80 mb-1">Call to Action</h4>
                      <Badge variant="outline">{ad.adCopy.cta}</Badge>
                    </div>
                    {ad.adCopy.hashtags && ad.adCopy.hashtags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-charcoal/80 mb-1">Hashtags</h4>
                        <div className="flex flex-wrap gap-1">
                          {ad.adCopy.hashtags.map((hashtag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              #{hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-charcoal/80 mb-1">SEO Description</h4>
                      <p className="text-xs text-charcoal/70">{ad.seoDescription}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {generateAdsMutation.data.bundleSuggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Bundle Suggestions</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {generateAdsMutation.data.bundleSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="border border-dashed">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                        <p className="text-sage font-semibold">${(suggestion.price / 100).toFixed(2)}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {suggestion.commonTags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}