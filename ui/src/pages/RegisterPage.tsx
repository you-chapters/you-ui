import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';
import './NewEntryPage.css';

type Step = 'register' | 'confirm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [step, setStep] = useState<Step>('register');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email, preferred_username: displayName } },
      });
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      await signIn({ username: email, password });
      await refresh();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">
          {step === 'register' ? 'Create account' : 'Verify email'}
        </h1>

        {step === 'confirm' && (
          <p className="auth-card__hint">
            A verification code was sent to <strong>{email}</strong>.
          </p>
        )}

        {error && <div className="alert alert--error">{error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleRegister}>
            <div className="field">
              <label className="field__label" htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                type="text"
                className="field__input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoComplete="nickname"
                required
              />
            </div>

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
                autoComplete="new-password"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                className="field__input"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button className="auth-card__submit" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <div className="field">
              <label className="field__label" htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                className="field__input"
                value={code}
                onChange={e => setCode(e.target.value)}
                autoComplete="one-time-code"
                required
              />
            </div>

            <button className="auth-card__submit" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify and sign in'}
            </button>
          </form>
        )}

        <p className="auth-card__footer">
          {step === 'register'
            ? <><Link to="/login">Sign in</Link> to an existing account</>
            : <button type="button" className="auth-card__footer" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-accent)' }} onClick={() => { setStep('register'); setError(''); }}>Back</button>
          }
        </p>
      </div>
    </div>
  );
}
