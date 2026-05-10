import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { trackSignup, trackLogin } from "@/lib/tracking";

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  verified_level: string;
  rating_avg: number;
  total_reviews: number;
  total_sessions: number;
  user_level: string;
  styles: string[];
  equipment: string[];
  instagram: string | null;
  website: string | null;
  has_studio: boolean;
  distance_radius: number | null;
  availability: any;
  onboarding_completed: boolean;
  created_at: string;
  lat: number | null;
  lng: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as unknown as Profile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Initialize auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          // Track geo + device (fire-and-forget, don't block auth)
          if (_event === "SIGNED_IN") {
            // Check if first login (no signup_country yet)
            supabase.from("profiles").select("signup_country, login_count").eq("id", session.user.id).single().then(({ data }) => {
              if (!(data as any)?.signup_country) {
                trackSignup(session.user.id).catch(() => {});
              } else {
                trackLogin(session.user.id).catch(() => {});
              }
            });
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Heartbeat: update last_active every 60s
  useEffect(() => {
    if (!user) return;

    const updatePresence = () => {
      supabase.from("profiles").update({ last_active: new Date().toISOString() }).eq("id", user.id).then();
    };

    updatePresence(); // immediately on login
    const interval = setInterval(updatePresence, 60_000);

    // Also update on visibility change (tab focus)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") updatePresence();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Use custom domain for redirect, not the Lovable preview URL
    const isCustomDomain = !window.location.hostname.includes("lovable.app") && !window.location.hostname.includes("lovableproject.com");
    const redirectTo = isCustomDomain ? window.location.origin : "https://collabshoot.com";
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: redirectTo,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    return { error: result.error ? (result.error instanceof Error ? result.error : new Error(String(result.error))) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
