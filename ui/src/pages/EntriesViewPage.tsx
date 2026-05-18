import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listEntries, getEntry } from '../api/entries';
import type { Entry } from '../types/entry';
import EntryCard from '../components/EntryCard';
import LoadingSpinner from '../components/LoadingSpinner';
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

  if (loading) return <LoadingSpinner />;
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
      </div>
      <p className="entry-detail__body">{entry.entry}</p>
    </main>
  );
}

export default function EntriesViewPage() {
  const { id } = useParams<{ id?: string }>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listEntries()
      .then(setEntries)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load entries.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!id) load();
  }, [id, load]);

  if (id) return <EntryDetail id={id} />;

  return (
    <main className="entries-view">
      <div className="entries-view__header">
        <h1 className="entries-view__title">Entries</h1>
        {!loading && !error && (
          <span className="entries-view__count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        )}
      </div>

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <div className="entries-view__error">
          <p>{error}</p>
          <button className="entries-view__retry" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="entries-view__empty">
          <p>No entries yet.</p>
          <Link to="/new">Write your first one →</Link>
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