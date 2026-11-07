import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import { loadEnv, type ProxyOptions } from 'vite';
import { defineConfig } from 'vitest/config';

// Mỗi nhóm đường dẫn API đi tới một service (thay cho API gateway khi dev).
// Production làm việc tương tự bằng rewrites trong vercel.json.
const services = {
  auth: 'http://localhost:8081',
  wardrobe: 'http://localhost:8082',
  outfit: 'http://localhost:8083',
  voting: 'http://localhost:8084',
  billing: 'http://localhost:8085',
};

export default defineConfig(({ mode }) => {
  const httpsDev = mode === 'https';
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxyTo = (target: string): ProxyOptions => ({
    target,
    configure(proxy) {
      // Spring uses this trusted local proxy header to set Secure on auth cookies.
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('X-Forwarded-Proto', httpsDev ? 'https' : 'http');
      });
    },
  });

  return {
    plugins: [
      react(),
      ...(httpsDev ? [basicSsl()] : []),
      VitePWA({
        // Bản demo dùng service worker của MSW; hai service worker cùng scope sẽ đè nhau.
        disable: !!env.VITE_MOCK_SERVICES,
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'assets/animations/looksy-hanger.webp', 'assets/animations/looksy-hanger.png'],
        manifest: {
          name: 'The Looks',
          short_name: 'The Looks',
          description: 'Trợ lý phối đồ AI từ tủ đồ của bạn. Wear More. Buy Smarter.',
          lang: 'vi',
          start_url: '/',
          display: 'standalone',
          theme_color: '#9440DD',
          background_color: '#FAF8FC',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api\//],
          globIgnores: ['**/mockServiceWorker.js'],
          runtimeCaching: [{
            urlPattern: /\/(?:assets\/.*\.(?:webp|png|jpe?g|gif)|the-looks-logo\.webp)(?:\?.*)?$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'thelooks-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          }],
        },
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api/public/auth': proxyTo(services.auth),
        '/api/app/me': proxyTo(services.auth),
        '/api/app/wardrobe': proxyTo(services.wardrobe),
        '/api/public/wardrobe': proxyTo(services.wardrobe),
        '/api/app/outfits': proxyTo(services.outfit),
        '/api/app/polls': proxyTo(services.voting),
        '/api/public/polls': proxyTo(services.voting),
        '/api/app/billing': proxyTo(services.billing),
        '/api/public/billing': proxyTo(services.billing),
        '/api/admin/outfits': proxyTo(services.outfit),
        '/api/admin/wardrobe': proxyTo(services.wardrobe),
        '/api/admin/polls': proxyTo(services.voting),
        '/api/admin/auth': proxyTo(services.auth),
        '/api/admin/billing': proxyTo(services.billing),
        '/api/admin/wardrobe': proxyTo(services.wardrobe),
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
    },
  };
});
