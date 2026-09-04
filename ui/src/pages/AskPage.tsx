import { useState } from 'react';
import EntryCard from '../components/EntryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { askQuestion } from '../api/qa';
import type { QaResponse } from '../types/qa';
import './NewEntryPage.css';
import './AskPage.css';

type Status = 'idle' | 'loading' | 'error';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QaResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const data = await askQuestion(q);
      setResult(data);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  return (
    <main className="new-entry ask-page">
      <h1 className="new-entry__title">Ask about your life</h1>

      <form onSubmit={e => e.preventDefault()}>
        <div className="field">
          <label className="field__label" htmlFor="question">Your question</label>
          <textarea
            id="question"
            className="field__textarea ask-page__textarea"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. When did I last feel truly rested? Who have I been spending time with?"
            rows={4}
          />
        </div>

        {status === 'error' && (
          <div className="alert alert--error">{error}</div>
        )}

        <button type="submit" className="new-entry__submit" disabled>
          {status === 'loading'
            ? <><LoadingSpinner size="sm" centered={false} /> Thinking…</>
            : 'Ask'}
        </button>
      </form>

      {result && (
        <section className="ask-page__result">
          <p className="ask-page__answer">{result.answer}</p>

          {result.sources.length > 0 && (
            <div className="ask-page__sources">
              <p className="ask-page__sources-label">Based on these entries</p>
              {result.sources.map(entry => (
                <EntryCard key={entry.entry_id} entry={entry} target="_blank" />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
