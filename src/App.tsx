
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegionRestriction from "@/components/RegionRestriction";

// Pages
import Index from "./pages/Index";
import LearnPage from "./pages/LearnPage";
import GamesPage from "./pages/GamesPage";
import AboutPage from "./pages/AboutPage";
import DonatePage from "./pages/DonatePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SecuritySettingsPage from "./pages/SecuritySettingsPage";
import AdminPage from "./pages/AdminPage";
import SetupAdminPage from "./pages/SetupAdminPage";
import NotFound from "./pages/NotFound";
import AlphabetsPage from "./pages/AlphabetsPage";
import NumbersPage from "./pages/NumbersPage";
import DaysPage from "./pages/DaysPage";
import MonthsPage from "./pages/MonthsPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AccountDeletionPage from "./pages/AccountDeletionPage";
import AccountDeletionWebPage from "./pages/AccountDeletionWebPage";
import DonationSuccessPage from "./pages/DonationSuccessPage";

// Game pages
import WordMatchGame from "./pages/games/WordMatchGame";
import AudioChallengeGame from "./pages/games/AudioChallengeGame";
import SentenceBuilderGame from "./pages/games/SentenceBuilderGame";
import MemoryChallengeGame from "./pages/games/MemoryChallengeGame";
import WordScrambleGame from "./pages/games/WordScrambleGame";

import "./App.css";

const queryClient = new QueryClient();

// Component to conditionally render header based on route
const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Check if current route is a learn-related route
  const isLearnRoute = location.pathname.startsWith('/learn');
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isLearnRoute && <Header />}
      <main className={isLearnRoute ? "flex-1" : "flex-1"}>
        {children}
      </main>
      {!isLearnRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <RegionRestriction>
              <ConditionalLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/learn" element={<LearnPage />} />
                  <Route path="/learn/alphabets" element={<AlphabetsPage />} />
                  <Route path="/learn/numbers" element={<NumbersPage />} />
                  <Route path="/learn/days" element={<DaysPage />} />
                  <Route path="/learn/months" element={<MonthsPage />} />
                  <Route path="/learn/:categoryId" element={<ModuleDetailPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/games/word-match/:categoryId?" element={<WordMatchGame />} />
                  <Route path="/games/audio-challenge/:categoryId?" element={<AudioChallengeGame />} />
                  <Route path="/games/sentence-builder" element={<SentenceBuilderGame />} />
                  <Route path="/games/memory-challenge" element={<MemoryChallengeGame />} />
                  <Route path="/games/word-scramble/:categoryId?" element={<WordScrambleGame />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/donation-success" element={<DonationSuccessPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/security" element={<SecuritySettingsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/setup-admin" element={<SetupAdminPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/account-deletion" element={<AccountDeletionPage />} />
                  <Route path="/account-deletion-web" element={<AccountDeletionWebPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ConditionalLayout>
            </RegionRestriction>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
