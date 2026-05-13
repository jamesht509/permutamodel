import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <p className="font-heading text-5xl md:text-7xl font-bold text-primary mb-2">404</p>
        <h1 className="font-heading text-xl font-bold text-foreground mb-2">{t.notFound.title}</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {t.notFound.body}
        </p>
        <button
          onClick={() => navigate("/discover")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.notFound.backToDiscover}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
