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

  it('submit button is always disabled regardless of input', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When did I last travel?');
    expect(screen.getByRole('button', { name: 'Ask' })).toBeDisabled();
  });

  it('does not call askQuestion when form is submitted', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Your question'), 'When?');
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    expect(qaApi.askQuestion).not.toHaveBeenCalled();
  });
});
