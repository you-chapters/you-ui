import type { PhaseRecord } from '../../types/phase';
import './PhaseTimeline.css';

const PHASE_COLORS = [
  '#7bc8a4',
  '#7eb8d4',
  '#d4a76a',
  '#c47eb8',
  '#e07b78',
  '#8b9ed4',
];

interface Props {
  phases: PhaseRecord[];
  viewYear: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PhaseTimeline({ phases, viewYear, selectedId, onSelect }: Props) {
  const yearStart = new Date(viewYear, 0, 1).getTime();
  const yearEnd = new Date(viewYear + 1, 0, 1).getTime();
  const yearDuration = yearEnd - yearStart;
  const today = Date.now();

  const bands = phases.flatMap((phase, i) => {
    const phaseStart = new Date(phase.start_date).getTime();
    const phaseEnd = phase.end_date ? new Date(phase.end_date).getTime() : today;
    const bandStart = Math.max(phaseStart, yearStart);
    const bandEnd = Math.min(phaseEnd, yearEnd);
    if (bandStart >= bandEnd) return [];
    return [{
      phase,
      color: PHASE_COLORS[i % PHASE_COLORS.length],
      left: ((bandStart - yearStart) / yearDuration) * 100,
      width: ((bandEnd - bandStart) / yearDuration) * 100,
    }];
  });

  return (
    <div className="phase-timeline">
      {bands.map(({ phase, color, left, width }) => (
        <button
          key={phase.phase_id}
          className={`phase-timeline__band${phase.phase_id === selectedId ? ' phase-timeline__band--selected' : ''}`}
          style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
          onClick={() => onSelect(phase.phase_id)}
          title={`${phase.title} · ${phase.start_date} – ${phase.end_date ?? 'ongoing'}`}
          aria-pressed={phase.phase_id === selectedId}
          aria-label={phase.title}
        />
      ))}
    </div>
  );
}
