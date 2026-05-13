import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { getStrings } from "@/lib/strings";
import { getBrand } from "@/lib/brand";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Class component can't use hooks; read brand from the singleton instead.
      const t = getStrings(getBrand().lang);
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground mb-2">{t.errorBoundary.title}</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {t.errorBoundary.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl gold-gradient text-primary-foreground font-body text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t.errorBoundary.refresh}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
