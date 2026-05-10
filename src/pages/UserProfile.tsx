import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProfileView from "@/components/ProfileView";

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  if (!id) return null;

  return <ProfileView profileId={id} isOwnProfile={user?.id === id} />;
}
