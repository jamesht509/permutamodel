import type { OnboardingData } from "@/pages/Onboarding";

const roles = [
  { value: "photographer", emoji: "📸", label: "Photographer", desc: "I shoot photos" },
  { value: "model", emoji: "🌟", label: "Model", desc: "I pose for photos" },
  { value: "creative", emoji: "🎨", label: "Creative", desc: "MUA, Stylist, etc." },
  { value: "dual", emoji: "📸🌟", label: "Both", desc: "Photographer & Model" },
];

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}

export default function StepRole({ data, update }: Props) {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-heading text-2xl font-bold text-foreground mb-6">I am a...</h2>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((r) => {
          const selected = data.role === r.value;
          return (
            <button
              key={r.value}
              onClick={() => update({ role: r.value })}
              className={`p-6 rounded-2xl text-center border transition-all ${
                selected
                  ? "border-primary bg-[rgba(233,69,96,0.1)] shadow-[0_0_20px_rgba(233,69,96,0.15)]"
                  : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)]"
              }`}
            >
              <span className="text-3xl block mb-2">{r.emoji}</span>
              <p className="font-heading font-semibold text-foreground text-sm">{r.label}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{r.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
