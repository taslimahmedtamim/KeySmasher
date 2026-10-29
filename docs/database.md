# KeySmasher — Database Design & Security Principles

KeySmasher uses Supabase PostgreSQL for persistent user accounts, typing sessions, curriculum definitions, and competitive records.

---

## 1. Core Principles
1. **Incremental Schema Introduction**: Tables are created only as their corresponding feature phase is developed.
2. **Row Level Security (RLS)**: Enabled by default on every user-facing table.
3. **Immutability of Finished Records**: Typing session results and race logs are immutable once committed.
4. **UUID Primary Keys**: `gen_random_uuid()` used for all entities.
5. **Ownership Isolation**: Public profile data is strictly separated from private account settings.

---

## 2. Planned Entity Evolution

### Phase F: Auth & User Data
- `profiles`: `id (uuid, references auth.users)`, `username`, `display_name`, `avatar_url`, `created_at`
- `user_preferences`: `user_id`, `theme`, `caret_style`, `sound_enabled`, `keyboard_layout`
- `typing_sessions`: `id`, `user_id`, `mode`, `target_duration`, `target_words`, `difficulty`, `raw_wpm`, `net_wpm`, `accuracy`, `cpm`, `completed_at`
- `personal_bests`: `user_id`, `mode`, `config_value`, `best_net_wpm`, `best_accuracy`, `session_id`, `updated_at`

### Phase D: Learning Academy
- `courses`: `id`, `slug`, `title`, `description`, `level`, `order_index`
- `lessons`: `id`, `course_id`, `title`, `target_text`, `min_accuracy`, `min_wpm`, `order_index`
- `lesson_progress`: `user_id`, `lesson_id`, `completed`, `best_wpm`, `best_accuracy`, `completed_at`

### Phase J & K: Multiplayer & Competitions
- `rooms`: `id`, `room_code`, `host_user_id`, `status`, `max_players`, `created_at`
- `race_results`: `id`, `room_id`, `user_id`, `placement`, `net_wpm`, `accuracy`, `completed_at`
- `leaderboard_cache`: Materialized view or indexed table for daily/weekly/all-time leaderboards.
