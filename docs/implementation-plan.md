# KeySmasher — Phased Implementation Plan & Checklist

> **Rule**: Phases must be developed and verified step-by-step. Never mark a phase as **Approved** without explicit user review and confirmation.

| Phase | Feature Description | Status | Verification Summary |
| :--- | :--- | :--- | :--- |
| **FEATURE A** | **Foundation and project setup** | **Approved** | Monorepo created, strict TS configured, shared scoring engine built & tested, Next.js 15+ App Router layout and navigation routes implemented, health check API passing. Approved by user. |
| **FEATURE B** | **Typing engine** (Headless, calculations, timer, caret, events) | **Approved** | Headless engine built, 0-shake stationary words, subpixel hardware-accelerated smooth caret glide, calm 1s ticks, tabular metrics, zen mode. Approved by user. |
| **FEATURE C** | **Practice page** (Interactive typing UI, modes, difficulty, results) | **Approved** | Quote & Custom modes, Punctuation/Numbers toggles, SVG speed history chart, consistency score, guest local storage history, mechanical sound effects, and final character timer fix. Approved by user. |
| **FEATURE D** | **Learning academy** (5 Course levels, progressive unlocking, lessons) | **Approved** | Structured 5-level curriculum, 24 lessons, interactive lesson runner, progressive unlocking, accuracy gates, star ratings. Approved by user. |
| **FEATURE E** | **Keyboard layouts & finger guidance** (Visual keyboard, QWERTY map) | **Approved** | UnifiedGuidanceConsole (Left Hand | Keyboard | Right Hand on one screen), anatomical fingers, tactile bumps, reach vectors, movement coach. Approved by user. |
| **FEATURE F** | **Authentication & database foundation** (Supabase, RLS, sessions) | **In progress** | AuthProvider, Supabase schema migration, Auth modal, session persistence, guest migration, dashboard reveal. |
| **FEATURE G** | **User dashboard & analytics** (Persisted history, trends, empty states) | **Not started** | Dependencies: Feature F. |
| **FEATURE H** | **Smart typing coach** (Rule-based recommendation engine, weak keys) | **Not started** | Dependencies: Feature G. |
| **FEATURE I** | **Real-time multiplayer infrastructure** (Node.js & Socket.IO service) | **Not started** | Dependencies: Feature A, F. |
| **FEATURE J** | **Multiplayer typing races** (Synchronized lobbies, countdowns, race) | **Not started** | Dependencies: Feature B, I. |
| **FEATURE K** | **Competition history & leaderboards** (Rankings, race records) | **Not started** | Dependencies: Feature J. |
| **FEATURE L** | **Gamification & challenges** (XP, streaks, daily goals, achievements) | **Not started** | Dependencies: Feature F, K. |
| **FEATURE M** | **Friends, ranked matches & tournaments** (Matchmaking, brackets) | **Not started** | Dependencies: Feature K, L. |
| **FEATURE N** | **Coding mode** (Syntax, programming languages, code symbols) | **Not started** | Dependencies: Feature B, C. |
| **FEATURE O** | **Accessibility, performance & production readiness** (Final audit) | **Not started** | Dependencies: All previous features. |

---

## Detailed Task Breakdown for Current Phase: FEATURE F (Authentication & Database Foundation)

- [x] Install `@supabase/supabase-js` and `@supabase/ssr` in `apps/web`.
- [x] Create PostgreSQL schema & RLS migration script `supabase/migrations/20261029000000_init_auth_and_records.sql` (profiles, user_preferences, typing_sessions, personal_bests, lesson_progress, RLS policies, automatic profile triggers).
- [x] Create isomorphic Supabase client (`apps/web/src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`) with seamless local/mock mode fallback.
- [x] Implement `AuthContext` and `useAuth` hook with real Supabase Auth + Demo login fallback, guest state tracking, and session listener.
- [x] Implement interactive Auth Modal (`AuthModal.tsx`) with Sign In, Sign Up, validation, and 1-click Demo Account login.
- [x] Wire AuthModal to `Header.tsx`, revealing User Dropdown, Dashboard link, and Sign Out action upon authentication.
- [x] Implement Guest-to-Account data sync (migrating local practice history and academy stars to user profile).
- [x] Write unit tests verifying auth state transitions, guest fallback, and form validations (54 total tests passing).
- [x] Run validation commands (typecheck, lint, test).
- [ ] User review and approval.
