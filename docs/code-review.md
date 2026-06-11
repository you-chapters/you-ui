# Code Review — Issues & Refactoring

## Critical

### C-1: Narrative test assertions are wrong
**File:** `ui/src/api/narrative.test.ts:22,29,35`

Tests assert the URL contains `refresh=false`, but the implementation only appends `refresh=true` when true, and omits the param entirely otherwise. Three test cases document non-existent behavior — either the implementation or the tests need to align with what the backend expects.

### C-2: Duplicate, inconsistent entry detail routes
**Files:** `ui/src/App.tsx:22-23`, `ui/src/components/EntryCard/index.tsx:29`, `ui/src/components/OnThisDayCard/index.tsx:59`

Two routes both render `EntriesViewPage`: `/entry/:id` and `/entries/:id`. `EntryCard` links to `/entry/`, `OnThisDayCard` links to `/entries/`. Both work but the public URL space is incoherent. Remove one route and consolidate all links to the survivor.

### C-3: PhaseCard "Explore entries" link is broken
**Files:** `ui/src/components/PhaseCard/index.tsx:42`, `ui/src/pages/EntriesViewPage.tsx`

The link appends `?from=...&to=...` query params for the phase's date range, but `EntriesViewPage` never calls `useSearchParams()`. It always loads the current week. Clicking "Explore entries →" silently shows the wrong data.

---

## High

### H-1: `amplify.ts` casts env vars to `string` unsafely
**File:** `ui/src/lib/amplify.ts:6-7`

`import.meta.env.VITE_COGNITO_USER_POOL_ID as string` suppresses TypeScript's awareness that the value may be `undefined`. A missing `.env.local` fails at Amplify runtime with a cryptic error. Add a runtime guard at startup:

```ts
const poolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
if (!poolId) throw new Error('VITE_COGNITO_USER_POOL_ID is not set');
```

Also declare the vars in `ui/src/vite-env.d.ts` (see L-5).

### H-2: `signOut()` has no error handling
**Files:** `ui/src/context/AuthContext.tsx:37-40`, `ui/src/components/NavBar/index.tsx:9-12`

If `amplifySignOut()` rejects, the error propagates uncaught. The UI leaves the user visually logged in with no feedback. Both `signOut` in the context and `handleSignOut` in `NavBar` need try/catch.

### H-3: `NarrativeStack.handleRefresh()` silently swallows errors
**File:** `ui/src/components/NarrativeStack/index.tsx:37-42`

The refresh chain has no `.catch()`. On failure, the spinner disappears and the stale narrative remains with no user-visible feedback.

### H-4: Race condition on concurrent API requests
**Files:** `ui/src/pages/EntriesViewPage.tsx:77-87`, `ui/src/pages/DashboardPage.tsx:25-28`

No `AbortController` or cancellation guard. If the user changes the week or period while a request is in flight, whichever response arrives last wins and can overwrite newer results with stale data.

### H-5: `DashboardPage` error state renders outside layout
**File:** `ui/src/pages/DashboardPage.tsx:30`

```ts
if (summaryError) return <p className="error">{summaryError}</p>;
```

Returns a bare, unstyled paragraph with no retry button. Compare with the proper error+retry pattern in `EntriesViewPage.tsx:150-155` and align.

---

## Medium

### M-1: Duplicate `formatDate` utility
**Files:** `ui/src/components/EntryCard/index.tsx:10-22`, `ui/src/pages/EntriesViewPage.tsx:10-17`

Two nearly identical `formatDate` functions exist in separate files with slightly different locale options. Extract a single utility to `ui/src/lib/formatDate.ts`.

### M-2: Inconsistent `refresh` param convention across API modules
**Files:** `ui/src/api/phases.ts:5`, `ui/src/api/narrative.ts:9-11`

`phases.ts` always serialises `refresh=true/false`. `narrative.ts` omits the param entirely when false. Pick one convention and apply it consistently across all API modules.

