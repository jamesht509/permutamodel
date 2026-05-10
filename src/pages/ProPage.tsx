import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Camera, BarChart3, Search, Upload, Star, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { toast } from "sonner";
import { motion } from "framer-motion";

const FEATURES = [
  { label: "Portfolio Photos", free: "20 max", pro: "Unlimited", icon: Camera },
  { label: "Search Priority", free: "Standard", pro: "Top Results", icon: Search },
  { label: "Profile Badge", free: "—", pro: "PRO Badge", icon: Crown },
  { label: "Profile Analytics", free: "—", pro: "Full Analytics", icon: BarChart3 },
  { label: "Featured Creatives", free: "—", pro: "Highlighted", icon: Star },
  { label: "Photo Uploads", free: "5MB max", pro: "10MB + compression", icon: Upload },
];

export default function ProPage() {
  const { user, profile, refreshProfile } = useAuth();
  const brand = useBrand();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const isPro = profile?.plan === "pro" || profile?.plan === "premium";

  const handleUpgrade = () => {
    toast("Coming Soon! 🚀", {
      description: "Stripe payment integration is being finalized. Stay tuned!",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">{brand.name} PRO</h1>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
        <div className="relative px-6 pt-12 pb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center mb-5 shadow-lg shadow-primary/30"
          >
            <Crown className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-3xl font-bold text-foreground"
          >
            Elevate Your
            <br />
            <span className="gold-text">Creative Career</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-body text-sm text-muted-foreground mt-3 max-w-xs mx-auto"
          >
            Stand out, get discovered faster, and unlock powerful tools to grow your portfolio.
          </motion.p>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-1 bg-card rounded-xl p-1 border border-border max-w-xs mx-auto">
          <button
            onClick={() => setBilling("monthly")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
              billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-body font-medium transition-all relative ${
              billing === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-[hsl(var(--success))] text-[9px] font-bold text-primary-foreground">
              -33%
            </span>
          </button>
        </div>

        {/* Price */}
        <motion.div
          key={billing}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-heading text-4xl md:text-5xl font-bold gold-text">
              ${billing === "monthly" ? "9.99" : "79.99"}
            </span>
            <span className="font-body text-sm text-muted-foreground">
              /{billing === "monthly" ? "mo" : "yr"}
            </span>
          </div>
          {billing === "annual" && (
            <p className="font-body text-xs text-[hsl(var(--success))] mt-1">
              Save $39.89 per year · ~$6.67/month
            </p>
          )}
        </motion.div>

        {/* Comparison Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 border-b border-border">
            <div className="px-4 py-3">
              <span className="font-body text-xs text-muted-foreground">Feature</span>
            </div>
            <div className="px-3 py-3 text-center border-x border-border">
              <span className="font-body text-xs text-muted-foreground">Free</span>
            </div>
            <div className="px-3 py-3 text-center bg-primary/5">
              <span className="font-body text-xs font-bold text-primary flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> PRO
              </span>
            </div>
          </div>
          {FEATURES.map((f, i) => (
            <div key={f.label} className={`grid grid-cols-3 ${i < FEATURES.length - 1 ? "border-b border-border/50" : ""}`}>
              <div className="px-4 py-3 flex items-center gap-2">
                <f.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-body text-xs text-foreground">{f.label}</span>
              </div>
              <div className="px-3 py-3 text-center border-x border-border/50 flex items-center justify-center">
                <span className="font-body text-xs text-muted-foreground">{f.free}</span>
              </div>
              <div className="px-3 py-3 text-center bg-primary/5 flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="font-body text-xs text-primary font-medium">{f.pro}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isPro ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-heading text-sm font-bold text-primary">You're a PRO member!</span>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            className="w-full py-4 rounded-2xl bg-muted border border-border text-muted-foreground font-heading text-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Coming Soon
          </motion.button>
        )}

        {/* Testimonial */}
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <p className="font-body text-xs text-muted-foreground italic">
            "PRO changed everything. I went from 2 bookings a month to 10+. The visibility boost is real."
          </p>
          <p className="font-body text-[10px] text-primary mt-2">— Sarah K., Fashion Photographer</p>
        </div>

        <p className="text-center font-body text-[10px] text-muted-foreground pb-4">
          Payment via Stripe coming soon. PRO features will be available after beta launch.
        </p>
      </div>
    </div>
  );
}
