import { useState } from "react";
import { X, Send, ArrowRight, ArrowLeft, Calendar, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const CONCEPTS = ["Editorial", "Street", "Studio", "Lifestyle", "Beauty", "Fashion", "Commercial", "Other"];

interface Props {
  open: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

export default function TfpRequestModal({ open, onClose, receiverId, receiverName }: Props) {
  const { user } = useAuth();
  const t = useTranslation();
  const firstName = receiverName.split(" ")[0];

  const STEPS = [
    { title: t.modals.whatsTheIdea, icon: "✦" },
    { title: t.modals.details, icon: "◐" },
    { title: t.modals.personalTouch, icon: "♡" },
  ];

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm font-body focus:outline-none focus:border-primary/40 transition-colors";

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setTitle(""); setConcept(""); setSelectedDate(undefined); setLocation(""); setDescription(""); setMessage("");
    }, 300);
  };

  const handleSend = async () => {
    if (!user || !title.trim()) {
      toast.error(t.modals.projectName);
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("tfp_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message || null,
        proposed_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
        proposed_location: location || null,
        style: concept || null,
        duration: null,
      });
      if (error) throw error;

      const senderName = user.user_metadata?.name || "Someone";
      const tfpNew = t.notifs.tfp_request_new({ name: senderName, title });
      await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "tfp_request",
        kind: "tfp_request_new",
        params: { name: senderName, title },
        title: tfpNew.title,
        body: tfpNew.body,
        data: { sender_id: user.id },
      });

      toast.success(t.modals.sendRequest + " ✉️");
      resetAndClose();
    } catch (err: any) {
      toast.error(err.message || t.common.error);
    } finally {
      setSending(false);
    }
  };

  const canProceed = step === 0 ? title.trim().length > 0 : true;

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
                <p className="text-[10px] uppercase tracking-widest text-primary/70 font-body">{t.modals.collaborateWith} {firstName}</p>
                <h2 className="font-heading text-lg font-bold text-foreground">{STEPS[step].icon} {STEPS[step].title}</h2>
              </div>
              <button onClick={resetAndClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-border")} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5">{t.modals.projectName} *</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 100))} placeholder={t.modals.projectNamePlaceholder} className={inputClass} autoFocus />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-2">{t.modals.whatsTheVibe}</label>
                      <div className="flex flex-wrap gap-2">
                        {CONCEPTS.map((c) => (
                          <button key={c} onClick={() => setConcept(concept === c ? "" : c)} className={cn("px-3.5 py-2 rounded-full text-xs font-body font-medium transition-all", concept === c ? "gold-gradient text-primary-foreground scale-105" : "bg-card/50 border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground")}>{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t.modals.when} <span className="text-muted-foreground/50">({t.modals.optional})</span>
                      </label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button className={cn(inputClass, "text-left flex items-center justify-between")}>
                            {selectedDate ? <span>{format(selectedDate, "PPP")}</span> : <span className="text-muted-foreground/60">{t.modals.pickDate}</span>}
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                          <CalendarComponent mode="single" selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setCalendarOpen(false); }} disabled={(date) => date < new Date()} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t.modals.where} <span className="text-muted-foreground/50">({t.modals.optional})</span>
                      </label>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value.slice(0, 200))} placeholder={t.modals.wherePlaceholder} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {t.modals.vision} <span className="text-muted-foreground/50">({t.modals.optional})</span>
                      </label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} placeholder={t.modals.visionPlaceholder} rows={3} className={cn(inputClass, "resize-none")} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground font-body">{t.modals.personalNote}</p>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))} placeholder={`${firstName}, ${t.modals.personalNotePlaceholder}`} rows={5} className={cn(inputClass, "resize-none")} autoFocus />
                    <p className="text-right text-[10px] text-muted-foreground">{message.length}/500</p>
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
                <button onClick={handleSend} disabled={sending || !title.trim()} className="flex-1 py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
                  {sending ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> {t.modals.sendRequest}</>}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}