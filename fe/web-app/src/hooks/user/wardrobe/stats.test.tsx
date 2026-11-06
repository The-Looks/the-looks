import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useWardrobeStats } from './api';
const request = vi.hoisted(() => vi.fn());
vi.mock('../../../services/user/wardrobe/requests', () => ({ wardrobeRequests: { stats: request } }));
afterEach(cleanup);
it('does not call the protected endpoint until the feature is enabled', async () => {
  request.mockResolvedValue({ totalItems: 0 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { result, rerender } = renderHook(({ enabled }) => useWardrobeStats(enabled), { initialProps: { enabled: false },
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
  expect(request).not.toHaveBeenCalled(); rerender({ enabled: true });
  await waitFor(() => expect(result.current.isSuccess).toBe(true)); expect(request).toHaveBeenCalledTimes(1); client.clear();
});
