import { apiFetch } from './client';
import type { QaResponse } from '../types/qa';

export async function askQuestion(question: string): Promise<QaResponse> {
  return apiFetch<QaResponse>('/entries/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
}
