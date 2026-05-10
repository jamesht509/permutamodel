import { useState, useEffect, useRef } from "react";
import { Heart, X, ChevronLeft, ChevronRight, Trash2, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  style: string | null;
  is_cover: boolean | null;
  likes_count: number;
  comments_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: { name: string; avatar_url: string | null } | null;
}

interface Props {
  photos: Photo[];
  isOwner: boolean;
  ownerId?: string;
  onDelete?: (id: string) => void;
}

export default function PortfolioGrid({ photos, isOwner, ownerId, onDelete }: Props) {
  const { user, profile } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || photos.length === 0) return;
    supabase
      .from("photo_likes")
      .select("photo_id")
      .eq("user_id", user.id)
      .in("photo_id", photos.map((p) => p.id))
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((d) => d.photo_id)));
      });
  }, [user, photos]);

  useEffect(() => {
    const counts: Record<string, number> = {};
    const cCounts: Record<string, number> = {};
    photos.forEach((p) => {
      counts[p.id] = p.likes_count || 0;
      cCounts[p.id] = (p as any).comments_count || 0;
    });
    setLikeCounts(counts);
    setCommentCounts(cCounts);
  }, [photos]);

  // Load comments when lightbox opens
  useEffect(() => {
    if (lightboxIndex === null) return;
    const photoId = photos[lightboxIndex]?.id;
    if (!photoId) return;
    loadComments(photoId);
  }, [lightboxIndex]);

  const loadComments = async (photoId: string) => {
    setCommentsLoading(true);
    const { data } = await supabase
      .from("photo_comments")
      .select("*, user:profiles!photo_comments_user_id_fkey(name, avatar_url)")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true })
      .limit(50);
    setComments((data as any) || []);
    setCommentsLoading(false);
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const toggleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error("Login to like photos"); return; }

    const isLiked = likedIds.has(photoId);
    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(photoId) : next.add(photoId);
      return next;
    });
    setLikeCounts((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) + (isLiked ? -1 : 1) }));

    if (isLiked) {
      await supabase.from("photo_likes").delete().eq("photo_id", photoId).eq("user_id", user.id);
    } else {
      await supabase.from("photo_likes").insert({ photo_id: photoId, user_id: user.id });

      // Send notification to photo owner (not to self)
      if (ownerId && ownerId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: ownerId,
          type: "photo_like",
          title: "Someone liked your photo ❤️",
          body: `${profile?.name || "Someone"} liked your photo`,
          data: { sender_id: user.id, photo_id: photoId },
        });
      }
    }
  };

  const submitComment = async () => {
    if (!user || !commentText.trim() || lightboxIndex === null) return;
    const photoId = photos[lightboxIndex].id;
    setSubmittingComment(true);

    const { data, error } = await supabase
      .from("photo_comments")
      .insert({ photo_id: photoId, user_id: user.id, content: commentText.trim() })
      .select("*, user:profiles!photo_comments_user_id_fkey(name, avatar_url)")
      .single();

    if (error) {
      toast.error("Failed to post comment");
      setSubmittingComment(false);
      return;
    }

    setComments((prev) => [...prev, data as any]);
    setCommentCounts((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 }));
    setCommentText("");
    setSubmittingComment(false);
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Notify photo owner
    if (ownerId && ownerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: ownerId,
        type: "photo_comment",
        title: "New comment on your photo 💬",
        body: `${profile?.name || "Someone"}: "${commentText.trim().slice(0, 60)}${commentText.trim().length > 60 ? "..." : ""}"`,
        data: { sender_id: user.id, photo_id: photoId },
      });
    }
  };

  const deleteComment = async (commentId: string, photoId: string) => {
    await supabase.from("photo_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCounts((prev) => ({ ...prev, [photoId]: Math.max((prev[photoId] || 0) - 1, 0) }));
  };

  const handleDelete = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(photoId);
  };

  const openLightbox = (index: number) => { setLightboxIndex(index); setComments([]); setCommentText(""); };
  const closeLightbox = () => { setLightboxIndex(null); setComments([]); setCommentText(""); };

  const navigateLightbox = (dir: -1 | 1) => {
    if (lightboxIndex === null) return;
    const next = lightboxIndex + dir;
    if (next >= 0 && next < photos.length) {
      setLightboxIndex(next);
      setComments([]);
      setCommentText("");
    }
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex]);

  if (photos.length === 0) return null;

  const columns: Photo[][] = [[], [], []];
  photos.forEach((photo, i) => columns[i % 3].push(photo));

  return (
    <>
      {/* Masonry Grid */}
      <div className="flex gap-2 mt-4 pb-8">
        {columns.map((col, ci) => (
          <div key={ci} className="flex-1 space-y-2">
            {col.map((photo) => {
              const globalIndex = photos.indexOf(photo);
              const liked = likedIds.has(photo.id);
              const cCount = commentCounts[photo.id] || 0;
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: globalIndex * 0.05 }}
                  onClick={() => openLightbox(globalIndex)}
                  className="relative group rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt={photo.title || "Portfolio photo"}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    style={{ aspectRatio: ci === 1 ? "3/4" : ci === 0 ? "4/5" : "1/1" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Like + Comment buttons */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => toggleLike(photo.id, e)} className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
                      <span className="text-[10px] font-body text-white font-medium">{likeCounts[photo.id] || 0}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px] font-body text-white font-medium">{cCount}</span>
                    </span>
                  </div>
                  {isOwner && onDelete && (
                    <button onClick={(e) => handleDelete(photo.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                  {photo.title && (
                    <p className="absolute bottom-2 right-2 text-[10px] font-body text-white/80 opacity-0 group-hover:opacity-100 transition-opacity max-w-[60%] truncate">{photo.title}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox with Comments */}
      <AnimatePresence>
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col md:flex-row"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white z-10" onClick={closeLightbox}>
              <X className="w-5 h-5" />
            </button>

            {/* Image area */}
            <div className="flex-1 flex items-center justify-center relative min-h-0" onClick={closeLightbox}>
              {lightboxIndex > 0 && (
                <button className="absolute left-4 p-2 rounded-full bg-white/10 text-white z-10" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {lightboxIndex < photos.length - 1 && (
                <button className="absolute right-4 p-2 rounded-full bg-white/10 text-white z-10 md:right-4" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              <motion.img
                key={photos[lightboxIndex].id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].title || ""}
                className="max-w-[90vw] md:max-w-[60vw] max-h-[50vh] md:max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Comments panel */}
            <div className="w-full md:w-[340px] bg-card/95 backdrop-blur-xl flex flex-col max-h-[45vh] md:max-h-full border-t md:border-t-0 md:border-l border-border" onClick={(e) => e.stopPropagation()}>
              {/* Like bar */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
                <button onClick={(e) => toggleLike(photos[lightboxIndex!].id, e)} className="flex items-center gap-1.5">
                  <Heart className={`w-5 h-5 ${likedIds.has(photos[lightboxIndex].id) ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                  <span className="text-sm font-body text-foreground font-medium">{likeCounts[photos[lightboxIndex].id] || 0}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4.5 h-4.5 text-foreground" />
                  <span className="text-sm font-body text-foreground font-medium">{commentCounts[photos[lightboxIndex].id] || 0}</span>
                </div>
                <span className="text-xs font-body text-muted-foreground ml-auto">{lightboxIndex + 1}/{photos.length}</span>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {commentsLoading ? (
                  <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="font-body text-xs text-muted-foreground">No comments yet</p>
                    <p className="font-body text-[10px] text-muted-foreground/60">Be the first to comment</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5 group">
                      {(c.user as any)?.avatar_url ? (
                        <img src={(c.user as any).avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">{(c.user as any)?.name?.charAt(0) || "?"}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-body text-xs font-semibold text-foreground">{(c.user as any)?.name || "Unknown"}</span>
                          <span className="font-body text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="font-body text-sm text-foreground/90 leading-relaxed">{c.content}</p>
                      </div>
                      {(c.user_id === user?.id || isOwner) && (
                        <button onClick={() => deleteComment(c.id, photos[lightboxIndex!].id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment input */}
              {user && (
                <div className="px-3 py-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{profile?.name?.charAt(0) || "?"}</div>
                    )}
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 rounded-xl bg-foreground/[0.04] border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      disabled={submittingComment}
                    />
                    <button
                      onClick={submitComment}
                      disabled={!commentText.trim() || submittingComment}
                      className="p-2 rounded-xl gold-gradient text-primary-foreground disabled:opacity-40 transition-opacity"
                    >
                      {submittingComment ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
