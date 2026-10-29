# KeySmasher — Phased Implementation Plan & Checklist

> **Rule**: Phases must be developed and verified step-by-step. Never mark a phase as **Approved** without explicit user review and confirmation.

| Phase | Feature Description | Status | Verification Summary |
| :--- | :--- | :--- | :--- |
| **FEATURE A** | **Foundation and project setup** | **Approved** | Monorepo created, strict TS configured, shared scoring engine built & tested, Next.js 15+ App Router layout and navigation routes implemented, health check API passing. Approved by user. |
| **FEATURE B** | **Typing engine** (Headless, calculations, timer, caret, events) | **Approved** | Headless engine built, 0-shake stationary words, subpixel hardware-accelerated smooth caret glide, calm 1s ticks, tabular metrics, zen mode. Approved by user. |
| **FEATURE C** | **Practice page** (Interactive typing UI, modes, difficulty, results) | **Approved** | Quote & Custom modes, Punctuation/Numbers toggles, SVG speed history chart, consistency score, guest local storage history, mechanical sound effects, and final character timer fix. Approved by user. |
| **FEATURE D** | **Learning academy** (5 Course levels, progressive unlocking, lessons) | **In progress** | Structured curriculum, interactive lesson runner, progressive unlocking, accuracy thresholds, star ratings. |
| **FEATURE E** | **Keyboard layouts & finger guidance** (Visual keyboard, QWERTY map) | **In progress** | Visual interactive keyboard, color-coded finger mapping, active key highlights. |
| **FEATURE F** | **Authentication & database foundation** (Supabase, RLS, sessions) | **Not started** | Dependencies: Feature C, D. |
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

## Detailed Task Breakdown for Current Phase: FEATURE D & E (Learning Academy & Visual Keyboard)

- [x] Create structured curriculum data in `@keysmasher/shared` (Levels 1 to 5, lesson IDs, targets, drills, descriptions, finger hints).
- [x] Build QWERTY finger-mapping data and color-coded finger zones (Pinky, Ring, Middle, Index, Thumb).
- [x] Build `VisualKeyboard.tsx` component with real-time keypress illumination and finger position indicator.
- [x] Build interactive Lesson Runner (`/learn/[levelId]/[lessonId]`) with step-by-step progress, target accuracy gate (e.g. 95%), and star scoring.
- [x] Implement progressive lesson unlocking and guest progress persistence (localStorage).
- [x] Update `/learn` catalog page with progress badges, unlocked/locked status, star tallies, and clean navigation.
- [x] Write Vitest unit tests for lesson completion, star calculations, and keyboard mapping (45 total tests passing).
- [x] Verify zero TypeScript errors and zero ESLint warnings across monorepo.
- [ ] User review and approval.
