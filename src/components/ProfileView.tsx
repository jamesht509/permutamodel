import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Share2, MoreVertical, Heart, Star, MapPin, Calendar, Camera, Sparkles, Shield, Crown, Gem, Rocket, Zap, ChevronLeft, ChevronRight, Settings, Users, Bookmark, ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import useEmblaCarousel from "embla-carousel-react";
import TfpRequestModal from "@/components/TfpRequestModal";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import AchievementBadges from "@/components/AchievementBadges";
import ReportModal from "@/components/ReportModal";
import ProfileCompletion from "@/components/ProfileCompletion";
import AvailabilityToggle from "@/components/AvailabilityToggle";
import { useDevice } from "@/hooks/useDevice";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  verified_level: string;
  rating_avg: number | null;
  total_reviews: number | null;
  total_sessions: number | null;
  user_level: string;
  styles: string[] | null;
  equipment: string[] | null;
  instagram: string | null;
  website: string | null;
  has_studio: boolean | null;
  availability: any;
  distance_radius: number | null;
  measurements: any;
  created_at: string | null;
}

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  style: string | null;
  is_cover: boolean | null;
  position: number;
  likes_count: number;
}

interface Review {
  id: string;
  overall_rating: number | null;
  comment: string | null;
  would_work_again: string | null;
  created_at: string | null;
  reviewer: { name: string; avatar_url: string | null } | null;
}

const LEVEL_MAP: Record<string, { icon: string; label: string }> = {
  newcomer: { icon: "○", label: "Newcomer" },
  starter: { icon: "◐", label: "Starter" },
  rising: { icon: "●", label: "Rising" },
  established: { icon: "◆", label: "Established" },
  elite: { icon: "★", label: "Elite" },
  legend: { icon: "✦", label: "Legend" },
};

