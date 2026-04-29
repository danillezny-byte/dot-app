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

window.React = React;
window.ReactDOM = { createRoot };

// Порядок импорта зеркалит app.html (старая HTML-точка входа).
// Менять его нельзя: IIFE-файлы (settings-deep2, pickers, note-blocks)
// читают `const { IconX } = window` на самом старте — иконки должны
// быть зарегистрированы раньше.
async function loadAll() {
  await import('./dot/tokens.jsx');
  await import('./dot/live.jsx');
  await import('./dot/icons.jsx');
  await import('./dot/phone.jsx');
  await import('./dot/keyboard.jsx');
  await import('./dot/composers.jsx');
  await import('./dot/settings.jsx');
  await import('./dot/auth.jsx');
  await import('./dot/onboarding.jsx');
  await import('./dot/app-screens.jsx');
  await import('./dot/flow-diagram.jsx');
  await import('./dot/composer-variants.jsx');
  await import('./dot/settings-deep.jsx');
  await import('./dot/settings-deep2.jsx');
  await import('./dot/task-pickers.jsx');
  await import('./dot/habit-pickers.jsx');
  await import('./dot/profile-screens.jsx');
  await import('./dot/verify-email.jsx');
  await import('./dot/note-editor.jsx');
  await import('./dot/note-blocks.jsx');
}

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
      if (user && (screen === 'login' || screen === 'register')) setScreen('home');
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

loadAll().then(() => {
  createRoot(document.getElementById('root')).render(<LiveApp />);
}).catch((err) => {
  console.error('[dot] Не удалось загрузить модули:', err);
  document.getElementById('root').innerHTML =
    `<div style="padding:24px;font-family:system-ui;color:#E44">Ошибка загрузки модулей. Смотри консоль.</div>`;
});
