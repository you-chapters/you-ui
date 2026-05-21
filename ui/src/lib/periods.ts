// ISO week: move to Thursday of the week to determine the year and week number
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function prevIsoWeekKey(key: string): string {
  const [yearStr, weekStr] = key.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekMon = new Date(jan4);
  weekMon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
  weekMon.setUTCDate(weekMon.getUTCDate() - 7);
  return isoWeekKey(weekMon);
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function prevMonthKey(key: string): string {
  const [yearStr, monthStr] = key.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
}