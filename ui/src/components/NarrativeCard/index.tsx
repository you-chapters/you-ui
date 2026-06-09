import type { NarrativeSummary } from '../../types/narrative';
import LoadingSpinner from '../LoadingSpinner';
import './NarrativeCard.css';

interface Props {
  title: string;
  narrative: NarrativeSummary | null;
  loading: boolean;
  refreshing: boolean;
  showRefresh?: boolean;
  onRefresh: () => void;
  onBack?: () => void;
  onForward?: () => void;
}

export default function NarrativeCard({
  title,
  narrative,
  loading,
  refreshing,
  showRefresh = false,
  onRefresh,
  onBack,
  onForward,
}: Props) {
  return (
    <section className="narrative-card">
      <div className="narrative-header">
        <h2>{title}</h2>
        <div className="narrative-actions">
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="narrative-refresh-icon"
              title="Refresh"
              aria-label="Refresh"
            >
              ↻
            </button>
          )}
          {onBack && (
            <button onClick={onBack} className="narrative-nav" aria-label="Previous">
              ‹
            </button>
          )}
          {onForward && (
            <button onClick={onForward} className="narrative-nav" aria-label="Next">
              ›
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <LoadingSpinner centered={false} />
      ) : narrative ? (
        <>
          <p className="narrative-text">{narrative.text}</p>
          <small className="narrative-meta">
            Generated {new Date(narrative.generated_at).toLocaleDateString()} ·{' '}
            {narrative.entry_count} {narrative.entry_count === 1 ? 'entry' : 'entries'}
          </small>
        </>
      ) : null}
    </section>
  );
}
