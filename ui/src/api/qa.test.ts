import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askQuestion } from './qa';
import { fetchAuthSession } from 'aws-amplify/auth';

vi.mock('aws-amplify/auth', () => ({ fetchAuthSession: vi.fn() }));

describe('qa API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: { idToken: { toString: () => 'mock-token' } },
    } as any);
  });
  afterEach(() => vi.unstubAllGlobals());

  function mockOk(data: unknown) {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(''),
    });
  }

  function mockError(status: number, body = '') {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status,
      text: () => Promise.resolve(body),
      statusText: `Error ${status}`,
    });
  }

  it('posts to /entries/ask with question and auth header', async () => {
    const response = { answer: 'You last felt rested on Tuesday.', sources: [] };
    mockOk(response);
    const result = await askQuestion('When did I last feel rested?');
    expect(fetch).toHaveBeenCalledWith('/entries/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-token' },
      body: JSON.stringify({ question: 'When did I last feel rested?' }),
    });
    expect(result).toEqual(response);
  });

  it('returns answer and source entries', async () => {
    const entry = { entry_id: 'e1', user_id: 'u1', entry: 'Slept well' };
    const response = { answer: 'Last Tuesday.', sources: [entry] };
    mockOk(response);
    const result = await askQuestion('When did I sleep well?');
    expect(result.answer).toBe('Last Tuesday.');
    expect(result.sources).toEqual([entry]);
  });

  it('throws on non-ok response', async () => {
    mockError(500, 'Internal Server Error');
    await expect(askQuestion('test?')).rejects.toThrow('Internal Server Error');
  });
});
