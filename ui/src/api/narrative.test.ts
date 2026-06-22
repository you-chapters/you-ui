import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNarrative } from './narrative';
import * as client from './client';

vi.mock('./client', () => ({ apiFetch: vi.fn() }));

const mockNarrative = {
  period_type: 'week' as const,
  period_key: '2026-W21',
  entry_count: 5,
  text: 'A thoughtful week.',
  generated_at: '2026-05-21T08:49:19.554979+00:00',
  is_cached: false,
};

describe('getNarrative', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls with type=week and no refresh param by default', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue(mockNarrative);
    const result = await getNarrative();
    expect(client.apiFetch).toHaveBeenCalledWith('/entries/narrative?type=week');
    expect(result).toEqual(mockNarrative);
  });

  it('uses type=month when specified', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue(mockNarrative);
    await getNarrative('month');
    expect(client.apiFetch).toHaveBeenCalledWith('/entries/narrative?type=month');
  });

  it('appends key param when provided', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue(mockNarrative);
    await getNarrative('week', '2026-W21');
    expect(client.apiFetch).toHaveBeenCalledWith('/entries/narrative?type=week&key=2026-W21');
  });

  it('sets refresh=true when requested', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue(mockNarrative);
    await getNarrative('week', undefined, true);
    expect(client.apiFetch).toHaveBeenCalledWith('/entries/narrative?type=week&refresh=true');
  });

  it('propagates errors', async () => {
    vi.mocked(client.apiFetch).mockRejectedValue(new Error('Network error'));
    await expect(getNarrative()).rejects.toThrow('Network error');
  });
});
