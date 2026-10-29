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
| **FEATURE H** | **Smart typing coach** (Rule-based recommendation engine, weak keys) | **Ready for Review** | Weak-key diagnostics, confusion matrix, finger load balance, rule-based coaching advice, visual keyboard heatmap, 1-click targeted drill generator. 68 unit tests passing (15 shared, 53 web), 0 TS errors, 0 ESLint warnings. |
| **FEATURE I** | **Real-time multiplayer infrastructure** (Node.js & Socket.IO service) | **Not started** | Dependencies: Feature A, F. |
| **FEATURE J** | **Multiplayer typing races** (Synchronized lobbies, countdowns, race) | **Not started** | Dependencies: Feature B, I. |
| **FEATURE K** | **Competition history & leaderboards** (Rankings, race records) | **Not started** | Dependencies: Feature J. |
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
- [ ] User review and approval.


