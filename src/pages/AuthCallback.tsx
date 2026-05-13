import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const goSuccess = () => {
      if (!cancelled) navigate("/discover", { replace: true });
    };
    const goError = (message: string) => {
      if (cancelled) return;
      toast.error(message);
      navigate("/login", { replace: true });
    };

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hashParams.get("error_description") || hashParams.get("error");
    const queryError = searchParams.get("error_description") || searchParams.get("error");
    const errorDescription = hashError || queryError;
    if (errorDescription) {
      goError(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) goSuccess();
    });

    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          goError(error.message);
          return;
        }
        if (data.session?.user) goSuccess();
      });
    } else {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          goError(error.message);
          return;
        }
        if (data.session?.user) goSuccess();
      });
    }

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-xs text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
