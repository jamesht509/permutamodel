import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, MapPin, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentLocation, reverseGeocode } from "@/lib/geocoding";
import { fetchMunicipalities } from "@/lib/brasilapi";
import { BRAZIL_STATES, BRAZIL_UF_SET } from "@/lib/brazil-states";
import { normalizeHandle } from "@/lib/instagram";
import { useTranslation } from "@/hooks/useTranslation";
import { useBrand } from "@/hooks/useBrand";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  userId: string;
}

export default function StepAboutYou({ data, update, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useTranslation();
  const brand = useBrand();
  const isBR = brand.country === "BR";

  const [uploading, setUploading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  // BR: load municípios when UF changes via BrasilAPI (with fallback).
  // US: skip the autocomplete — user types city + state freely.
  useEffect(() => {
    if (!isBR || !data.state || !BRAZIL_UF_SET.has(data.state)) {
      setCityOptions([]);
      return;
    }
    let cancelled = false;
    setCityLoading(true);
    fetchMunicipalities(data.state).then(({ cities }) => {
      if (!cancelled) {
        setCityOptions(cities);
        setCityLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [data.state, isBR]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t.validation.maxFileSize(5)); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(t.editProfile.avatarUploadFailed); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    update({ avatar_url: urlData.publicUrl });
    setUploading(false);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    const coords = await getCurrentLocation();
    if (!coords) {
      toast.error(t.editProfile.locationDetectFailed);
      setDetectingLocation(false);
      return;
    }
    const locationData = await reverseGeocode(coords.lat, coords.lng);
    if (locationData) {
      update({
        city: locationData.city,
        state: locationData.state,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      toast.success(t.editProfile.locationUpdated(locationData.city, locationData.state));
    } else {
      toast.error(t.editProfile.locationDetectFailed);
    }
    setDetectingLocation(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body text-sm";

  // Filter city autocomplete by what the user typed.
  const filteredCities = useMemo(() => {
    if (!cityOptions.length || !data.city.trim()) return cityOptions.slice(0, 10);
    const q = data.city.toLowerCase();
    return cityOptions.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
  }, [cityOptions, data.city]);

  const showCityDropdown = isBR && cityFocused && data.state && (cityLoading || filteredCities.length > 0);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{t.onboardingShell.stepAboutYou}</h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {isBR ? "Conta um pouco quem tu é" : "Let the community know who you are"}
        </p>
      </div>

      {/* Avatar */}
      <div className="flex justify-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full border-2 border-dashed border-border overflow-hidden hover:border-primary transition-colors group"
        >
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-primary transition-colors">
              <Camera className="w-8 h-8" />
              <span className="text-[10px] mt-1 font-body">
                {isBR ? "Adicionar foto" : "Add Photo"}
              </span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      </div>

      {/* Name */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-1.5">
          {t.editProfile.nameLabel} *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder={t.editProfile.namePlaceholder}
          className={inputClass}
        />
      </div>

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

        {isBR ? (
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">
                {t.onboardingShell.stateFieldLabel} *
              </label>
              <select
                value={data.state}
                onChange={(e) => update({ state: e.target.value, city: "" })}
                className={inputClass}
              >
                <option value="">UF</option>
                {BRAZIL_STATES.map((s) => (
                  <option key={s.uf} value={s.uf}>{s.uf}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block font-body text-xs text-muted-foreground mb-1.5">
                {t.onboardingShell.cityFieldLabel} *
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => update({ city: e.target.value })}
                onFocus={() => setCityFocused(true)}
                onBlur={() => setTimeout(() => setCityFocused(false), 150)}
                placeholder={data.state ? t.onboardingShell.cityPlaceholder : "—"}
                disabled={!data.state}
                className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {showCityDropdown && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {cityLoading ? (
                    <div className="px-4 py-3 text-xs font-body text-muted-foreground flex items-center gap-2">
                      <Loader className="w-3 h-3 animate-spin" />
                      {t.onboardingShell.cityLoading}
                    </div>
                  ) : filteredCities.length === 0 ? (
                    <div className="px-4 py-3 text-xs font-body text-muted-foreground">
                      {t.onboardingShell.cityNoneFound}
                    </div>
                  ) : (
                    filteredCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          update({ city });
                          setCityFocused(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-body text-foreground hover:bg-primary/10 transition-colors"
                      >
                        {city}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">
                {t.onboardingShell.cityFieldLabel}
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => update({ city: e.target.value })}
                placeholder={t.editProfile.cityPlaceholder}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">
                {t.onboardingShell.stateFieldLabel}
              </label>
              <input
                type="text"
                value={data.state}
                onChange={(e) => update({ state: e.target.value })}
                placeholder={t.editProfile.statePlaceholder}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-1.5">
          {t.editProfile.bioLabel}
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => { if (e.target.value.length <= 300) update({ bio: e.target.value }); }}
          placeholder={t.editProfile.bioPlaceholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <p className={`text-right text-[10px] mt-1 font-body ${data.bio.length > 280 ? "text-destructive" : "text-muted-foreground"}`}>
          {data.bio.length}/300
        </p>
      </div>

      {/* Instagram — optional in Fase 6. Stored without leading "@". */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-1.5">
          {t.onboardingShell.instagramOptional}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-body">@</span>
          <input
            type="text"
            value={data.instagram}
            onChange={(e) => update({ instagram: normalizeHandle(e.target.value) })}
            placeholder="yourusername"
            className={`${inputClass} pl-8`}
          />
        </div>
        <p className="text-[10px] font-body text-muted-foreground mt-1">{t.onboardingShell.instagramHelp}</p>
      </div>
    </div>
  );
}
