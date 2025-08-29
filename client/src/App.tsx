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
import Sidebar from "@/components/layout/sidebar";

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
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Dashboard />
            </div>
          </div>
        )}
      </Route>
      <Route path="/accounts">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Accounts />
            </div>
          </div>
        )}
      </Route>
      <Route path="/add-trade">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AddTrade />
            </div>
          </div>
        )}
      </Route>
      <Route path="/social-trading">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <SocialTrading />
            </div>
          </div>
        )}
      </Route>
      <Route path="/portfolio">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Portfolio />
            </div>
          </div>
        )}
      </Route>
      <Route path="/journal">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Journal />
            </div>
          </div>
        )}
      </Route>
      <Route path="/ai-insights">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AIInsights />
            </div>
          </div>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Profile />
            </div>
          </div>
        )}
      </Route>
      <Route path="/risk-management">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <RiskManagement />
            </div>
          </div>
        )}
      </Route>
  <Route path="/pricing" component={Pricing} />
  <Route path="/504" component={GatewayTimeout} />
  <Route path="/admin/cms" component={AdminCMS} />
  <Route path="/page/:slug" component={Page} />
      <Route path="/education">
        {() => (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Education />
            </div>
          </div>
        )}
      </Route>
      
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
