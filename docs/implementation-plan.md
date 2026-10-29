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
| **FEATURE G** | **User dashboard & analytics** (Persisted history, trends, empty states) | **Implemented** | Personal analytics hub with profile banner, 5 headline KPIs, interactive SVG progression chart with hover popovers, personal bests matrix, academy mastery card, and session history table with CSV/JSON export. |
| **FEATURE H** | **Smart typing coach** (Rule-based recommendation engine, weak keys) | **Not started** | Dependencies: Feature G. |
| **FEATURE I** | **Real-time multiplayer infrastructure** (Node.js & Socket.IO service) | **Not started** | Dependencies: Feature A, F. |
| **FEATURE J** | **Multiplayer typing races** (Synchronized lobbies, countdowns, race) | **Not started** | Dependencies: Feature B, I. |
| **FEATURE K** | **Competition history & leaderboards** (Rankings, race records) | **Not started** | Dependencies: Feature J. |
| **FEATURE L** | **Gamification & challenges** (XP, streaks, daily goals, achievements) | **Not started** | Dependencies: Feature F, K. |
| **FEATURE M** | **Friends, ranked matches & tournaments** (Matchmaking, brackets) | **Not started** | Dependencies: Feature K, L. |
| **FEATURE N** | **Coding mode** (Syntax, programming languages, code symbols) | **Not started** | Dependencies: Feature B, C. |
| **FEATURE O** | **Accessibility, performance & production readiness** (Final audit) | **Not started** | Dependencies: All previous features. |

---

## Detailed Task Breakdown for FEATURE G (User Dashboard & Analytics)

- [x] Create dashboard type definitions `apps/web/src/features/dashboard/types.ts` (PersonalBestRecord, AnalyticsSummary, ProgressionPoint, AcademyMasterySummary, UserAnalyticsData).
- [x] Build data loader hook `useUserAnalytics.ts` unifying Supabase database records, local session storage, academy storage, and strictly real user data.
- [x] Implement `DashboardProfileBanner.tsx` with user identity avatar, status pills, quick stats strip, and golden official Certificate Download action.
- [x] Remove CSV/JSON export clutter and replace with high-resolution typing certificate generator modal `TypingCertificateModal.tsx` (1600x1000 HD PNG download & print).
- [x] Integrate Certificate download in both Dashboard (All-time personal best) and Practice Page (immediate post-test results).
- [x] Implement `KpiMetricsGrid.tsx` with 5 neon headline cards: Peak WPM, Lifetime Average, Accuracy Ratio, Rhythm Consistency, and Active Daily Streak with clean integer rounding.
- [x] Implement `ProgressionChart.tsx` featuring an interactive SVG curve with neon cyan glow, filter tabs (All, Time, Words, Quotes), and hover data popovers.
- [x] Streamline dashboard by removing redundant 9-box personal bests grid and integrating prominent Star ⭐ / Peak badges directly into the Verified Speed Test Records table.
- [x] Implement `AcademyMasteryCard.tsx` showcasing 5-level curriculum completion bars, star counts, and direct lesson navigation.
- [x] Implement `SessionHistoryTable.tsx` with date formatting, mode badges, clean pagination, and glowing Star highlights for all-time peak and preset records.
- [x] Build authenticated and guest states in `apps/web/src/app/dashboard/page.tsx` with Cyberpunk unlock gateway and 1-click Demo login.
- [x] Write comprehensive unit tests in `apps/web/src/tests/FeatureG.test.tsx` (59 total passing tests across monorepo).
- [x] Verify strict TypeScript typecheck and ESLint with 0 errors and 0 warnings.
- [ ] User review and approval.

