
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
CREATE TYPE user_role AS ENUM ('photographer', 'model', 'creative', 'dual');
CREATE TYPE user_plan AS ENUM ('free', 'premium', 'pro');
CREATE TYPE verified_level AS ENUM ('none', 'email', 'phone', 'identity');
CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'noshow');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'declined', 'counter');
CREATE TYPE casting_status AS ENUM ('open', 'filled', 'expired', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE report_category AS ENUM ('harassment', 'fake_profile', 'noshow', 'inappropriate', 'spam', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE user_level AS ENUM ('newcomer', 'starter', 'rising', 'established', 'elite', 'legend');

-- ========================================
-- USERS TABLE (extends auth.users)
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'photographer',
  plan user_plan NOT NULL DEFAULT 'free',
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  verified_level verified_level NOT NULL DEFAULT 'none',
  rating_avg DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  user_level user_level NOT NULL DEFAULT 'newcomer',
  styles TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  measurements JSONB DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  distance_radius INTEGER DEFAULT 25,
  instagram TEXT,
  website TEXT,
  languages TEXT[] DEFAULT '{English}',
  has_studio BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PORTFOLIO PHOTOS
-- ========================================
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  style TEXT,
  is_nsfw BOOLEAN DEFAULT FALSE,
  is_cover BOOLEAN DEFAULT FALSE,
  credits_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- CASTING CALLS
-- ========================================
CREATE TABLE public.casting_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type_needed TEXT[] NOT NULL DEFAULT '{model}',
  styles TEXT[] NOT NULL DEFAULT '{}',
  proposed_date DATE,
  proposed_time TEXT,
  is_flexible_date BOOLEAN DEFAULT FALSE,
  location TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_indoor BOOLEAN DEFAULT TRUE,
  slots INTEGER NOT NULL DEFAULT 1,
  filled_slots INTEGER DEFAULT 0,
  status casting_status NOT NULL DEFAULT 'open',
  moodboard_urls TEXT[] DEFAULT '{}',
  requirements TEXT,
  duration TEXT,
  transport TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ========================================
-- CASTING APPLICATIONS
-- ========================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  casting_id UUID NOT NULL REFERENCES public.casting_calls(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(casting_id, applicant_id)
);

-- ========================================
-- TFP REQUESTS
-- ========================================
CREATE TABLE public.tfp_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  proposed_date DATE,
  proposed_time TEXT,
  proposed_location TEXT,
  style TEXT,
  duration TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SESSIONS (confirmed TFP shoots)
-- ========================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.tfp_requests(id),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id),
  model_id UUID NOT NULL REFERENCES public.profiles(id),
  date DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  duration TEXT,
  status session_status NOT NULL DEFAULT 'confirmed',
  checkin_photographer TIMESTAMPTZ,
  checkin_model TIMESTAMPTZ,
  checkout_time TIMESTAMPTZ,
  cancel_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- REVIEWS
-- ========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id),
  professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
  punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
  communication INTEGER CHECK (communication BETWEEN 1 AND 5),
  creativity INTEGER CHECK (creativity BETWEEN 1 AND 5),
  result_quality INTEGER CHECK (result_quality BETWEEN 1 AND 5),
  overall_rating DECIMAL(2,1),
  comment TEXT,
  would_work_again TEXT CHECK (would_work_again IN ('yes', 'maybe', 'no')),
  is_visible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, reviewer_id)
);

-- ========================================
-- CONVERSATIONS & MESSAGES
-- ========================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  is_archived_user1 BOOLEAN DEFAULT FALSE,
  is_archived_user2 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'location', 'schedule', 'system')),
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- FAVORITES
-- ========================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  favorited_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorited_user_id)
);

-- ========================================
-- NOTIFICATIONS
-- ========================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- REPORTS
-- ========================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  reported_id UUID NOT NULL REFERENCES public.profiles(id),
  category report_category NOT NULL,
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status report_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SHARED GALLERIES
-- ========================================
CREATE TABLE public.shared_galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id),
  model_id UUID NOT NULL REFERENCES public.profiles(id),
  photos JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'shared', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- EMERGENCY CONTACTS
-- ========================================
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ACHIEVEMENTS
-- ========================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casting_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tfp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Photos
CREATE POLICY "Photos are viewable by everyone" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Users can manage own photos" ON public.photos FOR ALL USING (auth.uid() = user_id);

