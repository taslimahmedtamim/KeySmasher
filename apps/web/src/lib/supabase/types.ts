export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: string;
          sound_theme: string;
          caret_style: string;
          keyboard_layout: string;
          guidance_mode: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: string;
          sound_theme?: string;
          caret_style?: string;
          keyboard_layout?: string;
          guidance_mode?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: string;
          sound_theme?: string;
          caret_style?: string;
          keyboard_layout?: string;
          guidance_mode?: string;
          updated_at?: string;
        };
      };
      typing_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: string;
          target_duration: number | null;
          target_words: number | null;
          difficulty: string;
          language: string;
          punctuation: boolean;
          numbers: boolean;
          raw_wpm: number;
          net_wpm: number;
          accuracy: number;
          cpm: number;
          consistency: number | null;
          total_characters: number;
          correct_characters: number;
          incorrect_characters: number;
          duration_seconds: number;
          wpm_history: Json | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: string;
          target_duration?: number | null;
          target_words?: number | null;
          difficulty?: string;
          language?: string;
          punctuation?: boolean;
          numbers?: boolean;
          raw_wpm: number;
          net_wpm: number;
          accuracy: number;
          cpm: number;
          consistency?: number | null;
          total_characters: number;
          correct_characters: number;
          incorrect_characters: number;
          duration_seconds: number;
          wpm_history?: Json | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: string;
          target_duration?: number | null;
          target_words?: number | null;
          difficulty?: string;
          language?: string;
          punctuation?: boolean;
          numbers?: boolean;
          raw_wpm?: number;
          net_wpm?: number;
          accuracy?: number;
          cpm?: number;
          consistency?: number | null;
          total_characters?: number;
          correct_characters?: number;
          incorrect_characters?: number;
          duration_seconds?: number;
          wpm_history?: Json | null;
          completed_at?: string;
        };
      };
      personal_bests: {
        Row: {
          id: string;
          user_id: string;
          mode: string;
          config_key: string;
          best_wpm: number;
          best_accuracy: number;
          session_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: string;
          config_key: string;
          best_wpm: number;
          best_accuracy: number;
          session_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: string;
          config_key?: string;
          best_wpm?: number;
          best_accuracy?: number;
          session_id?: string | null;
          updated_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          stars: number;
          best_wpm: number;
          best_accuracy: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          stars?: number;
          best_wpm?: number;
          best_accuracy?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          stars?: number;
          best_wpm?: number;
          best_accuracy?: number;
          completed_at?: string;
        };
      };
    };
  };
}
