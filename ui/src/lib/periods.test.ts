import { describe, it, expect } from 'vitest';
import { isoWeekKey, prevIsoWeekKey, monthKey, prevMonthKey } from './periods';

describe('isoWeekKey', () => {
  it('returns correct key for a mid-week date', () => {
    expect(isoWeekKey(new Date('2026-05-21'))).toBe('2026-W21');
  });

  it('handles year boundary — Dec 31 2020 is W53', () => {
    expect(isoWeekKey(new Date('2020-12-31'))).toBe('2020-W53');
  });

  it('handles ISO year rollover — Jan 1 2021 is W53 of 2020', () => {
    expect(isoWeekKey(new Date('2021-01-01'))).toBe('2020-W53');
  });

  it('Jan 4 is always W01', () => {
    expect(isoWeekKey(new Date('2021-01-04'))).toBe('2021-W01');
  });
});

describe('prevIsoWeekKey', () => {
  it('returns previous week within same year', () => {
    expect(prevIsoWeekKey('2026-W21')).toBe('2026-W20');
  });

  it('crosses year boundary into a 53-week year', () => {
    // 2020 is a leap year with 53 ISO weeks; 2021-W01 starts Jan 4 so prev is 2020-W53
    expect(prevIsoWeekKey('2021-W01')).toBe('2020-W53');
  });

  it('crosses year boundary into a 52-week year', () => {
    // 2025 has 52 ISO weeks
    expect(prevIsoWeekKey('2026-W01')).toBe('2025-W52');
  });
});

describe('monthKey', () => {
  it('formats correctly', () => {
    expect(monthKey(new Date('2026-05-21'))).toBe('2026-05');
  });

  it('pads single-digit months', () => {
    expect(monthKey(new Date('2026-01-15'))).toBe('2026-01');
  });
});

describe('prevMonthKey', () => {
  it('returns previous month', () => {
    expect(prevMonthKey('2026-05')).toBe('2026-04');
  });

  it('wraps to December of previous year', () => {
    expect(prevMonthKey('2026-01')).toBe('2025-12');
  });
});