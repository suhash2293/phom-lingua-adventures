
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RegionService } from "@/services/RegionService";
import RegionRestriction from "@/components/RegionRestriction";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import LearnPage from "./pages/LearnPage";
import GamesPage from "./pages/GamesPage";
import ProfilePage from "./pages/ProfilePage";
import AccountDeletionPage from "./pages/AccountDeletionPage";
import AccountDeletionWebPage from "./pages/AccountDeletionWebPage";
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";
import DonationSuccessPage from "./pages/DonationSuccessPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import SetupAdminPage from "./pages/SetupAdminPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import AlphabetsPage from "./pages/AlphabetsPage";
import NumbersPage from "./pages/NumbersPage";
import DaysPage from "./pages/DaysPage";
import MonthsPage from "./pages/MonthsPage";
import WordMatchGame from "./pages/games/WordMatchGame";
import AudioChallengeGame from "./pages/games/AudioChallengeGame";
import SentenceBuilderGame from "./pages/games/SentenceBuilderGame";
import MemoryChallengeGame from "./pages/games/MemoryChallengeGame";
import WordScrambleGame from "./pages/games/WordScrambleGame";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import React, { useEffect, useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [regionCheck, setRegionCheck] = useState<{
    isAllowed: boolean;
    countryCode: string;
    isLoading: boolean;
  }>({
    isAllowed: true,
    countryCode: '',
    isLoading: true
  });

  const [showRegionRestriction, setShowRegionRestriction] = useState(false);

  useEffect(() => {
    const checkRegion = async () => {
      try {
        const result = await RegionService.checkCurrentUserRegion();
        setRegionCheck({
          ...result,
          isLoading: false
        });

        if (!result.isAllowed) {
          setShowRegionRestriction(true);
        }
      } catch (error) {
        console.error('Region check failed:', error);
        setRegionCheck({
          isAllowed: true,
          countryCode: 'US',
          isLoading: false
        });
      }
    };

    checkRegion();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/learn" element={<LearnPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/account-deletion" element={<AccountDeletionPage />} />
                  <Route path="/account-deletion-web" element={<AccountDeletionWebPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/donation-success" element={<DonationSuccessPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/setup-admin" element={<SetupAdminPage />} />
                  <Route path="/learn/:categoryId" element={<ModuleDetailPage />} />
                  <Route path="/learn/alphabets" element={<AlphabetsPage />} />
                  <Route path="/learn/numbers" element={<NumbersPage />} />
                  <Route path="/learn/days" element={<DaysPage />} />
                  <Route path="/learn/months" element={<MonthsPage />} />
                  <Route path="/games/word-match" element={<WordMatchGame />} />
                  <Route path="/games/audio-challenge" element={<AudioChallengeGame />} />
                  <Route path="/games/sentence-builder" element={<SentenceBuilderGame />} />
                  <Route path="/games/memory-challenge" element={<MemoryChallengeGame />} />
                  <Route path="/games/word-scramble" element={<WordScrambleGame />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>

            {/* Region Restriction Modal */}
            {showRegionRestriction && !regionCheck.isLoading && (
              <RegionRestriction 
                countryCode={regionCheck.countryCode}
                onDismiss={() => setShowRegionRestriction(false)}
              />
            )}
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
