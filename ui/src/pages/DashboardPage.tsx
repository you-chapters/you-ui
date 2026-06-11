import { useState, useEffect } from 'react';
import { getSummary } from '../api/summary';
import type { PeriodSummary } from '../types/summary';
import { isoWeekKey, prevIsoWeekKey, monthKey, prevMonthKey } from '../lib/periods';
import PeriodStrip from '../components/PeriodStrip';
import PeopleCard from '../components/PeopleCard';
import PlacesCard from '../components/PlacesCard';
import NarrativeStack from '../components/NarrativeStack';
import OnThisDayCard from '../components/OnThisDayCard';
import './DashboardPage.css';

export default function DashboardPage() {
  const [period, setPeriod] = useState<7 | 30>(7);
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

  return (
    <main className="dashboard">
      <OnThisDayCard />
      <PeriodStrip summary={summary} period={period} onPeriodChange={setPeriod} />
      <div className="dashboard__cards-row">
        <PeopleCard people={summary?.top_people ?? null} />
        <PlacesCard locations={summary?.top_locations ?? null} />
      </div>
      <NarrativeStack type="week" currentKey={weekKey} previousKey={prevWeekKey} />
      <NarrativeStack type="month" currentKey={mthKey} previousKey={prevMthKey} />
    </main>
  );
}
