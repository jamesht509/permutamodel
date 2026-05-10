import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";

interface ProfileData {
  avatar_url: string | null;
  name: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  instagram: string | null;
  website: string | null;
  styles: string[] | null;
  equipment: string[] | null;
  has_studio: boolean | null;
  availability: any;
  role: string;
  measurements: any;
}

interface Props {
  profile: ProfileData;
  photoCount: number;
}

const COMPLETION_ITEMS = [
  { key: "avatar", label: "Profile photo", check: (p: ProfileData) => !!p.avatar_url },
  { key: "bio", label: "Bio", check: (p: ProfileData) => !!p.bio && p.bio.length > 10 },
  { key: "location", label: "Location", check: (p: ProfileData) => !!p.city && !!p.state },
  { key: "styles", label: "Styles", check: (p: ProfileData) => (p.styles?.length ?? 0) >= 1 },
  { key: "instagram", label: "Instagram or website", check: (p: ProfileData) => !!p.instagram || !!p.website },
  { key: "photos", label: "Portfolio photos", check: (_p: ProfileData, count: number) => count >= 3 },
  { key: "availability", label: "Availability", check: (p: ProfileData) => {
    const a = p.availability || {};
    return (a.days?.length > 0) || (a.times?.length > 0);
  }},
  { key: "equipment", label: "Equipment or measurements", check: (p: ProfileData) => {
    if (p.role === "photographer" || p.role === "dual") return (p.equipment?.length ?? 0) > 0;
    if (p.role === "model") return p.measurements && Object.values(p.measurements).some((v) => !!v);
    return true;
  }},
];

export default function ProfileCompletion({ profile, photoCount }: Props) {
  const navigate = useNavigate();
  const completed = COMPLETION_ITEMS.filter((item) => item.check(profile, photoCount));
  const percentage = Math.round((completed.length / COMPLETION_ITEMS.length) * 100);

  if (percentage >= 100) return null;

  return (
    <div className="mt-5 p-4 rounded-xl bg-card/50 border border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          Profile Completion
        </h3>
        <span className={`text-sm font-heading font-bold ${percentage >= 75 ? "text-green-500" : percentage >= 50 ? "text-primary" : "text-amber-500"}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted/30 mb-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${percentage >= 75 ? "bg-green-500" : percentage >= 50 ? "bg-gradient-to-r from-primary to-secondary" : "bg-amber-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {COMPLETION_ITEMS.map((item) => {
          const done = item.check(profile, photoCount);
          return (
            <div key={item.key} className="flex items-center gap-2">
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={`text-xs font-body ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/profile/edit")}
        className="w-full mt-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-body font-medium hover:bg-primary/20 transition-colors"
      >
        Complete your profile
      </button>
    </div>
  );
}
