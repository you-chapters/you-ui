import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NarrativeStack from './NarrativeStack';
import * as narrativeApi from '../api/narrative';
import type { NarrativeSummary } from '../types/narrative';

vi.mock('../api/narrative');

const currentNarrative: NarrativeSummary = {
  period_type: 'week',
  period_key: '2026-W21',
  entry_count: 5,
  text: 'Current week text.',
  generated_at: '2026-05-21T10:00:00Z',
  is_cached: false,
};

const previousNarrative: NarrativeSummary = {
  period_type: 'week',
  period_key: '2026-W20',
  entry_count: 3,
  text: 'Previous week text.',
  generated_at: '2026-05-14T10:00:00Z',
  is_cached: true,
};

function renderStack() {
  return render(
    <NarrativeStack type="week" currentKey="2026-W21" previousKey="2026-W20" />,
  );
}

async function navigateTo(direction: 'Next' | 'Previous') {
  fireEvent.click(screen.getByRole('button', { name: direction }));
  await act(() => new Promise(resolve => setTimeout(resolve, 150)));
}

describe('NarrativeStack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and shows current week narrative', async () => {
    vi.mocked(narrativeApi.getNarrative).mockResolvedValue(currentNarrative);
    renderStack();
    await waitFor(() => expect(screen.getByText('Current week text.')).toBeInTheDocument());
    expect(screen.getByText('This week')).toBeInTheDocument();
  });

  it('shows forward arrow on current card', async () => {
    vi.mocked(narrativeApi.getNarrative).mockResolvedValue(currentNarrative);
    renderStack();
    await waitFor(() => screen.getByText('This week'));
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
  });

  it('shows refresh button on current card', async () => {
    vi.mocked(narrativeApi.getNarrative).mockResolvedValue(currentNarrative);
    renderStack();
    await waitFor(() => screen.getByText('This week'));
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('does not load previous until navigated', async () => {
    vi.mocked(narrativeApi.getNarrative).mockResolvedValue(currentNarrative);
    renderStack();
    await waitFor(() => screen.getByText('Current week text.'));
    expect(narrativeApi.getNarrative).toHaveBeenCalledTimes(1);
    expect(narrativeApi.getNarrative).toHaveBeenCalledWith('week', '2026-W21');
  });

  it('loads previous when navigating to back card', async () => {
    vi.mocked(narrativeApi.getNarrative)
      .mockResolvedValueOnce(currentNarrative)
      .mockResolvedValue(previousNarrative);
    renderStack();
    await waitFor(() => screen.getByRole('button', { name: 'Next' }));
    await navigateTo('Next');
    await waitFor(() => expect(screen.getByText('Previous week text.')).toBeInTheDocument());
    expect(narrativeApi.getNarrative).toHaveBeenCalledWith('week', '2026-W20');
  });

  it('shows back arrow on previous card and no refresh or forward', async () => {
    vi.mocked(narrativeApi.getNarrative)
      .mockResolvedValueOnce(currentNarrative)
      .mockResolvedValue(previousNarrative);
    renderStack();
    await waitFor(() => screen.getByRole('button', { name: 'Next' }));
    await navigateTo('Next');
    await waitFor(() => screen.getByText('Last week'));
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('does not reload previous on second navigation', async () => {
    vi.mocked(narrativeApi.getNarrative)
      .mockResolvedValueOnce(currentNarrative)
      .mockResolvedValue(previousNarrative);
    renderStack();
    await waitFor(() => screen.getByRole('button', { name: 'Next' }));
    await navigateTo('Next');
    await waitFor(() => screen.getByRole('button', { name: 'Previous' }));
    await navigateTo('Previous');
    await waitFor(() => screen.getByRole('button', { name: 'Next' }));
    await navigateTo('Next');
    expect(narrativeApi.getNarrative).toHaveBeenCalledTimes(2);
  });

  it('renders peek strip when on current card', async () => {
    vi.mocked(narrativeApi.getNarrative).mockResolvedValue(currentNarrative);
    const { container } = renderStack();
    await waitFor(() => screen.getByText('This week'));
    expect(container.querySelector('.narrative-stack__peek')).toBeTruthy();
  });

  it('hides peek strip when on previous card', async () => {
    vi.mocked(narrativeApi.getNarrative)
      .mockResolvedValueOnce(currentNarrative)
      .mockResolvedValue(previousNarrative);
    const { container } = renderStack();
    await waitFor(() => screen.getByRole('button', { name: 'Next' }));
    await navigateTo('Next');
    await waitFor(() => screen.getByText('Last week'));
    expect(container.querySelector('.narrative-stack__peek')).toBeNull();
  });

  it('calls refresh with refresh=true', async () => {
    vi.mocked(narrativeApi.getNarrative).mockResolvedValue(currentNarrative);
    renderStack();
    await waitFor(() => screen.getByRole('button', { name: 'Refresh' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(narrativeApi.getNarrative).toHaveBeenCalledWith('week', '2026-W21', true);
  });
});