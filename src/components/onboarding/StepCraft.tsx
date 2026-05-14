import type { OnboardingData } from "@/pages/Onboarding";
import { Camera, User, Palette, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { STYLE_KEYS, labelForStyle, type StyleKey } from "@/lib/styles";
import { cn } from "@/lib/utils";

const MAX_STYLES = 5;

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}

export default function StepCraft({ data, update }: Props) {
  const t = useTranslation();

  const roles = [
    { value: "photographer", icon: Camera, label: t.common.photographer, desc: t.common.photographer },
    { value: "model", icon: User, label: t.common.model, desc: t.common.model },
    { value: "creative", icon: Palette, label: t.common.creative, desc: "MUA, Stylist, etc." },
    { value: "dual", icon: Sparkles, label: t.common.dual, desc: t.common.dual },
  ];

  const experienceLevels = [
    { value: "newcomer", label: t.discover.beginner },
    { value: "rising", label: t.discover.intermediate },
    { value: "established", label: t.discover.advanced },
    { value: "elite", label: t.discover.professional },
  ];

  const toggleStyle = (key: StyleKey) => {
    const selected = data.styles.includes(key);
    if (selected) {
      update({ styles: data.styles.filter((x) => x !== key) });
    } else if (data.styles.length < MAX_STYLES) {
      update({ styles: [...data.styles, key] });
    }
    // Hit the cap → no-op (chip is rendered disabled, see UI below).
  };

  const atCap = data.styles.length >= MAX_STYLES;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{t.onboardingShell.stepYourCraft}</h2>
      </div>

      {/* Role */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-2">
          {t.editProfile.roleLabel} *
        </label>
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-2">
          {t.discover.experienceLevel}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {experienceLevels.map((lvl) => {
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Styles — brand-aware labels, max 5 with disable-when-cap visual */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-2">
          {t.editProfile.stylesLabelMax(MAX_STYLES)} *
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {STYLE_KEYS.map((key) => {
            const isSelected = data.styles.includes(key);
            const isDisabled = !isSelected && atCap;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleStyle(key)}
                disabled={isDisabled}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all text-center",
                  isSelected && "bg-primary/20 text-primary border border-primary/30",
                  !isSelected && !isDisabled && "bg-card/50 text-muted-foreground border border-border hover:border-border/80",
                  isDisabled && "bg-card/30 text-muted-foreground/50 border border-border/40 cursor-not-allowed",
                )}
              >
                {labelForStyle(key, t.styles)}
              </button>
            );
          })}
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-1.5">{data.styles.length}/{MAX_STYLES}</p>
      </div>

      {/* TFP Toggle */}
      <div className="flex items-center justify-between bg-card/50 border border-border rounded-xl px-4 py-3">
        <div>
          <p className="font-body text-sm text-foreground font-medium">{t.profile.availableNow}</p>
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
