import { useEffect, useState } from 'react';
import { getPhases } from '../api/phases';
import PhaseCard from '../components/PhaseCard';
import PhaseTimeline from '../components/PhaseTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import type { PhaseRecord } from '../types/phase';
import './PhasesPage.css';

export default function PhasesPage() {
  const [phases, setPhases] = useState<PhaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  useEffect(() => { load(false); }, []);

  async function load(refresh: boolean) {
    try {
      const data = await getPhases(refresh);
      setPhases(data);
      setError(null);
      const open = data.find(p => p.is_open);
      setSelectedId(open?.phase_id ?? data[data.length - 1]?.phase_id ?? null);
    } catch {
      setError('Failed to load timeline.');
    } finally {
      setLoading(false);
    }
  }

  function hasYear(year: number) {
    const yearStart = new Date(year, 0, 1).getTime();
    const yearEnd = new Date(year + 1, 0, 1).getTime();
    const today = Date.now();
    return phases.some(p => {
      const start = new Date(p.start_date).getTime();
      const end = p.end_date ? new Date(p.end_date).getTime() : today;
      return start < yearEnd && end > yearStart;
    });
  }

  const selectedPhase = phases.find(p => p.phase_id === selectedId) ?? null;

  return (
    <div className="phases-page">
      <div className="phases-page__header">
        <h1 className="phases-page__title">Timeline</h1>
        <button
          className="phases-page__refresh"
          disabled
          title="Refresh timeline"
          aria-label="Refresh timeline"
        >↻</button>
      </div>

      {loading ? <LoadingSpinner centered />
        : error ? <p className="phases-page__error">{error}</p>
        : phases.length === 0 ? (
          <div className="phases-page__empty">
            <p>Your timeline will appear once you have at least 3 weeks of journal entries.</p>
            <p className="phases-page__empty-hint">Keep writing — chapters reveal themselves over time.</p>
          </div>
        ) : (
          <>
            <div className="phases-page__timeline-row">
              <button
                className="phases-page__nav"
                onClick={() => setViewYear(y => y - 1)}
                disabled={!hasYear(viewYear - 1)}
                aria-label="Previous year"
              >‹</button>
              <div className="phases-page__timeline-wrap">
                <p className="phases-page__year">{viewYear}</p>
                <PhaseTimeline
                  phases={phases}
                  viewYear={viewYear}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
              <button
                className="phases-page__nav"
                onClick={() => setViewYear(y => y + 1)}
                disabled={!hasYear(viewYear + 1)}
                aria-label="Next year"
              >›</button>
            </div>

            {selectedPhase && <PhaseCard phase={selectedPhase} />}
          </>
        )}
    </div>
  );
}
