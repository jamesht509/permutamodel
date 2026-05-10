import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login${location.search}`} state={{ from: location }} replace />;
  }

  // Profile still loading — show spinner instead of flashing page content
  if (!profile) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to onboarding if not completed (but don't redirect if already on onboarding)
  if (!profile.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to={`/onboarding${location.search}`} replace />;
  }

  return <>{children}</>;
}
