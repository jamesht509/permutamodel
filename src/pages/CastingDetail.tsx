import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Users, Calendar, Pencil, Trash2, Star, X, Upload, Image, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ApplyModal from "@/components/castings/ApplyModal";
import ApplicationsModal from "@/components/castings/ApplicationsModal";

// FASE 6 BR vocab — domain vocabulary, decision pending.
const STYLES = ["Portrait", "Fashion", "Lifestyle", "Editorial", "Boudoir", "Fine Art", "Fitness", "Commercial", "Street", "Conceptual", "Beauty", "Couples"];
const DURATION_OPTIONS = ["1h", "2h", "3h", "4h+", "Half Day", "Full Day"];

interface CastingFull {
  id: string;
  title: string;
  description: string;
  styles: string[];
  type_needed: string[];
  proposed_date: string | null;
  proposed_time: string | null;
  is_flexible_date: boolean | null;
  location: string | null;
  is_indoor: boolean | null;
  slots: number;
  filled_slots: number | null;
  status: string;
  duration: string | null;
  moodboard_urls: string[] | null;
  requirements: string | null;
  created_at: string | null;
  creator_id: string;
  creator: { name: string; avatar_url: string | null; rating_avg: number | null; verified_level: string; role: string } | null;
  applicationCount: number;
  hasApplied: boolean;
}

