import type { NarrativeSummary } from '../types/narrative';
import { apiFetch } from './client';

export function getNarrative(
  type: 'week' | 'month' = 'week',
  key?: string,
  refresh = false,
): Promise<NarrativeSummary> {
  const params = new URLSearchParams({ type, refresh: String(refresh) });
  if (key) params.set('key', key);
  return apiFetch<NarrativeSummary>(`/entries/narrative?${params}`);
}
