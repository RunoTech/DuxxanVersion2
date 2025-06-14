import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BlurOverlay } from "@/components/BlurOverlay";
import { useWallet } from "@/hooks/useWallet";
import { useWebSocket } from "@/hooks/useWebSocket";

// Pages
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import ProfileNew from "@/pages/ProfileNew";
import Community from "@/pages/Community";
import Raffles from "@/pages/Raffles";
import RaffleDetail from "@/pages/RaffleDetail";
import Donations from "@/pages/Donations";
import DonationDetail from "@/pages/DonationDetail";
import CreateRaffle from "@/pages/CreateRaffle";
import CreateDonation from "@/pages/CreateDonation";
import CountryProfile from "@/pages/CountryProfile";

import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Force immediate scroll to top without any animation
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile-new" component={ProfileNew} />
        <Route path="/community" component={Community} />
        <Route path="/raffles" component={Raffles} />
        <Route path="/raffles/:id" component={RaffleDetail} />
        <Route path="/donations" component={Donations} />
        <Route path="/donations/:id" component={DonationDetail} />
        <Route path="/country/:countryCode" component={CountryProfile} />
        <Route path="/create-raffle" component={CreateRaffle} />
        <Route path="/create-donation" component={CreateDonation} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AppContent() {
  const { isConnected } = useWallet();
  
  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <Navigation />
      <Router />
      <Footer />
      {!isConnected && <BlurOverlay />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
