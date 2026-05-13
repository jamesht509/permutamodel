import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/discover", { replace: true });
      } else if (event === "SIGNED_OUT") {
        navigate("/login", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        toast.error(error.message);
        navigate("/login", { replace: true });
        return;
      }
      if (data.session?.user) {
        navigate("/discover", { replace: true });
      }
    });

    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    const errorDescription = params.get("error_description") || params.get("error");
    if (errorDescription) {
      toast.error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
      navigate("/login", { replace: true });
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-xs text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
