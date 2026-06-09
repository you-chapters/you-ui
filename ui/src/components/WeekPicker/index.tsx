import { useState } from 'react';
import './WeekPicker.css';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mondayOf(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const day = r.getDay();
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1));
  return r;
}

export function currentWeek(): { from: Date; to: Date } {
  const from = mondayOf(new Date());
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  return { from, to };
}

function weeksForMonth(year: number, month: number): Array<{ from: Date; to: Date }> {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const weeks: Array<{ from: Date; to: Date }> = [];
  let start = mondayOf(first);
  while (start <= last) {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    weeks.push({ from: new Date(start), to: end });
    start = new Date(start);
    start.setDate(start.getDate() + 7);
  }
  return weeks;
}

function weekLabel(from: Date, to: Date): string {
  return from.getMonth() === to.getMonth()
    ? `${from.getDate()} – ${to.getDate()}`
    : `${MONTH_SHORT[from.getMonth()]} ${from.getDate()} – ${MONTH_SHORT[to.getMonth()]} ${to.getDate()}`;
}

export interface Week { from: Date; to: Date; }

export default function WeekPicker({ selected, onChange }: { selected: Week; onChange: (w: Week) => void }) {
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const thisWeekISO = toISODate(mondayOf(today));
  const todayISO = toISODate(today);

  const months = ([-2, -1, 0] as const).map(delta => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div className="week-picker">
      <div className="week-picker__nav">
        <button className="week-picker__arrow" onClick={() => setOffset(o => o - 1)} aria-label="Earlier months">←</button>
        <div className="week-picker__month-labels">
          {months.map(({ year, month }) => (
            <span key={`${year}-${month}`} className="week-picker__month-label">
              {MONTH_LONG[month]} {year}
            </span>
          ))}
        </div>
        <button className="week-picker__arrow" onClick={() => setOffset(o => Math.min(0, o + 1))} disabled={offset >= 0} aria-label="Later months">→</button>
      </div>
      <div className="week-picker__grid">
        {months.map(({ year, month }) => (
          <div key={`${year}-${month}`} className="week-picker__month">
            {weeksForMonth(year, month).map(w => {
              const fromISO = toISODate(w.from);
              const isSel = toISODate(selected.from) === fromISO;
              const isCur = fromISO === thisWeekISO;
              const isFuture = fromISO > todayISO;
              return (
                <button
                  key={fromISO}
                  className={`week-picker__week${isSel ? ' week-picker__week--selected' : ''}${isCur && !isSel ? ' week-picker__week--current' : ''}${isFuture ? ' week-picker__week--future' : ''}`}
                  onClick={() => !isFuture && onChange(w)}
                  disabled={isFuture}
                >
                  {weekLabel(w.from, w.to)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
