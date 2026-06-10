import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PhasesPage from './PhasesPage';
import * as phasesApi from '../api/phases';
import type { PhaseRecord } from '../types/phase';

vi.mock('../api/phases');

const phase2023: PhaseRecord = {
  phase_id: 'p1',
  title: 'Early Days',
  description: 'Just starting out.',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  entry_count: 20,
  dominant_topics: [],
  mean_mood: 0.6,
  top_people: [],
  top_locations: [],
  generated_at: '2023-12-31',
  is_open: false,
};

const openPhase2024: PhaseRecord = {
  phase_id: 'p2',
  title: 'Momentum',
  description: 'Still going.',
  start_date: '2024-01-01',
  end_date: null,
  entry_count: 50,
  dominant_topics: [],
  mean_mood: 0.8,
  top_people: [],
  top_locations: [],
  generated_at: '2024-06-01',
  is_open: true,
};

function renderPage() {
  render(<MemoryRouter><PhasesPage /></MemoryRouter>);
}

describe('PhasesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => vi.useRealTimers());

  it('shows loading spinner while fetching', () => {
    vi.mocked(phasesApi.getPhases).mockReturnValue(new Promise(() => {}));
    const { container } = render(<MemoryRouter><PhasesPage /></MemoryRouter>);
    expect(container.querySelector('.spinner')).toBeTruthy();
  });

  it('shows empty state when no phases returned', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/timeline will appear/i)).toBeTruthy());
  });

  it('shows error message when fetch fails', async () => {
    vi.mocked(phasesApi.getPhases).mockRejectedValue(new Error());
    renderPage();
    await waitFor(() => expect(screen.getByText('Failed to load timeline.')).toBeTruthy());
  });

  it('auto-selects the open phase card on load', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([phase2023, openPhase2024]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Still going.')).toBeTruthy());
  });

  it('renders a band button for the open phase', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([openPhase2024]);
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Momentum' })).toBeTruthy());
  });

  it('disables next-year arrow when no phases exist beyond today', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([openPhase2024]);
    renderPage();
    await waitFor(() => screen.getByText('Momentum'));
    expect(screen.getByLabelText('Next year')).toBeDisabled();
  });

  it('disables previous-year arrow when no phases exist in the prior year', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([openPhase2024]);
    renderPage();
    await waitFor(() => screen.getByText('Momentum'));
    expect(screen.getByLabelText('Previous year')).toBeDisabled();
  });

  it('enables previous-year arrow when a phase exists in the prior year', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([phase2023, openPhase2024]);
    renderPage();
    await waitFor(() => screen.getByText('Momentum'));
    expect(screen.getByLabelText('Previous year')).not.toBeDisabled();
  });

  it('navigating to a prior year shows that year label', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([phase2023, openPhase2024]);
    renderPage();
    await waitFor(() => screen.getByText('Momentum'));
    fireEvent.click(screen.getByLabelText('Previous year'));
    expect(screen.getByText('2023')).toBeTruthy();
  });

  it('clicking a band updates the displayed phase card', async () => {
    vi.mocked(phasesApi.getPhases).mockResolvedValue([phase2023, openPhase2024]);
    renderPage();
    await waitFor(() => screen.getByText('Momentum'));
    fireEvent.click(screen.getByLabelText('Previous year'));
    fireEvent.click(screen.getByRole('button', { name: 'Early Days' }));
    expect(screen.getByText('Just starting out.')).toBeTruthy();
  });
});
