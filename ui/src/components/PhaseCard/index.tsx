import { Link } from 'react-router-dom';
import type { PhaseRecord } from '../../types/phase';
import './PhaseCard.css';

interface Props {
  phase: PhaseRecord;
}

function moodChip(mean_mood: number): { emoji: string; label: string; modifier: string } {
  if (mean_mood >= 0.5) return { emoji: '😊', label: 'positive', modifier: 'positive' };
  if (mean_mood <= -0.5) return { emoji: '😔', label: 'low', modifier: 'low' };
  return { emoji: '😐', label: 'neutral', modifier: 'neutral' };
}

export default function PhaseCard({ phase }: Props) {
  const mood = moodChip(phase.mean_mood);
  const dateRange = phase.end_date
    ? `${phase.start_date} – ${phase.end_date}`
    : `${phase.start_date} – ongoing`;

  return (
    <article className={`phase-card${phase.is_open ? ' phase-card--open' : ''}`}>
      <div className="phase-card__header">
        <h3 className="phase-card__title">{phase.title}</h3>
        {phase.is_open && <span className="phase-card__badge">ongoing</span>}
      </div>

      <p className="phase-card__meta">
        {dateRange} · {phase.entry_count} {phase.entry_count === 1 ? 'entry' : 'entries'}
      </p>

      <p className="phase-card__description">{phase.description}</p>

      <div className="phase-card__chips">
        <span className={`phase-chip phase-chip--mood-${mood.modifier}`} title={`mood: ${mood.label}`}>{mood.emoji}</span>
        {phase.dominant_topics.map(t => (
          <span key={t} className="phase-chip phase-chip--topic">{t}</span>
        ))}
        {phase.top_people.map(p => (
          <span key={p} className="phase-chip phase-chip--person">{p}</span>
        ))}
        {phase.top_locations.map(l => (
          <span key={l} className="phase-chip phase-chip--location">{l}</span>
        ))}
      </div>

      <Link
        to={`/entries?from=${phase.start_date}&to=${phase.end_date ?? new Date().toISOString().slice(0, 10)}`}
        className="phase-card__explore"
      >
        Explore entries →
      </Link>
    </article>
  );
}
