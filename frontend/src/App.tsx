import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import Console from "./pages/Console";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import './App.css'

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Console} />
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
