import type { OnboardingData } from "@/pages/Onboarding";

const STYLES = [
  "Portrait", "Fashion", "Lifestyle", "Editorial", "Boudoir", "Fine Art",
  "Fitness", "Commercial", "Street", "Conceptual", "Beauty", "Maternity",
  "Couples", "Events",
];

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}

export default function StepStyles({ data, update }: Props) {
  const toggle = (style: string) => {
    const current = data.styles;
    if (current.includes(style)) {
      update({ styles: current.filter((s) => s !== style) });
    } else if (current.length < 5) {
      update({ styles: [...current, style] });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
        What styles do you work with?
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-6">Select 1–5 styles</p>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {STYLES.map((style) => {
          const selected = data.styles.includes(style);
          return (
            <button
              key={style}
              onClick={() => toggle(style)}
              className={`px-3 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                selected
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                  : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              {style}
            </button>
          );
        })}
      </div>

      <p className="text-center font-body text-sm text-muted-foreground mt-4">
        {data.styles.length}/5 selected
      </p>
    </div>
  );
}