### M-3: `summary.test.ts` mock is missing required `top_locations` field
**File:** `ui/src/api/summary.test.ts:7-13`

The `mockSummary` object is not typed as `PeriodSummary`, so the missing field passes TypeScript unchecked. Type the constant to surface real shape mismatches:

```ts
const mockSummary: PeriodSummary = { ..., top_locations: [] };
```

### M-4: `RegisterPage` "Back" button misuses a layout class
**File:** `ui/src/pages/RegisterPage.tsx:156`

The button uses `className="auth-card__footer"` (a structural layout class) and then overrides all default button styles via five inline style declarations. Extract a `button--link` utility class into `AuthPage.css`.

### M-5: `PhasesPage.load()` missing from `useEffect` dependency array
**File:** `ui/src/pages/PhasesPage.tsx:17-33`

`load` is defined inside the component and not memoised, but is omitted from the `useEffect` deps. Harmless today but will silently break if `load` ever closes over props or state. Wrap in `useCallback`.

### M-6: Local `navigate` function shadows React Router convention in `OnThisDayCard`
**File:** `ui/src/components/OnThisDayCard/index.tsx:24-29`

A local function named `navigate` (for internal index transitions) clashes with the standard name for `useNavigate()`'s return value. Rename to `goToEntry` or `showEntry`.

### M-7: `setTimeout` not cleared on unmount
**Files:** `ui/src/components/NarrativeStack/index.tsx:54-61`, `ui/src/components/OnThisDayCard/index.tsx:25`

Both components fire a 120ms `setTimeout` for fade transitions without storing or clearing the timer ID. If the component unmounts within that window, the callback runs against unmounted state. Store the ID and clear it in a `useEffect` cleanup.

---

## Low

### L-1: `BASE_URL` is an undocumented empty string
**File:** `ui/src/api/client.ts:3`

`const BASE_URL = ''` relies silently on same-origin deployment or the Vite proxy. Replace with `import.meta.env.VITE_API_BASE_URL ?? ''` and document the assumption.

### L-2: `AskPage` imports `NewEntryPage.css` for shared styles
**File:** `ui/src/pages/AskPage.tsx:6`

Hidden coupling between unrelated pages. Extract the shared form classes (`.field`, `.alert`, etc.) into a shared stylesheet.

### L-3: `formatDate()` called twice with the same argument
**File:** `ui/src/pages/EntriesViewPage.tsx:55-56`

```tsx
{formatDate(entry.timestamp) && (
  <p>{formatDate(entry.timestamp)}</p>
)}
```

Store the result in a variable.

### L-4: `getCurrentPhase()` is dead code
**File:** `ui/src/api/phases.ts:10`

The function is exported but never imported or called anywhere. Remove it or add a consumer.

### L-5: `vite-env.d.ts` doesn't declare custom env vars
**File:** `ui/src/vite-env.d.ts`

Add declarations to get type-safe access and remove the `as string` casts in `amplify.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### L-6: Local/UTC date mismatch in phase timeline
**Files:** `ui/src/pages/PhasesPage.tsx:15`, `ui/src/components/PhaseTimeline/index.tsx:21-22`

`new Date(p.start_date)` parses ISO date strings as UTC midnight. `new Date(year, 0, 1)` creates local midnight. In timezones west of UTC, a phase starting `"2023-01-01"` resolves to `2022-12-31` locally, causing `hasYear(2023)` to return false. Use consistent UTC parsing throughout.

### L-7: No tests for `WeekPicker` component
**File:** `ui/src/components/WeekPicker/`

`WeekPicker` contains non-trivial logic: week generation, offset navigation, future-week disabling. It has no test file. The edge cases (month-spanning weeks, DST boundaries, future disabling) are exactly the kind that regress silently.

### L-8: `AskPage` — question field not cleared after successful submit
**File:** `ui/src/pages/AskPage.tsx`

After a successful `askQuestion` call the textarea retains its text. If intentional UX, it should be tested and documented; if not, `setQuestion('')` should be called on success.