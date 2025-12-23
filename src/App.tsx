import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { ReadingSettingsProvider } from "@/hooks/useReadingSettings";
import BottomNavigation from "@/components/BottomNavigation";
import Index from "./pages/Index";
import QuranPage from "./pages/QuranPage";
import SurahPage from "./pages/SurahPage";
import MushafPage from "./pages/MushafPage";
import FavoritesPage from "./pages/FavoritesPage";
import SearchPage from "./pages/SearchPage";
import KhatmahPage from "./pages/KhatmahPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import ReadingStatsPage from "./pages/ReadingStatsPage";
import DailyWirdPage from "./pages/DailyWirdPage";
import TasbihPage from "./pages/TasbihPage";
import AzkarPage from "./pages/AzkarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <ReadingSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/surah/:surahNumber" element={<SurahPage />} />
                <Route path="/mushaf" element={<MushafPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/khatmah" element={<KhatmahPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/prayer-times" element={<PrayerTimesPage />} />
                <Route path="/reading-stats" element={<ReadingStatsPage />} />
                <Route path="/daily-wird" element={<DailyWirdPage />} />
                <Route path="/tasbih" element={<TasbihPage />} />
                <Route path="/azkar" element={<AzkarPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNavigation />
            </BrowserRouter>
          </TooltipProvider>
        </ReadingSettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
