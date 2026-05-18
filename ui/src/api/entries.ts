import type { Entry, CreateEntryPayload } from '../types/entry';
import { fetchAuthSession } from 'aws-amplify/auth';

const BASE_URL = '';

async function getIdToken(): Promise<string> {
  const { tokens } = await fetchAuthSession();
  const token = tokens?.idToken?.toString();
  if (!token) throw new Error('Not authenticated');
  return token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(BASE_URL + path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
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

export function listEntries(): Promise<Entry[]> {
  return apiFetch<Entry[]>('/entries');
}