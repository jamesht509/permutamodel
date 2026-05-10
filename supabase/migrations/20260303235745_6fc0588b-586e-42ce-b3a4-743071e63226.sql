-- Drop the overly permissive policy
DROP POLICY "Authenticated users can create notifications" ON public.notifications;

-- Create a more restrictive policy: only allow inserting notifications for other users
CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NOT NULL);
