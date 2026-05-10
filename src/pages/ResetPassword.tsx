import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/discover");
    }
    setSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Invalid reset link.</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 pl-11 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-6">
          Reset Password
        </h1>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} required />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold">
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
