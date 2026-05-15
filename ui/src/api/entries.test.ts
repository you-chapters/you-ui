import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEntry, getEntry, listEntries } from './entries';

describe('entries API', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
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

  it('createEntry posts to /entries with JSON body and returns entry', async () => {
    const entry = { entry_id: '1', user_id: 'u1', entry: 'hello' };
    mockOk(entry);
    const result = await createEntry({ user_id: 'u1', entry: 'hello' });
    expect(fetch).toHaveBeenCalledWith('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'u1', entry: 'hello' }),
    });
    expect(result).toEqual(entry);
  });

  it('getEntry fetches from /entries/:id', async () => {
    const entry = { entry_id: '42', user_id: 'u1', entry: 'world' };
    mockOk(entry);
    const result = await getEntry('42');
    expect(fetch).toHaveBeenCalledWith('/entries/42', undefined);
    expect(result).toEqual(entry);
  });

  it('listEntries fetches /entries without query when no userId', async () => {
    mockOk([]);
    await listEntries();
    expect(fetch).toHaveBeenCalledWith('/entries', undefined);
  });

  it('listEntries appends encoded user_id as query param', async () => {
    mockOk([]);
    await listEntries('user-1');
    expect(fetch).toHaveBeenCalledWith('/entries?user_id=user-1', undefined);
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
