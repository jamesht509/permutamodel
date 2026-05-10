import { Slider } from "@/components/ui/slider";
import type { OnboardingData } from "@/pages/Onboarding";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Morning", "Afternoon", "Evening"];

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
}

export default function StepAvailability({ data, update }: Props) {
  const toggleDay = (day: string) => {
    const current = data.availability.days;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    update({ availability: { ...data.availability, days: updated } });
  };

  const toggleTime = (time: string) => {
    const current = data.availability.times;
    const updated = current.includes(time)
      ? current.filter((t) => t !== time)
      : [...current, time];
    update({ availability: { ...data.availability, times: updated } });
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h2 className="font-heading text-2xl font-bold text-foreground">When are you available?</h2>

      {/* Days */}
      <div>
        <p className="font-body text-sm text-muted-foreground mb-3">Select your available days</p>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day) => {
            const selected = data.availability.days.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
                  selected
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.08)]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Times */}
      <div>
        <p className="font-body text-sm text-muted-foreground mb-3">Preferred times</p>
        <div className="flex gap-2 flex-wrap">
          {TIMES.map((time) => {
            const selected = data.availability.times.includes(time);
            return (
              <button
                key={time}
                onClick={() => toggleTime(time)}
                className={`px-5 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
                  selected
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.08)]"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance slider */}
      <div>
        <p className="font-body text-sm text-muted-foreground mb-1">
          How far are you willing to travel?
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-xs text-muted-foreground">5 mi</span>
          <span className="font-heading text-lg font-bold text-primary">
            {data.distance_radius} mi
          </span>
          <span className="font-body text-xs text-muted-foreground">100 mi</span>
        </div>
        <Slider
          value={[data.distance_radius]}
          onValueChange={([v]) => update({ distance_radius: v })}
          min={5}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
}
