import { useAuth } from "@/hooks/useAuth";
import ProfileView from "@/components/ProfileView";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <ProfileView profileId={user.id} isOwnProfile={true} />;
}
