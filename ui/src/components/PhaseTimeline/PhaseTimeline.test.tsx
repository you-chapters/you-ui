import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import PhaseTimeline from '.';
import type { PhaseRecord } from '../../types/phase';

const base: PhaseRecord = {
  phase_id: 'p1',
  title: 'Phase One',
  description: 'desc',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  entry_count: 10,
  dominant_topics: [],
  mean_mood: 0.5,
  top_people: [],
  top_locations: [],
  generated_at: '2024-12-31',
  is_open: false,
};

function render2024(overrides: Partial<PhaseRecord>[] = [base], selectedId: string | null = null, onSelect = vi.fn()) {
  return render(
    <PhaseTimeline phases={overrides.map(o => ({ ...base, ...o }))} viewYear={2024} selectedId={selectedId} onSelect={onSelect} />
  );
}

afterEach(() => vi.useRealTimers());

describe('PhaseTimeline', () => {
  it('renders a band for a phase overlapping the view year', () => {
    const { container } = render2024();
    expect(container.querySelectorAll('.phase-timeline__band')).toHaveLength(1);
  });

  it('does not render a band for a phase outside the view year', () => {
    const { container } = render(
      <PhaseTimeline phases={[base]} viewYear={2025} selectedId={null} onSelect={vi.fn()} />
    );
    expect(container.querySelectorAll('.phase-timeline__band')).toHaveLength(0);
  });

  it('renders multiple bands for multiple overlapping phases', () => {
    const { container } = render2024([
      base,
      { phase_id: 'p2', title: 'Phase Two', start_date: '2024-06-01', end_date: '2024-12-31' },
    ]);
    expect(container.querySelectorAll('.phase-timeline__band')).toHaveLength(2);
  });

  it('applies selected class to the selected band', () => {
    const { container } = render2024([base], 'p1');
    expect(container.querySelector('.phase-timeline__band--selected')).toBeTruthy();
  });

  it('does not apply selected class when a different phase is selected', () => {
    const { container } = render2024([base], 'other');
    expect(container.querySelector('.phase-timeline__band--selected')).toBeNull();
  });

  it('calls onSelect with the phase id when a band is clicked', () => {
    const onSelect = vi.fn();
    render2024([base], null, onSelect);
    fireEvent.click(screen.getByRole('button', { name: 'Phase One' }));
    expect(onSelect).toHaveBeenCalledWith('p1');
  });

  it('renders open phase band using today as end', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-06-15'));
    const { container } = render(
      <PhaseTimeline
        phases={[{ ...base, phase_id: 'p2', end_date: null, is_open: true }]}
        viewYear={2024}
        selectedId={null}
        onSelect={vi.fn()}
      />
    );
    expect(container.querySelectorAll('.phase-timeline__band')).toHaveLength(1);
  });

  it('does not render open phase band in a future year beyond today', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-06-15'));
    const { container } = render(
      <PhaseTimeline
        phases={[{ ...base, phase_id: 'p2', start_date: '2024-01-01', end_date: null, is_open: true }]}
        viewYear={2025}
        selectedId={null}
        onSelect={vi.fn()}
      />
    );
    expect(container.querySelectorAll('.phase-timeline__band')).toHaveLength(0);
  });
});
