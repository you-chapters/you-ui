import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSummary } from './summary';
import * as client from './client';

vi.mock('./client', () => ({ apiFetch: vi.fn() }));

const mockSummary = {
  period_days: 30,
  entry_count: 5,
  mood_timeline: [],
  top_topics: [],
  top_people: [],
};

describe('getSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls /entries/summary?period=30 by default', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue(mockSummary);
    const result = await getSummary();
    expect(client.apiFetch).toHaveBeenCalledWith('/entries/summary?period=30');
    expect(result).toEqual(mockSummary);
  });

  it('calls /entries/summary?period=7 when period is 7', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue(mockSummary);
    await getSummary(7);
    expect(client.apiFetch).toHaveBeenCalledWith('/entries/summary?period=7');
  });

  it('propagates errors', async () => {
    vi.mocked(client.apiFetch).mockRejectedValue(new Error('Network error'));
    await expect(getSummary()).rejects.toThrow('Network error');
  });
});
