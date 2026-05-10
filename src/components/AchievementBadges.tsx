import { useState, useEffect } from "react";
import { Trophy, Award, Zap, Star, Camera, Heart, Shield, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ACHIEVEMENT_CONFIG: Record<string, { icon: typeof Trophy; label: string; description: string; color: string }> = {
  first_session: { icon: Camera, label: "First Session", description: "Completed your first session", color: "text-primary" },
  five_sessions: { icon: Zap, label: "5 Sessions", description: "Completed 5 sessions", color: "text-amber-400" },
  ten_sessions: { icon: Award, label: "10 Sessions", description: "Completed 10 sessions", color: "text-orange-400" },
  first_review: { icon: Star, label: "First Review", description: "Received your first review", color: "text-primary" },
  five_star: { icon: Crown, label: "5-Star Rating", description: "Achieved a 5-star rating", color: "text-amber-400" },
  top_rated: { icon: Trophy, label: "Top Rated", description: "Top rated in your area", color: "text-amber-400" },
  verified: { icon: Shield, label: "Verified", description: "Identity verified", color: "text-green-400" },
  popular: { icon: Heart, label: "Popular", description: "Favorited by 10+ users", color: "text-pink-400" },
};

interface Props {
  userId: string;
}

export default function AchievementBadges({ userId }: Props) {
  const [achievements, setAchievements] = useState<{ achievement_type: string; unlocked_at: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("achievements")
      .select("achievement_type, unlocked_at")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false })
      .then(({ data }) => {
        setAchievements(data || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading || achievements.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((a) => {
          const config = ACHIEVEMENT_CONFIG[a.achievement_type] || {
            icon: Trophy,
            label: a.achievement_type.replace(/_/g, " "),
            description: "",
            color: "text-muted-foreground",
          };
          const Icon = config.icon;
          return (
            <div
              key={a.achievement_type}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border hover:border-primary/30 transition-colors cursor-default"
              title={config.description}
            >
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className="text-xs font-body font-medium text-foreground">{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
