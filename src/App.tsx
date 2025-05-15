
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import LearnPage from "./pages/LearnPage";
import AlphabetsPage from "./pages/AlphabetsPage";
import DaysPage from "./pages/DaysPage";
import MonthsPage from "./pages/MonthsPage";
import NumbersPage from "./pages/NumbersPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DonatePage from "./pages/DonatePage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import SetupAdminPage from "./pages/SetupAdminPage";
import NotFound from "./pages/NotFound";
import GamesPage from "./pages/GamesPage";
import WordMatchGame from "./pages/games/WordMatchGame";
import AudioChallengeGame from "./pages/games/AudioChallengeGame";
import WordScrambleGame from "./pages/games/WordScrambleGame";
import MemoryChallengeGame from "./pages/games/MemoryChallengeGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/alphabets" element={<AlphabetsPage />} />
                <Route path="/learn/days" element={<DaysPage />} />
                <Route path="/learn/months" element={<MonthsPage />} />
                <Route path="/learn/numbers" element={<NumbersPage />} />
                <Route path="/learn/:moduleId" element={<ModuleDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/setup-admin" element={<SetupAdminPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/games/word-match/:categoryId?" element={<WordMatchGame />} />
                <Route path="/games/audio-challenge/:categoryId?" element={<AudioChallengeGame />} />
                <Route path="/games/word-scramble/:categoryId?" element={<WordScrambleGame />} />
                <Route path="/games/memory-challenge/:categoryId?" element={<MemoryChallengeGame />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
