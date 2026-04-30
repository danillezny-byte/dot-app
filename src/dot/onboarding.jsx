import React from 'react';
import { IconSparkles, IconTarget, IconShield, IconCheck, IconRefresh } from './icons.jsx';
import { Button } from './phone.jsx';
import { live, dotMarkOnboarded } from './live.jsx';
// Onboarding (3 steps) + Migration dialog.

const { useState: useStateO } = React;

const STEPS = [
  {
    eyebrow: 'Шаг 1 из 3',
    title: 'Добро пожаловать в dot.',
    body: 'Минималистичное место для задач, привычек и личной базы знаний — одно для всех устройств.',
    Icon: IconSparkles,
  },
  {
    eyebrow: 'Шаг 2 из 3',
    title: 'Одна цель в день',
    body: 'Выделяйте одну задачу как главную. Остальные — поддерживают. Привычки помогают делать это изо дня в день.',
    Icon: IconTarget,
  },
  {
    eyebrow: 'Шаг 3 из 3',
    title: 'Везде под рукой',
    body: 'Ваши данные шифруются и синхронизируются между iPhone, Mac и браузером. Можно продолжить работу в любой момент.',
    Icon: IconShield,
  },
];

function Onboarding({ onGo }) {
  const [step, setStep] = useStateO(0);
  const cur = STEPS[step];

  // finish — единая точка выхода. Ставит флаг чтобы при следующем логине
  // приветствие не показывалось, и идёт в home минуя Migration (тот
  // показывает мок-числа 24/6/12, для реальных новых юзеров — путаница).
  // Параллельно создаёт «Инбокс» — дефолтное пространство в Базе с welcome-
  // страницей. Идемпотентно: если у юзера уже есть пространства, не трогает.
  // Не блокируем переход — вкладку Базы юзер откроет позже, к тому моменту
  // создание уже отработает.
  const finish = () => {
    dotMarkOnboarded?.();
    live?.createSmartInbox?.().catch((e) => console.warn('[dot] inbox failed', e));
    onGo && onGo('home');
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  return (
    <div style={{ padding: '64px 32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'grid', placeItems: 'center', marginBottom: 28,
        }}><cur.Icon size={36} strokeWidth={1.5} /></div>

        <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>{cur.eyebrow}</div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 14px', lineHeight: 1.12 }}>{cur.title}</h1>
        <p style={{ color: 'var(--sub)', fontSize: 16, margin: 0, lineHeight: 1.5, maxWidth: 320 }}>{cur.body}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i === step ? 'var(--accent)' : 'var(--line)',
            transition: 'all 220ms',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button kind="primary" full onClick={next}>{step < STEPS.length - 1 ? 'Далее' : 'Начать'}</Button>
        {step < STEPS.length - 1 && (
          <button onClick={finish} style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 14, cursor: 'pointer', padding: 12, fontFamily: 'inherit' }}>Пропустить</button>
        )}
      </div>
    </div>
  );
}

// ── MIGRATION DIALOG ──────────────────────────────────────────
function Migration({ onGo }) {
  const [state, setState] = useStateO('ask'); // ask | syncing | done

  const start = () => {
    setState('syncing');
    setTimeout(() => setState('done'), 1800);
  };

  return (
    <div style={{ padding: '48px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'grid', placeItems: 'center', marginBottom: 24,
        }}>
          {state === 'done' ? (
            <IconCheck size={30} strokeWidth={2.2} />
          ) : (
            <div style={{ animation: state === 'syncing' ? 'dot-spin 1.4s linear infinite' : 'none' }}>
              <IconRefresh size={30} strokeWidth={1.75} />
            </div>
          )}
          <style>{`@keyframes dot-spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {state === 'ask' && (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 10px', lineHeight: 1.18 }}>Мы нашли локальные данные</h1>
            <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>На этом устройстве уже есть задачи, привычки и заметки. Перенести их в облако вашего аккаунта?</p>
            <div style={{ marginTop: 20, padding: 14, borderRadius: 14, background: 'var(--chip)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--sub)' }}>Задачи</span><span>24</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--sub)' }}>Привычки</span><span>6</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--sub)' }}>Заметки в базе</span><span>12</span></div>
            </div>
          </>
        )}
        {state === 'syncing' && (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 10px' }}>Переносим данные…</h1>
            <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0 }}>Это займёт несколько секунд.</p>
          </>
        )}
        {state === 'done' && (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 10px' }}>Всё готово</h1>
            <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0 }}>42 объекта перенесены. Теперь ваши данные доступны с любого устройства.</p>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state === 'ask' && (
          <>
            <Button kind="primary" full onClick={start}>Перенести в облако</Button>
            <Button kind="ghost" full onClick={() => onGo && onGo('home')}>Начать с чистого листа</Button>
          </>
        )}
        {state === 'done' && (
          <Button kind="primary" full onClick={() => onGo && onGo('home')}>Перейти в dot.</Button>
        )}
      </div>
    </div>
  );
}

// Statless single-step card — used in Design Canvas to показать все три состояния
function OnboardingStep({ step = 0 }) {
  const cur = STEPS[step];
  return (
    <div style={{ padding: '64px 32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'grid', placeItems: 'center', marginBottom: 28,
        }}><cur.Icon size={36} strokeWidth={1.5} /></div>
        <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>{cur.eyebrow}</div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 14px', lineHeight: 1.12 }}>{cur.title}</h1>
        <p style={{ color: 'var(--sub)', fontSize: 16, margin: 0, lineHeight: 1.5, maxWidth: 320 }}>{cur.body}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i === step ? 'var(--accent)' : 'var(--line)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button kind="primary" full>{step < STEPS.length - 1 ? 'Далее' : 'Продолжить'}</Button>
        {step < STEPS.length - 1 && (
          <button style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 14, padding: 12, fontFamily: 'inherit' }}>Пропустить</button>
        )}
      </div>
    </div>
  );
}

export { Onboarding, Migration, OnboardingStep };
