import React from 'react';
// Auth flow screens — Login, Register, Reset, Onboarding, Migration dialog.

const { useState: useStateA } = React;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.33A9 9 0 009 18z" fill="#34A853"/>
      <path d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.92A9 9 0 000 9c0 1.45.35 2.82.92 4.05l3.05-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.92 4.95l3.05 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor">
      <path d="M14.8 10.6c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.7-2.1-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.3 1.9 2.6 3.3 2.6 1.3 0 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.2-2.6.7-1 1-1.5 1.5-2.6-3.9-1.5-3.2-4.9-3.2-4zM12.6 2.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.2.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.1.1 2.2-.6 3-1.5z"/>
    </svg>
  );
}

// ── LOGIN ──────────────────────────────────────────────────
function Login({ onGo, live }) {
  const [email, setEmail] = useStateA('');
  const [pwd, setPwd] = useStateA('');
  const [show, setShow] = useStateA(false);
  const [err, setErr] = useStateA('');
  const [busy, setBusy] = useStateA(false);

  const submit = async () => {
    if (!email.includes('@')) { setErr('Введите корректный email'); return; }
    if (pwd.length < 6) { setErr('Пароль короче 6 символов'); return; }
    setErr('');
    if (live && window.live) {
      setBusy(true);
      const { error } = await window.live.signIn(email.trim(), pwd);
      setBusy(false);
      if (error) { setErr(window.dotErr(error) || 'Не удалось войти'); return; }
    }
    // Если юзер на этом устройстве ещё не проходил onboarding (например,
    // зарегистрировался на другом устройстве и впервые тут логинится) —
    // показываем приветствие. Иначе — сразу в home.
    onGo && onGo(window.dotShouldOnboard?.() ? 'onboarding' : 'home');
  };

  return (
    <div style={{ padding: '48px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Logo size={28} />
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: '36px 0 6px', lineHeight: 1.15 }}>С возвращением</h1>
      <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, marginBottom: 28 }}>Войдите, чтобы продолжить работу с задачами, привычками и базой.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mail.com" />
        <Field
          label="Пароль"
          type={show ? 'text' : 'password'}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Не меньше 6 символов"
          error={err || null}
          trailing={
            <button onClick={() => setShow(!show)} style={{ border: 'none', background: 'none', color: 'var(--sub)', fontSize: 13, cursor: 'pointer', padding: 4 }}>
              {show ? 'Скрыть' : 'Показать'}
            </button>
          }
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
          <Button kind="plain" onClick={() => onGo && onGo('reset')}>Забыли пароль?</Button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button kind="primary" full onClick={submit} disabled={busy}>{busy ? 'Входим…' : 'Войти'}</Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{ fontSize: 12, color: 'var(--sub)' }}>или</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button kind="ghost" full onClick={async () => {
          const res = await window.live.signInWithGoogle();
          if (res?.error) window.dotToast(window.dotErr(res.error) || 'Не удалось войти через Google', 'error');
          // При успехе Supabase сам редиректит на accounts.google.com,
          // потом обратно на origin — в этот момент LiveApp заметит сессию через getUser().
        }}><GoogleIcon /> Продолжить с Google</Button>
        {/* Apple Sign In вернётся когда купим Apple Developer ($99/год) */}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', justifyContent: 'center', gap: 6, fontSize: 14 }}>
        <span style={{ color: 'var(--sub)' }}>Нет аккаунта?</span>
        <button onClick={() => onGo && onGo('register')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 14 }}>Создать</button>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────
