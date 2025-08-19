import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AddTrade from "@/pages/add-trade";
import Portfolio from "@/pages/portfolio";
import Journal from "@/pages/journal";
import AIInsights from "@/pages/ai-insights";
import RiskManagement from "@/pages/risk-management";
import Education from "@/pages/education";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/add-trade" component={AddTrade} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/journal" component={Journal} />
          <Route path="/ai-insights" component={AIInsights} />
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/education" component={Education} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
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
