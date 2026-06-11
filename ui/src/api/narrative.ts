import type { NarrativeSummary } from '../types/narrative';
import { apiFetch } from './client';

export function getNarrative(
  type: 'week' | 'month' = 'week',
  key?: string,
  refresh = false,
): Promise<NarrativeSummary> {
  const params = new URLSearchParams({ type });
  if (key) params.set('key', key);
  if (refresh) params.set('refresh', 'true');
  return apiFetch<NarrativeSummary>(`/entries/narrative?${params}`);
}
