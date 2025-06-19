import { Switch, Route, useLocation } from "wouter";
import { useEffect, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BlurOverlay } from "@/components/BlurOverlay";
import { TransactionTicker } from "@/components/TransactionTicker";
import { useWalletFixed as useWallet } from "@/hooks/useWalletFixed";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TranslationProvider } from "@/hooks/useTranslation";
import { AuthProvider } from "@/hooks/useAuth";

// Lazy load pages for better performance
import { lazy } from "react";
import Home from "@/pages/Home";

const Profile = lazy(() => import("@/pages/Profile"));
const ProfileNew = lazy(() => import("@/pages/ProfileNew"));
const Community = lazy(() => import("@/pages/Community"));
const CommunityDetail = lazy(() => import("@/pages/CommunityDetail"));
const Raffles = lazy(() => import("@/pages/Raffles"));
const RaffleDetail = lazy(() => import("@/pages/RaffleDetail"));
const Donations = lazy(() => import("@/pages/Donations"));
const DonationDetail = lazy(() => import("@/pages/DonationDetail"));
const CreateRaffle = lazy(() => import("@/pages/CreateRaffle"));
const CreateDonation = lazy(() => import("@/pages/CreateDonation"));
const CountryProfile = lazy(() => import("@/pages/CountryProfile"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Support = lazy(() => import("@/pages/Support"));

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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/profile" component={ProfileNew} />
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
      </Suspense>
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
      {!isConnected && <BlurOverlay />}
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
        <AuthProvider>
          <TranslationProvider>
            <AppContent />
            <Toaster />
          </TranslationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