export default function CastingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();

  const timeAgo = (d: string | null): string => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    return t.castingsPage.timeAgo(mins, hours, days);
  };
  const [casting, setCasting] = useState<CastingFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editRequirements, setEditRequirements] = useState("");
  const [editStyles, setEditStyles] = useState<string[]>([]);
  const [editSlots, setEditSlots] = useState(1);
  const [editMoodboard, setEditMoodboard] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isOwner = casting?.creator_id === user?.id;

  const fetchCasting = async () => {
    if (!id || !user) return;
    setLoading(true);

    const { data } = await supabase.from("casting_calls").select("*").eq("id", id).single();
    if (!data) { setLoading(false); navigate("/castings"); return; }

    const { data: creator } = await supabase.from("profiles").select("id, name, avatar_url, rating_avg, verified_level, role").eq("id", data.creator_id).single();

    const { data: apps } = await supabase.from("applications").select("casting_id").eq("casting_id", id);
    const { data: myApp } = await supabase.from("applications").select("id").eq("casting_id", id).eq("applicant_id", user.id).maybeSingle();

    setCasting({
      ...data,
      creator: creator || null,
      applicationCount: apps?.length || 0,
      hasApplied: !!myApp,
    });
    setLoading(false);
  };

  useEffect(() => { fetchCasting(); }, [id, user]);

  const startEdit = () => {
    if (!casting) return;
    setEditTitle(casting.title);
    setEditDesc(casting.description);
    setEditLocation(casting.location || "");
    setEditDuration(casting.duration || "");
    setEditRequirements(casting.requirements || "");
    setEditStyles([...casting.styles]);
    setEditSlots(casting.slots);
    setEditMoodboard([...(casting.moodboard_urls || [])]);
    setEditing(true);
  };

  const uploadMoodboard = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    for (const file of Array.from(files).slice(0, 5 - editMoodboard.length)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(t.validation.maxFileSize(5)); continue; }
      const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("portfolios").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("portfolios").getPublicUrl(path);
        setEditMoodboard((prev) => [...prev, data.publicUrl]);
      }
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!casting) return;
    setSaving(true);
    const { error } = await supabase.from("casting_calls").update({
      title: editTitle.trim(),
      description: editDesc.trim(),
      location: editLocation || null,
      duration: editDuration || null,
      requirements: editRequirements || null,
      styles: editStyles,
      slots: editSlots,
      moodboard_urls: editMoodboard,
    }).eq("id", casting.id);

    if (error) toast.error(error.message);
    else { toast.success(t.castingDetail.updated); setEditing(false); fetchCasting(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!casting) return;
    setDeleting(true);
    // Delete applications first
    await supabase.from("applications").delete().eq("casting_id", casting.id);
    const { error } = await supabase.from("casting_calls").delete().eq("id", casting.id);
    if (error) { toast.error(error.message); setDeleting(false); return; }
    toast.success(t.castingDetail.deleted);
    navigate("/castings");
  };

  const handleCancel = async () => {
    if (!casting) return;
    const { error } = await supabase.from("casting_calls").update({ status: "cancelled" as any }).eq("id", casting.id);
    if (error) toast.error(error.message);
    else { toast.success(t.castingDetail.cancelled); fetchCasting(); }
  };

  const chipClass = (active: boolean) => cn(
    "px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all",
    active ? "gold-gradient text-primary-foreground" : "bg-card/50 border border-border text-muted-foreground"
  );

  const inputClass = "w-full px-4 py-3 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm font-body focus:outline-none focus:border-primary/40 transition-colors";

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="h-8 w-32 bg-card/40 rounded-lg animate-pulse mb-4" />
        <div className="h-64 bg-card/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!casting) return null;

  const STATUS_STYLE: Record<string, string> = {
    open: "bg-green-500/15 text-green-400",
    filled: "bg-primary/15 text-primary",
    expired: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background pb-2 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/castings")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground flex-1 truncate">{casting.title}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${STATUS_STYLE[casting.status] || STATUS_STYLE.expired}`}>
          {casting.status === "open" ? t.castings.open : casting.status === "filled" ? t.castings.filled : casting.status === "expired" ? t.castings.expired : casting.status}
        </span>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Creator */}
        <div className="flex items-center gap-3" onClick={() => navigate(`/profile/${casting.creator_id}`)}>
          {casting.creator?.avatar_url ? (
            <img src={casting.creator.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {casting.creator?.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1">
            <p className="text-foreground font-semibold font-body">
              {casting.creator?.name}{casting.creator?.verified_level !== "none" ? " ✓" : ""}
            </p>
            <p className="text-muted-foreground text-xs font-body flex items-center gap-1">
              {casting.creator?.role} • <Star className="w-3 h-3 text-primary fill-primary" /> {Number(casting.creator?.rating_avg || 0).toFixed(1)} • {timeAgo(casting.created_at)}
            </p>
          </div>
        </div>

        {/* Edit mode */}
        {editing ? (
          <div className="space-y-4 bg-card/40 border border-border rounded-2xl p-4">
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{t.castingDetail.titleLabel}</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value.slice(0, 80))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{t.castingDetail.descriptionLabel}</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value.slice(0, 500))} rows={3} className={cn(inputClass, "resize-none")} />
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-2">{t.castingDetail.stylesLabel}</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button key={s} onClick={() => setEditStyles(editStyles.includes(s) ? editStyles.filter(x => x !== s) : [...editStyles, s])} className={chipClass(editStyles.includes(s))}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{t.castingDetail.locationLabel}</label>
              <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{t.castingDetail.slotsLabel}</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditSlots(Math.max(1, editSlots - 1))} className="w-10 h-10 rounded-xl border border-border text-foreground flex items-center justify-center">−</button>
                <span className="text-lg font-heading font-bold text-foreground w-8 text-center">{editSlots}</span>
                <button onClick={() => setEditSlots(Math.min(10, editSlots + 1))} className="w-10 h-10 rounded-xl border border-border text-foreground flex items-center justify-center">+</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{t.castingDetail.durationLabel}</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button key={d} onClick={() => setEditDuration(editDuration === d ? "" : d)} className={chipClass(editDuration === d)}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1 flex items-center gap-1">
                <Image className="w-3 h-3" /> {t.castingDetail.moodboardLabel} ({editMoodboard.length}/5)
              </label>
              <div className="flex gap-2 flex-wrap">
                {editMoodboard.map((url, i) => (
                  <div key={i} className="relative w-16 h-16">
                    <img src={url} alt="" className="w-full h-full rounded-lg object-cover" />
                    <button onClick={() => setEditMoodboard(p => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  </div>
                ))}
                {editMoodboard.length < 5 && (
                  <button onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                    {uploading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadMoodboard(e.target.files)} />
            </div>
            <div>
              <label className="block text-xs font-body text-muted-foreground mb-1">{t.castingDetail.requirementsLabel}</label>
              <textarea value={editRequirements} onChange={(e) => setEditRequirements(e.target.value)} rows={2} className={cn(inputClass, "resize-none")} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-body font-semibold text-sm">{t.common.cancel}</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl gold-gradient text-primary-foreground font-body font-semibold text-sm disabled:opacity-50">
                {saving ? t.settings.saving : t.common.saveChanges}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Description */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">{casting.title}</h2>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">{casting.description}</p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {casting.proposed_date && (
                <div className="bg-card/40 border border-border rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-primary mb-1"><Calendar className="w-4 h-4" /><span className="text-xs font-body font-semibold">{t.castingDetail.date}</span></div>
                  <p className="text-sm font-body text-foreground">{casting.is_flexible_date ? t.castings.flexible : casting.proposed_date}</p>
                  {casting.proposed_time && <p className="text-xs text-muted-foreground font-body">{casting.proposed_time}</p>}
                </div>
              )}
              {casting.location && (
                <div className="bg-card/40 border border-border rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-primary mb-1"><MapPin className="w-4 h-4" /><span className="text-xs font-body font-semibold">{t.castingDetail.location}</span></div>
                  <p className="text-sm font-body text-foreground">{casting.location}</p>
                  <p className="text-xs text-muted-foreground font-body">{casting.is_indoor ? t.castingDetail.indoor : t.castingDetail.outdoor}</p>
                </div>
              )}
              {casting.duration && (
                <div className="bg-card/40 border border-border rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-primary mb-1"><Clock className="w-4 h-4" /><span className="text-xs font-body font-semibold">{t.castingDetail.duration}</span></div>
                  <p className="text-sm font-body text-foreground">{casting.duration}</p>
                </div>
              )}
              <div className="bg-card/40 border border-border rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-primary mb-1"><Users className="w-4 h-4" /><span className="text-xs font-body font-semibold">{t.castingDetail.slots}</span></div>
                <p className="text-sm font-body text-foreground">{t.castingsPage.filledLabel(casting.filled_slots || 0, casting.slots)}</p>
              </div>
            </div>

            {/* Type needed */}
            {casting.type_needed.length > 0 && (
              <div>
                <p className="text-xs font-body text-muted-foreground mb-2">{t.castingDetail.lookingFor}</p>
                <div className="flex flex-wrap gap-2">
                  {casting.type_needed.map((tn) => (
                    <span key={tn} className="px-3 py-1.5 rounded-full text-xs font-body font-medium bg-secondary/15 text-secondary">{tn}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Styles */}
            {casting.styles.length > 0 && (
              <div>
                <p className="text-xs font-body text-muted-foreground mb-2">{t.castingDetail.styles}</p>
                <div className="flex flex-wrap gap-2">
                  {casting.styles.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full text-xs font-body font-medium bg-primary/10 text-primary">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {casting.requirements && (
              <div className="bg-card/40 border border-border rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-primary mb-2"><Sparkles className="w-4 h-4" /><span className="text-xs font-body font-semibold">{t.castingDetail.requirements}</span></div>
                <p className="text-sm font-body text-muted-foreground">{casting.requirements}</p>
              </div>
            )}

            {/* Moodboard */}
            {casting.moodboard_urls && casting.moodboard_urls.length > 0 && (
              <div>
                <p className="text-xs font-body text-muted-foreground mb-2">{t.castingDetail.moodboard}</p>
                <div className="grid grid-cols-3 gap-2">
                  {casting.moodboard_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-square rounded-xl object-cover" />
                  ))}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="space-y-2">
                <button onClick={() => setShowApps(true)} className="w-full py-3 bg-card border border-border text-foreground text-sm font-body font-semibold rounded-xl hover:bg-card/80 transition-colors">
                  {t.castingDetail.viewApplications(casting.applicationCount)}
                </button>
                <div className="flex gap-2">
                  <button onClick={startEdit} className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm font-body font-semibold flex items-center justify-center gap-2 hover:bg-card/50 transition-colors">
                    <Pencil className="w-4 h-4" /> {t.common.edit}
                  </button>
                  {casting.status === "open" && (
                    <button onClick={handleCancel} className="flex-1 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-body font-semibold hover:bg-destructive/10 transition-colors">
                      {t.castingDetail.cancelCasting}
                    </button>
                  )}
                  <button onClick={handleDelete} disabled={deleting} className="py-3 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Apply button */}
            {!isOwner && (
              <>
                {casting.hasApplied ? (
                  <button disabled className="w-full py-3 bg-card border border-border text-muted-foreground text-sm font-body font-semibold rounded-xl opacity-60">
                    {t.castingDetail.appliedBadge}
                  </button>
                ) : casting.status === "open" ? (
                  <button onClick={() => setShowApply(true)} className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-body font-semibold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-transform">
                    {t.castingDetail.applyNowWithCount(casting.applicationCount)}
                  </button>
                ) : null}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showApply && (
        <ApplyModal casting={casting} onClose={() => setShowApply(false)} onApplied={fetchCasting} />
      )}
      {showApps && (
        <ApplicationsModal castingId={casting.id} onClose={() => setShowApps(false)} onUpdate={fetchCasting} />
      )}
    </div>
  );
}
