import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LandingPage from './LandingPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LandingPage', () => {
  beforeEach(() => mockNavigate.mockClear());

  function renderPage() {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
  }

  it('renders headline and subtext', () => {
    renderPage();
    expect(screen.getByText('A place for your thoughts.')).toBeTruthy();
    expect(screen.getByText('Write freely. Read later. No clutter, no noise.')).toBeTruthy();
  });

  it('Write button navigates to /new', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Write' }));
    expect(mockNavigate).toHaveBeenCalledWith('/new');
  });

  it('List entries button navigates to /entries', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'List entries' }));
    expect(mockNavigate).toHaveBeenCalledWith('/entries');
  });
});
