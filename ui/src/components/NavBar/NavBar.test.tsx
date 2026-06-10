import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavBar from '.';
import { useAuth } from '../../context/AuthContext';

const mockNavigate = vi.fn();

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderNavBar() {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
}

describe('NavBar — authenticated', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'sub-123', displayName: 'Alice' },
      loading: false,
      signOut: mockSignOut,
      refresh: vi.fn(),
    });
  });

  it('renders logo linking to /', () => {
    renderNavBar();
    expect(screen.getByText('you.').getAttribute('href')).toBe('/');
  });

  it('renders New Entry, All Entries, Timeline, and Ask links', () => {
    renderNavBar();
    expect(screen.getByText('New Entry').getAttribute('href')).toBe('/new');
    expect(screen.getByText('All Entries').getAttribute('href')).toBe('/entries');
    expect(screen.getByText('Timeline').getAttribute('href')).toBe('/phases');
    expect(screen.getByText('Ask').getAttribute('href')).toBe('/ask');
  });

  it('displays the user display name', () => {
    renderNavBar();
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('renders a Sign out button', () => {
    renderNavBar();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();
  });

  it('calls signOut and navigates to /login on sign out', async () => {
    mockSignOut.mockResolvedValue(undefined);
    renderNavBar();
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});

describe('NavBar — unauthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('renders Sign in link', () => {
    renderNavBar();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('does not render nav links', () => {
    renderNavBar();
    expect(screen.queryByText('New Entry')).toBeNull();
    expect(screen.queryByText('All Entries')).toBeNull();
    expect(screen.queryByText('Ask')).toBeNull();
  });
});