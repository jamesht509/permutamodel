import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  userId: string;
}

export default function StepBasicInfo({ data, update, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB for avatar");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    update({ avatar_url: urlData.publicUrl });
    setUploading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body";

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">Tell us about yourself</h2>

      {/* Avatar */}
      <div className="flex justify-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-[120px] h-[120px] rounded-full border-2 border-dashed border-[rgba(255,255,255,0.15)] overflow-hidden hover:border-primary transition-colors group"
        >
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-primary transition-colors">
              <Camera className="w-8 h-8" />
              <span className="text-xs mt-1 font-body">Upload</span>
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
        <label className="block font-body text-sm text-muted-foreground mb-1.5">Full Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Your name"
          className={inputClass}
        />
      </div>

      {/* City */}
      <div>
        <label className="block font-body text-sm text-muted-foreground mb-1.5">Location</label>
        <input
          type="text"
          value={data.city}
          onChange={(e) => update({ city: e.target.value })}
          placeholder="e.g., Worcester, MA"
          className={inputClass}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block font-body text-sm text-muted-foreground mb-1.5">Bio</label>
        <textarea
          value={data.bio}
          onChange={(e) => {
            if (e.target.value.length <= 250) update({ bio: e.target.value });
          }}
          placeholder="Tell photographers/models what you're about..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <p className="text-right text-xs text-muted-foreground mt-1 font-body">
          {data.bio.length}/250
        </p>
      </div>
    </div>
  );
}
