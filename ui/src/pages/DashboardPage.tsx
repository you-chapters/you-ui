import { useState, useEffect } from 'react';
import { getSummary } from '../api/summary';
import type { PeriodSummary } from '../types/summary';
import PeriodStrip from '../components/PeriodStrip';
import PeopleCard from '../components/PeopleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardPage.css';

export default function DashboardPage() {
  const [period, setPeriod] = useState<7 | 30>(30);
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSummary(null);
    setError(null);
    getSummary(period)
      .then(setSummary)
      .catch(e => setError(e.message ?? 'Failed to load summary'));
  }, [period]);

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <LoadingSpinner centered />;

  return (
    <main className="dashboard">
      <PeriodStrip summary={summary} period={period} onPeriodChange={setPeriod} />
      <PeopleCard people={summary.top_people} />
    </main>
  );
}
