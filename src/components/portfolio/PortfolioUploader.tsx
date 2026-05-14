import { useState, useRef, useCallback } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface PhotoItem {
  id: string;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  style: string | null;
  is_cover: boolean;
  position: number;
  isNew?: boolean;
}

interface PendingUpload {
  id: string;
  file: File;
  preview: string;
  title: string;
  style: string;
  isCover: boolean;
  progress: number;
  uploading: boolean;
}

const STYLE_TAGS = ["Portrait", "Fashion", "Editorial", "Street", "Boudoir", "Commercial", "Lifestyle", "Fine Art", "Beauty", "Conceptual"];

interface Props {
  userId: string;
  photos: PhotoItem[];
  setPhotos: (photos: PhotoItem[]) => void;
  onChanged: () => void;
  isPro?: boolean;
}

const MAX_FREE_PHOTOS = 20;

export default function PortfolioUploader({ userId, photos, setPhotos, onChanged, isPro = false }: Props) {
  const t = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const maxPhotos = isPro ? 999 : MAX_FREE_PHOTOS;
    const remaining = maxPhotos - photos.length - pending.length;
    if (remaining <= 0) {
      toast.error(isPro ? "Max photos reached" : `Free plan: max ${MAX_FREE_PHOTOS} photos. Upgrade to PRO for unlimited.`);
      return;
    }

    const newPending: PendingUpload[] = [];
    const validFiles = Array.from(files).slice(0, remaining);

    for (const file of validFiles) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, WEBP allowed`);
        continue;
      }
      if (!isPro && file.size > 5 * 1024 * 1024) {
        // FASE 6: PRO upsell modal removed (no Stripe yet). Toast covers
        // the limit; future PRO reactivation will reinstate the modal.
        toast.error(t.validation.maxFileSize(5));
        return;
      }
      newPending.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        title: "",
        style: "",
        isCover: photos.length === 0 && pending.length === 0 && newPending.length === 0,
        progress: 0,
        uploading: false,
      });
    }

    setPending((prev) => [...prev, ...newPending]);
  }, [photos.length, pending.length]);

  const removePending = (id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const updatePending = (id: string, update: Partial<PendingUpload>) => {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, ...update } : p)));
  };

  const setCover = (id: string) => {
    setPending((prev) => prev.map((p) => ({ ...p, isCover: p.id === id })));
    // Also unset cover on existing photos
    setPhotos(photos.map((p) => ({ ...p, is_cover: false })));
    onChanged();
  };

  const uploadAll = async () => {
    if (pending.length === 0) return;
    setBatchUploading(true);

    const newlyUploaded: PhotoItem[] = [];

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      updatePending(item.id, { uploading: true, progress: 10 });

      try {
        // Compress
        const compressed = await imageCompression(item.file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
        });
        updatePending(item.id, { progress: 40 });

        // Generate thumbnail
        const thumbnail = await imageCompression(item.file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        });
        updatePending(item.id, { progress: 60 });

        // Upload main
        const ext = item.file.name.split(".").pop() || "jpg";
        const mainPath = `${userId}/${item.id}.${ext}`;
        const thumbPath = `${userId}/${item.id}_thumb.${ext}`;

        const { error: mainErr } = await supabase.storage.from("portfolios").upload(mainPath, compressed);
        if (mainErr) throw mainErr;
        updatePending(item.id, { progress: 80 });

        // Upload thumbnail
        await supabase.storage.from("portfolios").upload(thumbPath, thumbnail);
        updatePending(item.id, { progress: 90 });

        const { data: mainUrl } = supabase.storage.from("portfolios").getPublicUrl(mainPath);
        const { data: thumbUrl } = supabase.storage.from("portfolios").getPublicUrl(thumbPath);

        // Insert to DB
        const position = photos.length + newlyUploaded.length;
        await supabase.from("photos").insert({
          id: item.id,
          user_id: userId,
          url: mainUrl.publicUrl,
          thumbnail_url: thumbUrl.publicUrl,
          title: item.title.trim() || null,
          style: item.style || null,
          is_cover: item.isCover,
          position,
        });

        // If this is cover, unset others
        if (item.isCover) {
          await supabase
            .from("photos")
            .update({ is_cover: false })
            .eq("user_id", userId)
            .neq("id", item.id);
        }

        updatePending(item.id, { progress: 100 });

        newlyUploaded.push({
          id: item.id,
          url: mainUrl.publicUrl,
          thumbnail_url: thumbUrl.publicUrl,
          title: item.title.trim() || null,
          style: item.style || null,
          is_cover: item.isCover,
          position,
        });
      } catch (err: any) {
        toast.error(`Failed to upload: ${err.message}`);
      }
    }

    // Update state once with all new photos, respecting cover changes
    if (newlyUploaded.length > 0) {
      const hasCoverInNew = newlyUploaded.some((p) => p.is_cover);
      const updatedExisting = hasCoverInNew
        ? photos.map((p) => ({ ...p, is_cover: false }))
        : photos;
      setPhotos([...updatedExisting, ...newlyUploaded]);
    }

    setPending([]);
    setBatchUploading(false);
    onChanged();
    toast.success("Photos uploaded!");
  };

  const removeExisting = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    // Extract path from URL
    const urlParts = photo.url.split("/portfolios/");
    if (urlParts[1]) {
      const path = decodeURIComponent(urlParts[1]);
      await supabase.storage.from("portfolios").remove([path]);
      // Also try thumbnail
      const thumbPath = path.replace(/\.(\w+)$/, "_thumb.$1");
      await supabase.storage.from("portfolios").remove([thumbPath]);
    }

    await supabase.from("photos").delete().eq("id", photoId);
    setPhotos(photos.filter((p) => p.id !== photoId));
    onChanged();
    toast.success("Photo removed");
  };

  const setExistingCover = async (photoId: string) => {
    // Unset all covers, set the new one
    await supabase.from("photos").update({ is_cover: false }).eq("user_id", userId);
    await supabase.from("photos").update({ is_cover: true, position: 0 }).eq("id", photoId);

    // Reorder: cover photo goes first, others shift
    const coverPhoto = photos.find((p) => p.id === photoId);
    const others = photos.filter((p) => p.id !== photoId);
    const reordered = coverPhoto
      ? [{ ...coverPhoto, is_cover: true, position: 0 }, ...others.map((p, i) => ({ ...p, is_cover: false, position: i + 1 }))]
      : photos;

    // Update positions in DB for the rest
    for (let i = 0; i < others.length; i++) {
      await supabase.from("photos").update({ position: i + 1 }).eq("id", others[i].id);
    }

    setPhotos(reordered);
    setPending((prev) => prev.map((p) => ({ ...p, isCover: false })));
    onChanged();
    toast.success("Cover photo updated");
  };

  return (
    <div>
      <label className="text-xs font-body text-muted-foreground mb-1.5 block">Portfolio Photos</label>

      {/* Existing photos grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
              <img src={photo.thumbnail_url || photo.url} alt={photo.title || ""} className="w-full h-full object-cover" />
              {photo.is_cover && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-primary text-[10px] font-body font-bold text-primary-foreground uppercase">Cover</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.is_cover && (
                  <button onClick={() => setExistingCover(photo.id)} className="p-1.5 rounded-full bg-primary/80 text-primary-foreground" title="Set as cover">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => removeExisting(photo.id)} className="p-1.5 rounded-full bg-destructive/80 text-destructive-foreground" title="Delete">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/30 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="font-body text-sm text-foreground">
          <span className="text-primary">Browse Files</span> or drag & drop
        </p>
        <p className="font-body text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max 2MB after compression</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
      />

      {/* Pending uploads */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3">
            <p className="font-body text-xs text-muted-foreground">{pending.length} photo(s) ready to upload</p>
            {pending.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-3 flex gap-3">
                <img src={item.preview} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    value={item.title}
                    onChange={(e) => updatePending(item.id, { title: e.target.value })}
                    placeholder="Title (optional)"
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex flex-wrap gap-1">
                    {STYLE_TAGS.slice(0, 5).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => updatePending(item.id, { style: item.style === tag ? "" : tag })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-body transition-all ${
                          item.style === tag ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCover(item.id)}
                      className={`text-[10px] font-body font-medium flex items-center gap-1 ${item.isCover ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Star className={`w-3 h-3 ${item.isCover ? "fill-primary" : ""}`} />
                      {item.isCover ? "Cover" : "Set Cover"}
                    </button>
                    <button onClick={() => removePending(item.id)} className="text-[10px] font-body text-destructive ml-auto">Remove</button>
                  </div>
                  {item.uploading && (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={uploadAll}
              disabled={batchUploading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              {batchUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload {pending.length} Photo{pending.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center font-body text-xs text-muted-foreground mt-2">{photos.length + pending.length}/10 photos</p>

      {/* FASE 6: PRO upgrade modal removed — toast covers the size cap
          until Stripe monetization lands in Sessão 5+. */}
    </div>
  );
}
