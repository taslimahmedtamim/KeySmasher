# KeySmasher — Phased Implementation Plan & Checklist

> **Rule**: Phases must be developed and verified step-by-step. Never mark a phase as **Approved** without explicit user review and confirmation.

| Phase | Feature Description | Status | Verification Summary |
| :--- | :--- | :--- | :--- |
| **FEATURE A** | **Foundation and project setup** | **Approved** | Monorepo created, strict TS configured, shared scoring engine built & tested, Next.js 15+ App Router layout and navigation routes implemented, health check API passing. Approved by user. |
| **FEATURE B** | **Typing engine** (Headless, calculations, timer, caret, events) | **Approved** | Headless engine built, 0-shake stationary words, subpixel hardware-accelerated smooth caret glide, calm 1s ticks, tabular metrics, zen mode. Approved by user. |
| **FEATURE C** | **Practice page** (Interactive typing UI, modes, difficulty, results) | **Approved** | Quote & Custom modes, Punctuation/Numbers toggles, SVG speed history chart, consistency score, guest local storage history, mechanical sound effects, and final character timer fix. Approved by user. |
| **FEATURE D** | **Learning academy** (5 Course levels, progressive unlocking, lessons) | **Approved** | Structured 5-level curriculum, 24 lessons, interactive lesson runner, progressive unlocking, accuracy gates, star ratings. Approved by user. |
| **FEATURE E** | **Keyboard layouts & finger guidance** (Visual keyboard, QWERTY map) | **Approved** | UnifiedGuidanceConsole (Left Hand | Keyboard | Right Hand on one screen), anatomical fingers, tactile bumps, reach vectors, movement coach. Approved by user. |
| **FEATURE F** | **Authentication & database foundation** (Supabase, RLS, sessions) | **Approved** | PostgreSQL schema migration, RLS policies, AuthContext, AuthModal with responsive sizing, 1-click Demo Account, guest-to-account sync. Approved by user. |
| **FEATURE G** | **User dashboard & analytics** (Persisted history, trends, empty states) | **Approved** | Personal analytics hub with 2-tier profile banner, 5 headline KPIs, interactive SVG progression chart, academy mastery card, Star-highlighted verified records table, and high-res Certificate download. Approved by user. |
| **FEATURE H** | **Smart typing coach** (Rule-based recommendation engine, weak keys) | **Approved** | Weak-key diagnostics, confusion matrix, finger load balance, rule-based coaching advice, visual keyboard heatmap, 1-click targeted drill generator, Monkeytype-style speed chart, mechanical keyboard audio engine. Approved by user. |
| **FEATURE I** | **Real-time multiplayer infrastructure** (Node.js & WebSocket service) | **Ready for Review** | Standalone WebSocket service (`apps/realtime`), room lifecycle manager, heartbeat, anti-cheat validation, AI ghost typist runner. 102 unit/integration tests passing. |
| **FEATURE J** | **Multiplayer typing races** (Synchronized lobbies, countdowns, race) | **Ready for Review** | Private battle lobbies, 6-character room codes, synchronized 5s countdown overlay, multi-lane race track, live progress broadcast, and victory podium with rematch flow on `/compete`. |
| **FEATURE K** | **Competition history & leaderboards** (Rankings, race records) | **Ready for Review** | Database schema migration (`rooms`, `race_results`), global leaderboards (Daily, Weekly, All-Time), international rank tiers (Bronze to Grandmaster), user competition stats card, match history timeline, auto-record on podium finish. 112 tests passing. |
| **FEATURE L** | **Gamification & challenges** (XP, streaks, daily goals, achievements) | **Not started** | Dependencies: Feature F, K. |
| **FEATURE M** | **Friends, ranked matches & tournaments** (Matchmaking, brackets) | **Not started** | Dependencies: Feature K, L. |
| **FEATURE N** | **Coding mode** (Syntax, programming languages, code symbols) | **Not started** | Dependencies: Feature B, C. |
| **FEATURE O** | **Accessibility, performance & production readiness** (Final audit) | **Not started** | Dependencies: All previous features. |

