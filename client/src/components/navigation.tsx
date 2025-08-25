import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Wand2, Plus, User } from "lucide-react";

export default function Navigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/templates", label: "Templates" },
    { href: "/analytics", label: "Analytics" },
    { href: "/clients", label: "Clients" },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-sage/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Wand2 className="text-sage text-2xl mr-2" />
              <span className="font-inter font-bold text-xl text-navy">StyleAI</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <span
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        location === item.href || (location === "/" && item.href === "/dashboard")
                          ? "text-navy"
                          : "text-charcoal hover:text-sage"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate("/campaigns")}
              className="bg-sage hover:bg-sage/90 text-white"
              data-testid="button-new-campaign"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
            <Avatar>
              <AvatarFallback className="bg-coral text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}
