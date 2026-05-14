import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "@/hooks/useTranslation";
import { geocodeAddress } from "@/lib/geocoding";
import { isValidHandle } from "@/lib/instagram";
import StepAboutYou from "@/components/onboarding/StepAboutYou";
import StepCraft from "@/components/onboarding/StepCraft";
import StepShowWork from "@/components/onboarding/StepShowWork";

const TOTAL_STEPS = 3;

export interface OnboardingData {
  // Step 1
  name: string;
  avatar_url: string | null;
  bio: string;
  city: string;
  state: string;
  instagram: string;
  latitude: number | null;
  longitude: number | null;
  // Step 2
  role: string;
  experience: string;
  styles: string[];
  tfpAvailable: boolean;
  // Step 3
  portfolioUrls: { url: string; file?: File }[];
  // Legacy compat
  availability: { days: string[]; times: string[] };
  distance_radius: number;
}

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const brand = useBrand();
  const t = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    name: profile?.name ?? "",
    avatar_url: null,
    bio: "",
    city: "",
    state: "",
    instagram: "",
    latitude: null,
    longitude: null,
    role: "photographer",
    experience: "newcomer",
    styles: [],
    tfpAvailable: true,
    portfolioUrls: [],
    availability: { days: [], times: [] },
    distance_radius: 50,
  });

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  // Step 1: name + avatar + city + state required. Instagram is OPTIONAL
  //   (Fase 6 change); when present it must pass the handle regex (checked
  //   in `next()` with a separate toast, NOT as a "missing" field).
  // Step 2: role + at least 1 style (max 5 enforced inside StepCraft).
  // Step 3: at least 1 portfolio photo.
  const canContinue = (): boolean => {
    switch (step) {
      case 1:
        return (
          !!data.name.trim() &&
          !!data.avatar_url &&
          !!data.city.trim() &&
          !!data.state.trim()
        );
      case 2: return !!data.role && data.styles.length >= 1;
      case 3: return data.portfolioUrls.length >= 1;
      default: return false;
    }
  };

  const getMissingFields = (): string[] => {
    const m = t.onboardingShell.missingFields;
    const missing: string[] = [];
    if (step === 1) {
      if (!data.name.trim()) missing.push(m.name);
      if (!data.avatar_url) missing.push(m.avatar);
      if (!data.city.trim() || !data.state.trim()) missing.push(m.location);
    }
    if (step === 2) {
      if (data.styles.length === 0) missing.push(m.styles);
    }
    if (step === 3) {
      if (data.portfolioUrls.length === 0) missing.push(m.portfolio);
    }
    return missing;
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Save portfolio photos
      for (let i = 0; i < data.portfolioUrls.length; i++) {
        const photo = data.portfolioUrls[i];
        await supabase.from("photos").insert({
          user_id: user.id,
          url: photo.url,
          position: i,
          is_cover: i === 0,
        });
      }

      // Geocode if needed
      let lat = data.latitude;
      let lng = data.longitude;
      if ((!lat || !lng) && data.city && data.state) {
        const locationData = await geocodeAddress(data.city, data.state);
        if (locationData) {
          lat = locationData.latitude;
          lng = locationData.longitude;
        }
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          role: data.role as any,
          name: data.name,
          avatar_url: data.avatar_url,
          city: data.city.trim() || null,
          state: data.state.trim() || null,
          bio: data.bio.trim() || null,
          instagram: data.instagram.trim() || null,
          styles: data.styles,
          user_level: data.experience as any,
          availability: { ...data.availability, tfp_available: data.tfpAvailable } as any,
          distance_radius: data.distance_radius,
          lat,
          lng,
          country: brand.country,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(t.onboardingShell.welcomeToast(brand.name));

      // Send welcome email (fire-and-forget)
      supabase.functions.invoke("send-welcome", {
        body: { name: data.name },
      }).catch(() => {});

      navigate("/discover");
    } catch (err: any) {
      toast.error(err.message || t.onboardingShell.genericError);
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    // Instagram is optional, but if provided it must look like a real
    // handle. Surfaces as a separate toast (NOT a "missing field" entry),
    // so the user can clearly see "fix the handle" vs "fill the blanks".
    if (step === 1 && data.instagram.trim() && !isValidHandle(data.instagram)) {
      toast.error(t.validation.invalidInstagram);
      return;
    }
    if (step === TOTAL_STEPS) {
      handleComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const stepTitles = [
    t.onboardingShell.stepAboutYou,
    t.onboardingShell.stepYourCraft,
    t.onboardingShell.stepYourWork,
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          {step > 1 ? (
            <button onClick={back} className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <span className="font-body text-sm text-muted-foreground">
            {step}/{TOTAL_STEPS} · {stepTitles[step - 1]}
          </span>
          <div className="w-9" />
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-muted/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={false}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <StepAboutYou data={data} update={update} userId={user?.id ?? ""} />}
            {step === 2 && <StepCraft data={data} update={update} />}
            {step === 3 && <StepShowWork data={data} update={update} userId={user?.id ?? ""} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      <div className="px-4 pb-6 pt-2 space-y-2">
        <button
          onClick={next}
          disabled={!canContinue() || saving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold text-lg hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              {t.onboardingShell.settingUp}
            </span>
          ) : step === TOTAL_STEPS ? (
            t.onboardingShell.completeSetup
          ) : (
            t.cta.continue
          )}
        </button>
        {!canContinue() && (
          <p className="text-center text-xs font-body text-muted-foreground">
            {getMissingFields().length > 0 && `${t.onboardingShell.missingPrefix}: ${getMissingFields().join(", ")}`}
          </p>
        )}
      </div>
    </div>
  );
}
