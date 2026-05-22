import type { PeriodSummary } from '../types/summary';
import './PeriodStrip.css';

const MOOD_COLOR: Record<string, string> = {
  positive: '#4ade80',
  negative: '#f87171',
  neutral:  '#94a3b8',
  mixed:    '#fb923c',
  anxious:  '#facc15',
  excited:  '#f472b6'
};

const MOOD_EMOJI: Record<string, string> = {
  positive: '😊',
  excited:  '🤩',
  neutral:  '😐',
  mixed:    '😕',
  anxious:  '😰',
  negative: '😔'
};

function dominantMood(timeline: { mood: string }[]): string | null {
  if (timeline.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const { mood } of timeline) counts[mood] = (counts[mood] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

interface Props {
  summary: PeriodSummary;
  period: 7 | 30;
  onPeriodChange: (p: 7 | 30) => void;
}

export default function PeriodStrip({ summary, period, onPeriodChange }: Props) {
  const mood = dominantMood(summary.mood_timeline);

  return (
    <section className="period-strip">
      <div className="period-strip__controls">
        <button
          onClick={() => onPeriodChange(7)}
          className={`period-strip__btn${period === 7 ? ' period-strip__btn--active' : ''}`}
        >
          7d
        </button>
        <button
          onClick={() => onPeriodChange(30)}
          className={`period-strip__btn${period === 30 ? ' period-strip__btn--active' : ''}`}
        >
          30d
        </button>
        {mood && (
          <span className="period-strip__mood" title={mood}>
            {MOOD_EMOJI[mood]}
          </span>
        )}
        <span className="period-strip__count">
          {summary.entry_count} {summary.entry_count === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {summary.mood_timeline.length > 0 && (
        <div className="mood-sparkline" aria-label="Mood timeline">
          {summary.mood_timeline.map(({ date, mood }) => (
            <span
              key={date}
              title={`${date}: ${mood}`}
              style={{ background: MOOD_COLOR[mood] }}
              className="mood-dot"
            />
          ))}
        </div>
      )}

      {summary.top_topics.length > 0 && (
        <div className="topic-tags">
          {summary.top_topics.map(({ topic, count }) => (
            <span key={topic} className="tag">
              {topic} <small>{count}</small>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
