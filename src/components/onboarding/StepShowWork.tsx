import { useRef, useState, useCallback } from "react";
import { Upload, X, GripVertical, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  userId: string;
}

export default function StepShowWork({ data, update, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ id: string; name: string; progress: number }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);

  const uploadFile = useCallback(async (file: File) => {
    if (data.portfolioUrls.length + uploading.length >= 6) {
      toast.error("Maximum 6 photos for onboarding");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB`); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error(`${file.name}: only JPG, PNG, WebP`); return;
    }

    const id = crypto.randomUUID();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${id}.${ext}`;

    setUploading((prev) => [...prev, { id, name: file.name, progress: 0 }]);
    const interval = setInterval(() => {
      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: Math.min(u.progress + 25, 90) } : u));
    }, 150);

    const { error } = await supabase.storage.from("portfolios").upload(path, file);
    clearInterval(interval);

    if (error) {
      toast.error(`Failed: ${file.name}`);
      setUploading((prev) => prev.filter((u) => u.id !== id));
      return;
    }

    const { data: urlData } = supabase.storage.from("portfolios").getPublicUrl(path);
    setUploading((prev) => prev.filter((u) => u.id !== id));
    update({ portfolioUrls: [...data.portfolioUrls, { url: urlData.publicUrl }] });
    toast.success("Photo uploaded!");
  }, [data.portfolioUrls, uploading.length, userId, update]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const removePhoto = (index: number) => {
    const updated = data.portfolioUrls.filter((_, i) => i !== index);
    update({ portfolioUrls: updated });
    if (coverIndex >= updated.length) setCoverIndex(0);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Show your work</h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Upload 3–6 of your best photos
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
        }`}
      >
        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-body text-foreground font-medium text-sm">
          Drag & drop or <span className="text-primary">Browse Files</span>
        </p>
        <p className="font-body text-xs text-muted-foreground mt-1">JPG, PNG, WebP · Max 5MB each</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Uploading progress */}
      {uploading.map((u) => (
        <div key={u.id} className="mt-3 p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-xs text-foreground truncate">{u.name}</span>
            <span className="font-body text-[10px] text-muted-foreground">{u.progress}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-muted/30">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${u.progress}%` }} />
          </div>
        </div>
      ))}

      {/* Photo grid */}
      {data.portfolioUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {data.portfolioUrls.map((photo, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              {/* Cover badge */}
              {i === coverIndex && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-primary text-[10px] font-body font-bold text-primary-foreground uppercase">
                  Cover
                </span>
              )}
              {/* Set cover */}
              {i !== coverIndex && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCoverIndex(i); }}
                  className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Set as cover"
                >
                  <Star className="w-3 h-3 text-white" />
                </button>
              )}
              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              {/* Drag handle */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
                <GripVertical className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center font-body text-xs text-muted-foreground mt-3">
        {data.portfolioUrls.length}/6 photos {data.portfolioUrls.length < 3 && "· Min 3 to continue, or skip"}
      </p>
    </div>
  );
}