const ROLE_MAP: Record<string, { icon: string; label: string }> = {
  photographer: { icon: "◎", label: "Photographer" },
  model: { icon: "◇", label: "Model" },
  creative: { icon: "△", label: "Creative" },
  dual: { icon: "◎◇", label: "Photographer & Model" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  profileId: string;
  isOwnProfile: boolean;
}

export default function ProfileView({ profileId, isOwnProfile }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDesktop } = useDevice();
  const t = useTranslation();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showTfpModal, setShowTfpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [collaborators, setCollaborators] = useState<{ id: string; name: string; avatar_url: string | null }[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => setCurrentSlide(emblaApi.selectedScrollSnap()));
    }
  }, [emblaApi]);

  const loadProfile = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    const [profileRes, photosRes, reviewsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", profileId).single(),
      supabase.from("photos").select("id, url, thumbnail_url, title, style, is_cover, position, likes_count, comments_count").eq("user_id", profileId).order("position"),
      supabase
        .from("reviews")
        .select("id, overall_rating, comment, would_work_again, created_at, reviewer_id")
        .eq("reviewed_id", profileId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

      if (profileRes.data) setProfileData(profileRes.data as unknown as ProfileData);
      if (photosRes.data) setPhotos(photosRes.data);

      // Fetch reviewer names
      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const reviewerIds = reviewsRes.data.map((r) => r.reviewer_id);
        const { data: reviewers } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", reviewerIds);

        const reviewerMap = new Map(reviewers?.map((r) => [r.id, r]) || []);
        setReviews(
          reviewsRes.data.map((r) => ({
            ...r,
            reviewer: reviewerMap.get(r.reviewer_id) || null,
          }))
        );
      }

      // Check favorite
      if (user && !isOwnProfile) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("favorited_user_id", profileId)
          .maybeSingle();
        setIsFavorite(!!fav);
      }

      // Fetch collaborators (people they've done sessions with)
      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("photographer_id, model_id")
        .or(`photographer_id.eq.${profileId},model_id.eq.${profileId}`)
        .eq("status", "completed")
        .limit(20);

      if (sessionsData && sessionsData.length > 0) {
        const collabIds = [...new Set(
          sessionsData.map((s) => s.photographer_id === profileId ? s.model_id : s.photographer_id)
        )];
        const { data: collabProfiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", collabIds.slice(0, 8));
        if (collabProfiles) setCollaborators(collabProfiles);
      }

      // Own profile extras
      if (isOwnProfile && user) {
        const [sessRes, favRes] = await Promise.all([
          supabase
            .from("sessions")
            .select("id", { count: "exact", head: true })
            .or(`photographer_id.eq.${user.id},model_id.eq.${user.id}`),
          supabase
            .from("favorites")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);
        setSessionCount(sessRes.count ?? 0);
        setFavCount(favRes.count ?? 0);
      }

    setLoading(false);
  }, [profileId, user, isOwnProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Auto-open the TFP request modal when arriving via ?tfp=1 (the Discover
  // feed "Chamar pra permuta" CTA links here with that param). Only fires
  // once the profile is loaded and it isn't the viewer's own profile; the
  // param is stripped so a refresh / back-nav doesn't re-trigger it.
  useEffect(() => {
    if (searchParams.get("tfp") !== "1") return;
    if (isOwnProfile || !profileData) return;
    setShowTfpModal(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("tfp");
        return next;
      },
      { replace: true },
    );
  }, [searchParams, isOwnProfile, profileData, setSearchParams]);

  // Refetch when window regains focus (e.g. after editing profile)
  useEffect(() => {
    const onFocus = () => loadProfile(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadProfile]);

  // Realtime sync for own profile changes (bio/completion updates instantly after save)
  useEffect(() => {
    if (!isOwnProfile) return;

    const channel = supabase
      .channel(`profile-sync-${profileId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${profileId}` },
        () => loadProfile(false)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "photos", filter: `user_id=eq.${profileId}` },
        () => loadProfile(false)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwnProfile, profileId, loadProfile]);

  const toggleFavorite = async () => {
    if (!user) return;
    if (isFavorite) {
      setIsFavorite(false);
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("favorited_user_id", profileId);
    } else {
      setIsFavorite(true);
      await supabase.from("favorites").insert({ user_id: user.id, favorited_user_id: profileId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        {/* Header Skeleton */}
        <div className="h-14 bg-card/50 border-b border-border" />

        {/* Avatar + Info Skeleton */}
        <div className="px-4 py-6 space-y-4">
          <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
          <div className="h-6 w-32 bg-muted rounded mx-auto" />
          <div className="h-4 w-48 bg-muted rounded mx-auto" />

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* Portfolio Grid Skeleton */}
          <div className="grid grid-cols-2 gap-2 pt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="font-heading text-lg text-foreground">Profile not found</p>
        <button onClick={() => navigate(-1)} className="text-primary font-body text-sm">Go back</button>
      </div>
    );
  }

  const role = ROLE_MAP[profileData.role] || ROLE_MAP.photographer;
  const level = LEVEL_MAP[profileData.user_level] || LEVEL_MAP.newcomer;
  const joinDate = profileData.created_at
    ? new Date(profileData.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";
  const carouselPhotos = photos.length > 0 ? photos : (profileData.avatar_url ? [{ id: "avatar", url: profileData.avatar_url, is_cover: true, position: 0 }] : []);
  const avail = profileData.availability || {};
  const availDays: string[] = avail.days || [];
  const availTimes: string[] = avail.times || [];

  const handleMessage = async () => {
    if (!user) return;
    // Find or create conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
      .maybeSingle();
    if (existing) {
      navigate(`/messages/${existing.id}`);
    } else {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ user1_id: user.id, user2_id: profileId })
        .select("id")
        .single();
      if (newConv) navigate(`/messages/${newConv.id}`);
    }
  };

  if (isDesktop) {
    return (
      <>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="bg-card/30 border-b border-border px-6 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body text-sm">Back</span>
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-[380px_1fr] gap-8">
              {/* Left Column - Info */}
              <div className="space-y-5">
                {/* Avatar */}
                <div className="w-full aspect-square rounded-2xl bg-muted overflow-hidden">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-6xl font-bold text-primary">
                      {profileData.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                {/* Name + Badges */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-heading text-2xl font-bold text-foreground">{profileData.name}</h1>
                    {/* VERIFIED badge hidden for now */}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm font-body text-muted-foreground">
                    <span>{role.icon} {role.label}</span>
                    <span className="text-border">•</span>
                    <span>{level.icon} {level.label}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground flex items-center gap-1 mt-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {profileData.city || "Unknown"}{profileData.state ? `, ${profileData.state}` : ""}
                  </p>
                  {joinDate && (
                    <p className="flex items-center gap-1.5 mt-1 text-xs font-body text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Joined {joinDate}
                    </p>
                  )}
                  {profileData.instagram && (
                    <a href={`https://instagram.com/${profileData.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 mt-1.5 text-sm font-body text-primary hover:text-primary/80 transition-colors">
                      <Instagram className="w-3.5 h-3.5" />
                      <span>@{profileData.instagram}</span>
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex rounded-xl overflow-hidden border border-border bg-card/50 divide-x divide-border">
                  {[
                    { value: Number(profileData.rating_avg || 0).toFixed(1), label: "Rating", accent: true },
                    { value: profileData.total_sessions || 0, label: "Sessions" },
                    { value: profileData.total_reviews || 0, label: "Reviews" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex-1 text-center py-3.5">
                      <p className={`text-lg font-heading font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
                      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <div className="p-4 bg-card/30 rounded-xl border border-border">
                    <h3 className="font-body text-xs text-muted-foreground mb-2">{t.profile.about}</h3>
                    <p className="font-body text-sm text-foreground leading-relaxed">{profileData.bio}</p>
                  </div>
                )}

                {/* Styles */}
                {profileData.styles && profileData.styles.length > 0 && (
                  <div className="p-4 bg-card/30 rounded-xl border border-border">
                    <h3 className="font-body text-xs text-muted-foreground mb-2">{t.profile.styles}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.styles.map((style) => (
                        <span key={style} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-medium">{style}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                {(profileData.role === "photographer" || profileData.role === "dual") && profileData.equipment && profileData.equipment.length > 0 && (
                  <div className="p-4 bg-card/30 rounded-xl border border-border">
                    <h3 className="font-body text-xs text-muted-foreground mb-2">{t.profile.equipment}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.equipment.map((item) => (
                        <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-foreground font-body">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {(availDays.length > 0 || availTimes.length > 0) && (
                  <div className="p-4 bg-card/30 rounded-xl border border-border">
                    <h3 className="font-body text-xs text-muted-foreground mb-2">{t.profile.availableNow}</h3>
                    <div className="flex gap-1.5 mb-2">
                      {DAYS.map((day) => (
                        <div key={day} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-body font-medium ${
                          availDays.includes(day)
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-card/50 text-muted-foreground border border-border"
                        }`}>
                          {day.slice(0, 2)}
                        </div>
                      ))}
                    </div>
                    {availTimes.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {availTimes.map((t) => (
                          <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-secondary/20 text-secondary-foreground font-body">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Collaborators */}
                {collaborators.length > 0 && (
                  <div className="p-4 bg-card/30 rounded-xl border border-border">
                    <h3 className="font-body text-xs text-muted-foreground mb-2">Worked with</h3>
                    <div className="flex items-center">
                      <div className="flex -space-x-2.5">
                        {collaborators.slice(0, 6).map((c) => (
                          <img key={c.id} src={c.avatar_url || "/placeholder.svg"} alt={c.name} title={c.name}
                            onClick={() => navigate(`/profile/${c.id}`)}
                            className="w-9 h-9 rounded-full border-2 border-background object-cover cursor-pointer hover:scale-110 hover:z-10 transition-transform relative" />
                        ))}
                      </div>
                      {collaborators.length > 6 && (
                        <span className="ml-2 text-xs font-body text-muted-foreground">+{collaborators.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="space-y-2">
                    <button onClick={() => setShowTfpModal(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform">
                      {t.profile.sendRequest}
                    </button>
                    <button onClick={handleMessage}
                      className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-body font-medium hover:bg-card/80 transition-colors">
                      {t.profile.messageBtn}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={toggleFavorite}
                        className="flex-1 py-2.5 rounded-xl border border-border bg-card/50 flex items-center justify-center gap-2 hover:bg-card transition-colors">
                        <Heart className={`w-4 h-4 ${isFavorite ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-body text-foreground">{isFavorite ? "Saved" : "Save"}</span>
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                        className="flex-1 py-2.5 rounded-xl border border-border bg-card/50 flex items-center justify-center gap-2 hover:bg-card transition-colors">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-body text-foreground">Share</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Own Profile Actions */}
                {isOwnProfile && (
                  <div className="space-y-2">
                    <AvailabilityToggle />
                    <ProfileCompletion profile={profileData as any} photoCount={photos.length} />
                    <button onClick={() => navigate("/profile/edit")}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform">
                      {t.profile.editProfile}
                    </button>
                    <button onClick={() => navigate("/settings")} className="w-full flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">{t.nav.settings}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Portfolio + Reviews */}
              <div className="space-y-8">
                <AchievementBadges userId={profileId} />

                {/* Portfolio */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-1">{t.profile.portfolio}</h2>
                  {photos.length > 0 ? (
                    <PortfolioGrid photos={photos} isOwner={isOwnProfile} ownerId={profileData?.id} />
                  ) : (
                    <div className="flex items-center justify-center h-48 rounded-xl bg-card/30 border border-border mt-4">
                      <div className="text-center">
                        <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="font-body text-sm text-muted-foreground">{t.profile.noPhotos}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                    {t.profile.reviews} ({profileData.total_reviews || 0})
                  </h2>
                  {reviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-xl bg-card/50 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                              {review.reviewer?.avatar_url ? (
                                <img src={review.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                  {review.reviewer?.name?.charAt(0) || "?"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-body font-medium text-foreground">{review.reviewer?.name || "Anonymous"}</p>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= (review.overall_rating || 0) ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-sm font-body text-muted-foreground">{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-body text-muted-foreground">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {profileData && !isOwnProfile && (
          <TfpRequestModal open={showTfpModal} onClose={() => setShowTfpModal(false)} receiverId={profileData.id} receiverName={profileData.name} />
        )}
        {profileData && !isOwnProfile && (
          <ReportModal open={showReportModal} onClose={() => setShowReportModal(false)} reportedId={profileData.id} reportedName={profileData.name} />
        )}
      </>
    );
  }

  // MOBILE - existing layout
  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Hero Carousel */}
      <div className="relative h-[50vh] overflow-hidden">
        {carouselPhotos.length > 0 ? (
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {carouselPhotos.map((photo) => (
                <div key={photo.id} className="flex-[0_0_100%] min-w-0 h-full">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-card flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        {/* Top buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
              className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
            {!isOwnProfile && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center">
                  <MoreVertical className="w-5 h-5 text-foreground" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-10">
                    <button onClick={() => { setShowMenu(false); setShowReportModal(true); }} className="block w-full text-left px-4 py-3 text-sm font-body text-foreground hover:bg-primary/10 whitespace-nowrap">Report</button>
                    <button onClick={async () => {
                      setShowMenu(false);
                      if (!user) return;
                      const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: profileId });
                      if (error) {
                        if (error.code === '23505') toast.info("User already blocked");
                        else toast.error("Failed to block user");
                      } else {
                        toast.success("User blocked");
                        navigate(-1);
                      }
                    }} className="block w-full text-left px-4 py-3 text-sm font-body text-destructive hover:bg-destructive/10 whitespace-nowrap">Block</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dot indicators */}
        {carouselPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {carouselPhotos.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-primary w-4" : "bg-foreground/30"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-heading text-2xl font-bold text-foreground">{profileData.name}</h1>
          {/* PRO/VERIFIED badges hidden for now */}
        </div>

        <div className="flex items-center gap-3 mt-2 text-sm font-body text-muted-foreground flex-wrap">
          <span>{role.icon} {role.label}</span>
          <span className="text-border">•</span>
          <span>{level.icon} {level.label}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 text-sm font-body text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{profileData.city || "Unknown"}{profileData.state ? `, ${profileData.state}` : ""}</span>
        </div>

        {joinDate && (
          <div className="flex items-center gap-1.5 mt-1 text-xs font-body text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Joined {joinDate}</span>
          </div>
        )}

        {profileData.instagram && (
          <a href={`https://instagram.com/${profileData.instagram}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 mt-1.5 text-sm font-body text-primary hover:text-primary/80 transition-colors">
            <Instagram className="w-3.5 h-3.5" />
            <span>@{profileData.instagram}</span>
          </a>
        )}

        {(profileData as any).available_now && (profileData as any).available_until && new Date((profileData as any).available_until) > new Date() && (
          <div className="mt-5 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
            <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-body text-sm font-semibold text-green-400">Available Now</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Until {new Date((profileData as any).available_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
              {(profileData as any).availability_note && (
                <p className="font-body text-xs text-foreground mt-2">"{(profileData as any).availability_note}"</p>
              )}
            </div>
          </div>
        )}

        <div className="flex mt-5 rounded-xl overflow-hidden border border-border bg-card/50 divide-x divide-border">
          {[
            { value: Number(profileData.rating_avg || 0).toFixed(1), label: "Rating", accent: true },
            { value: profileData.total_sessions || 0, label: "Sessions" },
            { value: profileData.total_reviews || 0, label: "Reviews" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 text-center py-3.5">
              <p className={`text-lg font-heading font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {profileData.bio && (
          <div className="mt-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2">{t.profile.about}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{profileData.bio}</p>
          </div>
        )}

        {profileData.styles && profileData.styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profileData.styles.map((style) => (
              <span key={style} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-body font-medium">{style}</span>
            ))}
          </div>
        )}

        {isOwnProfile && (
          <div className="px-4 mb-5">
            <AvailabilityToggle />
          </div>
        )}

        {isOwnProfile && profileData && (
          <ProfileCompletion profile={profileData as any} photoCount={photos.length} />
        )}

        <AchievementBadges userId={profileId} />

        {photos.length > 0 && (
          <div className="mt-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{t.profile.portfolio} ({photos.length})</h3>
            <PortfolioGrid photos={photos} isOwner={isOwnProfile} ownerId={profileData?.id} />
          </div>
        )}

        {collaborators.length > 0 && (
          <div className="mt-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Worked with</h3>
            <div className="flex items-center">
              <div className="flex -space-x-2.5">
                {collaborators.slice(0, 6).map((c) => (
                  <img key={c.id} src={c.avatar_url || "/placeholder.svg"} alt={c.name} title={c.name}
                    onClick={() => navigate(`/profile/${c.id}`)} className="w-9 h-9 rounded-full border-2 border-background object-cover cursor-pointer hover:scale-110 hover:z-10 transition-transform relative" />
                ))}
              </div>
              {collaborators.length > 6 && (
                <span className="ml-2 text-xs font-body text-muted-foreground">+{collaborators.length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {(profileData.role === "photographer" || profileData.role === "dual") && profileData.equipment && profileData.equipment.length > 0 && (
          <div className="mt-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2">{t.profile.equipment}</h3>
            <div className="flex flex-wrap gap-1.5">
              {profileData.equipment.map((item) => (
                <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-foreground font-body">{item}</span>
              ))}
            </div>
          </div>
        )}

        {(profileData.role === "model" || profileData.role === "dual") && profileData.measurements && Object.keys(profileData.measurements).length > 0 && (
          <div className="mt-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2">{t.profile.measurements}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(profileData.measurements).map(([key, val]) => (
                val ? (
                  <div key={key} className="p-2.5 rounded-xl bg-card/50 border border-border">
                    <p className="text-[10px] font-body text-muted-foreground uppercase">{key}</p>
                    <p className="text-sm font-body text-foreground">{String(val)}</p>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {(availDays.length > 0 || availTimes.length > 0) && (
          <div className="mt-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Availability</h3>
            <div className="flex gap-1.5 mb-2">
              {DAYS.map((day) => (
                <div key={day} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-body font-medium ${
                  availDays.includes(day)
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-card/50 text-muted-foreground border border-border"
                }`}>
                  {day.slice(0, 2)}
                </div>
              ))}
            </div>
            {availTimes.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {availTimes.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-secondary/20 text-secondary-foreground font-body">{t}</span>
                ))}
              </div>
            )}
            {profileData.distance_radius && (
              <p className="text-xs font-body text-muted-foreground mt-2">
                Willing to travel up to {profileData.distance_radius} km
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-semibold text-foreground">
              {t.profile.reviews} ({profileData.total_reviews || 0})
            </h3>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 rounded-xl bg-card/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                      {review.reviewer?.avatar_url ? (
                        <img src={review.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {review.reviewer?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-body font-medium text-foreground">{review.reviewer?.name || "Anonymous"}</p>
                      <p className="text-[10px] font-body text-muted-foreground">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= (review.overall_rating || 0) ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm font-body text-muted-foreground">{review.comment}</p>}
                  {review.would_work_again && (
                    <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${
                      review.would_work_again === "yes" ? "bg-green-500/10 text-green-400" :
                      review.would_work_again === "maybe" ? "bg-amber-500/10 text-amber-400" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      Would work again: {review.would_work_again === "yes" ? "✅ Yes" : review.would_work_again === "maybe" ? "🤔 Maybe" : "❌ No"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-body text-muted-foreground">No reviews yet</p>
          )}
        </div>

        {isOwnProfile && (
          <div className="mt-6 space-y-2">
            <button onClick={() => navigate("/settings")} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-body text-sm text-foreground">{t.nav.settings}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => navigate("/sessions")} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="font-body text-sm text-foreground">{t.sessions.title}</span>
              </div>
              <span className="text-xs font-body text-muted-foreground">{sessionCount}</span>
            </button>
            <button onClick={() => navigate("/favorites")} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors">
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-muted-foreground" />
                <span className="font-body text-sm text-foreground">{t.favorites.title}</span>
              </div>
              <span className="text-xs font-body text-muted-foreground">{favCount}</span>
            </button>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar — sits above mobile nav */}
      <div className="fixed bottom-[4.5rem] lg:bottom-0 left-0 right-0 lg:left-64 bg-background/95 backdrop-blur-xl border-t border-border p-3 md:p-4 z-30 safe-area-pb">
        {isOwnProfile ? (
          <button onClick={() => navigate("/profile/edit")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold text-base hover:scale-[1.01] active:scale-[0.99] transition-transform">
            {t.profile.editProfile}
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowTfpModal(true)}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform">
              {t.profile.sendRequest}
            </button>
            <button onClick={handleMessage}
              className="px-4 rounded-xl border border-border bg-card/50 flex items-center justify-center hover:bg-card transition-colors">
              <MessageCircle className="w-5 h-5 text-foreground" />
            </button>
            <button onClick={toggleFavorite}
              className="px-4 rounded-xl border border-border bg-card/50 flex items-center justify-center hover:bg-card transition-colors">
              <Heart className={`w-5 h-5 ${isFavorite ? "text-primary fill-primary" : "text-muted-foreground"}`} />
            </button>
          </div>
        )}
      </div>

      {profileData && !isOwnProfile && (
        <TfpRequestModal open={showTfpModal} onClose={() => setShowTfpModal(false)} receiverId={profileData.id} receiverName={profileData.name} />
      )}
      {profileData && !isOwnProfile && (
        <ReportModal open={showReportModal} onClose={() => setShowReportModal(false)} reportedId={profileData.id} reportedName={profileData.name} />
      )}
    </div>
  );
}
