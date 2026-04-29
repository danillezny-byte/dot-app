// Профильные экраны: редактирование профиля и управление подпиской.

const { useState: useStatePS } = React;

function ProfileEdit({ onBack, live, initial }) {
  const [name, setName] = useStatePS(initial?.name ?? (live ? '' : 'Алиса Королёва'));
  const [email, setEmail] = useStatePS(initial?.email ?? (live ? '' : 'alice@mail.com'));
  const [originalEmail, setOriginalEmail] = useStatePS(initial?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useStatePS(null);
  const [theme, setThemeS] = useStatePS(typeof window !== 'undefined' && window.dotTheme ? window.dotTheme.get() : 'light');
  const [busy, setBusy] = useStatePS(false);
  const [emailMsg, setEmailMsg] = useStatePS(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    if (!live || !window.live) return;
    let cancelled = false;
    (async () => {
      const { profile } = await window.live.loadProfile();
      if (cancelled || !profile) return;
      setName(profile.name || (profile.email || '').split('@')[0]);
      setEmail(profile.email);
      setOriginalEmail(profile.email);
      setAvatarUrl(profile.avatar_url || null);
    })();
    return () => { cancelled = true; };
  }, [live]);

  const initial1 = (name || email || '?').trim().charAt(0).toUpperCase();

  const setTheme = (t) => {
    setThemeS(t);
    if (window.dotTheme) window.dotTheme.set(t);
  };

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !live) return;
    setBusy(true);
    const { url, error } = await window.live.uploadAvatar(file);
    if (!error && url) {
      await window.live.updateProfile({ avatar_url: url });
      setAvatarUrl(url);
    } else if (error) {
      alert('Не удалось загрузить: ' + (error.message || ''));
    }
    setBusy(false);
  };

  const save = async () => {
    if (!live || !window.live || busy) { onBack && onBack(); return; }
    setBusy(true);
    await window.live.updateProfile({ name: name.trim() });
    if (email && email !== originalEmail) {
      const { error } = await window.live.updateAuthEmail(email.trim());
      if (error) {
        alert('Email: ' + error.message);
        setBusy(false);
        return;
      }
      setEmailMsg('Письмо подтверждения отправлено на новый email. Старый продолжит работать до подтверждения.');
      setBusy(false);
      return; // не закрываем — пусть прочтёт сообщение
    }
    setBusy(false);
    onBack && onBack();
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>Профиль</div>
        <button onClick={save} disabled={busy} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer', opacity: busy ? 0.5 : 1,
        }}>{busy ? '…' : 'Готово'}</button>
      </div>

      {/* Аватар */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 24px' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAvatarChange} />
        <div style={{
          width: 96, height: 96, borderRadius: 48,
          background: avatarUrl ? `center/cover no-repeat url(${avatarUrl})` : 'var(--accent)',
          color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 36, fontWeight: 600,
          position: 'relative',
        }}>
          {!avatarUrl && initial1}
          <button onClick={onPickAvatar} disabled={busy} style={{
            position: 'absolute', right: -4, bottom: -4,
            width: 32, height: 32, borderRadius: 16,
            background: 'var(--bg)', color: 'var(--accent)',
            border: '2px solid var(--bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>
            <IconCamera size={14} strokeWidth={1.9} />
          </button>
        </div>
        <button onClick={onPickAvatar} disabled={busy} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, marginTop: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
          {busy ? 'Загружаем…' : 'Изменить фото'}
        </button>
      </div>

      <EditSection title="Личные данные">
        <EditField label="Имя"   value={name}  onChange={setName} />
        <EditField label="Email" value={email} onChange={setEmail} />
      </EditSection>
      {emailMsg && (
        <div style={{ padding: '10px 24px', fontSize: 13, color: 'var(--accent)', lineHeight: 1.4 }}>{emailMsg}</div>
      )}

      <EditSection title="Тема">
        <ThemeRow value={theme} onChange={setTheme} />
      </EditSection>

      <EditSection title="Предпочтения">
        <StartTabRow />
      </EditSection>

    </div>
  );
}

// Стартовый экран — какая вкладка по умолчанию открывается. Хранится в localStorage.
function StartTabRow() {
  const TABS = [
    { id: 'tasks',  label: 'Задачи' },
    { id: 'habits', label: 'Привычки' },
    { id: 'base',   label: 'База' },
    { id: 'me',     label: 'Профиль' },
  ];
  const [tab, setTab] = useStatePS(localStorage.getItem('dot-start-tab') || 'tasks');
  const apply = (t) => {
    setTab(t);
    localStorage.setItem('dot-start-tab', t);
  };
  return (
    <div style={{ padding: '12px 24px 14px' }}>
      <div style={{ fontSize: 14, color: 'var(--sub)', marginBottom: 10 }}>Стартовый экран</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => apply(t.id)} style={{
            padding: '8px 14px', borderRadius: 10,
            background: tab === t.id ? 'var(--accent)' : 'var(--chip)',
            color: tab === t.id ? '#fff' : 'var(--text)',
            border: 'none', fontSize: 13, fontWeight: 500,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>
    </div>
  );
}

function ThemeRow({ value, onChange }) {
  const themes = [
    { id: 'light', label: 'Светлая', bg: '#F5F5F7', text: '#111' },
    { id: 'dark',  label: 'Тёмная',  bg: '#000000', text: '#FFF' },
    { id: 'warm',  label: 'Тёплая',  bg: '#F4F0E8', text: '#2A2418' },
  ];
  return (
    <div style={{ padding: '14px 24px', display: 'flex', gap: 10 }}>
      {themes.map((t) => {
        const sel = t.id === value;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, padding: '12px 8px', borderRadius: 14,
            border: sel ? '2px solid var(--accent)' : '2px solid transparent',
            background: t.bg, color: t.text,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: '0 0 0 1px rgba(60,60,67,0.12)',
          }}>
            <div style={{
              width: 44, height: 28, borderRadius: 6, background: t.id === 'dark' ? '#1C1C1E' : (t.id === 'warm' ? '#FBF8F1' : '#FFFFFF'),
              border: '1px solid rgba(60,60,67,0.15)',
            }} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function EditSection({ title, children }) {
  return (
    <>
      <div style={{ padding: '14px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>{title}</div>
      <div style={{ borderTop: '1px solid var(--line)' }}>{children}</div>
    </>
  );
}

function EditField({ label, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 24px', borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ fontSize: 14, color: 'var(--sub)', width: 80 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontSize: 15, color: 'var(--text)', fontFamily: 'inherit',
      }} />
    </div>
  );
}

function EditRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 24px', borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
      <span style={{ color: 'var(--sub)', fontSize: 14 }}>{value}</span>
    </div>
  );
}

// ─── Subscription management ─────────────────────────
// Минимальная живая логика: показываем текущий тариф, кнопкой
// можно переключиться (Free ⇄ Plus). Реальная оплата (Stripe и т.п.)
// — отдельная история; пока это «прототипный» переключатель.
function SubscriptionManage({ onBack }) {
  const [profile, setProfile] = useStatePS(null);
  const [busy, setBusy] = useStatePS(false);
  React.useEffect(() => {
    if (!window.live) return;
    window.live.loadProfile().then(({ profile }) => profile && setProfile(profile));
  }, []);

  const isPlus = profile?.plan === 'plus';

  const togglePlan = async () => {
    if (busy || !window.live) return;
    setBusy(true);
    const next = isPlus ? 'free' : 'plus';
    const { profile: updated, error } = await window.live.updatePlan(next);
    if (error) alert('Ошибка: ' + error.message);
    if (updated) setProfile(updated);
    setBusy(false);
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>Подписка</div>
      </div>

      {/* Карточка текущего тарифа */}
      <div style={{
        margin: '4px 24px 20px', padding: 20,
        borderRadius: 20,
        background: isPlus ? 'var(--accent)' : 'var(--chip)',
        color: isPlus ? '#fff' : 'var(--text)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', opacity: 0.9 }}>
          <IconStar size={14} strokeWidth={2.2} /> Текущий тариф
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, margin: '10px 0 6px', letterSpacing: -0.5 }}>{isPlus ? 'dot. Plus' : 'dot. Free'}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{isPlus ? 'Все функции, без лимитов' : 'Базовые функции'}</div>
      </div>

      {/* Что входит */}
      <EditSection title={isPlus ? 'Что доступно' : 'Что даст Plus'}>
        <PlanLine label="Задачи и привычки" yes />
        <PlanLine label="Заметки и страницы" yes />
        <PlanLine label="Синхронизация на всех устройствах" yes />
        <PlanLine label="Загрузка изображений" yes={isPlus || true /* пока разрешаем всем */} />
        <PlanLine label="История версий страниц" yes={isPlus} hint={isPlus ? '' : 'Только в Plus'} />
        <PlanLine label="Совместная работа" yes={isPlus} hint={isPlus ? '' : 'Только в Plus'} />
      </EditSection>

      <div style={{ padding: '24px 24px 8px' }}>
        <button onClick={togglePlan} disabled={busy} style={{
          width: '100%', height: 50, borderRadius: 14, border: 'none',
          background: isPlus ? 'transparent' : 'var(--accent)',
          color: isPlus ? '#E44' : '#fff',
          border: isPlus ? '1px solid var(--line)' : 'none',
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer', opacity: busy ? 0.6 : 1,
        }}>
          {busy ? '…' : (isPlus ? 'Отменить Plus' : 'Перейти на Plus')}
        </button>
      </div>

      <div style={{ padding: '14px 24px', fontSize: 12, color: 'var(--sub)', lineHeight: 1.5 }}>
        Это прототип. Платёжная система (Stripe / ЮКасса) — следующий этап. Сейчас переключатель работает «в один клик».
      </div>
    </div>
  );
}

function PlanLine({ label, yes, hint }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 24px', borderBottom: '1px solid var(--line)',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 11,
        background: yes ? 'var(--accent-soft)' : 'var(--chip)',
        color: yes ? 'var(--accent)' : 'var(--sub)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        {yes ? <IconCheck size={14} strokeWidth={2.5} /> : '•'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--sub)' }}>{hint}</div>}
      </div>
    </div>
  );
}

