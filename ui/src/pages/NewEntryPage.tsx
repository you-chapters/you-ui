import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { createEntry } from '../api/entries';
import LoadingSpinner from '../components/LoadingSpinner';
import './NewEntryPage.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function NewEntryPage() {
  const [entryText, setEntryText] = useState('');
  const [location, setLocation] = useState('');
  const [status/*, setStatus*/] = useState<Status>('idle');
  const [errorMessage/*, setErrorMessage*/] = useState('');

  /*
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryText.trim()) {
      setStatus('error');
      setErrorMessage('Entry cannot be empty.');
      return;
    }
    setStatus('submitting');
    try {
      await createEntry({ entry: entryText.trim(), location: location.trim() || undefined });
      setEntryText('');
      setLocation('');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }
  */

  return (
    <main className="new-entry">
      <h1 className="new-entry__title">New Entry</h1>

      {status === 'error' && (
        <div className="alert alert--error">{errorMessage}</div>
      )}
      {status === 'success' && (
        <div className="alert alert--success">
          Entry saved. <Link to="/entries">View all entries →</Link>
        </div>
      )}

      <form onSubmit={e => e.preventDefault()}>
        <div className="field">
          <label className="field__label" htmlFor="location">Location</label>
          <input
            id="location"
            className="field__input"
            type="text"
            placeholder="Where are you?"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="entryText">Your entry</label>
          <textarea
            id="entryText"
            className="field__textarea"
            placeholder="What's on your mind?"
            value={entryText}
            onChange={e => setEntryText(e.target.value)}
            autoFocus
          />
        </div>

        <button
          className="new-entry__submit"
          type="submit"
          disabled
        >
          {status === 'submitting' ? <LoadingSpinner size="sm" centered={false} /> : 'Save Entry'}
        </button>
      </form>
    </main>
  );
}