# dot.

Минималистичный таск-менеджер с привычками и личной базой знаний.
Тихо, по-человечески, без шума.

**Production:** [dot-app-gold.vercel.app](https://dot-app-gold.vercel.app/)
**Платформа:** мобильная PWA (iOS / Android, устанавливается на homescreen)
**Десктоп:** работает в браузере, но второстепенен — все экраны оптимизированы под телефон.

## Стек

- **Vite 7** + React 19 — клиент
- **Supabase** — auth, Postgres, Storage, Row-Level Security
- **vite-plugin-pwa** — Service Worker, манифест, оффлайн-кэш
- **Vercel** — хостинг + автодеплой из `main`

## Запуск локально

```bash
npm install
npm run dev          # http://localhost:5173
```

Перед первым запуском нужен `.env.local` в корне:

```ini
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Образец — в `.env.example`. Анон-ключ публичный по дизайну: вся защита данных в БД через Row-Level Security.

### Полезные скрипты

```bash
npm run build        # production-сборка → dist/
npm run preview      # локальный сервер для dist/
npm run lint         # ESLint
npx pwa-assets-generator --override   # перегенерация иконок из public/dot-icon.svg
```

## Структура

```
dot-app/
├── src/
│   ├── main.jsx              # точка входа (BootShell, ErrorBoundary, code-splitting)
│   └── dot/                  # 19 модулей UI
│       ├── live.jsx          # Supabase API + кэш + dotErr/dotToast/dotHaptic
│       ├── icons.jsx         # Lucide icon set
│       ├── phone.jsx         # Button, Field, Logo, Card — базовые примитивы
│       ├── auth.jsx          # Login / Register / Reset
│       ├── onboarding.jsx    # 3 шага welcome для новых юзеров
│       ├── app-screens.jsx   # Home, Tasks, Habits, Base, Profile (главное)
│       ├── settings.jsx      # настройки аккаунта/синхронизации/о приложении
│       ├── note-editor.jsx   # редактор страниц Базы (Notion-like)
│       └── …                 # composers, pickers, deep-settings и т.д.
├── public/                   # статика: favicon, PWA-иконки, manifest, privacy/terms
├── backend/                  # SQL-миграции Supabase (запускать руками в SQL Editor)
├── legacy/                   # архив babel-standalone прототипа (dot/, app.html и др.)
├── scripts/                  # утилиты (генератор экспортов, переводов и т.п.)
├── .env.local                # (не в git) Supabase ключи
├── vite.config.js            # ngrok hosts, PWA-плагин
└── pwa-assets.config.js      # настройки генератора иконок
```

## Деплой

- **Auto:** push в `main` → Vercel пересобирает → live на `dot-app-gold.vercel.app`.
- **Vercel root**: `./` (после переноса с `app/` в коммите [`d9e8127`](https://github.com/danillezny-byte/dot-app/commit/d9e8127))
- **Env vars в Vercel:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Supabase Auth → URL Configuration:** в Redirect URLs добавлены `https://*.vercel.app/**`, `http://localhost:5173/**` для логина

## Тестовые юзеры

Формат `test+N@gmail.com`, пароль `Test12345!`. Очистка SQL:

```sql
delete from auth.users where email like 'test+%@gmail.com';
```

## Что важно знать

- **Mobile-first.** Все экраны оптимизированы под узкую колонку. Hover-эффекты не используются как основное взаимодействие. Для тестов на телефоне через локальный dev — `ngrok http 5173`.
- **Service Worker автоматически кеширует** всё после первого захода. Чтобы увидеть свежий деплой — закрыть все вкладки сайта (или DevTools → Application → Service Workers → Unregister).
- **localStorage warm cache** — задачи/привычки/спейсы/страницы/профиль/streak показываются мгновенно из локального кэша при следующем заходе, потом тихо обновляются.
- **Haptic feedback** работает только в установленной PWA на iOS (Apple by-design блокирует `navigator.vibrate` в Safari).
- **Google OAuth** требует включения провайдера в Supabase Dashboard и настройки credentials в Google Cloud Console.

## Архив `legacy/`

В `legacy/dot/` лежит babel-standalone прототип (19 .jsx файлов, ~11k строк) — стартовая точка проекта до миграции на Vite. В `legacy/*.html` — figma-export канвасы (`dot-figma-export.html`, `dot-redesign.html` и др.). Используется как референс, не запускается в проде.

## Лицензия

Не определена пока.
