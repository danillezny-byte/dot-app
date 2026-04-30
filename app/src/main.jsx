// app/src/main.jsx — точка входа Vite-сборки.
//
// Что это, по-дизайнерски: главный артборд, который собирает все
// компоненты из dot/* (как frame с инстансами компонентов из библиотеки)
// и запускает их на устройстве.
//
// Зачем шимы window.React / window.ReactDOM:
// файлы dot/*.jsx написаны для старой среды (babel-standalone + CDN),
// где React и ReactDOM были глобалами. Чтобы не переписывать
// все 19 файлов, мы кладём те же глобалы из npm-пакетов на window
// ДО того, как код dot/* начнёт исполняться. Динамические `import()`
// гарантируют этот порядок (статические `import` хойстятся выше).
//
// Когда пройдёт мобильный тест и переедем в корень — заменим эти
// dynamic-импорты на честные именованные `import { Login } from './dot/auth'`.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Static-импорты dot/*-модулей. Порядок важен: IIFE-файлы (settings-deep2,
// pickers, note-blocks) читают `const { IconX } = window` на самом старте —
// иконки должны быть инициализированы раньше. Vite/Rollup сохраняют этот
// порядок при сборке, потому что каждый импорт — side-effect-only.
//
// После того как все IIFE-файлы будут размотаны (Phase 3), эти импорты можно
// будет переставить в произвольном порядке (или вообще делегировать
// Vite-трекингу зависимостей через статический анализ).
import './dot/tokens.jsx';
import './dot/live.jsx';
import './dot/icons.jsx';
import './dot/phone.jsx';
import './dot/keyboard.jsx';
import './dot/composers.jsx';
import './dot/settings.jsx';
import './dot/auth.jsx';
import './dot/onboarding.jsx';
import './dot/app-screens.jsx';
// flow-diagram.jsx — наследие figma-canvas, не нужен в live-режиме.
// import './dot/flow-diagram.jsx';
import './dot/composer-variants.jsx';
import './dot/settings-deep.jsx';
import './dot/settings-deep2.jsx';
import './dot/task-pickers.jsx';
import './dot/habit-pickers.jsx';
import './dot/profile-screens.jsx';
import './dot/verify-email.jsx';
import './dot/note-editor.jsx';
import './dot/note-blocks.jsx';

// Шим window.React оставляем — IIFE-файлы могут где-то опираться на глобал,
// + некоторые легаси-обращения (window.live доступ через window.React.useState).
window.React = React;
window.ReactDOM = { createRoot };

// LiveApp — корневой компонент. Логика 1-в-1 как в app.html (script type=text/babel),
// просто перенесена в JSX-модуль.
function LiveApp() {
  const { useState, useEffect } = React;
  const [screen, setScreen] = useState('login');
  const [homeTab, setHomeTab] = useState(localStorage.getItem('dot-start-tab') || 'tasks');

  const goTo = (s) => {
    if (s === 'migration') return setScreen('home');
    const isProfileSub = s === 'profile-edit' || s === 'profile-sub' || s === 'profile-help' || s === 'settings' || s === 'plans';
    if (isProfileSub) setHomeTab('me');
    setScreen(s);
  };
  const props = { onGo: goTo, live: true };

  useEffect(() => {
    if (!window.live) return;
    window.live.getUser().then((user) => {
      if (user && (screen === 'login' || screen === 'register')) {
        // Уже залогинен (например, переоткрыл вкладку): если ещё не видел
        // onboarding на этом устройстве — показываем, иначе сразу в home.
        setScreen(window.dotShouldOnboard?.() ? 'onboarding' : 'home');
      }
    });
  }, []);

  const back = () => setScreen('home');

  // Эти компоненты приходят из dot/* через window-globals (как в babel-standalone).
  const { Login, Register, Reset, Onboarding, Migration, Home, Plans,
          ProfileEdit, SubscriptionManage, HelpSupport } = window;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflowY: 'auto' }}>
      {screen === 'login'        && <Login {...props} />}
      {screen === 'register'     && <Register {...props} />}
      {screen === 'reset'        && <Reset {...props} />}
      {screen === 'onboarding'   && <Onboarding {...props} />}
      {screen === 'migration'    && <Migration {...props} />}
      {screen === 'home'         && <Home {...props} initialTab={homeTab} key={homeTab} />}
      {screen === 'plans'        && <Plans {...props} />}
      {screen === 'profile-edit' && <ProfileEdit live onBack={back} />}
      {screen === 'profile-sub'  && <SubscriptionManage onBack={back} />}
      {screen === 'profile-help' && <HelpSupport onBack={back} />}
      {screen === 'settings'     && <SettingsLive onBack={back} />}
    </div>
  );
}

// Settings со встроенной навигацией index ↔ detail — как было в app.html
function SettingsLive({ onBack }) {
  const { useState } = React;
  const [id, setId] = useState('index');
  const { SettingsIndex, SettingsDetail, IconChevronLeft } = window;

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
