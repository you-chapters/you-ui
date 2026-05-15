import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';
import './NewEntryPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn({ username: email, password });
      await refresh();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Sign in</h1>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="field__input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="field__input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="auth-card__submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