---

## Detailed Task Breakdown for FEATURE H (Smart Typing Coach & Weak-Key Diagnostics)

- [x] Create domain types in `@keysmasher/shared`: `KeyAccuracyStat`, `WeakKeyDiagnostic`, `FingerBalanceStat`, `CoachRecommendation`, `CoachAnalysisResult`.
- [x] Implement pure diagnostic engine in `@keysmasher/shared` (`diagnosticEngine.ts`):
  - Per-character accuracy & error frequency.
  - Finger error load (Left Pinky/Ring/Middle/Index vs Right Index/Middle/Ring/Pinky).
  - Top 5 weakest keys with confusion mapping (e.g. typed `r` instead of `t`).
  - Rule-based coaching recommendations (speed plateau, accuracy bottleneck, rhythm cadence, specific Academy lesson deep links).
  - Targeted drill generator synthesizing practice sentences tailored to target weak keys (`drillGenerator.ts`).
- [x] Build `apps/web/src/features/coach/components/KeyboardHeatmap.tsx` rendering an interactive QWERTY heatmap with accuracy color-coding (Mastered >97%, Developing 90-96%, Weak <90%), with interactive key drawer revealing finger assignment, motion instruction, and mis-presses.
- [x] Build `apps/web/src/features/coach/components/SmartCoachCard.tsx` on the Dashboard displaying:
  - Accuracy Health Score & Hand Balance ratio.
  - Top 3-5 Weak Keys with miss frequency and finger assignments.
  - Actionable Coach Insight pills.
  - 1-Click "Start Targeted Weak-Key Drill" button that loads custom practice text.
