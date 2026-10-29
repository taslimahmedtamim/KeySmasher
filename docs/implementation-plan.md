# KeySmasher — Phased Implementation Plan & Checklist

> **Rule**: Phases must be developed and verified step-by-step. Never mark a phase as **Approved** without explicit user review and confirmation.

| Phase | Feature Description | Status | Verification Summary |
| :--- | :--- | :--- | :--- |
| **FEATURE A** | **Foundation and project setup** | **Approved** | Monorepo created, strict TS configured, shared scoring engine built & tested, Next.js 15+ App Router layout and navigation routes implemented, health check API passing. Approved by user. |
| **FEATURE B** | **Typing engine** (Headless, calculations, timer, caret, events) | **Approved** | Headless engine built, 0-shake stationary words, subpixel hardware-accelerated smooth caret glide, calm 1s ticks, tabular metrics, zen mode. Approved by user. |
| **FEATURE C** | **Practice page** (Interactive typing UI, modes, difficulty, results) | **In progress** | Adding Quote & Custom modes, Punctuation & Numbers toggles, SVG speed history chart, consistency score, guest local storage history, and sound effects. |
| **FEATURE D** | **Learning academy** (5 Course levels, progressive unlocking, lessons) | **Not started** | Dependencies: Feature B, C. |
| **FEATURE E** | **Keyboard layouts & finger guidance** (Visual keyboard, QWERTY map) | **Not started** | Dependencies: Feature D. |
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

## Detailed Task Breakdown for Current Phase: FEATURE C (Practice Page & Analytics)

- [ ] Add Punctuation (`@#$`) and Numbers (`123`) toggles to practice configuration bar.
- [ ] Add Quote mode (famous inspirational & literary quotes) and Custom Text mode (modal to paste user custom text).
- [ ] Add Consistency score calculation to `@keysmasher/shared` and typing metrics.
- [ ] Build interactive SVG Speed History Line Chart component (`WpmHistoryChart.tsx`) displaying raw WPM, net WPM, error spikes, and peak speed.
- [ ] Build Web Audio synthetic mechanical switch sound effects synthesizer (click, clack, thock, mute).
- [ ] Enhance Results screen with detailed statistics (CPM, Consistency, Error distribution, Copy to Clipboard summary, and Guest save reminder).
- [ ] Implement guest local session storage history (storing recent test runs in localStorage with average WPM and personal best).
- [ ] Write Vitest unit tests for new features and verify zero TypeScript/ESLint warnings.
- [ ] User review and approval.
