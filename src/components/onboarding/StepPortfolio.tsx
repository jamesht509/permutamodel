import { useRef, useState, useCallback } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  userId: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

export default function StepPortfolio({ data, update, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (data.portfolioUrls.length + uploading.length >= 10) {
        toast.error("Maximum 10 photos");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, WebP accepted`);
        return;
      }

      const id = crypto.randomUUID();
      const ext = file.name.split(".").pop();
      const path = `${userId}/${id}.${ext}`;

      setUploading((prev) => [...prev, { id, name: file.name, progress: 0 }]);

      // Simulate progress (Supabase JS doesn't support progress events)
      const interval = setInterval(() => {
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: Math.min(u.progress + 20, 90) } : u))
        );
      }, 200);

      const { error } = await supabase.storage.from("portfolios").upload(path, file);
      clearInterval(interval);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        setUploading((prev) => prev.filter((u) => u.id !== id));
        return;
      }

      const { data: urlData } = supabase.storage.from("portfolios").getPublicUrl(path);

      setUploading((prev) => prev.filter((u) => u.id !== id));
      update({
        portfolioUrls: [...data.portfolioUrls, { url: urlData.publicUrl }],
      });
    },
    [data.portfolioUrls, uploading.length, userId, update]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const removePhoto = (index: number) => {
    update({ portfolioUrls: data.portfolioUrls.filter((_, i) => i !== index) });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Upload your best work</h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Minimum 3 photos to activate your profile
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
        }`}
      >
        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-body text-foreground font-medium">
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
        <div key={u.id} className="mt-3 p-3 rounded-xl bg-card border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-sm text-foreground truncate">{u.name}</span>
            <span className="font-body text-xs text-muted-foreground">{u.progress}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${u.progress}%` }}
            />
          </div>
        </div>
      ))}

      {/* Photo grid */}
      {data.portfolioUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {data.portfolioUrls.map((photo, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />

              {/* Cover badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-primary text-[10px] font-body font-bold text-white uppercase">
                  Cover
                </span>
              )}

              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Grip handle */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
                <GripVertical className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center font-body text-sm text-muted-foreground mt-3">
        {data.portfolioUrls.length}/10 photos
      </p>
    </div>
  );
}
