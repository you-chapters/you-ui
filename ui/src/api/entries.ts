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

export function listEntries(): Promise<Entry[]> {
  return apiFetch<Entry[]>('/entries');
}

export function searchEntries(query: string): Promise<Entry[]> {
  return apiFetch<Entry[]>('/entries/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
}