function Register({ onGo, live }) {
  const [name, setName] = useStateA('');
  const [email, setEmail] = useStateA('');
  const [pwd, setPwd] = useStateA('');
  const [agree, setAgree] = useStateA(true);
  const [err, setErr] = useStateA('');
  const [busy, setBusy] = useStateA(false);

  const strength = pwd.length < 6 ? 0 : pwd.length < 10 ? 1 : /[0-9]/.test(pwd) ? 2 : 1;
  const strengthLabels = ['Слабый', 'Средний', 'Надёжный'];
  const strengthColors = ['#E44', '#F2A93B', '#2E8B57'];

  const canSubmit = name && email.includes('@') && pwd.length >= 6 && agree && !busy;

  const submit = async () => {
    setErr('');
    if (live && window.live) {
      setBusy(true);
      const { session, error } = await window.live.signUp(email.trim(), pwd, name);
      setBusy(false);
      if (error) { setErr(window.dotErr(error) || 'Не удалось зарегистрироваться'); return; }
      if (!session) {
        setErr('Аккаунт создан, но требуется подтверждение email. Проверьте почту.');
        return;
      }
    }
    onGo && onGo('onboarding');
  };

  return (
    <div style={{ padding: '48px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
        <button onClick={() => onGo && onGo('login')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer' }}>
          <IconChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <Logo size={22} />
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 6px', lineHeight: 1.15 }}>Создать аккаунт</h1>
      <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, marginBottom: 24 }}>30 секунд — и ваши данные будут синхронизироваться между устройствами.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Имя" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mail.com" />
        <div>
          <Field label="Пароль" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Минимум 6 символов" />
          {pwd && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(strength + 1) * 33}%`, background: strengthColors[strength], transition: 'width 200ms, background 200ms' }} />
              </div>
              <span style={{ fontSize: 12, color: strengthColors[strength], fontWeight: 500 }}>{strengthLabels[strength]}</span>
            </div>
          )}
        </div>
      </div>

      <label style={{ display: 'flex', gap: 10, marginTop: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
        <Checkbox checked={agree} onChange={() => setAgree(!agree)} />
        <span>Согласен с <span style={{ color: 'var(--accent)' }}>условиями</span> и <span style={{ color: 'var(--accent)' }}>политикой конфиденциальности</span>.</span>
      </label>

      {err && <div style={{ marginTop: 12, fontSize: 13, color: '#E44', lineHeight: 1.4 }}>{err}</div>}

      <div style={{ marginTop: 18 }}>
        <Button kind="primary" full disabled={!canSubmit} onClick={submit}>{busy ? 'Создаём…' : 'Создать аккаунт'}</Button>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--sub)' }}>
        Уже есть аккаунт? <button onClick={() => onGo && onGo('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 13 }}>Войти</button>
      </div>
    </div>
  );
}

// ── RESET ──────────────────────────────────────────────────
function Reset({ onGo, live }) {
  const [email, setEmail] = useStateA('');
  const [sent, setSent] = useStateA(false);
  const [err, setErr] = useStateA('');
  const [busy, setBusy] = useStateA(false);

  const submit = async () => {
    setErr('');
    if (live && window.live) {
      setBusy(true);
      const { error } = await window.live.resetPassword(email.trim());
      setBusy(false);
      if (error) { setErr(window.dotErr(error) || 'Не удалось отправить ссылку'); return; }
    }
    setSent(true);
  };

  return (
    <div style={{ padding: '48px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
        <button onClick={() => onGo && onGo('login')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer' }}>
          <IconChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <Logo size={22} />
      </div>

      {!sent ? (
        <>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 6px', lineHeight: 1.15 }}>Восстановить пароль</h1>
          <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, marginBottom: 24 }}>Мы отправим ссылку на указанный email.</p>
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mail.com" error={err || null} />
          <div style={{ marginTop: 18 }}>
            <Button kind="primary" full disabled={!email.includes('@') || busy} onClick={submit}>{busy ? 'Отправляем…' : 'Отправить ссылку'}</Button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--accent-soft)', margin: '0 auto 18px', display: 'grid', placeItems: 'center' }}>
            <IconMail size={26} color="var(--accent)" strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>Письмо отправлено</h2>
          <p style={{ color: 'var(--sub)', fontSize: 14, margin: 0, marginBottom: 24 }}>Мы отправили ссылку на <b style={{ color: 'var(--text)' }}>{email}</b>. Перейдите по ней, чтобы задать новый пароль.</p>
          <Button kind="ghost" onClick={() => onGo && onGo('login')}>Вернуться ко входу</Button>
        </div>
      )}
    </div>
  );
}

// Дуальный режим во время ESM-миграции: window для legacy, export для нового кода.
Object.assign(window, { GoogleIcon, AppleIcon, Login, Register, Reset });
export { GoogleIcon, AppleIcon, Login, Register, Reset };
