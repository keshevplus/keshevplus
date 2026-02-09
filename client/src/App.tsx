import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Switch, Route } from "wouter";
import { ThemeProvider } from "@/hooks/useTheme";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import ChatWidget from "@/components/ChatWidget";
import Index from "./pages/Index";

const AdminPage = lazy(() => import("./pages/AdminPage"));
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
const NotFound = lazy(() => import("./pages/not-found"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        aria-label="Loading"
      />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/questionnaire/:type" component={QuestionnairePage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <AccessibilityWidget />
        <ChatWidget />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
