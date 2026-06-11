import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PeriodStrip from '.';
import type { PeriodSummary } from '../../types/summary';

const baseSummary: PeriodSummary = {
  period_days: 30,
  entry_count: 5,
  mood_timeline: [
    { date: '2026-05-01', mood: 'positive' },
    { date: '2026-05-02', mood: 'negative' },
  ],
  top_topics: [
    { topic: 'work', count: 3 },
    { topic: 'health', count: 2 },
  ],
  top_people: [],
  top_locations: [],
};

describe('PeriodStrip', () => {
  it('renders skeleton dots and tags when summary is null', () => {
    const { container } = render(<PeriodStrip summary={null} period={7} onPeriodChange={vi.fn()} />);
    expect(container.querySelector('.period-strip__skeleton-dots')).toBeTruthy();
    expect(container.querySelector('.period-strip__skeleton-tags')).toBeTruthy();
    expect(container.querySelector('.period-strip__skeleton-dot')).toBeTruthy();
  });

  it('renders plural entry count', () => {
    render(<PeriodStrip summary={baseSummary} period={30} onPeriodChange={vi.fn()} />);
    expect(screen.getByText('5 entries')).toBeTruthy();
  });

  it('renders singular entry count', () => {
    render(<PeriodStrip summary={{ ...baseSummary, entry_count: 1 }} period={30} onPeriodChange={vi.fn()} />);
    expect(screen.getByText('1 entry')).toBeTruthy();
  });

  it('renders one mood dot per timeline entry', () => {
    const { container } = render(<PeriodStrip summary={baseSummary} period={30} onPeriodChange={vi.fn()} />);
    expect(container.querySelectorAll('.mood-dot')).toHaveLength(2);
  });

  it('renders topic tags', () => {
    render(<PeriodStrip summary={baseSummary} period={30} onPeriodChange={vi.fn()} />);
    expect(screen.getByText('work')).toBeTruthy();
    expect(screen.getByText('health')).toBeTruthy();
  });

  it('marks the active period button', () => {
    const { container } = render(<PeriodStrip summary={baseSummary} period={7} onPeriodChange={vi.fn()} />);
    expect(container.querySelector('.period-strip__btn--active')?.textContent?.trim()).toBe('7d');
  });

  it('calls onPeriodChange(7) when 7d is clicked', () => {
    const onChange = vi.fn();
    render(<PeriodStrip summary={baseSummary} period={30} onPeriodChange={onChange} />);
    fireEvent.click(screen.getByText('7d'));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('calls onPeriodChange(30) when 30d is clicked', () => {
    const onChange = vi.fn();
    render(<PeriodStrip summary={baseSummary} period={7} onPeriodChange={onChange} />);
    fireEvent.click(screen.getByText('30d'));
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('hides sparkline when mood_timeline is empty', () => {
    const { container } = render(
      <PeriodStrip summary={{ ...baseSummary, mood_timeline: [] }} period={30} onPeriodChange={vi.fn()} />
    );
    expect(container.querySelector('.mood-sparkline')).toBeNull();
  });

  it('hides topic tags when top_topics is empty', () => {
    const { container } = render(
      <PeriodStrip summary={{ ...baseSummary, top_topics: [] }} period={30} onPeriodChange={vi.fn()} />
    );
    expect(container.querySelector('.topic-tags')).toBeNull();
  });
});
