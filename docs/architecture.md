# KeySmasher — Architecture & System Design

## 1. Overview

**KeySmasher** is a full-stack touch typing learning academy, customizable speed testing engine, and real-time multiplayer competition platform.

The system is organized as a clean, modular monorepo using npm workspaces with clear boundaries between the frontend application, the shared core domain package, the persistent database, and the real-time competition service.

---

## 2. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                                Client                                   |
|   +-----------------------------------------------------------------+   |
|   |                  Next.js App Router (apps/web)                  |   |
|   |  - Touch Typing Academy (Courses & Lessons)                     |   |
|   |  - Practice Arena (Monkeytype-style Custom Tests)               |   |
|   |  - Multiplayer Lobby & Real-Time Race Client                    |   |
|   |  - User Dashboard & Analytics                                   |   |
|   +-----------------------------------------------------------------+   |
|               |                                      ^                  |
|               | HTTPS REST / SSR                     | WebSockets       |
|               v                                      v                  |
+---------------+--------------------------------------+------------------+
                |                                      |
                v                                      v
+-------------------------------+      +----------------------------------+
|           Database            |      |        Real-Time Service         |
|      (Supabase PostgreSQL)    |      |    (apps/realtime - Node.js)     |
|                               |      |                                  |
| - Row Level Security (RLS)    |      | - Socket.IO Persistent Server    |
| - Profiles & Preferences      |      | - Room State Machine             |
| - Lessons & Progress          |<-----+ - Authoritative Countdown & Race |
| - Sessions & Race Results     |      | - Anti-Cheat Submission Verify   |
| - Personal Bests & Leaderboard|      | - Progress Broadcast Throttling  |
+-------------------------------+      +----------------------------------+
                ^                                      ^
                |                                      |
                +------------------+-------------------+
                                   |
                     +---------------------------+
                     |    Core Domain Package    |
                     |    (@keysmasher/shared)   |
                     |                           |
                     | - Deterministic Scoring   |
                     |   (Raw/Net WPM, Accuracy) |
                     | - Shared TypeScript Types |
                     | - Room & Race States      |
                     | - Constants & Rules       |
                     +---------------------------+
```

---

## 3. Component Responsibilities

### 3.1 Web Application (`apps/web`)
- **Framework**: Next.js 15+ App Router, React 19, TypeScript (strict mode).
- **Styling**: Tailwind CSS with custom neon/dark-mode theme tokens, accessible focus rings, and responsive layouts.
- **Typing Engine**: Reusable, isolated typing engine hook and controller.
- **Client Responsibilities**: Capturing keystrokes with high fidelity, rendering carats and passages without layout shifts, calculating client-side preview metrics, rendering visual keyboard guides.

### 3.2 Shared Package (`packages/shared`)
- **Purpose**: Zero-dependency library shared between `apps/web` and `apps/realtime`.
- **Contents**:
  - Deterministic typing metrics formulas: `calculateTypingMetrics()`.
  - Constants: Standard word length (5 characters), duration presets, word presets.
  - Domain types: `UserProfile`, `TypingSession`, `RaceStatus`, `RaceParticipant`, etc.
  - Guarantees: Identical scoring rules across practice, lessons, and competition.

### 3.3 Database & Auth (`Supabase PostgreSQL`)
- **Authentication**: Email/password, OAuth, session management.
- **Authorization**: Row Level Security (RLS) enforcing that users can only modify their own profiles, preferences, and private test history.
- **Integrity**: Foreign keys, check constraints, unique constraints, and database triggers for personal best updates.

### 3.4 Real-Time Service (`apps/realtime` — Scheduled for Phase I/J)
- **Runtime**: Dedicated Node.js service using Socket.IO.
- **Role**: Persistent WebSocket connections for real-time race lobbies, synchronized race starts, and live progress broadcasting.
- **Fairness & Authority**: The server establishes race countdowns, validates typed results against passage length and elapsed time, and rejects duplicate or impossible results.

---

## 4. Key Technical Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Typing Calculation Inconsistency** | Unified in `@keysmasher/shared/constants/scoring.ts` with 100% unit test coverage. Formula adheres strictly to the 5-character touch typing standard. |
| **Timer Drifts & Multiple Intervals** | Use `performance.now()` delta tracking rather than relying on raw `setInterval` ticks. Isolate timer lifecycle within the typing engine. |
| **Layout Shift During Keystrokes** | Monospace typography with fixed character bounding boxes and pre-rendered token spans. |
| **Cheating in Multiplayer Races** | Server-authoritative start/end timestamps, passage fingerprint validation, keystroke frequency verification, and progress rate limiting. |
| **Database Exposure** | Enforce Postgres Row Level Security (RLS) on all tables; never expose the service-role key to frontend code. |
