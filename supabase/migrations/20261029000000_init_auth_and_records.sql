-- ==============================================================================
-- KeySmasher — Initial Database Schema & Security Policies (Phase F)
-- Migration: 20261029000000_init_auth_and_records.sql
-- ==============================================================================

-- 1. Profiles (User Identity & Public Card)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. User Preferences (Settings & Ergonomics)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' NOT NULL,
  sound_theme TEXT DEFAULT 'click' NOT NULL,
  caret_style TEXT DEFAULT 'smooth' NOT NULL,
  keyboard_layout TEXT DEFAULT 'qwerty' NOT NULL,
  guidance_mode TEXT DEFAULT 'unified' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Typing Sessions (Immutable record of finished tests)
CREATE TABLE IF NOT EXISTS public.typing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- 'words' | 'time' | 'quote' | 'custom'
  target_duration INTEGER,
  target_words INTEGER,
  difficulty TEXT DEFAULT 'normal' NOT NULL,
  language TEXT DEFAULT 'english' NOT NULL,
  punctuation BOOLEAN DEFAULT false NOT NULL,
  numbers BOOLEAN DEFAULT false NOT NULL,
  raw_wpm NUMERIC(6,2) NOT NULL,
  net_wpm NUMERIC(6,2) NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  cpm INTEGER NOT NULL,
  consistency NUMERIC(5,2),
  total_characters INTEGER NOT NULL,
  correct_characters INTEGER NOT NULL,
  incorrect_characters INTEGER NOT NULL,
  duration_seconds NUMERIC(8,2) NOT NULL,
  wpm_history JSONB,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_typing_sessions_user_id ON public.typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_completed_at ON public.typing_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_mode ON public.typing_sessions(mode);

-- 4. Personal Bests (Fast lookup for PRs)
CREATE TABLE IF NOT EXISTS public.personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  config_key TEXT NOT NULL, -- e.g. 'time-15', 'words-25'
  best_wpm NUMERIC(6,2) NOT NULL,
  best_accuracy NUMERIC(5,2) NOT NULL,
  session_id UUID REFERENCES public.typing_sessions(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, mode, config_key)
);

CREATE INDEX IF NOT EXISTS idx_personal_bests_lookup ON public.personal_bests(user_id, mode, config_key);

-- 5. Lesson Progress (Learning Academy Progress)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  stars SMALLINT DEFAULT 0 NOT NULL,
  best_wpm NUMERIC(6,2) DEFAULT 0 NOT NULL,
  best_accuracy NUMERIC(5,2) DEFAULT 0 NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Typing Sessions Policies
CREATE POLICY "Users can view own typing sessions"
  ON public.typing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own typing sessions"
  ON public.typing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Personal Bests Policies
CREATE POLICY "Personal bests are viewable by everyone"
  ON public.personal_bests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own personal bests"
  ON public.personal_bests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lesson Progress Policies
CREATE POLICY "Users can view own lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own lesson progress"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_username TEXT;
BEGIN
  extracted_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
  );

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    extracted_username,
    COALESCE(new.raw_user_meta_data->>'display_name', extracted_username),
    COALESCE(new.raw_user_meta_data->>'avatar_url', null)
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
