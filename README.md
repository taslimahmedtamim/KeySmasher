# KeySmasher

> Full-Stack Touch Typing Learning, Practicing & Competition Platform.

KeySmasher combines a structured touch typing academy, a customizable speed testing engine (inspired by Monkeytype), and real-time multiplayer typing competitions into a unified, keyboard-first web experience.

---

## Features Overview

- **Learn**: Structured Touch Typing Academy from Beginner to Expert with finger placement guidance.
- **Practice**: Customizable typing speed engine with time (15s, 30s, 60s, 120s) and word count (10, 25, 50, 100) modes.
- **Compete**: Live multiplayer typing races, private rooms, and leaderboards.
- **Dashboard**: Personal analytics, accuracy tracking, weak-key diagnosis, and daily streaks.
- **Shared Scoring Core**: Deterministic formulas adhering to the international standard 5-character word length.

---

## Project Structure

```
KeySmasher/
├── apps/
│   └── web/                   # Next.js 15+ App Router, React 19, Tailwind CSS
├── packages/
│   └── shared/                # Core domain types, schemas, and scoring logic
├── docs/                      # Architecture, database, decisions, implementation plan
├── .env.example               # Environment variables template
├── package.json               # Monorepo workspaces configuration
└── README.md
```

---

## Prerequisites

- **Node.js**: v20+ LTS (Tested on v26 LTS)
- **npm**: v10+

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verify Health Check
```bash
curl http://localhost:3000/api/health
```

---

## Verification & Testing Commands

```bash
# Run unit & component tests
npm run test

# Run strict TypeScript typecheck
npm run typecheck

# Run ESLint checks
npm run lint

# Run production build
npm run build
```

---

## Architecture & Documentation

- [Implementation Plan & Status](docs/implementation-plan.md)
- [System Architecture](docs/architecture.md)
- [Technical Decisions (ADRs)](docs/decisions.md)
- [Testing Guidelines](docs/testing.md)
- [Database Design Principles](docs/database.md)
- [Deployment Guide](docs/deployment.md)
