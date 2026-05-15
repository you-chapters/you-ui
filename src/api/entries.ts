import type { Entry, CreateEntryPayload } from '../types/entry';

const BASE_URL = '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE_URL + path, init);
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

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

export function listEntries(userId?: string): Promise<Entry[]> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiFetch<Entry[]>(`/entries${query}`);
}