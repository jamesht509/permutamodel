import { useRef, useState } from "react";
import { Camera, MapPin, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentLocation, reverseGeocode } from "@/lib/geocoding";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  userId: string;
}

export default function StepAboutYou({ data, update, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB for avatar"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    update({ avatar_url: urlData.publicUrl });
    setUploading(false);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    const coords = await getCurrentLocation();
    if (!coords) {
      toast.error("Couldn't detect your location. Please enter manually.");
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
      toast.success(`Location detected: ${locationData.city}, ${locationData.state}`);
    } else {
      toast.error("Couldn't identify your location. Please enter manually.");
    }
    setDetectingLocation(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body text-sm";

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Tell us about you</h2>
        <p className="font-body text-sm text-muted-foreground mt-1">Let the community know who you are</p>
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
              <span className="text-[10px] mt-1 font-body">Add Photo</span>
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
        <label className="block font-body text-xs text-muted-foreground mb-1.5">Full Name *</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Your name"
          className={inputClass}
        />
      </div>

      {/* Location detection */}
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
              Detecting location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Use My Current Location
            </>
          )}
        </button>
        <div className="text-center text-xs font-body text-muted-foreground mb-3">or enter manually</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-body text-xs text-muted-foreground mb-1.5">City</label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => update({ city: e.target.value })}
              placeholder="Worcester"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block font-body text-xs text-muted-foreground mb-1.5">State</label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => update({ state: e.target.value })}
              placeholder="MA"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-1.5">Bio</label>
        <textarea
          value={data.bio}
          onChange={(e) => { if (e.target.value.length <= 300) update({ bio: e.target.value }); }}
          placeholder="Tell photographers/models what you're about..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <p className={`text-right text-[10px] mt-1 font-body ${data.bio.length > 280 ? "text-destructive" : "text-muted-foreground"}`}>
          {data.bio.length}/300
        </p>
      </div>

      {/* Instagram */}
      <div>
        <label className="block font-body text-xs text-muted-foreground mb-1.5">Instagram *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-body">@</span>
          <input
            type="text"
            value={data.instagram}
            onChange={(e) => update({ instagram: e.target.value.replace(/^@/, "") })}
            placeholder="yourusername"
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>
    </div>
  );
}
