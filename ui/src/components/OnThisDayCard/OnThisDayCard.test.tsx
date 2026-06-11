import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OnThisDayCard from '.';
import * as entriesApi from '../../api/entries';
import type { Entry } from '../../types/entry';

vi.mock('../../api/entries');

const makeEntry = (overrides: Partial<Entry>): Entry => ({
  entry_id: 'e1',
  user_id: 'u1',
  entry: 'A journal entry.',
  timestamp: '2021-06-11T10:00:00Z',
  location: '',
  tags: null,
  ...overrides,
});

function renderCard() {
  return render(
    <MemoryRouter>
      <OnThisDayCard />
    </MemoryRouter>,
  );
}

describe('OnThisDayCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while loading', () => {
    vi.mocked(entriesApi.getOnThisDay).mockReturnValue(new Promise(() => {}));
    const { container } = renderCard();
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when API returns empty', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([]);
    const { container } = renderCard();
    await waitFor(() => expect(entriesApi.getOnThisDay).toHaveBeenCalled());
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when API rejects', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockRejectedValue(new Error('fail'));
    const { container } = renderCard();
    await waitFor(() => expect(entriesApi.getOnThisDay).toHaveBeenCalled());
    expect(container.firstChild).toBeNull();
  });

  it('shows title and year for a single entry', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ timestamp: '2019-06-11T10:00:00Z' }),
    ]);
    renderCard();
    await waitFor(() => expect(screen.getByText('On this day')).toBeInTheDocument());
    expect(screen.getByText('2019')).toBeInTheDocument();
  });

  it('shows truncated preview when entry exceeds 200 chars', async () => {
    const long = 'x'.repeat(210);
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([makeEntry({ entry: long })]);
    renderCard();
    await waitFor(() => screen.getByText(/x{200}…/));
  });

  it('shows full text when entry is within 200 chars', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ entry: 'Short entry.' }),
    ]);
    renderCard();
    await waitFor(() => expect(screen.getByText('Short entry.')).toBeInTheDocument());
  });

  it('shows location when present', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ location: 'Kyiv, Ukraine' }),
    ]);
    renderCard();
    await waitFor(() => expect(screen.getByText('Kyiv, Ukraine')).toBeInTheDocument());
  });

  it('omits location when empty', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ location: '' }),
    ]);
    renderCard();
    await waitFor(() => screen.getByText('On this day'));
    expect(screen.queryByRole('generic', { name: /location/i })).toBeNull();
  });

  it('renders a link to the entry', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ entry_id: 'abc123' }),
    ]);
    renderCard();
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /view/i });
      expect(link).toHaveAttribute('href', '/entries/abc123');
    });
  });

  it('hides nav buttons for a single entry', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([makeEntry({})]);
    renderCard();
    await waitFor(() => screen.getByText('On this day'));
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
  });

  it('shows nav buttons for multiple entries', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ entry_id: 'e1' }),
      makeEntry({ entry_id: 'e2' }),
    ]);
    renderCard();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('Previous is disabled on first entry', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ entry_id: 'e1' }),
      makeEntry({ entry_id: 'e2' }),
    ]);
    renderCard();
    await waitFor(() => screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('navigates to next entry and updates year', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ entry_id: 'e1', entry: 'First.', timestamp: '2020-06-11T00:00:00Z' }),
      makeEntry({ entry_id: 'e2', entry: 'Second.', timestamp: '2018-06-11T00:00:00Z' }),
    ]);
    renderCard();
    await waitFor(() => screen.getByText('First.'));
    expect(screen.getByText('2020')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await act(() => new Promise(resolve => setTimeout(resolve, 150)));

    await waitFor(() => expect(screen.getByText('Second.')).toBeInTheDocument());
    expect(screen.getByText('2018')).toBeInTheDocument();
  });

  it('Next is disabled on last entry after navigating', async () => {
    vi.mocked(entriesApi.getOnThisDay).mockResolvedValue([
      makeEntry({ entry_id: 'e1', entry: 'First.' }),
      makeEntry({ entry_id: 'e2', entry: 'Second.' }),
    ]);
    renderCard();
    await waitFor(() => screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await act(() => new Promise(resolve => setTimeout(resolve, 150)));

    await waitFor(() => screen.getByText('Second.'));
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();
  });
});
