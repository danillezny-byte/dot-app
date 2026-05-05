// src/main.jsx — точка входа Vite-сборки.
//
// Что это по-дизайнерски: главный артборд, собирающий компоненты из
// src/dot/ (как frame с инстансами компонентов библиотеки) и
// запускающий их в браузере.
//
// После Phase 5 ESM-миграции — чистый ESM. Никаких window.* шимов,
// никаких side-effect imports. Vite сам строит dep-graph через named
// imports.

import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';

// ── Eager imports: нужны для первого рендера ─────────────────────
// Login/Register/Reset — потенциально первый экран что юзер видит,
// нет смысла дробить.
import { Login, Register, Reset } from './dot/auth.jsx';
import { IconChevronLeft } from './dot/icons.jsx';
import { live, dotShouldOnboard, hasStoredSession } from './dot/live.jsx';

// ── Lazy imports: пост-логин экраны выносятся в отдельные чанки ──
// Vite/Rollup создаёт отдельный JS-файл на каждый dynamic import().
// Бандл при первом заходе (логин-флоу) сильно меньше — на мобильном CPU
// LCP падает с ~4с в зелёную зону. Чанки догружаются по необходимости.
const Onboarding = lazy(() => import('./dot/onboarding.jsx').then((m) => ({ default: m.Onboarding })));
const Migration  = lazy(() => import('./dot/onboarding.jsx').then((m) => ({ default: m.Migration })));
const Home       = lazy(() => import('./dot/app-screens.jsx').then((m) => ({ default: m.Home })));
const Plans      = lazy(() => import('./dot/app-screens.jsx').then((m) => ({ default: m.Plans })));
const ProfileEdit         = lazy(() => import('./dot/profile-screens.jsx').then((m) => ({ default: m.ProfileEdit })));
const SubscriptionManage  = lazy(() => import('./dot/profile-screens.jsx').then((m) => ({ default: m.SubscriptionManage })));
const HelpSupport         = lazy(() => import('./dot/profile-screens.jsx').then((m) => ({ default: m.HelpSupport })));
const SettingsIndex  = lazy(() => import('./dot/settings.jsx').then((m) => ({ default: m.SettingsIndex })));
const SettingsDetail = lazy(() => import('./dot/settings.jsx').then((m) => ({ default: m.SettingsDetail })));

// Простой fallback — пока подгружается чанк, показываем тихий пульс
// (тот же что в SplashShell). На скорости ~50KB-чанка это 50-200мс.
function SuspenseFallback() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 12, animation: 'dot-pulse 1.4s ease-in-out infinite' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text)' }} />
      </div>
    </div>
  );
}

// LiveApp — корневой компонент. Логика 1-в-1 как в app.html (script type=text/babel),
// просто перенесена в JSX-модуль.
function LiveApp() {
  const { useState, useEffect } = React;
  // Если в localStorage уже лежит токен Supabase — стартуем сразу с home.
  // Без этого был flash экрана логина при каждом открытии (~200-400мс
  // пока async getUser завершится). Реальная валидация токена идёт в
  // useEffect ниже — если токен протух, нас выкинет назад на login.
  const initialScreen = hasStoredSession()
    ? (dotShouldOnboard?.() ? 'onboarding' : 'home')
    : 'login';
  const [screen, setScreen] = useState(initialScreen);
  const [homeTab, setHomeTab] = useState(localStorage.getItem('dot-start-tab') || 'tasks');

  const goTo = (s) => {
    if (s === 'migration') return setScreen('home');
    const isProfileSub = s === 'profile-edit' || s === 'profile-sub' || s === 'profile-help' || s === 'settings' || s === 'plans';
    if (isProfileSub) setHomeTab('me');
    setScreen(s);
  };
  const props = { onGo: goTo, live: true };

  useEffect(() => {
    // Валидируем сессию в фоне. Если токен оказался протухшим — вернёмся
    // на login. Если жив — оставляем как есть (мы уже стартовали с home
    // через hasStoredSession-fast-path).
    live.getUser().then((user) => {
      if (!user && screen !== 'login' && screen !== 'register' && screen !== 'reset') {
        setScreen('login');
      } else if (user && (screen === 'login' || screen === 'register')) {
        setScreen(dotShouldOnboard?.() ? 'onboarding' : 'home');
      }
    });
  }, []);

  const back = () => setScreen('home');

  // Home сама управляет padding-top (DotHeader включает safe-area-inset-top).
  // Остальные экраны не имеют sticky-шапки — добавляем padding-top на LiveApp
  // wrapper чтобы их контент не лез под notch + status-bar overlay.
  const needsTopSafeArea = screen !== 'home';
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      position: 'relative', overflowY: 'auto',
      paddingTop: needsTopSafeArea ? 'env(safe-area-inset-top)' : 0,
    }}>
      {/* Login/Register/Reset рендерятся синхронно (eager-imported) — ноль ожидания. */}
      {screen === 'login'        && <Login {...props} />}
      {screen === 'register'     && <Register {...props} />}
      {screen === 'reset'        && <Reset {...props} />}
      {/* Остальные экраны лениво подгружаются — Suspense даёт fallback пока качается чанк. */}
      <Suspense fallback={<SuspenseFallback />}>
        {screen === 'onboarding'   && <Onboarding {...props} />}
        {screen === 'migration'    && <Migration {...props} />}
        {screen === 'home'         && <Home {...props} initialTab={homeTab} key={homeTab} />}
        {screen === 'plans'        && <Plans {...props} />}
        {screen === 'profile-edit' && <ProfileEdit live onBack={back} />}
        {screen === 'profile-sub'  && <SubscriptionManage onBack={back} />}
        {screen === 'profile-help' && <HelpSupport onBack={back} />}
        {screen === 'settings'     && <SettingsLive onBack={back} />}
      </Suspense>
    </div>
  );
}

