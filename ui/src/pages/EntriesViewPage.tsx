import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { listEntries, getEntry, searchEntries } from '../api/entries';
import type { Entry } from '../types/entry';
import EntryCard from '../components/EntryCard';
import Skeleton from '../components/Skeleton';
import WeekPicker, { type Week, toISODate, currentWeek } from '../components/WeekPicker';
import './EntriesViewPage.css';

function formatDate(raw?: string) {
  if (!raw) return null;
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(raw));
  } catch {
    return null;
  }
}

function EntryDetail({ id }: { id: string }) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getEntry(id)
      .then(setEntry)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load entry.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="entry-detail">
      <div className="entry-detail__skeleton-meta">
        <Skeleton className="entry-detail__skeleton-date" />
      </div>
      <Skeleton className="entry-detail__skeleton-body-line" />
      <Skeleton className="entry-detail__skeleton-body-line" />
      <Skeleton className="entry-detail__skeleton-body-line entry-detail__skeleton-body-line--short" />
    </main>
  );
  if (error) return (
    <div className="entry-detail">
      <Link to="/entries" className="entry-detail__back">← Back</Link>
      <p style={{ color: 'var(--color-error)' }}>{error}</p>
    </div>
  );
  if (!entry) return null;

  return (
    <main className="entry-detail">
      <Link to="/entries" className="entry-detail__back">← All Entries</Link>
      <div className="entry-detail__meta">
        {formatDate(entry.timestamp) && (
          <p className="entry-detail__date">{formatDate(entry.timestamp)}</p>
        )}
        {entry.location && <p className="entry-detail__location">{entry.location}</p>}
      </div>
      <p className="entry-detail__body">{entry.entry}</p>
    </main>
  );
}

export default function EntriesViewPage() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const initialQuery = (location.state as { searchQuery?: string } | null)?.searchQuery ?? '';

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedWeek, setSelectedWeek] = useState<Week>(currentWeek);

  const load = useCallback((query: string, week: Week) => {
    setLoading(true);
    setError(null);
    const req = query.trim()
      ? searchEntries(query.trim())
      : listEntries(toISODate(week.from), toISODate(week.to));
    req
      .then(setEntries)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load entries.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!id) load(searchQuery, selectedWeek);
  }, [id, searchQuery, selectedWeek, load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(inputValue);
  }

  function handleClear() {
    setInputValue('');
    setSearchQuery('');
  }

  function handleWeekSelect(week: Week) {
    setSelectedWeek(week);
    setInputValue('');
    setSearchQuery('');
  }

  if (id) return <EntryDetail id={id} />;

  return (
    <main className="entries-view">
      <div className="entries-view__header">
        <h1 className="entries-view__title">Entries</h1>
        {!loading && !error && (
          <span className="entries-view__count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        )}
      </div>

      <WeekPicker selected={selectedWeek} onChange={handleWeekSelect} />

      <form className="entries-view__search" onSubmit={e => e.preventDefault()}>
        <input
          type="search"
          className="entries-view__search-input"
          placeholder="Search entries…"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        {inputValue && (
          <button type="button" className="entries-view__search-clear" onClick={handleClear} aria-label="Clear search">
            ×
          </button>
        )}
        <button type="submit" className="entries-view__search-btn" disabled>Search</button>
      </form>

      {loading && (
        <div className="entries-view__list">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="entries-view__skeleton-card">
              <Skeleton className="entries-view__skeleton-date" />
              <Skeleton className="entries-view__skeleton-line" />
              <Skeleton className="entries-view__skeleton-line entries-view__skeleton-line--short" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="entries-view__error">
          <p>{error}</p>
          <button className="entries-view__retry" onClick={() => load(searchQuery, selectedWeek)}>Retry</button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="entries-view__empty">
          {searchQuery ? (
            <p>No results for "{searchQuery}".</p>
          ) : (
            <p>No entries this week.</p>
          )}
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="entries-view__list">
          {entries.map(e => <EntryCard key={e.entry_id} entry={e} />)}
        </div>
      )}
    </main>
  );
}
