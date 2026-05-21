import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import * as summaryApi from '../api/summary';
import type { PeriodSummary } from '../types/summary';

vi.mock('../api/summary');
vi.mock('../components/NarrativeStack', () => ({
  default: () => <div data-testid="narrative-stack" />,
}));

const mockSummary: PeriodSummary = {
  period_days: 30,
  entry_count: 3,
  mood_timeline: [{ date: '2026-05-01', mood: 'positive' }],
  top_topics: [{ topic: 'work', count: 2 }],
  top_people: [{ name: 'Alice', count: 1 }],
  top_locations: [],
};

function renderPage() {
  render(<MemoryRouter><DashboardPage /></MemoryRouter>);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching', () => {
    vi.mocked(summaryApi.getSummary).mockReturnValue(new Promise(() => {}));
    const { container } = render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(container.querySelector('.spinner')).toBeTruthy();
  });

  it('renders summary content after load', async () => {
    vi.mocked(summaryApi.getSummary).mockResolvedValue(mockSummary);
    renderPage();
    await waitFor(() => expect(screen.getByText('3 entries')).toBeTruthy());
    expect(screen.getByText('work')).toBeTruthy();
    expect(screen.getByText(/Alice/)).toBeTruthy();
  });

  it('shows error message when fetch fails', async () => {
    vi.mocked(summaryApi.getSummary).mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Network error')).toBeTruthy());
  });

  it('calls getSummary with 30 by default', async () => {
    vi.mocked(summaryApi.getSummary).mockResolvedValue(mockSummary);
    renderPage();
    expect(summaryApi.getSummary).toHaveBeenCalledWith(30);
  });

  it('re-fetches with period 7 when 7d is clicked', async () => {
    vi.mocked(summaryApi.getSummary).mockResolvedValue(mockSummary);
    renderPage();
    await waitFor(() => screen.getByText('7d'));
    fireEvent.click(screen.getByText('7d'));
    await waitFor(() => expect(summaryApi.getSummary).toHaveBeenCalledWith(7));
  });

  it('shows loading spinner again while re-fetching after period change', async () => {
    vi.mocked(summaryApi.getSummary)
      .mockResolvedValueOnce(mockSummary)
      .mockReturnValue(new Promise(() => {}));
    const { container } = render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    await waitFor(() => screen.getByText('7d'));
    fireEvent.click(screen.getByText('7d'));
    expect(container.querySelector('.spinner')).toBeTruthy();
  });

  it('renders two narrative stacks', async () => {
    vi.mocked(summaryApi.getSummary).mockResolvedValue(mockSummary);
    renderPage();
    await waitFor(() => screen.getByText('3 entries'));
    expect(screen.getAllByTestId('narrative-stack')).toHaveLength(2);
  });
});
