import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import Clients from "@/pages/clients";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Authenticated routes */}
      <Route path="/dashboard">
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </Route>
      <Route path="/campaigns">
        <AuthenticatedLayout>
          <Campaigns />
        </AuthenticatedLayout>
      </Route>
      <Route path="/templates">
        <AuthenticatedLayout>
          <Templates />
        </AuthenticatedLayout>
      </Route>
      <Route path="/analytics">
        <AuthenticatedLayout>
          <Analytics />
        </AuthenticatedLayout>
      </Route>
      <Route path="/clients">
        <AuthenticatedLayout>
          <Clients />
        </AuthenticatedLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
