import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProtectedRoute from '.';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

function renderProtected() {
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading spinner while auth is resolving', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true, signOut: vi.fn(), refresh: vi.fn() });
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><div>secret</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(container.querySelector('.spinner')).toBeTruthy();
  });

  it('renders children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { userId: 'u1', displayName: 'Alice' }, loading: false, signOut: vi.fn(), refresh: vi.fn() });
    renderProtected();
    expect(screen.getByText('secret')).toBeTruthy();
  });

  it('redirects to /login when user is null', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn(), refresh: vi.fn() });
    renderProtected();
    expect(screen.getByText('login page')).toBeTruthy();
    expect(screen.queryByText('secret')).toBeNull();
  });
});
