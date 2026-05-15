# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

No obvious comments in code - only comment complex/non-obvious logic.

## Commands

All commands run from `ui/`:

```bash
npm run dev       # dev server (Vite)
npm run build     # tsc + vite build
npm test          # vitest (watch mode)
npx vitest run    # single test run
npx vitest run src/components/NavBar.test.tsx  # single file
```

## Architecture

React 19 + TypeScript SPA using Vite, React Router v7, and Vitest.

**Data flow**: Pages call `src/api/entries.ts` → fetch against a backend at relative `BASE_URL` (`''`) → typed via `src/types/entry.ts`.

**Routing** (`App.tsx`): `/` → `LandingPage`, `/new` → `NewEntryPage`, `/entries` and `/entries/:id` → `EntriesViewPage`.

**API layer** (`src/api/entries.ts`): thin wrapper around `fetch`. Three functions: `createEntry`, `getEntry`, `listEntries`. Errors throw with the response body text.

**Types** (`src/types/entry.ts`): `Entry` (entry_id, user_id, entry, timestamp) and `CreateEntryPayload`.

Tests use `@testing-library/react` with jsdom. Setup file: `src/setupTests.ts`.