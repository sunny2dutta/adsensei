import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import Clients from "@/pages/clients";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-sage rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      {children}
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/campaigns">
        <ProtectedRoute>
          <Campaigns />
        </ProtectedRoute>
      </Route>
      <Route path="/templates">
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      <Route path="/clients">
        <ProtectedRoute>
          <Clients />
        </ProtectedRoute>
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
