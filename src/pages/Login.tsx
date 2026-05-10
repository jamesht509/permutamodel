import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "@/hooks/useTranslation";
import { useDevice } from "@/hooks/useDevice";
import { toast } from "sonner";

const GALLERY = [
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=85",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=85",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=85",
];

export default function Login() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const brand = useBrand();
  const t = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={`/discover${location.search}`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error(t.login.passwordsDontMatch);
        setSubmitting(false);
        return;
      }
      if (!name.trim()) {
        toast.error(t.login.enterName);
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error(t.login.alreadyRegistered);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(t.login.checkEmail, { duration: 6000 });
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      }
    }
    setSubmitting(false);
  };

  const inputClass =
    "w-full px-4 py-3 pl-11 rounded-xl bg-foreground/[0.04] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all font-body text-sm";

  const formContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto"
    >
      {/* Back to landing */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-body text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Logo */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">{brand.name}</h1>
        <p className="font-accent italic text-primary text-base mt-1">{brand.tagline}</p>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {isSignUp ? t.login.createAccount : "Welcome back"}
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {isSignUp ? "Join the creative community" : "Sign in to continue"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.login.fullNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
          </motion.div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="email"
            placeholder={t.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t.login.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {isSignUp && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="password"
                placeholder={t.login.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </motion.div>
        )}

        {!isSignUp && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-xs font-body text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl gold-gradient text-primary-foreground font-body font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-primary/20"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              {isSignUp ? t.login.creatingAccount : t.login.signingIn}
            </span>
          ) : (
            isSignUp ? t.login.createAccount : t.login.signIn
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={async () => {
          const { error } = await signInWithGoogle();
          if (error) toast.error(error.message);
        }}
        className="w-full py-3 rounded-xl bg-foreground/[0.06] border border-border text-foreground font-body text-sm font-medium hover:bg-foreground/[0.1] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Toggle */}
      <p className="text-center text-sm font-body text-muted-foreground mt-6">
        {isSignUp ? t.login.alreadyHaveAccount : t.login.dontHaveAccount}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary font-semibold hover:underline"
        >
          {isSignUp ? t.login.signIn : t.login.signUp}
        </button>
      </p>
    </motion.div>
  );

  // ── DESKTOP: Split-screen ──
  if (isDesktop) {
    return (
      <div className="min-h-[100dvh] flex bg-background">
        {/* Left: Editorial Photo */}
        <div className="hidden lg:block w-[55%] relative overflow-hidden">
          <img
            src={GALLERY[Math.floor(Date.now() / 86400000) % GALLERY.length]}
            alt="Creative photography"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
          
          {/* Overlay text */}
          <div className="absolute bottom-12 left-12 right-24">
            <p className="font-accent italic text-primary text-lg mb-2">The premier TFP network</p>
            <h2 className="font-heading text-4xl font-bold text-foreground leading-tight">
              Where Photographers<br />& Models <span className="gold-text">Create Together</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md">
              Connect with talented creatives. Build your portfolio through collaborative shoots.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          {formContent}
        </div>
      </div>
    );
  }

  // ── MOBILE: Centered card ──
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-5 py-10">
      {formContent}
    </div>
  );
}
