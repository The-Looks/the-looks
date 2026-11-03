import { afterEach, describe, expect, it, vi } from 'vitest';
import { session } from './session';

afterEach(() => { vi.unstubAllGlobals(); session.clear(); });

describe('HttpOnly cookie session refresh', () => {
  it('keeps the active UI session after a temporary server failure', async () => {
    const future = new Date(Date.now() + 10 * 60_000).toISOString();
    session.start(future);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }));

    expect(await session.refresh()).toBe(false);
    expect(session.getExpiry()).toBe(Date.parse(future));
    expect(session.isRefreshUnavailable()).toBe(true);
  });

  it('clears the UI session when refresh is explicitly unauthorized', async () => {
    session.start(new Date(Date.now() + 10 * 60_000).toISOString());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }));

    expect(await session.refresh()).toBe(false);
    expect(session.getExpiry()).toBe(0);
    expect(session.isRefreshUnavailable()).toBe(false);
  });
});
