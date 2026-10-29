# KeySmasher — Architectural & Technical Decisions Log

This log records major technical and architectural decisions, their rationale, trade-offs, and dates.

---

## ADR 001: Monorepo Architecture with npm Workspaces
- **Date**: 2026-10-29
- **Status**: Accepted
- **Context**: The project consists of a Next.js frontend, a shared domain logic package, and a future persistent Socket.IO real-time service.
- **Decision**: Use npm workspaces with `packages/*` and `apps/*` directories.
- **Rationale**: Keeps scoring algorithms and types strictly unified without requiring external package registry publishing. Eliminates drift between browser and server validation while maintaining independent deployability.

---

## ADR 002: Deterministic Scoring Standard (5 Characters / Word)
- **Date**: 2026-10-29
- **Status**: Accepted
- **Context**: Different typing platforms define WPM and accuracy differently, leading to user confusion and scoring disputes.
- **Decision**: 
  - Standard word length = 5 characters (including spaces and punctuation).
  - Raw WPM = `(totalTypedCharacters / 5) / (elapsedMinutes)`.
  - Net WPM = `Math.max(0, ((totalTypedCharacters / 5) - incorrectCharacters) / (elapsedMinutes))`.
  - Accuracy = `(correctCharacters / totalTypedCharacters) * 100`.
- **Rationale**: Adheres to the international touch-typing speed specification (used in certified competitions and standard benchmarking).

---

## ADR 003: Dark Mode First with High-Contrast Accessible Neon Accents
- **Date**: 2026-10-29
- **Status**: Accepted
- **Context**: Serious typists and competitive programmers prioritize minimal eye strain during extended sessions.
- **Decision**: Deep navy/slate background (`#090d16`), clear typography, high-contrast text, restrained neon cyan/purple accents, and visible `:focus-visible` rings for keyboard navigation.
- **Rationale**: Delivers a focused, distraction-free environment while maintaining a distinct brand identity matching the "KeySmasher" logo.

---

## ADR 004: Decoupling Typing Engine from UI Layout
- **Date**: 2026-10-29
- **Status**: Accepted
- **Context**: The typing engine must be used identically in Practice tests, Learning Academy exercises, and Multiplayer races.
- **Decision**: Build the engine as a headless TypeScript controller / custom React hook in `features/typing` with zero UI coupling.
- **Rationale**: Guarantees identical event handling, Backspace semantics, and metric calculations across all screens.
