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

## Environment

Copy `ui/.env.example` to `ui/.env.local` and fill in the Cognito values before running locally:
```
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_USER_POOL_CLIENT_ID=
```

## Architecture

React 19 + TypeScript SPA using Vite, React Router v7, and Vitest.

**Data flow**: Pages call `src/api/` modules → fetch against a backend at relative `BASE_URL` (`''`) → typed via `src/types/`.

**Routing** (`App.tsx`): `/` → `DashboardPage` (protected), `/new` → `NewEntryPage` (protected), `/entries` and `/entries/:id` → `EntriesViewPage` (protected), `/login` → `LoginPage`, `/register` → `RegisterPage`.

**Auth** (`src/lib/amplify.ts`, `src/context/AuthContext.tsx`): Amplify is configured once at startup. `AuthProvider` wraps the app and exposes `useAuth()` — `{ user, loading, signOut, refresh }`. `user.displayName` is `preferred_username` with email/sub as fallbacks. `ProtectedRoute` redirects unauthenticated users to `/login`.

**API layer**:
- `src/api/client.ts` — shared `apiFetch<T>` wrapper; attaches `Authorization: Bearer <idToken>` on every request via Amplify's `fetchAuthSession`.
- `src/api/entries.ts` — `createEntry`, `getEntry`, `listEntries`, `searchEntries` (`POST /entries/search`).
- `src/api/summary.ts` — `getSummary(period: 7 | 30)` fetching `GET /entries/summary?period=N`.

**Types**:
- `src/types/entry.ts`: `Entry` (entry_id, user_id, entry, timestamp, location, tags), `EntryTags` (people, locations, topics, mood, time_markers), `CreateEntryPayload` (entry, location).
- `src/types/summary.ts`: `PeriodSummary`, `MoodPoint`, `TopicCount`, `PersonCount`.

Tests use `@testing-library/react` with jsdom. Setup file: `src/setupTests.ts`.