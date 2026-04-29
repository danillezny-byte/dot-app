// Конфиг генератора PWA-иконок.
// Запуск: `npx pwa-assets-generator`
//
// Берёт public/dot-icon.svg как источник, рендерит все размеры
// (favicon, apple-touch-icon, maskable, transparent) в public/.
// Manifest в vite.config.js ссылается на эти файлы.

import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/dot-icon.svg'],
});
