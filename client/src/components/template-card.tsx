import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Star } from "lucide-react";
import { Template } from "@shared/schema";

interface TemplateCardProps {
  template: Template;
  onUse?: (template: Template) => void;
  onPreview?: (template: Template) => void;
}

export default function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "new-arrivals": return "bg-sage text-white";
      case "seasonal-sales": return "bg-coral text-white";
      case "lifestyle": return "bg-golden text-navy";
      case "luxury": return "bg-navy text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="hover:shadow-2xl transition-shadow border-sage/20 overflow-hidden group" data-testid={`template-card-${template.id}`}>
      <div className="relative">
        {template.imageUrl && (
          <img 
            src={template.imageUrl} 
            alt={template.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
          />
        )}
        <div className="absolute top-4 right-4">
          {template.isPopular ? (
            <Badge className="bg-sage text-white">Popular</Badge>
          ) : (
            <Badge className={getCategoryColor(template.category)}>
              {getCategoryLabel(template.category)}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-inter font-semibold text-xl text-navy mb-2">{template.name}</h3>
        <p className="text-charcoal/70 mb-4">{template.description}</p>
        <div className="flex items-center space-x-4 mb-4 text-sm text-charcoal/60">
          <span data-testid={`template-usage-${template.id}`}>
            <Eye className="inline mr-1 h-3 w-3" />
            {template.usageCount} uses
          </span>
          <span data-testid={`template-rating-${template.id}`}>
            <Star className="inline mr-1 h-3 w-3 fill-current text-golden" />
            {template.rating} rating
          </span>
        </div>
        <div className="flex space-x-3">
          {onUse && (
            <Button 
              className="flex-1 bg-sage hover:bg-sage/90 text-white"
              onClick={() => onUse(template)}
              data-testid={`button-use-template-${template.id}`}
            >
              Use Template
            </Button>
          )}
          {onPreview && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPreview(template)}
              className="border-gray-200 hover:border-sage"
              data-testid={`button-preview-template-${template.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
