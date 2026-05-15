import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { signIn } from 'aws-amplify/auth';

const mockNavigate = vi.fn();
const mockRefresh = vi.fn();

vi.mock('aws-amplify/auth', () => ({ signIn: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate, useLocation: () => ({ state: null, pathname: '/login' }) };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ refresh: mockRefresh }),
}));

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  function renderPage() {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
  }

  it('renders email, password fields and submit button', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('calls signIn with email and password', async () => {
    vi.mocked(signIn).mockResolvedValue({} as any);
    renderPage();
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(signIn).toHaveBeenCalledWith({ username: 'test@example.com', password: 'password123' });
  });

  it('calls refresh and navigates after successful sign in', async () => {
    vi.mocked(signIn).mockResolvedValue({} as any);
    mockRefresh.mockResolvedValue(undefined);
    renderPage();
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows error message on signIn failure', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('Incorrect username or password.'));
    renderPage();
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByText('Incorrect username or password.')).toBeTruthy());
  });

  it('disables button while loading', async () => {
    vi.mocked(signIn).mockImplementation(() => new Promise(() => {}));
    renderPage();
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Signing in/ })).toBeDisabled());
  });

  it('renders a link to the register page', () => {
    renderPage();
    expect(screen.getByText('Create one').getAttribute('href')).toBe('/register');
  });
});
