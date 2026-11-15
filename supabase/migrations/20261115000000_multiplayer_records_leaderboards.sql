-- ==============================================================================
-- KeySmasher — Multiplayer Race Records & Leaderboard Cache (Feature K)
-- Migration: 20261115000000_multiplayer_records_leaderboards.sql
-- ==============================================================================

-- 1. Persistent Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  host_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mode TEXT NOT NULL, -- 'words' | 'time' | 'quote' | 'custom'
  difficulty TEXT NOT NULL,
  target_words INTEGER,
  target_duration INTEGER,
  status TEXT DEFAULT 'WAITING' NOT NULL,
  max_players INTEGER DEFAULT 8 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- 2. Immutable Race Results (Leaderboard & Match History)
CREATE TABLE IF NOT EXISTS public.race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  placement INTEGER NOT NULL,
  total_racers INTEGER NOT NULL,
  net_wpm NUMERIC(6,2) NOT NULL,
  raw_wpm NUMERIC(6,2) NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  duration_seconds NUMERIC(8,2) NOT NULL,
  mode TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_race_results_user_id ON public.race_results(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_wpm ON public.race_results(net_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_completed_at ON public.race_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_room_code ON public.race_results(room_code);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;

-- Rooms Policies
CREATE POLICY "Rooms are viewable by everyone"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Room hosts can update their own room"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = host_user_id);

-- Race Results Policies
CREATE POLICY "Race results and leaderboards are viewable by everyone"
  ON public.race_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own verified race results"
  ON public.race_results FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
