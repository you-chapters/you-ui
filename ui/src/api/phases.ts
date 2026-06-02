import { apiFetch } from './client';
import type { PhaseRecord } from '../types/phase';

export function getPhases(refresh = false): Promise<PhaseRecord[]> {
  const params = new URLSearchParams({ refresh: String(refresh) });
  return apiFetch<PhaseRecord[]>(`/phases?${params}`);
}

export function getCurrentPhase(): Promise<PhaseRecord | null> {
  return apiFetch<PhaseRecord | null>('/phases/current');
}

export function getPhase(phaseId: string): Promise<PhaseRecord> {
  return apiFetch<PhaseRecord>(`/phases/${phaseId}`);
}
