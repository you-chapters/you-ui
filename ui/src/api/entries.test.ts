import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEntry, getEntry, listEntries, searchEntries } from './entries';
import { fetchAuthSession } from 'aws-amplify/auth';

vi.mock('aws-amplify/auth', () => ({ fetchAuthSession: vi.fn() }));

describe('entries API', () => {
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

  it('createEntry posts to /entries with JSON body and auth header', async () => {
    const entry = { entry_id: '1', user_id: 'u1', entry: 'hello' };
    mockOk(entry);
    const result = await createEntry({ entry: 'hello' });
    expect(fetch).toHaveBeenCalledWith('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-token' },
      body: JSON.stringify({ entry: 'hello' }),
    });
    expect(result).toEqual(entry);
  });

  it('getEntry fetches from /entries/:id with auth header', async () => {
    const entry = { entry_id: '42', user_id: 'u1', entry: 'world' };
    mockOk(entry);
    const result = await getEntry('42');
    expect(fetch).toHaveBeenCalledWith('/entries/42', {
      headers: { Authorization: 'Bearer mock-token' },
    });
    expect(result).toEqual(entry);
  });

  it('listEntries fetches /entries', async () => {
    mockOk([]);
    await listEntries();
    expect(fetch).toHaveBeenCalledWith('/entries', {
      headers: { Authorization: 'Bearer mock-token' },
    });
  });

  it('searchEntries posts to /entries/search with query', async () => {
    mockOk([]);
    await searchEntries('Alice');
    expect(fetch).toHaveBeenCalledWith('/entries/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-token' },
      body: JSON.stringify({ query: 'Alice' }),
    });
  });

  it('throws when no token is available', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined } as any);
    await expect(getEntry('1')).rejects.toThrow('Not authenticated');
  });

  it('throws with response body text on non-ok response', async () => {
    mockError(404, 'Not found');
    await expect(getEntry('x')).rejects.toThrow('Not found');
  });

  it('throws HTTP status when body is empty on non-ok response', async () => {
    mockError(500, '');
    await expect(getEntry('x')).rejects.toThrow('HTTP 500');
  });
});
