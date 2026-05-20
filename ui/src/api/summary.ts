import type { PeriodSummary } from '../types/summary';
import { apiFetch } from './client';

export function getSummary(period: 7 | 30 = 30): Promise<PeriodSummary> {
  return apiFetch<PeriodSummary>(`/entries/summary?period=${period}`);
}
