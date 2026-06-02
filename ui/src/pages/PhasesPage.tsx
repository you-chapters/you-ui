import { useEffect, useState } from 'react';
import { getPhases } from '../api/phases';
import PhaseCard from '../components/PhaseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { PhaseRecord } from '../types/phase';
import './PhasesPage.css';

export default function PhasesPage() {
  const [phases, setPhases] = useState<PhaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load(false);
  }, []);

  async function load(refresh: boolean) {
    try {
      if (refresh) setRefreshing(true);
      const data = await getPhases(refresh);
      setPhases(data);
      setError(null);
    } catch {
      setError('Failed to load timeline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const openPhase = phases.find(p => p.is_open);

  return (
    <div className="phases-page">
      <div className="phases-page__header">
        <h1 className="phases-page__title">Timeline</h1>
        <button
          className="phases-page__refresh"
          onClick={() => load(true)}
          disabled={refreshing}
          title="Refresh timeline"
          aria-label="Refresh timeline"
        >
          ↻
        </button>
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : error ? (
        <p className="phases-page__error">{error}</p>
      ) : phases.length === 0 ? (
        <div className="phases-page__empty">
          <p>Your timeline will appear once you have at least 3 weeks of journal entries.</p>
          <p className="phases-page__empty-hint">Keep writing — chapters reveal themselves over time.</p>
        </div>
      ) : (
        <ol className="phases-timeline">
          {phases.map(phase => (
            <li key={phase.phase_id} className="phases-timeline__item">
              <div className="phases-timeline__connector" />
              <PhaseCard phase={phase} />
            </li>
          ))}
        </ol>
      )}

      {openPhase && (
        <p className="phases-page__current-hint">
          Current chapter started {openPhase.start_date}.
        </p>
      )}
    </div>
  );
}
