import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";

// ── Lazy-loaded pages (code splitting) ──
const Login = lazy(() => import("@/pages/Login"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Chat = lazy(() => import("@/pages/Chat"));
const Discover = lazy(() => import("@/pages/Discover"));
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Castings = lazy(() => import("@/pages/Castings"));
const CastingDetail = lazy(() => import("@/pages/CastingDetail"));
const Messages = lazy(() => import("@/pages/Messages"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Settings = lazy(() => import("@/pages/Settings"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Sessions = lazy(() => import("@/pages/Sessions"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const ProPage = lazy(() => import("@/pages/ProPage"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Admin = lazy(() => import("@/pages/Admin"));

const queryClient = new QueryClient();

// Force dark mode — dark-first editorial app
if (!document.documentElement.classList.contains("dark")) {
  document.documentElement.classList.add("dark");
}

// Route loading spinner
function RouteLoader() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="grain" />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Landing />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Onboarding (protected but no layout) */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />

                {/* Admin (protected, no layout) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Protected with Layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/castings" element={<Castings />} />
                  <Route path="/castings/:id" element={<CastingDetail />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:conversationId" element={<Messages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/profile/:id" element={<UserProfile />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/pro" element={<ProPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
