import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Crown, Bell, Shield, Heart,
  Ban, Info, MessageSquare, LogOut, ChevronRight, ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const NOTIF_TYPES = [
  "TFP Requests", "Messages", "Session Reminders", "Reviews", "Casting Matches", "Profile Views",
];

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIF_TYPES.map((t) => [t, true]))
  );
  const [pushEnabled, setPushEnabled] = useState(true);

  // Privacy
  const [requestPref, setRequestPref] = useState("everyone");
  const [hideProfile, setHideProfile] = useState(false);
  const [hideDistance, setHideDistance] = useState(false);
  const [showOnline, setShowOnline] = useState(true);

  // Settings loaded flag
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Account modals
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Load persisted settings from profile
  useEffect(() => {
    if (!user || settingsLoaded) return;
    supabase
      .from("profiles")
      .select("push_notifications_enabled, private_mode, show_online_status, notification_prefs, request_preference, hide_distance")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPushEnabled(data.push_notifications_enabled ?? true);
          setHideProfile(data.private_mode ?? false);
          setShowOnline(data.show_online_status ?? true);
          setRequestPref((data as any).request_preference ?? "everyone");
          setHideDistance((data as any).hide_distance ?? false);
          const savedNotifs = (data as any).notification_prefs as Record<string, boolean> | null;
          if (savedNotifs && typeof savedNotifs === "object") {
            setNotifPrefs(prev => ({ ...prev, ...savedNotifs }));
          }
        }
        setSettingsLoaded(true);
      });
  }, [user, settingsLoaded]);

  const updateProfileSetting = async (fields: Record<string, any>) => {
    if (!user) return false;
    const { error } = await supabase
      .from("profiles")
      .update(fields)
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to save setting");
      return false;
    }
    return true;
  };

  const handleTogglePush = async (v: boolean) => {
    setPushEnabled(v);
    const ok = await updateProfileSetting({ push_notifications_enabled: v });
    if (!ok) setPushEnabled(!v);
  };

  const handleTogglePrivateMode = async (v: boolean) => {
    setHideProfile(v);
    const ok = await updateProfileSetting({ private_mode: v });
    if (!ok) setHideProfile(!v);
  };

  const handleToggleShowOnline = async (v: boolean) => {
    setShowOnline(v);
    const ok = await updateProfileSetting({ show_online_status: v });
    if (!ok) setShowOnline(!v);
  };

  const handleToggleHideDistance = async (v: boolean) => {
    setHideDistance(v);
    const ok = await updateProfileSetting({ hide_distance: v });
    if (!ok) setHideDistance(!v);
  };

  const handleNotifPrefChange = async (type: string, v: boolean) => {
    const updated = { ...notifPrefs, [type]: v };
    setNotifPrefs(updated);
    const ok = await updateProfileSetting({ notification_prefs: updated });
    if (!ok) setNotifPrefs(prev => ({ ...prev, [type]: !v }));
  };

  const handleRequestPrefChange = async (opt: string) => {
    const prev = requestPref;
    setRequestPref(opt);
    const ok = await updateProfileSetting({ request_preference: opt });
    if (!ok) setRequestPref(prev);
  };

  // Safety
  const [emergencyContact, setEmergencyContact] = useState({ name: "", phone: "", relationship: "" });
  const [ecLoaded, setEcLoaded] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Logout/delete confirm
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<{ id: string; blocked_id: string; name: string; avatar_url: string | null }[]>([]);

  // Load emergency contact
  useEffect(() => {
    if (!user || ecLoaded) return;
    supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) {
          setEmergencyContact({ name: data[0].name, phone: data[0].phone, relationship: data[0].relationship || "" });
        }
        setEcLoaded(true);
      });
  }, [user, ecLoaded]);

  // Load blocked users
  useEffect(() => {
    if (!user) return;
    const loadBlocked = async () => {
      const { data } = await supabase
        .from("blocked_users")
        .select("id, blocked_id")
        .eq("blocker_id", user.id);
      if (data && data.length > 0) {
        const blockedIds = data.map((b) => b.blocked_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", blockedIds);
        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        setBlockedUsers(
          data.map((b) => ({
            id: b.id,
            blocked_id: b.blocked_id,
            name: profileMap.get(b.blocked_id)?.name || "Unknown",
            avatar_url: profileMap.get(b.blocked_id)?.avatar_url || null,
          }))
        );
      }
    };
    loadBlocked();
  }, [user]);

  const toggle = (section: string) => setExpanded((prev) => (prev === section ? null : section));

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const saveEmergencyContact = async () => {
    if (!user || !emergencyContact.name.trim() || !emergencyContact.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    const { data: existing } = await supabase
      .from("emergency_contacts")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("emergency_contacts")
        .update({ name: emergencyContact.name, phone: emergencyContact.phone, relationship: emergencyContact.relationship || null })
        .eq("id", existing[0].id);
    } else {
      await supabase.from("emergency_contacts").insert({
        user_id: user.id,
        name: emergencyContact.name,
        phone: emergencyContact.phone,
        relationship: emergencyContact.relationship || null,
      });
    }
    toast.success("Emergency contact saved");
  };

  const sendFeedback = async () => {
    if (!user || !feedback.trim()) return;
    setSendingFeedback(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        message: feedback.trim(),
      });
      if (error) throw error;
      toast.success("Thank you for your feedback!");
      setFeedback("");
    } catch {
      toast.error("Failed to send feedback");
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation email sent to both addresses. Check your inbox.");
      setNewEmail("");
      setShowChangeEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete account");
      toast.success("Account deleted");
      await signOut();
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const Section = ({ id, icon: Icon, label, danger, children }: {
    id: string; icon: any; label: string; danger?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-card/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
          <span className={`font-body text-sm ${danger ? "text-destructive" : "text-foreground"}`}>{label}</span>
        </div>
        {expanded === id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded === id && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-primary" : "bg-muted"}`}
      >
        <div className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 transition-transform`}
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );

  const inputClass = "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">{t.settings.title}</h1>
      </div>

      {/* Edit Profile CTA */}
      <button
        onClick={() => navigate("/profile/edit")}
        className="w-full flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-card/30 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
              {profile?.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-heading text-sm font-semibold text-foreground">{profile?.name}</p>
          <p className="font-body text-xs text-primary">{t.profile.editProfile} →</p>
        </div>
      </button>

      {/* Account */}
      <Section id="account" icon={User} label={t.settings.account}>
        {/* Change Email */}
        {showChangeEmail ? (
          <div className="space-y-2">
            <p className="text-xs font-body text-muted-foreground">Current: {user?.email}</p>
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email address" className={inputClass} />
            <div className="flex gap-2">
              <button onClick={() => setShowChangeEmail(false)} className="flex-1 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-body">{t.settings.cancel}</button>
              <button onClick={handleChangeEmail} disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-40">
                {saving ? t.settings.saving : t.settings.changeEmail}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowChangeEmail(true)} className="w-full text-left py-2 text-sm font-body text-foreground hover:text-primary">{t.settings.changeEmail}</button>
        )}

        {/* Change Password */}
        {showChangePassword ? (
          <div className="space-y-2">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className={inputClass} />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={inputClass} />
            <div className="flex gap-2">
              <button onClick={() => { setShowChangePassword(false); setNewPassword(""); setConfirmPassword(""); }} className="flex-1 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-body">{t.settings.cancel}</button>
              <button onClick={handleChangePassword} disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-40">
                {saving ? t.settings.saving : t.settings.changePassword}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowChangePassword(true)} className="w-full text-left py-2 text-sm font-body text-foreground hover:text-primary">{t.settings.changePassword}</button>
        )}

        <button onClick={() => setShowDelete(true)} className="w-full text-left py-2 text-sm font-body text-destructive">{t.settings.deleteAccount}</button>
      </Section>

      {/* Plan */}
      <Section id="plan" icon={Crown} label="Subscription">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-body text-sm text-foreground">Current Plan:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            profile?.plan === "pro" || profile?.plan === "premium" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {(profile?.plan || "free").toUpperCase()}
          </span>
        </div>
        {(profile?.plan === "pro" || profile?.plan === "premium") && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-heading text-sm font-bold text-foreground">You're a PRO member!</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Enjoy unlimited photos, priority search, and analytics.</p>
          </div>
        )}
        {/* FASE 6: PRO upgrade card hidden for free users. Stripe
            monetization comes in Sessão 5+; existing PRO/Premium users
            still see their badge above. */}
      </Section>

      {/* Notifications */}
      <Section id="notifications" icon={Bell} label={t.settings.notifications}>
        <Toggle value={pushEnabled} onChange={handleTogglePush} label={t.settings.pushNotifications} />
        <div className="h-px bg-border my-1" />
        {NOTIF_TYPES.map((type) => (
          <Toggle
            key={type}
            value={notifPrefs[type]}
            onChange={(v) => handleNotifPrefChange(type, v)}
            label={type}
          />
        ))}
      </Section>

      {/* Privacy */}
      <Section id="privacy" icon={Shield} label={t.settings.privacy}>
        <div>
          <p className="text-xs font-body text-muted-foreground mb-1.5">{t.settings.requestsFrom}</p>
          <div className="flex gap-2">
            {["everyone", "verified", "nobody"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleRequestPrefChange(opt)}
                className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                  requestPref === opt
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {opt === "everyone" ? t.settings.everyone : opt === "verified" ? t.settings.verified : t.settings.noOne}
              </button>
            ))}
          </div>
        </div>
        <Toggle value={hideProfile} onChange={handleTogglePrivateMode} label={t.settings.hideProfile} />
        <Toggle value={hideDistance} onChange={handleToggleHideDistance} label={t.settings.hideDistance} />
        <Toggle value={showOnline} onChange={handleToggleShowOnline} label={t.settings.showOnline} />
      </Section>

      {/* Safety */}
      <Section id="safety" icon={Heart} label="Safety">
        <div className="space-y-2">
          <p className="text-xs font-body text-muted-foreground">Emergency Contact</p>
          <input value={emergencyContact.name} onChange={(e) => setEmergencyContact((p) => ({ ...p, name: e.target.value }))} placeholder="Contact Name" className={inputClass} />
          <input value={emergencyContact.phone} onChange={(e) => setEmergencyContact((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className={inputClass} />
          <input value={emergencyContact.relationship} onChange={(e) => setEmergencyContact((p) => ({ ...p, relationship: e.target.value }))} placeholder="Relationship (optional)" className={inputClass} />
          <button onClick={saveEmergencyContact} className="w-full py-2 rounded-xl bg-primary/10 text-primary text-sm font-body font-medium">
            Save Contact
          </button>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-body text-foreground">Verification Status</p>
            <p className="text-xs font-body text-muted-foreground capitalize">{profile?.verified_level || "none"}</p>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-body font-medium">
            Upgrade
          </button>
        </div>
      </Section>

      {/* Blocked Users */}
      <Section id="blocked" icon={Ban} label={t.settings.blockedUsers}>
        {blockedUsers.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground">No blocked users</p>
        ) : (
          blockedUsers.map((b) => (
            <div key={b.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                  {b.avatar_url ? (
                    <img src={b.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {b.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-sm font-body text-foreground">{b.name}</span>
              </div>
              <button
                onClick={async () => {
                  await supabase.from("blocked_users").delete().eq("id", b.id);
                  setBlockedUsers((prev) => prev.filter((x) => x.id !== b.id));
                  toast.success(`${b.name} unblocked`);
                }}
                className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-body font-medium"
              >
                Unblock
              </button>
            </div>
          ))
        )}
      </Section>

      {/* About */}
      <Section id="about" icon={Info} label={t.settings.about}>
        <button onClick={() => navigate("/terms")} className="w-full text-left py-2 text-sm font-body text-foreground hover:text-primary">Terms of Service</button>
        <button onClick={() => navigate("/privacy")} className="w-full text-left py-2 text-sm font-body text-foreground hover:text-primary">Privacy Policy</button>
        <p className="text-xs font-body text-muted-foreground">App Version 1.0.0</p>
        <p className="text-xs font-body text-muted-foreground">Made with ❤️ by Jemson Marius</p>
      </Section>

      {/* Feedback */}
      <Section id="feedback" icon={MessageSquare} label={t.settings.feedback}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
          placeholder="Tell us what you think..."
          className="w-full h-24 bg-background border border-border rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={sendFeedback}
          disabled={!feedback.trim() || sendingFeedback}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-body font-semibold disabled:opacity-40"
        >
          {t.settings.feedback}
        </button>
      </Section>

      {/* Logout */}
      <div className="border-b border-border">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-card/30 transition-colors"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="font-body text-sm text-destructive">{t.settings.logout}</span>
        </button>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-80 rounded-2xl border border-border p-5 text-center">
            <p className="font-heading text-lg font-bold text-foreground mb-2">{t.settings.logout}?</p>
            <p className="font-body text-sm text-muted-foreground mb-5">{t.settings.logout}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body font-medium">{t.settings.cancel}</button>
              <button onClick={handleSignOut} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-body font-semibold">{t.settings.logout}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-80 rounded-2xl border border-border p-5 text-center">
            <p className="font-heading text-lg font-bold text-foreground mb-2">{t.settings.deleteAccount}?</p>
            <p className="font-body text-sm text-muted-foreground mb-5">{t.settings.deleteAccount}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body font-medium">{t.settings.cancel}</button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-body font-semibold disabled:opacity-40">
                {deleting ? t.common.loading : t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
