# Phase 2 — Dashboard: Frontend Implementation

Replaces the current `LandingPage` (two CTA buttons, no data) with a `DashboardPage` that shows
a live period summary for the authenticated user. The dashboard is the first thing a logged-in
user sees; unauthenticated users are redirected to `/login` as before.

---

## Files to delete

Remove `LandingPage` entirely — it has no value once the dashboard exists:

```
ui/src/pages/LandingPage.tsx
ui/src/pages/LandingPage.css
ui/src/pages/LandingPage.test.tsx
```

---

## New files

### `ui/src/types/summary.ts`

```ts
export interface MoodPoint {
  date: string;   // "YYYY-MM-DD"
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface TopicCount {
  topic: string;
  count: number;
}

export interface PersonCount {
  name: string;
  count: number;
}

export interface PeriodSummary {
  period_days: number;
  entry_count: number;
  mood_timeline: MoodPoint[];   // chronological
  top_topics: TopicCount[];     // sorted by count desc
  top_people: PersonCount[];    // sorted by count desc
}
```

### `ui/src/api/summary.ts`

Add a new api module (keeps entries.ts focused on CRUD):

```ts
import type { PeriodSummary } from '../types/summary';
import { apiFetch } from './entries';   // re-export apiFetch from entries.ts, or duplicate

export function getSummary(period: 7 | 30 = 30): Promise<PeriodSummary> {
  return apiFetch<PeriodSummary>(`/entries/summary?period=${period}`);
}
```

Note: `apiFetch` is currently unexported in `entries.ts`. Either export it from there or extract
it to `ui/src/api/client.ts` and import in both modules. The latter is cleaner.

### `ui/src/components/PeriodStrip.tsx`

Renders the top row of the dashboard: entry count, mood sparkline dots, topic tags.

```tsx
import type { PeriodSummary } from '../types/summary';

const MOOD_COLOR: Record<string, string> = {
  positive: '#4ade80',   // green
  negative: '#f87171',   // red
  neutral:  '#94a3b8',   // grey
  mixed:    '#fb923c',   // orange
};

interface Props {
  summary: PeriodSummary;
  period: 7 | 30;
  onPeriodChange: (p: 7 | 30) => void;
}

export default function PeriodStrip({ summary, period, onPeriodChange }: Props) {
  return (
    <section>
      <div>
        <button onClick={() => onPeriodChange(7)}  className={period === 7  ? 'active' : ''}>7d</button>
        <button onClick={() => onPeriodChange(30)} className={period === 30 ? 'active' : ''}>30d</button>
      </div>

      <p>{summary.entry_count} {summary.entry_count === 1 ? 'entry' : 'entries'}</p>

      {/* mood sparkline — one coloured dot per day */}
      <div className="mood-sparkline">
        {summary.mood_timeline.map(({ date, mood }) => (
          <span
            key={date}
            title={`${date}: ${mood}`}
            style={{ background: MOOD_COLOR[mood] }}
            className="mood-dot"
          />
        ))}
      </div>

      {/* topic tags */}
      <div className="topic-tags">
        {summary.top_topics.map(({ topic, count }) => (
          <span key={topic} className="tag">
            {topic} <small>{count}</small>
          </span>
        ))}
      </div>
    </section>
  );
}
```

### `ui/src/components/PeopleCard.tsx`

Renders the people section. Clicking a name fires a semantic search via the existing
`POST /entries/search` endpoint, using the person's name as the query.

