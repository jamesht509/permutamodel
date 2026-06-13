import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Camera, MapPin, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { getCurrentLocation, reverseGeocode, geocodeAddress } from "@/lib/geocoding";
import PortfolioUploader from "@/components/portfolio/PortfolioUploader";

// FASE 6 BR vocab — role / style / day / time labels stay in EN for now;
// BR taxonomy + km/mi unit decision pending. Values written to DB remain
// English-keyed (role enum, day strings) so a label-only swap is safe later.
const ROLE_OPTIONS = [
  { value: "photographer", label: "📸 Photographer" },
  { value: "model", label: "🌟 Model" },
  { value: "creative", label: "🎨 Creative" },
  { value: "dual", label: "📸🌟 Photographer & Model" },
];

const STYLE_OPTIONS = [
  "Portrait", "Fashion", "Lifestyle", "Editorial", "Boudoir", "Fine Art",
  "Fitness", "Commercial", "Street", "Conceptual", "Beauty", "Maternity",
  "Couples", "Events",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Morning", "Afternoon", "Evening", "Night"];

interface PhotoItem {
  id: string;
  url: string;
  is_cover: boolean;
  position: number;
  isNew?: boolean;
}

export default function EditProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("photographer");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [hasStudio, setHasStudio] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [distanceRadius, setDistanceRadius] = useState(25);
  const [availDays, setAvailDays] = useState<string[]>([]);
  const [availTimes, setAvailTimes] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Load existing data
  useEffect(() => {
    if (!profile || !user) return;
    setName(profile.name || "");
    setRole(profile.role || "photographer");
    setBio(profile.bio || "");
    setCity(profile.city || "");
    setState(profile.state || "");
    setStyles(profile.styles || []);
    setEquipment(profile.equipment || []);
    setInstagram(profile.instagram || "");
    setWebsite(profile.website || "");
    setHasStudio(profile.has_studio || false);
    setAvatarUrl(profile.avatar_url || null);
    setDistanceRadius(profile.distance_radius || 50);
    const avail = (profile.availability as any) || {};
    setAvailDays(avail.days || []);
    setAvailTimes(avail.times || []);
    setMeasurements((profile as any).measurements || {});

    // Load photos
    supabase
      .from("photos")
      .select("id, url, thumbnail_url, title, style, is_cover, position")
      .eq("user_id", user.id)
      .order("position")
      .then(({ data }) => {
        if (data) setPhotos(data.map((p) => ({ ...p, is_cover: p.is_cover || false })));
      });
  }, [profile, user]);

  const markChanged = () => setHasChanges(true);

  const toggleStyle = (s: string) => {
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev));
    markChanged();
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !equipment.includes(equipmentInput.trim())) {
      setEquipment((prev) => [...prev, equipmentInput.trim()]);
      setEquipmentInput("");
      markChanged();
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(t.editProfile.avatarUploadFailed); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const urlWithCacheBust = `${data.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(urlWithCacheBust);
    markChanged();
  };

  const handleDetectLocation = async () => {
    if (!user) return;
    setDetectingLocation(true);
    const coords = await getCurrentLocation();
    if (!coords) {
      toast.error(t.editProfile.locationDetectFailed);
      setDetectingLocation(false);
      return;
    }
    const locationData = await reverseGeocode(coords.lat, coords.lng);
    if (locationData) {
      setCity(locationData.city);
      setState(locationData.state);
      await supabase.from("profiles").update({
        lat: coords.lat,
        lng: coords.lng,
        city: locationData.city,
        state: locationData.state,
      }).eq("id", user.id);
      toast.success(t.editProfile.locationUpdated(locationData.city, locationData.state));
      markChanged();
    }
    setDetectingLocation(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    markChanged();
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error(t.editProfile.nameRequired); return; }
    setSaving(true);

    try {
      // Geocode if city/state changed
      let lat = profile?.lat || null;
      let lng = profile?.lng || null;
      if (city.trim() && state.trim()) {
        const locationData = await geocodeAddress(city.trim(), state.trim());
        if (locationData) {
          lat = locationData.latitude;
          lng = locationData.longitude;
        }
      }

      // Update profile
      const { error } = await supabase.from("profiles").update({
        name: name.trim(),
        role: role as any,
        bio: bio.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        styles,
        equipment,
        instagram: instagram.trim() || null,
        website: website.trim() || null,
        has_studio: hasStudio,
        avatar_url: avatarUrl,
        distance_radius: distanceRadius,
        lat,
        lng,
        availability: { days: availDays, times: availTimes } as any,
        measurements: measurements as any,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      if (error) throw error;

      // Sync photos: delete removed, insert new
      const existingIds = photos.filter((p) => !p.isNew).map((p) => p.id);

      // Delete photos not in current list
      if (existingIds.length > 0) {
        await supabase.from("photos").delete().eq("user_id", user.id).not("id", "in", `(${existingIds.join(",")})`);
      } else {
        // All photos removed — delete everything
        await supabase.from("photos").delete().eq("user_id", user.id);
      }
      // Insert new photos
      const newPhotos = photos.filter((p) => p.isNew);
      for (let i = 0; i < newPhotos.length; i++) {
        await supabase.from("photos").insert({
          user_id: user.id,
          url: newPhotos[i].url,
          position: existingIds.length + i,
          is_cover: existingIds.length === 0 && i === 0,
        });
      }

      // Update positions for all
      for (let i = 0; i < photos.length; i++) {
        if (!photos[i].isNew) {
          await supabase.from("photos").update({ position: i, is_cover: i === 0 }).eq("id", photos[i].id);
        }
      }

      await refreshProfile();
      toast.success(t.editProfile.saved);
      setHasChanges(false);
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || t.editProfile.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <div>
      <label className="text-xs font-body text-muted-foreground mb-1 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => { onChange(e.target.value); markChanged(); }}
          placeholder={placeholder}
          className="w-full h-24 bg-background border border-border rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); markChanged(); }}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">{t.editProfile.title}</h1>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => avatarRef.current?.click()}
            className="w-24 h-24 rounded-full bg-muted overflow-hidden relative cursor-pointer group"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {name?.charAt(0) || "?"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />
          <p className="text-xs font-body text-muted-foreground mt-2">{t.editProfile.tapToChangeAvatar}</p>
        </div>

        {/* Basic Info */}
        {renderField(t.editProfile.nameLabel, name, setName, t.editProfile.namePlaceholder)}

        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.editProfile.roleLabel}</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); markChanged(); }}
                className={`py-2.5 rounded-xl text-xs font-body font-medium transition-all ${
                  role === r.value
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {renderField(t.editProfile.bioLabel, bio, setBio, t.editProfile.bioPlaceholder, true)}

        {/* Location */}
        <div>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="w-full mb-3 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-body font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {detectingLocation ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {t.editProfile.detectingLocation}
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                {t.editProfile.updateMyLocation}
              </>
            )}
          </button>
          <div className="grid grid-cols-2 gap-3">
            {renderField(t.editProfile.cityLabel, city, setCity, t.editProfile.cityPlaceholder)}
            {renderField(t.editProfile.stateLabel, state, setState, t.editProfile.statePlaceholder)}
          </div>
        </div>

        {renderField(t.editProfile.instagramLabel, instagram, setInstagram, "@username")}
        {renderField(t.editProfile.websiteLabel, website, setWebsite, "https://...")}

        {/* Styles */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.editProfile.stylesLabelMax(5)}</label>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  styles.includes(s)
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        {(role === "photographer" || role === "dual") && (
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.editProfile.equipmentLabel}</label>
            <div className="flex gap-2 mb-2">
              <input
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEquipment()}
                placeholder={t.editProfile.equipmentPlaceholder}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={addEquipment} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-body font-medium">{t.editProfile.addBtn}</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {equipment.map((item) => (
                <span key={item} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-xs font-body text-foreground">
                  {item}
                  <button onClick={() => { setEquipment((prev) => prev.filter((e) => e !== item)); markChanged(); }}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Measurements (models) */}
        {(role === "model" || role === "dual") && (
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.editProfile.measurementsLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {["height", "weight", "bust", "waist", "hips", "shoe_size", "hair_color", "eye_color"].map((key) => (
                <input
                  key={key}
                  value={measurements[key] || ""}
                  onChange={(e) => { setMeasurements((prev) => ({ ...prev, [key]: e.target.value })); markChanged(); }}
                  placeholder={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ))}
            </div>
          </div>
        )}

        {/* Studio */}
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-foreground">{t.editProfile.hasStudio}</span>
          <button
            onClick={() => { setHasStudio(!hasStudio); markChanged(); }}
            className={`w-11 h-6 rounded-full transition-colors relative ${hasStudio ? "bg-primary" : "bg-muted"}`}
          >
            <div className="w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 left-0.5 transition-transform"
              style={{ transform: hasStudio ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>

        {/* Availability */}
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.editProfile.availableDays}</label>
          <div className="flex gap-1.5 mb-3">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => { setAvailDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]); markChanged(); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-body font-medium transition-all ${
                  availDays.includes(day)
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {day.slice(0, 2)}
              </button>
            ))}
          </div>
          <label className="text-xs font-body text-muted-foreground mb-1.5 block">{t.editProfile.timePreferences}</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => { setAvailTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]); markChanged(); }}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  availTimes.includes(t)
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground border border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">{t.editProfile.travelRadius(distanceRadius, "km")}</label>
            <input
              type="range"
              min={5}
              max={100}
              value={distanceRadius}
              onChange={(e) => { setDistanceRadius(Number(e.target.value)); markChanged(); }}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* Photos */}
        {user && (
          <PortfolioUploader
            userId={user.id}
            photos={photos as any}
            setPhotos={setPhotos as any}
            onChanged={markChanged}
            isPro={profile?.plan === "pro" || profile?.plan === "premium"}
          />
        )}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-[4.5rem] lg:bottom-0 left-0 right-0 lg:left-64 bg-background/95 backdrop-blur-xl border-t border-border p-4 z-30 safe-area-pb">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-body font-semibold text-base disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            {saving ? t.settings.saving : t.common.saveChanges}
          </button>
        </div>
      )}
    </div>
  );
}
