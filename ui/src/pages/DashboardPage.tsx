import { useState, useEffect } from 'react';
import { getSummary } from '../api/summary';
import type { PeriodSummary } from '../types/summary';
import { isoWeekKey, prevIsoWeekKey, monthKey, prevMonthKey } from '../lib/periods';
import PeriodStrip from '../components/PeriodStrip';
import PeopleCard from '../components/PeopleCard';
import NarrativeStack from '../components/NarrativeStack';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardPage.css';

export default function DashboardPage() {
  const [period, setPeriod] = useState<7 | 30>(30);
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [weekKey] = useState(() => isoWeekKey(new Date()));
  const [prevWeekKey] = useState(() => prevIsoWeekKey(isoWeekKey(new Date())));
  const [mthKey] = useState(() => monthKey(new Date()));
  const [prevMthKey] = useState(() => prevMonthKey(monthKey(new Date())));

  useEffect(() => {
    setSummary(null);
    setSummaryError(null);
    getSummary(period)
      .then(setSummary)
      .catch(e => setSummaryError(e.message ?? 'Failed to load summary'));
  }, [period]);

  if (summaryError) return <p className="error">{summaryError}</p>;
  if (!summary) return <LoadingSpinner centered />;

  return (
    <main className="dashboard">
      <PeriodStrip summary={summary} period={period} onPeriodChange={setPeriod} />
      <PeopleCard people={summary.top_people} />
      <NarrativeStack type="week" currentKey={weekKey} previousKey={prevWeekKey} />
      <NarrativeStack type="month" currentKey={mthKey} previousKey={prevMthKey} />
    </main>
  );
}
