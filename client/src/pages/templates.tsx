import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type Template } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import TemplateCard from "@/components/template-card";
import { Plus } from "lucide-react";

const TEMPLATE_CATEGORIES = [
  { value: "all", label: "All Templates" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "seasonal-sales", label: "Seasonal Sales" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "luxury", label: "Luxury" },
];

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" 
        ? "/api/templates" 
        : `/api/templates?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json() as Template[];
    },
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest("POST", `/api/templates/${templateId}/use`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template selected!",
        description: "Template usage has been recorded. You can now customize it for your campaign.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to use template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUseTemplate = (template: Template) => {
    useTemplateMutation.mutate(template.id);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading templates...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-inter font-bold text-4xl text-navy mb-4">Fashion-Focused Templates</h1>
        <p className="text-xl text-charcoal/80">Pre-built campaigns optimized for fashion brands</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {TEMPLATE_CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.value)}
            className={
              selectedCategory === category.value
                ? "bg-sage text-white"
                : "bg-gray-100 text-charcoal hover:bg-sage/10"
            }
            data-testid={`filter-${category.value}`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal/60 mb-4">No templates found in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
              onPreview={handlePreviewTemplate}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <Button 
          size="lg" 
          className="bg-navy hover:bg-navy/90 text-white"
          data-testid="button-create-custom-template"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Custom Template
        </Button>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              {previewTemplate.imageUrl && (
                <img 
                  src={previewTemplate.imageUrl} 
                  alt={previewTemplate.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="font-semibold text-navy mb-2">Description</h4>
                <p className="text-charcoal/80">{previewTemplate.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-navy mb-2">Ad Copy Template</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-charcoal font-mono">
                    {previewTemplate.adCopyTemplate}
                  </pre>
                </div>
              </div>
              {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-navy mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tags.map((tag, index) => (
                      <span key={index} className="bg-sage/20 text-sage px-2 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewTemplate(null)}
                  data-testid="button-close-preview"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="bg-sage hover:bg-sage/90 text-white"
                  data-testid="button-use-preview-template"
                >
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
