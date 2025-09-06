import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import Clients from "@/pages/clients";
import Products from "@/pages/products";
import CreateAd from "@/pages/create-ad";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/error-boundary";

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
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/create-ad" component={CreateAd} />
      
      {/* Home route */}
      <Route path="/">
        {isLoading ? (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-sage rounded-full animate-pulse mx-auto mb-4"></div>
              <p className="text-charcoal/70">Loading...</p>
            </div>
          </div>
        ) : isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <>
            <Navigation />
            <Landing />
          </>
        )}
      </Route>
      
      {/* Protected routes */}
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
      <Route path="/products">
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
