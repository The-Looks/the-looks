import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// Mỗi nhóm đường dẫn API đi tới một service (thay cho API gateway khi dev).
// Production làm việc tương tự bằng rewrites trong vercel.json.
const services = {
  identity: 'http://localhost:8081',
  wardrobe: 'http://localhost:8082',
  outfit: 'http://localhost:8083',
  voting: 'http://localhost:8084',
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Bản demo dùng service worker của MSW; hai service worker cùng scope sẽ đè nhau.
      disable: !!process.env.VITE_MOCK_SERVICES,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
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
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api/public/auth': services.identity,
      '/api/app/me': services.identity,
      '/api/app/wardrobe': services.wardrobe,
      '/api/app/outfits': services.outfit,
      '/api/app/polls': services.voting,
      '/api/public/polls': services.voting,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
