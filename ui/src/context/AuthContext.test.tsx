import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import * as amplifyAuth from 'aws-amplify/auth';

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(),
  fetchUserAttributes: vi.fn(),
  signOut: vi.fn(),
}));

function TestConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  if (!user) return <div>no user</div>;
  return <div>{user.userId}:{user.displayName}</div>;
}

function renderProvider() {
  return render(<AuthProvider><TestConsumer /></AuthProvider>);
}

describe('AuthContext', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts in loading state', () => {
    vi.mocked(amplifyAuth.getCurrentUser).mockReturnValue(new Promise(() => {}));
    renderProvider();
    expect(screen.getByText('loading')).toBeTruthy();
  });

  it('sets user with preferred_username as displayName', async () => {
    vi.mocked(amplifyAuth.getCurrentUser).mockResolvedValue({ userId: 'sub-123', username: 'u' } as any);
    vi.mocked(amplifyAuth.fetchUserAttributes).mockResolvedValue({ preferred_username: 'Alice', email: 'a@test.com' } as any);
    renderProvider();
    await waitFor(() => expect(screen.getByText('sub-123:Alice')).toBeTruthy());
  });

  it('falls back to email when no preferred_username', async () => {
    vi.mocked(amplifyAuth.getCurrentUser).mockResolvedValue({ userId: 'sub-123', username: 'u' } as any);
    vi.mocked(amplifyAuth.fetchUserAttributes).mockResolvedValue({ email: 'a@test.com' } as any);
    renderProvider();
    await waitFor(() => expect(screen.getByText('sub-123:a@test.com')).toBeTruthy());
  });

  it('falls back to userId when no preferred_username or email', async () => {
    vi.mocked(amplifyAuth.getCurrentUser).mockResolvedValue({ userId: 'sub-123', username: 'u' } as any);
    vi.mocked(amplifyAuth.fetchUserAttributes).mockResolvedValue({} as any);
    renderProvider();
    await waitFor(() => expect(screen.getByText('sub-123:sub-123')).toBeTruthy());
  });

  it('sets user to null when not authenticated', async () => {
    vi.mocked(amplifyAuth.getCurrentUser).mockRejectedValue(new Error('Not signed in'));
    renderProvider();
    await waitFor(() => expect(screen.getByText('no user')).toBeTruthy());
  });

  it('clears user after signOut', async () => {
    vi.mocked(amplifyAuth.getCurrentUser).mockResolvedValue({ userId: 'sub-123', username: 'u' } as any);
    vi.mocked(amplifyAuth.fetchUserAttributes).mockResolvedValue({ preferred_username: 'Alice' } as any);
    vi.mocked(amplifyAuth.signOut).mockResolvedValue(undefined);

    function TestSignOut() {
      const { user, signOut } = useAuth();
      return (
        <>
          <div>{user ? user.displayName : 'no user'}</div>
          <button onClick={signOut}>sign out</button>
        </>
      );
    }

    render(<AuthProvider><TestSignOut /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy());
    await act(async () => { screen.getByRole('button', { name: 'sign out' }).click(); });
    await waitFor(() => expect(screen.getByText('no user')).toBeTruthy());
  });
});
