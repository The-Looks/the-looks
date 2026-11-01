import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '../shared/api/queryClient';
import { session } from '../shared/lib/session';
import '../shared/theme/styles.css';
import { router } from './router';

session.subscribe(() => {
  if (!session.getToken()) queryClient.clear();
});

/**
 * Bật MSW cho các service trong VITE_MOCK_SERVICES.
 * Dev: đặt trong .env.development. Bản demo trên Vercel: đặt biến môi trường lúc build (để trống ở production thật).
 */
async function enableMocks() {
  const services = (import.meta.env.VITE_MOCK_SERVICES ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (services.length === 0) return;
  const { startMocks } = await import('../shared/mocks/browser');
  await startMocks(services);
}

enableMocks().then(() => session.refresh()).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