// Settings со встроенной навигацией index ↔ detail — как было в app.html
function SettingsLive({ onBack }) {
  const { useState } = React;
  const [id, setId] = useState('index');

  if (id === 'index') {
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
            <IconChevronLeft size={22} strokeWidth={1.75} />
          </button>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Настройки</div>
        </div>
        <SettingsIndex onEnter={(rowId) => setId(rowId)} />
      </div>
    );
  }
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <SettingsDetail id={id} onBack={() => setId('index')} />
    </div>
  );
}

// ErrorBoundary — ловит любой неперехваченный рендер-эксепшен в дереве LiveApp
// и показывает дружелюбный экран вместо белого. По дизайн-аналогии: это как
// «assets/error-state» frame, который показываем когда инстанс компонента сломался.
//
// React 19 для error boundary всё ещё требует class component — хук-API нет.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[dot] Поймал краш в дереве:', error, info);
    // Сюда же позже можно подцепить Sentry/PostHog
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px', textAlign: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>·····</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Что-то пошло не так</div>
          <div style={{ fontSize: 14, color: 'var(--sub)', maxWidth: 320, lineHeight: 1.5 }}>
            Где-то в коде икнуло. Перезагрузи приложение, обычно помогает. Если повторяется — пинговать разработчика.
          </div>
          <button
            onClick={() => location.reload()}
            style={{
              marginTop: 8, padding: '12px 28px', borderRadius: 12, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Перезагрузить
          </button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: 24, fontSize: 12, color: 'var(--sub)', textAlign: 'left', maxWidth: 480 }}>
              <summary style={{ cursor: 'pointer' }}>Подробности (dev only)</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 8 }}>
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// BootShell — корневой компонент. Раньше был с loadAll/ready/splash,
// потому что dot/*-модули грузились динамически. После Phase 2 ESM-миграции
// все импорты статичные, к моменту render() ВСЕ модули уже исполнились
// и зарегистрировались (window.live, window.React, etc). Splash больше
// не нужен — рендерим LiveApp сразу.
//
// SpeedInsights остаётся в boot — он подхватывает Web Vitals (FCP/LCP/TTFB)
// с самого старта, иначе метрики были бы потеряны.
function BootShell() {
  return (
    <ErrorBoundary>
      <SpeedInsights />
      <LiveApp />
    </ErrorBoundary>
  );
}

// Singleton root — иначе Vite HMR при каждом обновлении модуля зовёт createRoot
// заново, и React 19 ругается «container already passed to createRoot».
const rootEl = document.getElementById('root');
const root = window.__dotRoot || (window.__dotRoot = createRoot(rootEl));
root.render(<BootShell />);
