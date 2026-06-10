import { Suspense, lazy, useEffect } from "react";
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
import { useGuestMigration } from "@/hooks/useGuestMigration";
import { HomeModeProvider } from "@/hooks/useHomeMode";
import BottomNavigation from "@/components/BottomNavigation";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

// Eager load critical pages
import Index from "./pages/Index";
import QuranPage from "./pages/QuranPage";

// Lazy load non-critical pages for code splitting
const SurahPage = lazy(() => import("./pages/SurahPage"));
const MushafPage = lazy(() => import("./pages/MushafPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const KhatmahPage = lazy(() => import("./pages/KhatmahPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
// VerifyOtpPage removed - using direct Firebase Auth
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ReadingStatsPage = lazy(() => import("./pages/ReadingStatsPage"));
const DailyWirdPage = lazy(() => import("./pages/DailyWirdPage"));
const TasbihPage = lazy(() => import("./pages/TasbihPage"));
const AzkarPage = lazy(() => import("./pages/AzkarPage"));
const ProphetStoriesPage = lazy(() => import("./pages/ProphetStoriesPage"));
const RuqyahPage = lazy(() => import("./pages/RuqyahPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotificationSettingsPage = lazy(() => import("./components/NotificationSettingsPage"));
const HadithPage = lazy(() => import("./pages/HadithPage"));
const HadithBookmarksPage = lazy(() => import("./pages/HadithBookmarksPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const PrayerTimesPage = lazy(() => import("./pages/PrayerTimesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
// Social network layer
const FeedPage = lazy(() => import("./pages/FeedPage"));
const SocialProfilePage = lazy(() => import("./pages/SocialProfilePage"));
const PostDetailsPage = lazy(() => import("./pages/PostDetailsPage"));
const SocialSearchPage = lazy(() => import("./pages/SocialSearchPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const SplashScreen = lazy(() => import("./pages/SplashScreen"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));
const AsmaUlHusnaPage = lazy(() => import("./pages/AsmaUlHusnaPage"));

const queryClient = new QueryClient();

// Minimal loading fallback for lazy-loaded routes (avoid full-screen blocking spinner)
const PageLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Component to handle guest data migration
const GuestMigrationHandler = ({ children }: { children: React.ReactNode }) => {
  useGuestMigration();
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ReadingSettingsProvider>
            <GlobalAudioProvider>
              <DownloadManagerProvider>
                <TooltipProvider>
                  <HomeModeProvider>
                  <GuestMigrationHandler>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/quran" element={<QuranPage />} />
                          <Route path="/surah/:surahNumber" element={<SurahPage />} />
                          <Route path="/mushaf" element={<MushafPage />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route path="/search" element={<SearchPage />} />
                          <Route path="/khatmah" element={<KhatmahPage />} />
                          <Route path="/auth" element={<AuthPage />} />
                          {/* verify-otp route removed - using direct Firebase Auth */}
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/reading-stats" element={<ReadingStatsPage />} />
                          <Route path="/daily-wird" element={<DailyWirdPage />} />
                          <Route path="/tasbih" element={<TasbihPage />} />
                          <Route path="/azkar" element={<AzkarPage />} />
                          <Route path="/prophet-stories" element={<ProphetStoriesPage />} />
                          <Route path="/ruqyah" element={<RuqyahPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
                          <Route path="/hadith" element={<HadithPage />} />
                          <Route path="/hadith/bookmarks" element={<HadithBookmarksPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/lessons" element={<LessonsPage />} />
                          <Route path="/teacher" element={<TeacherDashboard />} />
                          <Route path="/messages" element={<MessagesPage />} />
                          <Route path="/user-management" element={<UserManagementPage />} />
                          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="/prayer-times" element={<PrayerTimesPage />} />
                          {/* Social network */}
                          <Route path="/feed" element={<FeedPage />} />
                          <Route path="/u/:username" element={<SocialProfilePage />} />
                          <Route path="/post/:postId" element={<PostDetailsPage />} />
                          <Route path="/social-search" element={<SocialSearchPage />} />
                          <Route path="/support" element={<SupportPage />} />
                          <Route path="/verification" element={<VerificationPage />} />
                          <Route path="/welcome" element={<WelcomePage />} />
                          <Route path="/splash" element={<SplashScreen />} />
                          <Route path="/explore" element={<ExplorePage />} />
                          <Route path="/create-post" element={<CreatePostPage />} />
                          <Route path="/asma-ul-husna" element={<AsmaUlHusnaPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                      <GlobalAudioPlayer />
                      <BottomNavigation />
                    </BrowserRouter>
                  </GuestMigrationHandler>
                  </HomeModeProvider>
                </TooltipProvider>
              </DownloadManagerProvider>
            </GlobalAudioProvider>
          </ReadingSettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
