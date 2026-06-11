import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NarrativeCard from '.';
import type { NarrativeSummary } from '../../types/narrative';

const stub: NarrativeSummary = {
  period_type: 'week',
  period_key: '2026-W21',
  entry_count: 3,
  text: 'It was a thoughtful week.',
  generated_at: '2026-05-20T10:00:00Z',
  is_cached: false,
};

describe('NarrativeCard', () => {
  it('renders narrative text and meta', () => {
    render(<NarrativeCard title="This week" narrative={stub} loading={false} refreshing={false} onRefresh={() => {}} />);
    expect(screen.getByText('It was a thoughtful week.')).toBeInTheDocument();
    expect(screen.getByText(/3 entries/)).toBeInTheDocument();
    expect(screen.getByText('This week')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<NarrativeCard title="Last month" narrative={stub} loading={false} refreshing={false} onRefresh={() => {}} />);
    expect(screen.getByText('Last month')).toBeInTheDocument();
  });

  it('renders "entry" singular when count is 1', () => {
    const single = { ...stub, entry_count: 1 };
    render(<NarrativeCard title="This week" narrative={single} loading={false} refreshing={false} onRefresh={() => {}} />);
    expect(screen.getByText(/1 entry/)).toBeInTheDocument();
  });

  it('shows skeleton and hides content when loading', () => {
    const { container } = render(
      <NarrativeCard title="This week" narrative={null} loading={true} refreshing={false} onRefresh={() => {}} />,
    );
    expect(container.querySelector('.narrative-skeleton')).toBeTruthy();
    expect(screen.queryByText('It was a thoughtful week.')).not.toBeInTheDocument();
  });

  it('renders card wrapper even when not loading and no narrative', () => {
    const { container } = render(
      <NarrativeCard title="This week" narrative={null} loading={false} refreshing={false} onRefresh={() => {}} />,
    );
    expect(container.querySelector('.narrative-card')).toBeTruthy();
  });

  it('hides refresh button when showRefresh is false', () => {
    render(<NarrativeCard title="Last week" narrative={stub} loading={false} refreshing={false} onRefresh={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });

  it('shows refresh icon button when showRefresh is true', () => {
    render(<NarrativeCard title="This week" narrative={stub} loading={false} refreshing={false} showRefresh onRefresh={() => {}} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('disables refresh button while refreshing', () => {
    render(<NarrativeCard title="This week" narrative={stub} loading={false} refreshing={true} showRefresh onRefresh={() => {}} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('calls onRefresh when refresh button clicked', () => {
    const onRefresh = vi.fn();
    render(<NarrativeCard title="This week" narrative={stub} loading={false} refreshing={false} showRefresh onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('renders back arrow when onBack provided', () => {
    const onBack = vi.fn();
    render(<NarrativeCard title="Last week" narrative={stub} loading={false} refreshing={false} onRefresh={() => {}} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders forward arrow when onForward provided', () => {
    const onForward = vi.fn();
    render(<NarrativeCard title="This week" narrative={stub} loading={false} refreshing={false} onRefresh={() => {}} onForward={onForward} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onForward).toHaveBeenCalledOnce();
  });
});
