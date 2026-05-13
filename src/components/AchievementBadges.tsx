import { useState, useEffect } from "react";
import { Trophy, Award, Zap, Star, Camera, Heart, Shield, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

const ACHIEVEMENT_ICONS: Record<string, { icon: typeof Trophy; color: string }> = {
  first_session: { icon: Camera, color: "text-primary" },
  five_sessions: { icon: Zap, color: "text-amber-400" },
  ten_sessions: { icon: Award, color: "text-orange-400" },
  first_review: { icon: Star, color: "text-primary" },
  five_star: { icon: Crown, color: "text-amber-400" },
  top_rated: { icon: Trophy, color: "text-amber-400" },
  verified: { icon: Shield, color: "text-green-400" },
  popular: { icon: Heart, color: "text-pink-400" },
};

interface Props {
  userId: string;
}

export default function AchievementBadges({ userId }: Props) {
  const t = useTranslation();
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
      <h3 className="font-heading text-sm font-semibold text-foreground mb-2">{t.achievements.title}</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((a) => {
          const type = a.achievement_type as keyof typeof t.achievements.types;
          const meta = t.achievements.types[type];
          const visual = ACHIEVEMENT_ICONS[a.achievement_type] || { icon: Trophy, color: "text-muted-foreground" };
          const Icon = visual.icon;
          const label = meta?.label ?? a.achievement_type.replace(/_/g, " ");
          const description = meta?.description ?? "";
          return (
            <div
              key={a.achievement_type}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border hover:border-primary/30 transition-colors cursor-default"
              title={description}
            >
              <Icon className={`w-3.5 h-3.5 ${visual.color}`} />
              <span className="text-xs font-body font-medium text-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
