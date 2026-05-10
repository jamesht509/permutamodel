
-- Create avatars bucket (public for display)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create portfolios bucket (public for display)
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);

-- Avatars: anyone can view
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Avatars: authenticated users can upload their own
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars: users can update their own
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars: users can delete their own
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Portfolios: anyone can view
CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- Portfolios: authenticated users can upload their own
CREATE POLICY "Users can upload their own portfolio photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Portfolios: users can update their own
CREATE POLICY "Users can update their own portfolio photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Portfolios: users can delete their own
CREATE POLICY "Users can delete their own portfolio photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
