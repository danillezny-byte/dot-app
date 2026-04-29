import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' = новый SW сам активируется без подтверждения,
      // у dot нет «несохранённого» состояния, обновлять можно молча.
      registerType: 'autoUpdate',

      // Включаем PWA и в dev-режиме, чтобы тестировать на телефоне через ngrok
      // ещё до build/deploy. На десктопе можно открыть DevTools → Application
      // и увидеть зарегистрированный Service Worker.
      devOptions: { enabled: true, type: 'module' },

      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],

      manifest: {
        name: 'dot.',
        short_name: 'dot.',
        description: 'Задачи, привычки и база знаний — тихо и по-человечески.',
        theme_color: '#F5F5F7',
        background_color: '#F5F5F7',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ru',
        scope: '/',
        start_url: '/',
        // Иконки сгенерированы из public/dot-icon.svg через @vite-pwa/assets-generator.
        // Перегенерация: `npx pwa-assets-generator` (см. pwa-assets.config.js).
        icons: [
          { src: 'pwa-64x64.png',         sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',       sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',       sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      // Стратегия SW: precache всё, что собрал Vite (HTML/JS/CSS/SVG),
      // плюс runtime-cache для шрифтов Google и Supabase-запросов.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Google Fonts стили — cache-first (раз в неделю обновляем)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Шрифтовые файлы — cache-first навсегда
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase API — network-first: онлайн всегда свежее, офлайн отдаём кэш
            urlPattern: ({ url }) => url.host.endsWith('.supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,           // 0.0.0.0 — чтобы ngrok / телефон в LAN могли достучаться
    port: 5173,
    strictPort: false,
    // Vite по умолчанию блокирует Host-заголовки от ngrok (CVE-2025-mosaic).
    // Разрешаем все *.ngrok-free.app / *.ngrok.app поддомены для dev-туннеля.
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io', '.ngrok.dev'],
  },
});
