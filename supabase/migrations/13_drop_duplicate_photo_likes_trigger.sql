-- Migration 13: drop duplicate photo_likes trigger
-- Two triggers fired AFTER INSERT OR DELETE on photo_likes, both calling
-- update_photo_likes_count(). Each like/unlike was double-counting.
-- Keep trigger_photo_likes_count, drop on_photo_like_change.
DROP TRIGGER IF EXISTS on_photo_like_change ON public.photo_likes;
