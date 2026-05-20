import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EntriesViewPage from './EntriesViewPage';
import * as entriesApi from '../api/entries';
import type { Entry } from '../types/entry';

vi.mock('../api/entries');

const mockEntries: Entry[] = [
  { entry_id: '1', user_id: 'test-uuid', entry: 'First entry', timestamp: '2024-01-01T12:00:00Z' },
  { entry_id: '2', user_id: 'test-uuid', entry: 'Second entry' },
];

function renderListView() {
  render(
    <MemoryRouter initialEntries={['/entries']}>
      <Routes>
        <Route path="/entries" element={<EntriesViewPage />} />
        <Route path="/entries/:id" element={<EntriesViewPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderDetailView(id: string) {
  render(
    <MemoryRouter initialEntries={[`/entries/${id}`]}>
      <Routes>
        <Route path="/entries/:id" element={<EntriesViewPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EntriesViewPage - list mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading spinner while fetching', () => {
    vi.mocked(entriesApi.listEntries).mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <MemoryRouter initialEntries={['/entries']}>
        <Routes><Route path="/entries" element={<EntriesViewPage />} /></Routes>
      </MemoryRouter>
    );
    expect(container.querySelector('.spinner')).toBeTruthy();
  });

  it('calls listEntries on load', async () => {
    vi.mocked(entriesApi.listEntries).mockResolvedValue(mockEntries);
    renderListView();
    await waitFor(() => expect(entriesApi.listEntries).toHaveBeenCalledWith());
  });

  it('renders entry cards after loading', async () => {
    vi.mocked(entriesApi.listEntries).mockResolvedValue(mockEntries);
    renderListView();
    await waitFor(() => expect(screen.getByText('First entry')).toBeTruthy());
    expect(screen.getByText('Second entry')).toBeTruthy();
  });

  it('shows correct plural entry count', async () => {
    vi.mocked(entriesApi.listEntries).mockResolvedValue(mockEntries);
    renderListView();
    await waitFor(() => expect(screen.getByText('2 entries')).toBeTruthy());
  });

  it('shows singular entry count for one entry', async () => {
    vi.mocked(entriesApi.listEntries).mockResolvedValue([mockEntries[0]]);
    renderListView();
    await waitFor(() => expect(screen.getByText('1 entry')).toBeTruthy());
  });

  it('shows empty state when there are no entries', async () => {
    vi.mocked(entriesApi.listEntries).mockResolvedValue([]);
    renderListView();
    await waitFor(() => expect(screen.getByText('No entries yet.')).toBeTruthy());
  });

  it('shows error message and retry button on fetch failure', async () => {
    vi.mocked(entriesApi.listEntries).mockRejectedValue(new Error('Network error'));
    renderListView();
    await waitFor(() => expect(screen.getByText('Network error')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('retries fetching when Retry button is clicked', async () => {
    vi.mocked(entriesApi.listEntries)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue(mockEntries);
    renderListView();
    await waitFor(() => screen.getByRole('button', { name: 'Retry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('First entry')).toBeTruthy());
  });
});

describe('EntriesViewPage - detail mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the full entry body', async () => {
    vi.mocked(entriesApi.getEntry).mockResolvedValue(mockEntries[0]);
    renderDetailView('1');
    await waitFor(() => expect(screen.getByText('First entry')).toBeTruthy());
  });

  it('shows back link to all entries', async () => {
    vi.mocked(entriesApi.getEntry).mockResolvedValue(mockEntries[0]);
    renderDetailView('1');
    await waitFor(() => expect(screen.getByText('← All Entries')).toBeTruthy());
  });

  it('shows error message when entry fetch fails', async () => {
    vi.mocked(entriesApi.getEntry).mockRejectedValue(new Error('Not found'));
    renderDetailView('x');
    await waitFor(() => expect(screen.getByText('Not found')).toBeTruthy());
  });

  it('shows location when present', async () => {
    vi.mocked(entriesApi.getEntry).mockResolvedValue({ ...mockEntries[0], location: 'Tokyo' });
    const { container } = render(
      <MemoryRouter initialEntries={['/entries/1']}>
        <Routes><Route path="/entries/:id" element={<EntriesViewPage />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(container.querySelector('.entry-detail__location')?.textContent).toBe('Tokyo'));
  });

  it('omits location element when absent', async () => {
    vi.mocked(entriesApi.getEntry).mockResolvedValue(mockEntries[0]);
    const { container } = render(
      <MemoryRouter initialEntries={['/entries/1']}>
        <Routes><Route path="/entries/:id" element={<EntriesViewPage />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('First entry'));
    expect(container.querySelector('.entry-detail__location')).toBeNull();
  });
});