- [x] Build `apps/web/src/features/coach/components/PostTestCoachTip.tsx` for immediate coaching feedback on the Practice Results screen.
- [x] Integrate Smart Coach into Dashboard ([page.tsx](file:///run/media/tamim/New%20Volume/Projects/KeySmasher/apps/web/src/app/dashboard/page.tsx)) and Practice results ([practice/page.tsx](file:///run/media/tamim/New%20Volume/Projects/KeySmasher/apps/web/src/app/practice/page.tsx)).
- [x] Write unit tests for coach engine calculations and UI components in `apps/web/src/tests/FeatureH.test.tsx`.
- [x] Verify strict TypeScript typecheck and ESLint with 0 errors and 0 warnings.
- [x] User review and approval.

---

## Detailed Task Breakdown for FEATURE I & J (Real-Time Multiplayer Infrastructure & Races)

- [x] Create domain types and anti-cheat validation in `@keysmasher/shared/src/multiplayer`:
  - `MultiplayerRoom`, `RoomParticipant`, `RoomConfig`, `RoomStatus`, `WsMessage`, `RaceSubmission`.
  - Room code generator (`generateRoomCode()`) with uppercase alphanumeric format omitting ambiguous characters.
  - Server-authoritative anti-cheat validation (`validateRaceSubmission()`) enforcing 320 WPM physical ceiling and character minimums.
  - AI Bot typist speed calculation with natural human-like cadence variance (`calculateBotProgress()`).
  - Unit tests in `packages/shared/src/multiplayer/multiplayer.test.ts` (13 tests passing).
- [x] Build dedicated real-time service in `apps/realtime`:
  - Node.js WebSocket server with `/health` HTTP endpoint, heartbeat ping/pong, and graceful shutdown.
  - `RoomManager` handling room lifecycle: create, join, ready, host migration, live broadcast, and empty room cleanup.
  - Synchronized 5-second countdown machine and background AI bot progression loop.
- [x] Build client multiplayer hook and fallback in `apps/web/src/features/multiplayer`:
  - `useMultiplayerRoom` hook managing live WebSocket connection, message handling, throttled progress emissions (150ms delta), and seamless simulated local arena fallback when offline.
- [x] Build UI components in `apps/web/src/features/multiplayer/components`:
  - `RoomCreateModal.tsx`: Room rule customization (mode, words, duration, difficulty, modifiers, capacity).
  - `RoomJoinCard.tsx`: Formatted 6-character room code input.
  - `RoomLobbyView.tsx`: Live room code copy, invite link sharing, racer roster cards with Host crown, AI Ghost Typist adder, and in-room chat comms.
  - `RaceCountdownOverlay.tsx`: Synchronized pulsing countdown numbers (5, 4, 3, 2, 1, GO!).
  - `RaceTrack.tsx`: Multi-lane race track with live avatars, progress bars, dynamic place tags (`#1`, `#2`, `#3`), and live WPM readouts.
  - `RaceArena.tsx`: Unified race typing area integrating `TypingArea` and mechanical switch audio.
  - `RacePodium.tsx`: 1st, 2nd, 3rd place victory podium with Gold/Silver/Bronze trophy illumination, complete scoreboard table, and Rematch flow.
- [x] Integrate full competitive flow into `/compete` (`apps/web/src/app/compete/page.tsx`):
  - Support auto-joining via URL query params (`/compete?room=XYZ123`).
  - Instant "Practice vs AI Ghost" 1-click match button for solo testing.
  - Smooth state transitions: Arena Hub -> Lobby -> Countdown -> Live Race Track -> Victory Podium.
- [x] Write integration test suite in `apps/web/src/tests/FeatureI_J.test.tsx` (10 tests passing).
- [x] Verify strict TypeScript typecheck and ESLint across all 3 workspaces with 0 errors and 0 warnings.
- [x] Verify production build across all static and dynamic routes.

---

## Detailed Task Breakdown for FEATURE K (Competition History & Leaderboards)

- [x] Create database migration in `supabase/migrations/20261115000000_multiplayer_records_leaderboards.sql`:
  - `rooms` table with code, host, config, and status.
  - `race_results` table storing placement, net WPM, raw WPM, accuracy, duration, and completion timestamp.
  - RLS policies allowing public reads and authenticated user writes.
- [x] Build rank tier calculation and services in `apps/web/src/features/leaderboard`:
  - `calculateRankTier(netWpm)` mapping speeds to Bronze (<40), Silver (40-59), Gold (60-79), Platinum (80-99), Diamond (100-119), Master (120-139), and Grandmaster (140+).
  - `computeCompetitionStats()` computing total battles, wins, podiums (1st/2nd/3rd), win rate percentage, and peak race speed.
  - `getGlobalLeaderboard()` sorting typists descending by verified Net WPM, filtering by period (Daily, Weekly, All-Time), and dynamically highlighting the current user's placement.
  - Persistent localStorage race recording (`keysmasher_race_history`).
- [x] Build UI components in `apps/web/src/features/leaderboard/components`:
  - `UserCompetitionStatsCard.tsx`: Displays rank tier jewel badge, division name, and 4 KPI readouts (Peak Race WPM, Win Rate, Podiums, Avg Speed).
  - `LeaderboardTable.tsx`: Full responsive ranking table with Daily / Weekly / All-Time period toggle, Gold/Silver/Bronze highlight badges, avatar initials, and dynamic `(You)` highlight row.
  - `RecentBattlesList.tsx`: Timeline list of completed matches showing placement, room code, speed, accuracy, and timestamp, with an empty state prompting new races.
- [x] Connect match results saving to `RacePodium.tsx` so completed races are automatically persisted to the competitor's match history.
- [x] Integrate sub-tabs into `/compete` (`apps/web/src/app/compete/page.tsx`):
  - "Battle Arena", "Global Leaderboards", and "My Battle History".
- [x] Write test suite in `apps/web/src/tests/FeatureK.test.tsx` (10 tests passing).
- [x] Verify strict TypeScript typecheck and ESLint with 0 errors and 0 warnings.
- [x] Verify production build across all static and dynamic routes.




