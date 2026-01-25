
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RegionRestriction from "./components/RegionRestriction";
import Index from "./pages/Index";
import GamesPage from "./pages/GamesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import AdminSignInPage from "./pages/AdminSignInPage";
import SetupAdminPage from "./pages/SetupAdminPage";
import NotFound from "./pages/NotFound";
import AlphabetsPage from "./pages/AlphabetsPage";
import NumbersPage from "./pages/NumbersPage";
import DaysPage from "./pages/DaysPage";
import MonthsPage from "./pages/MonthsPage";
import SeasonsPage from "./pages/SeasonsPage";
import GreetingsPage from "./pages/GreetingsPage";
import DonatePage from "./pages/DonatePage";
import DonationSuccessPage from "./pages/DonationSuccessPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WordMatchGame from "./pages/games/WordMatchGame";
import AudioChallengeGame from "./pages/games/AudioChallengeGame";
import MemoryChallengeGame from "./pages/games/MemoryChallengeGame";
import WordScrambleGame from "./pages/games/WordScrambleGame";
import SentenceBuilderGame from "./pages/games/SentenceBuilderGame";

import "./App.css";

const queryClient = new QueryClient();

// Component to render consistent layout for all pages
const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
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
                  <Route path="/alphabets" element={<AlphabetsPage />} />
                  <Route path="/numbers" element={<NumbersPage />} />
                  <Route path="/days" element={<DaysPage />} />
                  <Route path="/months" element={<MonthsPage />} />
                  <Route path="/seasons" element={<SeasonsPage />} />
                  <Route path="/greetings" element={<GreetingsPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/games/word-match/:categoryId?" element={<WordMatchGame />} />
                  <Route path="/games/audio-challenge/:categoryId?" element={<AudioChallengeGame />} />
                  <Route path="/games/sentence-builder" element={<SentenceBuilderGame />} />
                  <Route path="/games/memory-challenge" element={<MemoryChallengeGame />} />
                  <Route path="/games/word-scramble/:categoryId?" element={<WordScrambleGame />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/donation-success" element={<DonationSuccessPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/setup-admin" element={<SetupAdminPage />} />
                  <Route path="/admin-signin" element={<AdminSignInPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
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
