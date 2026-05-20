import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewEntryPage from './NewEntryPage';
import * as entriesApi from '../api/entries';

vi.mock('../api/entries');
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { userId: 'test-uuid', displayName: 'Alice' } }),
}));

describe('NewEntryPage', () => {
  beforeEach(() => vi.clearAllMocks());

  function renderPage() {
    render(<MemoryRouter><NewEntryPage /></MemoryRouter>);
  }

  it('renders the entry form', () => {
    renderPage();
    const textarea = screen.getByLabelText('Your entry');
    expect(textarea).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save Entry' })).toBeTruthy();
    expect(document.activeElement).toBe(textarea);
  });

  it('shows validation error when submitting empty entry', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    expect(screen.getByText('Entry cannot be empty.')).toBeTruthy();
  });

  it('shows validation error for whitespace-only entry', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Your entry'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    expect(screen.getByText('Entry cannot be empty.')).toBeTruthy();
  });

  it('calls createEntry with trimmed text and no location when blank', async () => {
    vi.mocked(entriesApi.createEntry).mockResolvedValue({
      entry_id: '1', user_id: 'test-uuid', entry: 'test entry',
    });
    renderPage();
    await userEvent.type(screen.getByLabelText('Your entry'), 'test entry');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    await waitFor(() => expect(screen.getByText(/Entry saved/)).toBeTruthy());
    expect(entriesApi.createEntry).toHaveBeenCalledWith({ entry: 'test entry', location: undefined });
  });

  it('submits location when provided', async () => {
    vi.mocked(entriesApi.createEntry).mockResolvedValue({
      entry_id: '1', user_id: 'test-uuid', entry: 'test entry', location: 'Berlin',
    });
    renderPage();
    await userEvent.type(screen.getByLabelText('Location'), 'Berlin');
    await userEvent.type(screen.getByLabelText('Your entry'), 'test entry');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    await waitFor(() => expect(screen.getByText(/Entry saved/)).toBeTruthy());
    expect(entriesApi.createEntry).toHaveBeenCalledWith({ entry: 'test entry', location: 'Berlin' });
  });

  it('clears the location input after successful submit', async () => {
    vi.mocked(entriesApi.createEntry).mockResolvedValue({
      entry_id: '1', user_id: 'test-uuid', entry: 'test', location: 'Paris',
    });
    renderPage();
    const locationInput = screen.getByLabelText('Location') as HTMLInputElement;
    await userEvent.type(locationInput, 'Paris');
    await userEvent.type(screen.getByLabelText('Your entry'), 'test');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    await waitFor(() => expect(locationInput.value).toBe(''));
  });

  it('clears the textarea after successful submit', async () => {
    vi.mocked(entriesApi.createEntry).mockResolvedValue({
      entry_id: '1', user_id: 'test-uuid', entry: 'test',
    });
    renderPage();
    const textarea = screen.getByLabelText('Your entry') as HTMLTextAreaElement;
    await userEvent.type(textarea, 'some text');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    await waitFor(() => expect(textarea.value).toBe(''));
  });

  it('shows API error message on submit failure', async () => {
    vi.mocked(entriesApi.createEntry).mockRejectedValue(new Error('Server error'));
    renderPage();
    await userEvent.type(screen.getByLabelText('Your entry'), 'test');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    await waitFor(() => expect(screen.getByText('Server error')).toBeTruthy());
  });

  it('disables the submit button while submitting', async () => {
    vi.mocked(entriesApi.createEntry).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 5000))
    );
    renderPage();
    await userEvent.type(screen.getByLabelText('Your entry'), 'test');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
  });
});