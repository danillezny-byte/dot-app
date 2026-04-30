import React from 'react';
// Settings — полный каталог экранов.
// Index (главный список) + 6 детальных: Аккаунт, Синхронизация,
// Оформление, Уведомления, Приватность, О приложении.

const { useState: useStateS } = React;

function SettingsIndex({ onEnter }) {
  const [profile, setProfile] = useStateS(null);
  React.useEffect(() => {
    if (!window.live) return;
    window.live.loadProfile().then(({ profile }) => profile && setProfile(profile));
  }, []);
  const themeName = (typeof window !== 'undefined' && window.dotTheme)
    ? ({ light: 'Светлая', dark: 'Тёмная', warm: 'Тёплая' }[window.dotTheme.get()] || 'Светлая')
    : 'Светлая';
  const rows = [
    { id: 'account',  icon: IconUser,     label: 'Аккаунт',       sub: profile?.email || '—' },
    { id: 'theme',    icon: IconPalette,  label: 'Оформление',    sub: themeName },
    { id: 'sync',     icon: IconCloud,    label: 'Синхронизация', sub: 'Авто, через Supabase' },
    { id: 'notif',    icon: IconBell,     label: 'Уведомления',   sub: 'В разработке' },
    { id: 'privacy',  icon: IconLock,     label: 'Приватность',   sub: 'В разработке' },
    { id: 'about',    icon: IconInfo,     label: 'О приложении',  sub: 'Версия и ссылки' },
  ];
  const initial1 = (profile?.name || profile?.email || '?').trim().charAt(0).toUpperCase();
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '12px 24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 27,
          background: profile?.avatar_url ? `center/cover no-repeat url(${profile.avatar_url})` : 'var(--accent)',
          color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 600,
        }}>{!profile?.avatar_url && initial1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name || (profile?.email || '').split('@')[0] || '—'}</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.email || ''}</div>
        </div>
        {profile?.plan === 'plus' && (
          <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', fontWeight: 600, fontSize: 12, padding: '6px 12px', borderRadius: 99 }}>Plus</span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--line)' }}>
        {rows.map((r) => (
          <div key={r.id} onClick={() => onEnter && onEnter(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 24px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--text)' }}>
              <r.icon size={18} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>{r.sub}</div>
            </div>
            <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsDetail({ id, onBack }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{DETAIL_TITLES[id]}</div>
      </div>
      {id === 'account'  && <AccountDetail />}
      {id === 'sync'     && <SyncDetail />}
      {id === 'theme'    && <ThemeDetail />}
      {id === 'notif'    && <NotifDetail />}
      {id === 'privacy'  && <PrivacyDetail />}
      {id === 'about'    && <AboutDetail />}
    </div>
  );
}
const DETAIL_TITLES = {
  account: 'Аккаунт', sync: 'Синхронизация', theme: 'Оформление',
  notif: 'Уведомления', privacy: 'Приватность', about: 'О приложении',
};

function SectionHead({ children }) {
  return <div style={{ padding: '14px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>{children}</div>;
}
function Row({ label, value, valueColor, onClick, right }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 24px', borderBottom: '1px solid var(--line)',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
      {value && <span style={{ color: valueColor || 'var(--sub)', fontSize: 14, marginRight: right ? 10 : 0 }}>{value}</span>}
      {right}
    </div>
  );
}
function Toggle({ on }) {
  return (
    <div style={{
      width: 40, height: 24, borderRadius: 12,
      background: on ? 'var(--accent)' : 'rgba(120,120,128,0.2)',
      position: 'relative', transition: 'background 160ms',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 20, height: 20, borderRadius: 10,
        background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'left 160ms',
      }} />
    </div>
  );
}

// ─── Detail: Account ─────────────────────────
function AccountDetail() {
  const [profile, setProfile] = useStateS(null);
  React.useEffect(() => {
    if (!window.live) return;
    window.live.loadProfile().then(({ profile }) => profile && setProfile(profile));
  }, []);

  const signOut = async () => {
    if (!window.live) return;
    await window.live.signOut();
    window.location.reload();
  };
  const deleteAccount = async () => {
    if (!window.confirm('Удалить аккаунт? Все данные (задачи, привычки, страницы) будут стёрты безвозвратно.')) return;
    if (!window.live) return;
    const { error } = await window.live.deleteAccount();
    if (error) {
      window.dotToast(window.dotErr(error), 'error');
      return;
    }
    window.location.reload();
  };

  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <SectionHead>Профиль</SectionHead>
      <Row label="Имя" value={profile?.name || '—'} />
      <Row label="Email" value={profile?.email || '—'} />
      <Row label="Тариф" value={profile?.plan === 'plus' ? 'Plus' : 'Free'} valueColor={profile?.plan === 'plus' ? 'var(--accent)' : undefined} />
      <SectionHead>Сессия</SectionHead>
      <Row label="Выйти из аккаунта" onClick={signOut} right={<span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>Выйти</span>} />
      <SectionHead>Опасная зона</SectionHead>
      <Row label={<span style={{ color: '#E44' }}>Удалить аккаунт</span>} onClick={deleteAccount} />
    </div>
  );
}

// Универсальный «в разработке» — для секций, требующих доп.настройки
function ComingSoonDetail({ what }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🛠️</div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>В разработке</div>
      <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
        {what}
      </div>
    </div>
  );
}

function SyncDetail() {
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <SectionHead>Состояние</SectionHead>
      <Row label="Статус" value="Синхронизировано" valueColor="#2E8B57" />
      <Row label="Бэкенд" value="Supabase" />
      <Row label="Авто-сохранение" value="Включено" valueColor="#2E8B57" />
      <SectionHead>Информация</SectionHead>
      <div style={{ padding: '14px 24px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
        Все изменения сохраняются в облако автоматически. Тонкая настройка (только по Wi-Fi, журнал конфликтов) — в разработке.
      </div>
    </div>
  );
}

// ─── Detail: Theme ───────────────────────────
function ThemeDetail() {
  const [theme, setTheme] = useStateS(window.dotTheme ? window.dotTheme.get() : 'light');
  const apply = (t) => {
    setTheme(t);
    if (window.dotTheme) window.dotTheme.set(t);
  };
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <SectionHead>Тема</SectionHead>
      {[['light','Светлая'],['dark','Тёмная'],['warm','Тёплая бежевая']].map(([k,l]) => (
        <Row key={k} label={l} onClick={() => apply(k)} right={theme === k ? <IconCheck size={16} color="var(--accent)" strokeWidth={2.2} /> : null} />
      ))}
      <div style={{ padding: '14px 24px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
        Тема сохраняется на устройстве. На разных устройствах можно настроить независимо.
      </div>
    </div>
  );
}

function NotifDetail() {
  return <ComingSoonDetail what="Push-уведомления требуют разрешения от браузера/iOS и serviceWorker. Сейчас все напоминания у задач/привычек видны только когда открыто приложение." />;
}
function PrivacyDetail() {
  return <ComingSoonDetail what="Биометрический замок (Face ID, Touch ID), PIN-код, экспорт данных. Шифрование на стороне Supabase уже включено." />;
}

// ─── Detail: About ───────────────────────────
function AboutDetail() {
  return (
    <div>
      <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
        <Logo size={32} />
        <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 8 }}>Прототип · v0.5</div>
      </div>
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <Row label="Исходники на GitHub" onClick={() => window.open('https://github.com/danillezny-byte/dot-app', '_blank')} right={<window.IconExternalLink size={14} color="var(--sub)" strokeWidth={1.75} />} />
        <Row label="Бэкенд" value="Supabase" />
        <Row label="Авторы" value="Данил + Claude" />
      </div>
      <div style={{ padding: '20px 24px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
        Это рабочий прототип. Многое сделано, многое впереди — будем улучшать вместе.
      </div>
    </div>
  );
}

// Shell used by Design Canvas: `id="index"` shows the index, other ids show detail pane.
function SettingsShell({ id = 'index' }) {
  if (id === 'index') return <SettingsIndex />;
  return <SettingsDetail id={id} />;
}

// Дуальный режим во время ESM-миграции: window для legacy, export для нового кода.
Object.assign(window, { SettingsIndex, SettingsDetail, SectionHead, Toggle, AccountDetail, ComingSoonDetail, SyncDetail, ThemeDetail, NotifDetail, PrivacyDetail, AboutDetail, SettingsShell });
export { SettingsIndex, SettingsDetail, SectionHead, Toggle, AccountDetail, ComingSoonDetail, SyncDetail, ThemeDetail, NotifDetail, PrivacyDetail, AboutDetail, SettingsShell };
