import { useState, useEffect } from "react";
import { ImagePlus, Images, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  sessionId: string;
  photographerId: string;
  modelId: string;
}

interface GalleryData {
  id: string;
  photos: string[];
  status: string;
}

export default function SharedGallerySection({ sessionId, photographerId, modelId }: Props) {
  const { user } = useAuth();
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const isPhotographer = user?.id === photographerId;

  useEffect(() => {
    supabase
      .from("shared_galleries")
      .select("id, photos, status")
      .eq("session_id", sessionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const photos = Array.isArray(data.photos) ? (data.photos as string[]) : [];
          setGallery({ id: data.id, photos, status: data.status || "draft" });
        }
        setLoading(false);
      });
  }, [sessionId]);

  const createGallery = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("shared_galleries")
      .insert({
        session_id: sessionId,
        photographer_id: photographerId,
        model_id: modelId,
        photos: [],
        status: "draft",
      })
      .select("id, photos, status")
      .single();

    if (error) {
      toast.error("Failed to create gallery");
      return;
    }
    setGallery({ id: data.id, photos: [], status: data.status || "draft" });
    toast.success("Gallery created!");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !gallery || !e.target.files?.length) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `galleries/${sessionId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("portfolios").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("portfolios").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
    }

    if (newUrls.length > 0) {
      const updatedPhotos = [...gallery.photos, ...newUrls];
      await supabase
        .from("shared_galleries")
        .update({ photos: updatedPhotos })
        .eq("id", gallery.id);
      setGallery({ ...gallery, photos: updatedPhotos });
      toast.success(`${newUrls.length} photo(s) added!`);
    }
    setUploading(false);
  };

  const shareGallery = async () => {
    if (!gallery) return;
    await supabase
      .from("shared_galleries")
      .update({ status: "shared" })
      .eq("id", gallery.id);
    setGallery({ ...gallery, status: "shared" });

    // Notify model
    await supabase.from("notifications").insert({
      user_id: modelId,
      type: "gallery_shared",
      title: "Gallery Shared! 📸",
      body: "Your session photos are ready to view!",
      data: { session_id: sessionId },
    });

    toast.success("Gallery shared with model!");
  };

  if (loading) return null;

  // No gallery yet — photographer can create one
  if (!gallery) {
    if (!isPhotographer) return null;
    return (
      <button
        onClick={createGallery}
        className="w-full mt-2 py-2 rounded-xl bg-primary/10 text-primary text-xs font-body font-medium flex items-center justify-center gap-1"
      >
        <ImagePlus className="w-3.5 h-3.5" /> Create Shared Gallery
      </button>
    );
  }

  return (
    <div className="mt-2">
      {/* Gallery preview */}
      {gallery.photos.length > 0 ? (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {gallery.photos.slice(0, 4).map((url, i) => (
            <button
              key={i}
              onClick={() => { setViewerIndex(i); setViewerOpen(true); }}
              className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          {gallery.photos.length > 4 && (
            <button
              onClick={() => { setViewerIndex(0); setViewerOpen(true); }}
              className="flex-shrink-0 w-16 h-16 rounded-lg bg-card/50 border border-border flex items-center justify-center"
            >
              <span className="text-xs font-body text-muted-foreground">+{gallery.photos.length - 4}</span>
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs font-body text-muted-foreground">No photos yet</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        {isPhotographer && (
          <>
            <label className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-body font-medium flex items-center justify-center gap-1 cursor-pointer">
              <ImagePlus className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Add Photos"}
              <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            {gallery.status === "draft" && gallery.photos.length > 0 && (
              <button
                onClick={shareGallery}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-body font-semibold flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Share with Model
              </button>
            )}
          </>
        )}
        {gallery.photos.length > 0 && (
          <button
            onClick={() => { setViewerIndex(0); setViewerOpen(true); }}
            className="flex-1 py-2 rounded-xl bg-card/50 border border-border text-foreground text-xs font-body font-medium flex items-center justify-center gap-1"
          >
            <Images className="w-3.5 h-3.5" /> View All ({gallery.photos.length})
          </button>
        )}
      </div>

      {gallery.status === "shared" && (
        <p className="text-[10px] font-body text-green-400 mt-1">✓ Gallery shared</p>
      )}

      {/* Fullscreen viewer */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={() => setViewerOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setViewerOpen(false)}>
            <X className="w-6 h-6" />
          </button>
          <img
            src={gallery.photos[viewerIndex]}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {gallery.photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setViewerIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === viewerIndex ? "bg-primary w-4" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
