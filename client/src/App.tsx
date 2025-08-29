import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import SignIn from "@/pages/auth/signin";
import SignUp from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Accounts from "@/pages/accounts";
import AddTrade from "@/pages/add-trade";
import Portfolio from "@/pages/portfolio";
import Journal from "@/pages/journal";
import AIInsights from "@/pages/ai-insights";
import SocialTrading from "@/pages/social-trading";
import RiskManagement from "@/pages/risk-management";
import Education from "@/pages/education";
import Pricing from "@/pages/pricing";
import GatewayTimeout from "@/pages/gateway-timeout";
import AdminCMS from "@/pages/admin-cms";
import Page from "@/pages/page";
import Profile from "@/pages/profile";
import ResetPassword from "@/pages/reset-password";
import AppLayout from "./components/layout/AppLayout";

function AppRouter() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth/signin" component={SignIn} />
      <Route path="/auth/signup" component={SignUp} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/reset" component={ResetPassword} />

      {/* Protected Routes with Sidebar */}
      <Route path="/dashboard">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      <Route path="/accounts">
        <AppLayout>
          <Accounts />
        </AppLayout>
      </Route>
      <Route path="/add-trade">
        <AppLayout>
          <AddTrade />
        </AppLayout>
      </Route>
      <Route path="/social-trading">
        <AppLayout>
          <SocialTrading />
        </AppLayout>
      </Route>
      <Route path="/portfolio">
        <AppLayout>
          <Portfolio />
        </AppLayout>
      </Route>
      <Route path="/journal">
        <AppLayout>
          <Journal />
        </AppLayout>
      </Route>
      <Route path="/ai-insights">
        <AppLayout>
          <AIInsights />
        </AppLayout>
      </Route>
      <Route path="/profile">
        <AppLayout>
          <Profile />
        </AppLayout>
      </Route>
      <Route path="/risk-management">
        <AppLayout>
          <RiskManagement />
        </AppLayout>
      </Route>
      <Route path="/education">
        <AppLayout>
          <Education />
        </AppLayout>
      </Route>

      {/* Other Routes */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/504" component={GatewayTimeout} />
      <Route path="/admin/cms" component={AdminCMS} />
      <Route path="/page/:slug" component={Page} />

      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
