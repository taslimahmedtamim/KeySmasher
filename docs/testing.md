# KeySmasher — Testing Strategy & Guidelines

## 1. Principles
- **No silent failures**: All errors must be handled and surfaced properly.
- **Deterministic scoring tests**: Formulas for Raw WPM, Net WPM, and Accuracy must be verified against documented edge cases.
- **Timer isolation**: Test time-sensitive logic using fake timers (`vi.useFakeTimers()`).
- **Baseline checks before every phase completion**:
  1. TypeScript strict type checks (`npm run typecheck`)
  2. Lint checks (`npm run lint`)
  3. Unit & integration tests (`npm run test`)
  4. Production build (`npm run build`)

---

## 2. Test Execution Commands

From the workspace root:

```bash
# Run all unit tests across all workspaces
npm run test

# Run tests in specific workspaces
npm run test --workspace=@keysmasher/shared
npm run test --workspace=apps/web

# Run TypeScript compilation check
npm run typecheck

# Run ESLint check
npm run lint

# Run production build
npm run build
```

---

## 3. Test Coverage Goals
- **`packages/shared`**: 100% coverage on all scoring formulas, time calculations, and data normalization.
- **`apps/web` (Typing Engine - Phase B)**: Keystroke handler, Backspace behavior, caret progression, timer completion, and reset state.
- **`apps/web` (Components)**: Navigation rendering, responsive toggles, accessible keyboard focus.
- **`apps/realtime` (Phase I & J)**: Room lifecycle, countdown synchronization, concurrent player join/leave, disconnect handling.
