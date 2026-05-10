import type { OnboardingData } from "@/pages/Onboarding";
import { Camera, User, Palette, Sparkles } from "lucide-react";

const roles = [
  { value: "photographer", icon: Camera, label: "Photographer", desc: "I capture moments" },
  { value: "model", icon: User, label: "Model", desc: "I bring visions to life" },
  { value: "creative", icon: Palette, label: "Creative", desc: "MUA, Stylist, etc." },
  { value: "dual", icon: Sparkles, label: "Both", desc: "Photographer & Model" },
];

const EXPERIENCE_LEVELS = [
  { value: "newcomer", label: "Beginner", desc: "Just starting out" },
  { value: "rising", label: "Intermediate", desc: "Some experience" },
  { value: "established", label: "Advanced", desc: "Years of work" },
  { value: "elite", label: "Professional", desc: "Full-time creative" },
];

const SPECIALTIES = [
  "Portrait", "Fashion", "Editorial", "Street", "Boudoir",
  "Commercial", "Lifestyle", "Fine Art", "Fitness", "Beauty",
  "Conceptual", "Events", "Couples", "Maternity",
];

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}

export default function StepCraft({ data, update }: Props) {
  const toggleStyle = (s: string) => {
    update({
      styles: data.styles.includes(s)
        ? data.styles.filter((x) => x !== s)
        : data.styles.length < 5 ? [...data.styles, s] : data.styles,
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Your craft</h2>
        <p className="font-body text-sm text-muted-foreground mt-1">Help us match you with the right people</p>
      </div>

      {/* Role */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-2">I am a... *</label>
        <div className="grid grid-cols-2 gap-2.5">
          {roles.map((r) => {
            const selected = data.role === r.value;
            return (
              <button
                key={r.value}
                onClick={() => update({ role: r.value })}
                className={`p-4 rounded-xl text-center border transition-all ${
                  selected
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
                    : "border-border bg-card/50 hover:bg-card"
                }`}
              >
                <r.icon className={`w-6 h-6 mx-auto mb-2 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-heading font-semibold text-foreground text-sm">{r.label}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-2">Experience Level</label>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE_LEVELS.map((lvl) => {
            const selected = data.experience === lvl.value;
            return (
              <button
                key={lvl.value}
                onClick={() => update({ experience: lvl.value })}
                className={`py-3 px-3 rounded-xl text-left border transition-all ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card/50 hover:bg-card"
                }`}
              >
                <p className={`font-body text-sm font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>{lvl.label}</p>
                <p className="font-body text-[10px] text-muted-foreground">{lvl.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialties */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-2">Specialties * (up to 5)</label>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => toggleStyle(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                data.styles.includes(s)
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-card/50 text-muted-foreground border border-border hover:border-border/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-1.5">{data.styles.length}/5 selected</p>
      </div>

      {/* TFP Toggle */}
      <div className="flex items-center justify-between bg-card/50 border border-border rounded-xl px-4 py-3">
        <div>
          <p className="font-body text-sm text-foreground font-medium">Available for TFP</p>
          <p className="font-body text-[10px] text-muted-foreground">Show you're open to collaborate</p>
        </div>
        <button
          onClick={() => update({ tfpAvailable: !data.tfpAvailable })}
          className={`w-11 h-6 rounded-full transition-colors relative ${data.tfpAvailable ? "bg-primary" : "bg-muted"}`}
        >
          <div
            className="w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 left-0.5 transition-transform"
            style={{ transform: data.tfpAvailable ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>
    </div>
  );
}
