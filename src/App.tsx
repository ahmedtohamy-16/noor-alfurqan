import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { ReadingSettingsProvider } from "@/hooks/useReadingSettings";
import { GlobalAudioProvider } from "@/hooks/useGlobalAudio";
import { DownloadManagerProvider } from "@/components/DownloadManager";
import BottomNavigation from "@/components/BottomNavigation";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import Index from "./pages/Index";
import QuranPage from "./pages/QuranPage";
import SurahPage from "./pages/SurahPage";
import MushafPage from "./pages/MushafPage";
import FavoritesPage from "./pages/FavoritesPage";
import SearchPage from "./pages/SearchPage";
import KhatmahPage from "./pages/KhatmahPage";
import AuthPage from "./pages/AuthPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import ReadingStatsPage from "./pages/ReadingStatsPage";
import DailyWirdPage from "./pages/DailyWirdPage";
import TasbihPage from "./pages/TasbihPage";
import AzkarPage from "./pages/AzkarPage";
import ProphetStoriesPage from "./pages/ProphetStoriesPage";
import RuqyahPage from "./pages/RuqyahPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationSettingsPage from "./components/NotificationSettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ReadingSettingsProvider>
            <GlobalAudioProvider>
              <DownloadManagerProvider>
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
                    <Route path="/verify-otp" element={<VerifyOtpPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/prayer-times" element={<PrayerTimesPage />} />
                    <Route path="/reading-stats" element={<ReadingStatsPage />} />
                    <Route path="/daily-wird" element={<DailyWirdPage />} />
                    <Route path="/tasbih" element={<TasbihPage />} />
                    <Route path="/azkar" element={<AzkarPage />} />
                    <Route path="/prophet-stories" element={<ProphetStoriesPage />} />
                    <Route path="/ruqyah" element={<RuqyahPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/notification-settings" element={<NotificationSettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <GlobalAudioPlayer />
                  <BottomNavigation />
                  </BrowserRouter>
                </TooltipProvider>
              </DownloadManagerProvider>
            </GlobalAudioProvider>
          </ReadingSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
