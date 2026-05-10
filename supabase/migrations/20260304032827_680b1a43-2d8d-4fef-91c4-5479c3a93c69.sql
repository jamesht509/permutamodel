
-- Add session_id column to tfp_requests to link accepted requests to sessions
ALTER TABLE public.tfp_requests ADD COLUMN session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_tfp_requests_session_id ON public.tfp_requests(session_id);