-- Casting Calls
CREATE POLICY "Castings are viewable by everyone" ON public.casting_calls FOR SELECT USING (true);
CREATE POLICY "Users can manage own castings" ON public.casting_calls FOR ALL USING (auth.uid() = creator_id);

-- Applications
CREATE POLICY "Applications visible to involved parties" ON public.applications FOR SELECT USING (
  auth.uid() = applicant_id OR 
  auth.uid() IN (SELECT creator_id FROM public.casting_calls WHERE id = casting_id)
);
CREATE POLICY "Users can create applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Casting creator can update applications" ON public.applications FOR UPDATE USING (
  auth.uid() IN (SELECT creator_id FROM public.casting_calls WHERE id = casting_id)
);

-- TFP Requests
CREATE POLICY "TFP requests visible to involved" ON public.tfp_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send TFP requests" ON public.tfp_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Involved users can update TFP requests" ON public.tfp_requests FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Sessions
CREATE POLICY "Sessions visible to involved" ON public.sessions FOR SELECT USING (auth.uid() = photographer_id OR auth.uid() = model_id);
CREATE POLICY "Involved users can manage sessions" ON public.sessions FOR ALL USING (auth.uid() = photographer_id OR auth.uid() = model_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (is_visible = true OR auth.uid() = reviewer_id OR auth.uid() = reviewed_id);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Conversations
CREATE POLICY "Conversations visible to participants" ON public.conversations FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages
CREATE POLICY "Messages visible to conversation participants" ON public.messages FOR SELECT USING (
  auth.uid() IN (SELECT user1_id FROM public.conversations WHERE id = conversation_id UNION SELECT user2_id FROM public.conversations WHERE id = conversation_id)
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Favorites
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can see own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Emergency contacts
CREATE POLICY "Users can manage own emergency contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- Shared galleries
CREATE POLICY "Galleries visible to involved" ON public.shared_galleries FOR SELECT USING (auth.uid() = photographer_id OR auth.uid() = model_id);
CREATE POLICY "Photographer can manage galleries" ON public.shared_galleries FOR ALL USING (auth.uid() = photographer_id);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update rating average after review
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    rating_avg = (
      SELECT ROUND(AVG(overall_rating)::numeric, 1)
      FROM public.reviews 
      WHERE reviewed_id = NEW.reviewed_id AND is_visible = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE reviewed_id = NEW.reviewed_id AND is_visible = true
    )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Make reviews visible when both parties reviewed
CREATE OR REPLACE FUNCTION public.check_mutual_review()
RETURNS TRIGGER AS $$
DECLARE
  other_review_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.reviews 
    WHERE session_id = NEW.session_id 
    AND reviewer_id = NEW.reviewed_id 
    AND reviewed_id = NEW.reviewer_id
  ) INTO other_review_exists;
  
  IF other_review_exists THEN
    UPDATE public.reviews SET is_visible = true WHERE session_id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_review_check_mutual
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.check_mutual_review();

-- Update user level based on sessions
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_sessions = (
      SELECT COUNT(*) FROM public.sessions 
      WHERE (photographer_id = NEW.photographer_id OR model_id = NEW.photographer_id)
      AND status = 'completed'
    ),
    user_level = CASE 
      WHEN (SELECT COUNT(*) FROM public.sessions WHERE (photographer_id = NEW.photographer_id OR model_id = NEW.photographer_id) AND status = 'completed') >= 51 THEN 'legend'::user_level
      WHEN (SELECT COUNT(*) FROM public.sessions WHERE (photographer_id = NEW.photographer_id OR model_id = NEW.photographer_id) AND status = 'completed') >= 26 THEN 'elite'::user_level
      WHEN (SELECT COUNT(*) FROM public.sessions WHERE (photographer_id = NEW.photographer_id OR model_id = NEW.photographer_id) AND status = 'completed') >= 11 THEN 'established'::user_level
      WHEN (SELECT COUNT(*) FROM public.sessions WHERE (photographer_id = NEW.photographer_id OR model_id = NEW.photographer_id) AND status = 'completed') >= 3 THEN 'rising'::user_level
      WHEN (SELECT COUNT(*) FROM public.sessions WHERE (photographer_id = NEW.photographer_id OR model_id = NEW.photographer_id) AND status = 'completed') >= 1 THEN 'starter'::user_level
      ELSE 'newcomer'::user_level
    END
  WHERE id = NEW.photographer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_session_completed
  AFTER UPDATE ON public.sessions
  FOR EACH ROW 
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.update_user_level();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
