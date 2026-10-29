# KeySmasher — Phased Implementation Plan & Checklist

> **Rule**: Phases must be developed and verified step-by-step. Never mark a phase as **Approved** without explicit user review and confirmation.

| Phase | Feature Description | Status | Verification Summary |
| :--- | :--- | :--- | :--- |
| **FEATURE A** | **Foundation and project setup** | **Approved** | Monorepo created, strict TS configured, shared scoring engine built & tested, Next.js 15+ App Router layout and navigation routes implemented, health check API passing. Approved by user. |
| **FEATURE B** | **Typing engine** (Headless, calculations, timer, caret, events) | **In progress** | Dependencies: Feature A. Implementing headless engine, passage generator, and timer lifecycle. |
| **FEATURE C** | **Practice page** (Interactive typing UI, modes, difficulty, results) | **Not started** | Dependencies: Feature B. |
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

## Detailed Task Breakdown for Current Phase: FEATURE A

- [x] Inspect existing project and environment.
- [x] Configure Node.js LTS, npm workspaces, and Git repository.
- [x] Establish monorepo structure (`apps/web`, `packages/shared`, `docs/`).
- [x] Build core domain package `@keysmasher/shared` with deterministic scoring formulas and unit tests.
- [x] Configure Next.js 15+ App Router with React 19, TypeScript strict mode, and Tailwind CSS.
- [x] Implement shared design system, responsive navigation Header, and Footer.
- [x] Implement core routes: Home (`/`), Learn (`/learn`), Practice (`/practice`), Compete (`/compete`), Dashboard (`/dashboard`).
- [x] Implement `/api/health` health-check verification endpoint.
- [x] Configure Vitest and automated UI tests.
- [x] Create `.env.example`, `.gitignore`, and documentation (`architecture.md`, `decisions.md`, `testing.md`, `database.md`, `deployment.md`, `README.md`).
- [x] Run typecheck, unit tests, lint checks, and production build checks.
- [ ] User review and approval.
