import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BlurOverlay } from "@/components/BlurOverlay";
import { TransactionTicker } from "@/components/TransactionTicker";
import { useWallet } from "@/hooks/useWallet";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TranslationProvider } from "@/hooks/useTranslation";

// Pages
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import ProfileNew from "@/pages/ProfileNew";
import Community from "@/pages/Community";
import CommunityDetail from "@/pages/CommunityDetail";
import Raffles from "@/pages/Raffles";
import RaffleDetail from "@/pages/RaffleDetail";
import Donations from "@/pages/Donations";
import DonationDetail from "@/pages/DonationDetail";
import CreateRaffle from "@/pages/CreateRaffle";
import CreateDonation from "@/pages/CreateDonation";
import CountryProfile from "@/pages/CountryProfile";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Support from "@/pages/Support";

import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Force immediate scroll to top with multiple methods
    const scrollToTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      // Additional force with requestAnimationFrame
      requestAnimationFrame(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
      });
    };
    
    // Immediate scroll before render
    scrollToTop();
    
    // Multiple fallback scrolls
    const timeouts = [
      setTimeout(scrollToTop, 1),
      setTimeout(scrollToTop, 10),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100)
    ];
    
    return () => timeouts.forEach(clearTimeout);
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
        <Route path="/community/:id" component={CommunityDetail} />
        <Route path="/raffles" component={Raffles} />
        <Route path="/raffles/:id" component={RaffleDetail} />
        <Route path="/donations" component={Donations} />
        <Route path="/donations/:id" component={DonationDetail} />
        <Route path="/country/:countryCode" component={CountryProfile} />
        <Route path="/create-raffle" component={CreateRaffle} />
        <Route path="/create-donation" component={CreateDonation} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/support" component={Support} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AppContent() {
  const { isConnected, connection } = useWallet();
  
  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  // console.log('AppContent render:', { isConnected, hasConnection: !!connection });

  return (
    <div className="min-h-screen bg-white dark:bg-[#1D2025] text-gray-900 dark:text-white transition-colors duration-200 pb-12">
      <Navigation />
      <Router />
      <Footer />
      <TransactionTicker />
      {(!isConnected && !connection) && <BlurOverlay />}
    </div>
  );
}

function App() {
  // Global error handler for chart-related issues
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const message = event.message || '';
      if (message.includes('appendChild') || 
          message.includes('chart') ||
          message.includes('ResponsiveContainer') ||
          message.includes('ResizeObserver') ||
          message.includes('Cannot read properties of null')) {
        event.preventDefault();
        console.warn('Chart error suppressed:', message);
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || '';
      if (message.includes('appendChild') || 
          message.includes('chart') ||
          message.includes('ResponsiveContainer') ||
          message.includes('ResizeObserver')) {
        event.preventDefault();
        console.warn('Chart promise rejection suppressed:', message);
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <AppContent />
          <Toaster />
        </TranslationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
