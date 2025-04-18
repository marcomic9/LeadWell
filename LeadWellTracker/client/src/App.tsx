import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Leads from "@/pages/leads";
import Calendar from "@/pages/calendar";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import LeadForm from "@/pages/lead-form";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* App routes */}
      <Route path="/" component={Home} />
      <Route path="/leads" component={Leads} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/team" component={Team} />
      <Route path="/settings" component={Settings} />
      <Route path="/lead-form" component={LeadForm} />
      {/* Fallback to 404 */}
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
