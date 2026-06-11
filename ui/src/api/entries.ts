import type { Entry, CreateEntryPayload } from '../types/entry';
import { apiFetch } from './client';

export function createEntry(payload: CreateEntryPayload): Promise<Entry> {
  return apiFetch<Entry>('/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getEntry(id: string): Promise<Entry> {
  return apiFetch<Entry>(`/entries/${id}`);
}

export function listEntries(fromDate?: string, toDate?: string): Promise<Entry[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  const queryString = params.toString();
  return apiFetch<Entry[]>(`/entries${queryString ? `?${queryString}` : ''}`);
}

export function getOnThisDay(): Promise<Entry[]> {
  return apiFetch<Entry[]>('/entries/on-this-day');
}

export function searchEntries(query: string): Promise<Entry[]> {
  return apiFetch<{ entries: Entry[] }>('/entries/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then(r => r.entries);
}
