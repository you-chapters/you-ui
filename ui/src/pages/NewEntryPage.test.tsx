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

  it('submit button is always disabled', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Save Entry' })).toBeDisabled();
  });

  it('does not call createEntry when form is submitted', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Your entry'), 'test entry');
    await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
    expect(entriesApi.createEntry).not.toHaveBeenCalled();
  });
});