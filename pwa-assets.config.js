// Конфиг генератора PWA-иконок и iOS-сплешей.
// Запуск: `npx pwa-assets-generator`
//
// Берёт public/dot-icon.svg как источник.
// Рендерит:
//   - favicon.ico, favicon.svg, apple-touch-icon-180.png
//   - pwa-64/192/512.png + maskable-icon-512 (для манифеста)
//   - apple-splash-{w}x{h}.png × N (для каждого размера экрана iPhone/iPad)
//
// При запуске печатает в консоль <link rel="apple-touch-startup-image"> теги —
// их надо вставить в index.html.

import {
  defineConfig,
  minimal2023Preset,
  createAppleSplashScreens,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.35,
        // Светлая тема: белый фон под три точки. Совпадает с --bg.
        resizeOptions:     { background: '#F5F5F7', fit: 'contain' },
        // Тёмная тема: чёрный фон. iOS подхватит автоматически по prefers-color-scheme.
        darkResizeOptions: { background: '#000000', fit: 'contain' },
        linkMediaOptions: {
          log: true,
          addMediaScreen: true,
          basePath: '/',
          xhtml: false,
        },
      },
      // Покрываем актуальные iPhone/iPad. Старые модели можно добавить
      // по списку https://github.com/elegantapp/pwa-asset-generator/blob/master/src/predefined-resources.ts
      // Список из appleSplashScreenSizes генератора (проверенные имена).
      // Покрывает все актуальные iPhone и iPad. iOS Safari сам выбирает
      // подходящий media-query по rectangle экрана.
      ['iPad Air 9.7"', 'iPad Pro 11"', 'iPad Pro 12.9"',
       'iPhone 8', 'iPhone 8 Plus', 'iPhone X',
       'iPhone XR', 'iPhone XS Max', 'iPhone 12 Pro'],
    ),
  },
  images: ['public/dot-icon.svg'],
});
