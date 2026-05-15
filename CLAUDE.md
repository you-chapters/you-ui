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

**Data flow**: Pages call `src/api/entries.ts` → fetch against a backend at relative `BASE_URL` (`''`) → typed via `src/types/entry.ts`.

**Routing** (`App.tsx`): `/` → `LandingPage`, `/new` → `NewEntryPage`, `/entries` and `/entries/:id` → `EntriesViewPage`.

**Auth** (`src/lib/amplify.ts`, `src/context/AuthContext.tsx`): Amplify is configured once at startup. `AuthProvider` wraps the app and exposes `useAuth()` — `{ user, loading, signOut, refresh }`. `user.userId` is the Cognito sub (UUID) used as `user_id` in API calls; `user.displayName` is `preferred_username` with email/sub as fallbacks. `ProtectedRoute` redirects unauthenticated users to `/login`.

**API layer** (`src/api/entries.ts`): thin wrapper around `fetch`. Calls `fetchAuthSession()` on every request and attaches `Authorization: Bearer <idToken>`. Three functions: `createEntry`, `getEntry`, `listEntries`. Errors throw with the response body text.

**Types** (`src/types/entry.ts`): `Entry` (entry_id, user_id, entry, timestamp) and `CreateEntryPayload`.

Tests use `@testing-library/react` with jsdom. Setup file: `src/setupTests.ts`.