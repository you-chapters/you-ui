import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AskPage from './AskPage';
import * as qaApi from '../api/qa';

vi.mock('../api/qa');

describe('AskPage', () => {
  beforeEach(() => vi.clearAllMocks());

  function renderPage() {
    render(<MemoryRouter><AskPage /></MemoryRouter>);
  }

  it('renders the question form', () => {
    renderPage();
    expect(screen.getByLabelText('Your question')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeTruthy();
  });

  it('disables submit button when question is empty', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeDisabled();
  });

  it('enables submit button when question has non-whitespace text', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When did I last travel?');
    expect(screen.getByRole('button', { name: 'Ask' })).not.toBeDisabled();
  });

  it('does not submit when question is whitespace only', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), '   ');
    expect(screen.getByRole('button', { name: 'Ask' })).toBeDisabled();
    expect(qaApi.askQuestion).not.toHaveBeenCalled();
  });

  it('calls askQuestion with trimmed question on submit', async () => {
    vi.mocked(qaApi.askQuestion).mockResolvedValue({ answer: 'Last March.', sources: [] });
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When did I travel?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(qaApi.askQuestion).toHaveBeenCalledWith('When did I travel?'));
  });

  it('renders the answer after a successful response', async () => {
    vi.mocked(qaApi.askQuestion).mockResolvedValue({ answer: 'Last March.', sources: [] });
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('Last March.')).toBeTruthy());
  });

  it('renders source entries with links when sources are returned', async () => {
    const entry = { entry_id: 'e1', user_id: 'u1', entry: 'Went to Paris' };
    vi.mocked(qaApi.askQuestion).mockResolvedValue({ answer: 'You went to Paris.', sources: [entry] });
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'Where did I go?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('Went to Paris')).toBeTruthy());
    expect(screen.getByRole('link', { name: /Went to Paris/ }).getAttribute('href')).toBe('/entry/e1');
  });

  it('does not render sources section when sources array is empty', async () => {
    vi.mocked(qaApi.askQuestion).mockResolvedValue({ answer: 'No data found.', sources: [] });
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'Anything?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('No data found.')).toBeTruthy());
    expect(screen.queryByText('Based on these entries')).toBeNull();
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(qaApi.askQuestion).mockRejectedValue(new Error('Server error'));
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('Server error')).toBeTruthy());
  });

  it('shows fallback error when thrown value is not an Error', async () => {
    vi.mocked(qaApi.askQuestion).mockRejectedValue('oops');
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('Something went wrong.')).toBeTruthy());
  });

  it('clears previous result when a new question is submitted', async () => {
    vi.mocked(qaApi.askQuestion)
      .mockResolvedValueOnce({ answer: 'First answer.', sources: [] })
      .mockResolvedValueOnce({ answer: 'Second answer.', sources: [] });
    renderPage();
    const textarea = screen.getByLabelText('Your question');
    await userEvent.type(textarea, 'First?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('First answer.')).toBeTruthy());
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Second?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByText('Second answer.')).toBeTruthy());
    expect(screen.queryByText('First answer.')).toBeNull();
  });

  it('disables submit button while loading', async () => {
    vi.mocked(qaApi.askQuestion).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 5000))
    );
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
  });
});
