-- Allow authenticated users to insert notifications (for TFP requests, etc.)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow messages to be updated (for read_at)
CREATE POLICY "Recipients can update messages read status"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user1_id FROM public.conversations WHERE id = conversation_id
    UNION
    SELECT user2_id FROM public.conversations WHERE id = conversation_id
  )
);
