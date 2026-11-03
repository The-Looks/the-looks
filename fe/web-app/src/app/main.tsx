import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '../shared/api/queryClient';
import { session } from '../shared/lib/session';
import '../shared/theme/typography.css';
import '../shared/theme/styles.css';
import '../shared/theme/web-app.css';
import '../shared/theme/experience.css';
import '../shared/theme/guest-figma.css';
import { router } from './router';

session.subscribe(() => {
  if (!session.getExpiry()) queryClient.clear();
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
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#9440DD',
              colorInfo: '#9440DD',
              colorSuccess: '#32936F',
              colorWarning: '#A76B22',
              colorError: '#DB607E',
              colorText: '#251D2F',
              colorTextSecondary: '#786E80',
              colorBgBase: '#FAF8FC',
              colorBorder: '#ECE4F3',
              borderRadius: 14,
              fontFamily: 'var(--font-body)',
              fontSize: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--type-14')),
            },
            components: {
              Button: { borderRadius: 999, controlHeight: 44, fontWeight: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--weight-semibold')) },
              Card: { borderRadiusLG: 20 },
              Input: { borderRadius: 14 },
              Menu: { itemBorderRadius: 12 },
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});