// ─── Payment method ───────────────────────────────────
function PaymentMethod({ onBack }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>Способ оплаты</div>
      </div>

      {/* Visual card */}
      <div style={{
        margin: '12px 24px 22px', padding: '20px 22px 22px',
        borderRadius: 18,
        background: 'linear-gradient(135deg, #1F2340 0%, #0B0E1F 100%)',
        color: '#fff',
        aspectRatio: '1.586 / 1',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            width: 38, height: 28, borderRadius: 5,
            background: 'linear-gradient(135deg, #F3C969 0%, #C48E2E 100%)',
          }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontStyle: 'italic', letterSpacing: -0.5, fontWeight: 700 }}>VISA</div>
        </div>
        <div>
          <div style={{ fontSize: 18, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}>
            •••• &nbsp; •••• &nbsp; •••• &nbsp; 4521
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.1 }}>
            <div>
              <div>Держатель</div>
              <div style={{ marginTop: 4, fontSize: 13, opacity: 1, letterSpacing: 0.5 }}>A. PETROVA</div>
            </div>
            <div>
              <div>Действует до</div>
              <div style={{ marginTop: 4, fontSize: 13, opacity: 1, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums' }}>09/28</div>
            </div>
          </div>
        </div>
      </div>

      <EditSection title="Карта по умолчанию">
        <EditRow label="Имя держателя" value="Anna Petrova" />
        <EditRow label="Номер карты" value="•• 4521" />
        <EditRow label="Срок действия" value="09/28" />
        <EditRow label="Адрес выставления" value="Москва, РФ" />
      </EditSection>

      <div style={{ padding: '18px 24px 0' }}>
        <button style={{
          width: '100%', padding: '13px 16px',
          background: 'var(--chip)', color: 'var(--text)', fontWeight: 500,
          border: 'none', borderRadius: 12, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          + Добавить другую карту
        </button>
      </div>

      <div style={{ padding: '18px 24px 0', fontSize: 12, color: 'var(--sub)', lineHeight: 1.5 }}>
        Данные карты хранятся у платёжного провайдера. Мы видим только последние 4 цифры.
      </div>
    </div>
  );
}

// ─── Billing history ──────────────────────────────────
function BillingHistory({ onBack }) {
  const payments = [
    { date: '12 мая 2025',  desc: 'dot. Plus · Годовая подписка', amount: '1 990 ₽', card: 'Visa •• 4521', ok: true },
    { date: '12 мая 2024',  desc: 'dot. Plus · Годовая подписка', amount: '1 790 ₽', card: 'Visa •• 4521', ok: true },
    { date: '18 фев 2024',  desc: 'Повторная попытка',            amount: '1 790 ₽', card: 'Visa •• 4521', ok: true },
    { date: '12 фев 2024',  desc: 'dot. Plus · Годовая подписка', amount: '1 790 ₽', card: 'Visa •• 2008', ok: false },
    { date: '12 мая 2023',  desc: 'dot. Plus · Месяц',            amount: '199 ₽',   card: 'Visa •• 2008', ok: true },
  ];
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>История платежей</div>
      </div>

      <div style={{ padding: '4px 24px 14px' }}>
        <div style={{
          padding: 16, borderRadius: 14, background: 'var(--chip)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: 0.1, fontWeight: 600 }}>Всего уплачено</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.3 }}>7 758 ₽</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'right' }}>за 3 года<br />5 транзакций</div>
        </div>
      </div>

      <div>
        {payments.map((p, i) => (
          <div key={i} style={{
            padding: '14px 24px', borderTop: '1px solid var(--line)',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{p.desc}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{p.date}</span>
                <span>·</span>
                <span>{p.card}</span>
                {!p.ok && <><span>·</span><span style={{ color: '#E44' }}>Ошибка</span></>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 15, fontWeight: 500,
                color: p.ok ? 'var(--text)' : 'rgba(60,60,67,0.5)',
                textDecoration: p.ok ? 'none' : 'line-through',
                fontVariantNumeric: 'tabular-nums',
              }}>{p.amount}</div>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 4, cursor: 'pointer' }}>Чек</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cancel subscription flow ─────────────────────────
function CancelSubscription({ onBack }) {
  const reasons = [
    'Дорого',
    'Не пользуюсь',
    'Нашёл альтернативу',
    'Не хватает функций',
    'Другое',
  ];
  return (
    <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>Отмена подписки</div>
      </div>

      <div style={{ padding: '8px 24px 0' }}>
        <div style={{
          padding: 16, borderRadius: 14,
          background: 'rgba(228,68,68,0.08)',
          border: '1px solid rgba(228,68,68,0.2)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            Подписка останется активной до 12 мая 2026
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
            После этой даты аккаунт перейдёт на бесплатный тариф. Ваши данные сохранятся, но часть функций станет недоступна.
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>
        Что вы потеряете
      </div>
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'Неограниченные страницы в базе',
          'Напоминания по задачам и привычкам',
          'Синхронизация между устройствами',
          'Экспорт в Markdown и PDF',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)' }}>
            <span style={{
              width: 18, height: 18, borderRadius: 9, flexShrink: 0,
              background: 'rgba(228,68,68,0.12)', color: '#E44',
              display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
            }}>×</span>
            {t}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>
        Почему вы отменяете?
      </div>
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {reasons.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 12,
            background: i === 0 ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--chip)',
            border: i === 0 ? '1.5px solid var(--accent)' : '1.5px solid transparent',
            fontSize: 15,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 9,
              border: `1.5px solid ${i === 0 ? 'var(--accent)' : 'rgba(60,60,67,0.3)'}`,
              background: i === 0 ? 'var(--accent)' : 'transparent',
              flexShrink: 0,
              display: 'grid', placeItems: 'center',
            }}>
              {i === 0 && <span style={{ width: 7, height: 7, borderRadius: 4, background: '#fff' }} />}
            </span>
            <span style={{ color: 'var(--text)' }}>{r}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 24px 0', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
        <button style={{
          padding: '13px 16px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Остаться на Plus
        </button>
        <button style={{
          padding: '12px 16px', background: 'transparent', color: '#E44',
          border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Всё равно отменить
        </button>
      </div>
    </div>
  );
}

// ─── Help & support ───────────────────────────────────
function HelpSupport({ onBack }) {
  const popular = [
    'Как перенести данные с другого устройства?',
    'Почему не приходят напоминания?',
    'Как работает офлайн-режим?',
    'Что входит в тариф Plus?',
    'Как отменить подписку?',
  ];
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>Помощь и поддержка</div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 24px 18px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderRadius: 12, background: 'var(--chip)',
        }}>
          <IconSearch size={16} color="var(--sub)" strokeWidth={1.75} />
          <span style={{ fontSize: 14, color: 'rgba(60,60,67,0.4)' }}>Поиск по базе знаний</span>
        </div>
      </div>

      {/* Частые вопросы */}
      <div style={{ padding: '0 24px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>
        Частые вопросы
      </div>
      <div>
        {popular.map((q, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 24px',
            borderTop: i === 0 ? '1px solid var(--line)' : 'none',
            borderBottom: '1px solid var(--line)',
          }}>
            <div style={{ fontSize: 15, color: 'var(--text)', flex: 1, lineHeight: 1.35 }}>{q}</div>
            <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>
          Все статьи в базе знаний  →
        </div>
      </div>

      {/* Связаться */}
      <div style={{ padding: '28px 24px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>
        Связаться с нами
      </div>
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px', borderRadius: 14,
          background: 'var(--accent)', color: '#fff',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.18)',
            display: 'grid', placeItems: 'center',
          }}>
            <IconMessageCircle size={16} strokeWidth={2} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Чат с поддержкой</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Онлайн — ответим за 10 мин</div>
          </div>
          <IconChevronRight size={14} color="#fff" strokeWidth={2} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px', borderRadius: 14,
          background: 'var(--chip)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 16, flexShrink: 0,
            background: 'rgba(60,60,67,0.08)',
            display: 'grid', placeItems: 'center',
          }}>
            <IconMail size={16} strokeWidth={1.75} color="var(--sub)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: 'var(--text)' }}>Написать письмо</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>help@dot.app</div>
          </div>
          <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
        </div>
      </div>

      <div style={{ padding: '22px 24px 0', fontSize: 12, color: 'var(--sub)', lineHeight: 1.5 }}>
        Версия 2.4.1 (build 284) · <span style={{ color: 'var(--accent)' }}>Сообщить о баге</span>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileEdit, SubscriptionManage, PaymentMethod, BillingHistory, CancelSubscription, HelpSupport });
