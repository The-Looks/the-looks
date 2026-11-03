import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '../services/shared/api/queryClient';
import { applyBrandToDocument, brand } from '../services/shared/brand';
import { session } from '../services/shared/session';
import '../components/shared/theme/styles.css';
import '../components/shared/theme/web-app.css';
import '../components/shared/theme/experience.css';
import '../components/shared/theme/guest-figma.css';
import '../components/shared/theme/home-redesign.css';
import { router } from './router';

applyBrandToDocument();

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
  const { startMocks } = await import('../services/shared/mocks/browser');
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
              colorPrimary: brand.colors.purple,
              colorInfo: brand.colors.purple,
              colorSuccess: brand.colors.green,
              colorWarning: brand.colors.amber,
              colorError: brand.colors.pink,
              colorText: brand.colors.ink,
              colorTextSecondary: brand.colors.muted,
              colorBgBase: brand.colors.bg,
              colorBorder: brand.colors.line,
              borderRadius: brand.radius.md,
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
