import { useState, useRef } from "react";
import { X, Upload, ArrowRight, ArrowLeft, Sparkles, MapPin, Clock, Users, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const STYLES = ["Portrait", "Fashion", "Lifestyle", "Editorial", "Boudoir", "Fine Art", "Fitness", "Commercial", "Street", "Conceptual", "Beauty", "Couples"];
const TYPE_OPTIONS = ["Model", "Photographer", "MUA", "Stylist"];
const DURATION_OPTIONS = ["1h", "2h", "3h", "4h+", "Half Day", "Full Day"];

interface Props { open: boolean; onClose: () => void; onCreated?: () => void; }

export default function CreateCastingModal({ open, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const t = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const STEPS = [
    { title: t.modals.whatsTheShoot, subtitle: t.modals.nameAndVibe },
    { title: t.modals.whoAndWhen, subtitle: t.modals.talentDateLogistics },
    { title: t.modals.finalDetails, subtitle: t.modals.locationMoodboard },
  ];

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [typeNeeded, setTypeNeeded] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isFlexible, setIsFlexible] = useState(false);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isIndoor, setIsIndoor] = useState(true);
  const [slots, setSlots] = useState(1);
  const [duration, setDuration] = useState("");
  const [requirements, setRequirements] = useState("");
  const [moodboard, setMoodboard] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm font-body focus:outline-none focus:border-primary/40 transition-colors";

  const chipClass = (active: boolean) =>
    cn("px-3.5 py-2 rounded-full text-xs font-body font-medium transition-all", active ? "gold-gradient text-primary-foreground scale-105" : "bg-card/50 border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground");

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setTitle(""); setDescription(""); setTypeNeeded([]); setStyles([]);
      setSelectedDate(undefined); setIsFlexible(false); setTime(""); setLocation("");
      setIsIndoor(true); setSlots(1); setDuration(""); setRequirements("");
      setMoodboard([]);
    }, 300);
  };

  const uploadMoodboard = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    for (const file of Array.from(files).slice(0, 5 - moodboard.length)) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); continue; }
      const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("portfolios").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("portfolios").getPublicUrl(path);
        setMoodboard((prev) => [...prev, data.publicUrl]);
      }
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || !description.trim()) { toast.error(t.common.error); return; }
    setSaving(true);
    const { error } = await supabase.from("casting_calls").insert({
      creator_id: user.id,
      title: title.trim(),
      description: description.trim(),
      type_needed: typeNeeded.length > 0 ? typeNeeded : ["Model"],
      styles,
      proposed_date: isFlexible ? null : (selectedDate ? format(selectedDate, "yyyy-MM-dd") : null),
      proposed_time: time || null,
      is_flexible_date: isFlexible,
      location: location || null,
      is_indoor: isIndoor,
      slots,
      duration: duration || null,
      requirements: requirements || null,
      moodboard_urls: moodboard,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.modals.publishCasting);
      onCreated?.();
      resetAndClose();
    }
    setSaving(false);
  };

  const canProceed = step === 0 ? title.trim().length > 0 && description.trim().length > 0 : true;

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary/70 font-body">{t.modals.newCasting}</p>
                <h2 className="font-heading text-lg font-bold text-foreground">{STEPS[step].title}</h2>
                <p className="text-xs text-muted-foreground font-body">{STEPS[step].subtitle}</p>
              </div>
              <button onClick={resetAndClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mb-5 mt-3">
              {STEPS.map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-border")} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5">{t.modals.titleLabel} *</label>
                      <input value={title} onChange={(e) => { if (e.target.value.length <= 80) setTitle(e.target.value); }} placeholder={t.modals.titlePlaceholder} className={inputClass} autoFocus />
                      <p className="text-right text-[10px] text-muted-foreground mt-0.5">{title.length}/80</p>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5">{t.modals.descriptionLabel} *</label>
                      <textarea value={description} onChange={(e) => { if (e.target.value.length <= 500) setDescription(e.target.value); }} rows={3} placeholder={t.modals.descriptionPlaceholder} className={cn(inputClass, "resize-none")} />
                      <p className="text-right text-[10px] text-muted-foreground mt-0.5">{description.length}/500</p>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-2">{t.modals.stylesLabel}</label>
                      <div className="flex flex-wrap gap-2">
                        {STYLES.map((s) => (
                          <button key={s} onClick={() => toggleArr(styles, s, setStyles)} className={chipClass(styles.includes(s))}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {t.modals.whoNeeded}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TYPE_OPTIONS.map((tp) => (
                          <button key={tp} onClick={() => toggleArr(typeNeeded, tp, setTypeNeeded)} className={chipClass(typeNeeded.includes(tp))}>{tp}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5">{t.modals.howManySlots}</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSlots(Math.max(1, slots - 1))} className="w-10 h-10 rounded-xl border border-border text-foreground flex items-center justify-center hover:bg-foreground/5 transition-colors text-lg">−</button>
                        <span className="text-lg font-heading font-bold text-foreground w-8 text-center">{slots}</span>
                        <button onClick={() => setSlots(Math.min(10, slots + 1))} className="w-10 h-10 rounded-xl border border-border text-foreground flex items-center justify-center hover:bg-foreground/5 transition-colors text-lg">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.modals.when}
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn(inputClass, "text-left flex items-center justify-between flex-1", isFlexible && "opacity-40")} disabled={isFlexible}>
                              {selectedDate ? format(selectedDate, "PPP") : <span className="text-muted-foreground/60">{t.modals.pickDate}</span>}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date()} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                        <button onClick={() => { setIsFlexible(!isFlexible); if (!isFlexible) setSelectedDate(undefined); }} className={chipClass(isFlexible)}>
                          {t.castings.flexible}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {[t.modals.morning, t.modals.afternoon, t.modals.evening].map((tp, i) => {
                          const enVals = ["Morning", "Afternoon", "Evening"];
                          return <button key={tp} onClick={() => setTime(time === enVals[i] ? "" : enVals[i])} className={cn("flex-1 py-2 rounded-xl text-center", chipClass(time === enVals[i]))}>{tp}</button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.modals.duration}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((d) => (
                          <button key={d} onClick={() => setDuration(duration === d ? "" : d)} className={chipClass(duration === d)}>{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t.modals.locationLabel}
                      </label>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.modals.locationPlaceholder} className={inputClass} autoFocus />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setIsIndoor(true)} className={chipClass(isIndoor)}>{t.modals.indoor}</button>
                        <button onClick={() => setIsIndoor(false)} className={chipClass(!isIndoor)}>{t.modals.outdoor}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Image className="w-3 h-3" /> {t.modals.moodboard} ({moodboard.length}/5)
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {moodboard.map((url, i) => (
                          <div key={i} className="relative w-16 h-16">
                            <img src={url} alt="" className="w-full h-full rounded-lg object-cover" />
                            <button onClick={() => setMoodboard((p) => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                              <X className="w-3 h-3 text-destructive-foreground" />
                            </button>
                          </div>
                        ))}
                        {moodboard.length < 5 && (
                          <button onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            {uploading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadMoodboard(e.target.files)} />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {t.modals.requirements} <span className="text-muted-foreground/50">({t.modals.optional})</span>
                      </label>
                      <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={2} placeholder={t.modals.requirementsPlaceholder} className={cn(inputClass, "resize-none")} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground font-body text-sm flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t.common.back}
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed} className="flex-1 py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
                  {t.modals.continue} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={saving || !title.trim() || !description.trim()} className="flex-1 py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
                  {saving ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : t.modals.publishCasting}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}