```tsx
import { useNavigate } from 'react-router-dom';
import type { PersonCount } from '../types/summary';

interface Props {
  people: PersonCount[];
}

export default function PeopleCard({ people }: Props) {
  const navigate = useNavigate();

  if (people.length === 0) return null;

  function handlePersonClick(name: string) {
    // Navigate to /entries with the search query pre-set.
    // EntriesViewPage will need to support reading this state to trigger a search on mount.
    navigate('/entries', { state: { searchQuery: name } });
  }

  return (
    <section>
      <h2>People</h2>
      <ul>
        {people.map(({ name, count }) => (
          <li key={name}>
            <button onClick={() => handlePersonClick(name)}>
              {name} <small>×{count}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Note: for the person-click search to work, `EntriesViewPage` needs a small change — read
`location.state.searchQuery` on mount and trigger a search if it's present.
See the `EntriesViewPage` change below.

### `ui/src/pages/DashboardPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import { getSummary } from '../api/summary';
import type { PeriodSummary } from '../types/summary';
import PeriodStrip from '../components/PeriodStrip';
import PeopleCard from '../components/PeopleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const [period, setPeriod] = useState<7 | 30>(30);
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSummary(null);
    setError(null);
    getSummary(period)
      .then(setSummary)
      .catch(e => setError(e.message ?? 'Failed to load summary'));
  }, [period]);

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <LoadingSpinner centered />;

  return (
    <main>
      <PeriodStrip summary={summary} period={period} onPeriodChange={setPeriod} />
      <PeopleCard people={summary.top_people} />
    </main>
  );
}
```

---

## Modified files

### `ui/src/App.tsx`

- Remove the `LandingPage` import
- Change the `/` route from `<LandingPage />` to `<ProtectedRoute><DashboardPage /></ProtectedRoute>`
- Unauthenticated users hitting `/` are redirected to `/login` (same as all other protected routes)

```tsx
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';   // replaces LandingPage
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewEntryPage from './pages/NewEntryPage';
import EntriesViewPage from './pages/EntriesViewPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/new" element={<ProtectedRoute><NewEntryPage /></ProtectedRoute>} />
        <Route path="/entries" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
        <Route path="/entries/:id" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
```

### `ui/src/types/entry.ts`

Add the `EntryTags` and `tags` field that the backend already returns but the frontend ignores:

```ts
export interface EntryTags {
  people: string[];
  locations: string[];
  topics: string[];
  mood: 'positive' | 'negative' | 'neutral' | 'mixed' | null;
  time_markers: string[];
}

export interface Entry {
  entry_id: string;
  user_id: string;
  entry: string;
  timestamp?: string;
  location?: string;
  tags?: EntryTags | null;
}

export interface CreateEntryPayload {
  entry: string;
  location?: string;
}
```

Note: `user_id` was removed from `CreateEntryPayload` — the backend derives it from the JWT and
never reads it from the request body. Sending it is harmless but misleading.

### `ui/src/pages/EntriesViewPage.tsx` (minor)

Read `location.state.searchQuery` on mount to support the person-click flow from `PeopleCard`:

```tsx
import { useLocation } from 'react-router-dom';

// inside the component:
const location = useLocation();

useEffect(() => {
  const query = (location.state as { searchQuery?: string } | null)?.searchQuery;
  if (query) {
    // trigger the existing search flow with `query`
  }
}, []);
```

The exact implementation depends on how `EntriesViewPage` manages search state internally —
add a `searchQuery` state, pre-populate it from `location.state`, and trigger the search on mount
when it's non-empty.

### `ui/src/api/entries.ts` (minor)

Export `apiFetch` so `summary.ts` can reuse it, or extract it to a shared `ui/src/api/client.ts`.
The cleanest split:

```
ui/src/api/client.ts   — apiFetch (shared auth fetch wrapper)
ui/src/api/entries.ts  — createEntry, getEntry, listEntries, searchEntries
ui/src/api/summary.ts  — getSummary
```

---

## Verification checklist

1. Log in → `/` shows `DashboardPage` with loading spinner, then summary
2. 7d / 30d toggle re-fetches and updates all sections
3. No entries with tags yet → `entry_count: 0`, empty sparkline and people list (graceful empty states)
4. Entries with tags → mood dots appear in chronological order; topics show with counts
5. Click a person name → navigates to `/entries` and search results for that person appear
6. Log out → navigating to `/` redirects to `/login`
7. `/login` and `/register` still work without auth