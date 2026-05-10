
-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can see their own blocks
CREATE POLICY "Users can view own blocks"
ON public.blocked_users FOR SELECT
TO authenticated
USING (blocker_id = auth.uid());

-- Users can block others
CREATE POLICY "Users can block others"
ON public.blocked_users FOR INSERT
TO authenticated
WITH CHECK (blocker_id = auth.uid() AND blocked_id != auth.uid());

-- Users can unblock
CREATE POLICY "Users can unblock"
ON public.blocked_users FOR DELETE
TO authenticated
USING (blocker_id = auth.uid());

-- Security definer function to check if blocked
CREATE OR REPLACE FUNCTION public.is_blocked(user1 UUID, user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = user1 AND blocked_id = user2)
       OR (blocker_id = user2 AND blocked_id = user1)
  )
$$;

-- Add policy on messages: prevent sending messages to/from blocked users
CREATE POLICY "Block prevents sending messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  NOT public.is_blocked(
    auth.uid(),
    (SELECT CASE 
      WHEN c.user1_id = auth.uid() THEN c.user2_id 
      ELSE c.user1_id 
    END FROM public.conversations c WHERE c.id = conversation_id)
  )
);
