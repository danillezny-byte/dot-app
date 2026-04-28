// Settings — полный каталог экранов.
// Index (главный список) + 6 детальных: Аккаунт, Синхронизация,
// Оформление, Уведомления, Приватность, О приложении.

const { useState: useStateS } = React;

function SettingsIndex({ onEnter }) {
  const rows = [
    { id: 'account',  icon: IconUser,     label: 'Аккаунт',       sub: 'alice@mail.com' },
    { id: 'sync',     icon: IconCloud,    label: 'Синхронизация', sub: 'Включена' },
    { id: 'theme',    icon: IconPalette,  label: 'Оформление',    sub: 'Системная · Фиолетовый' },
    { id: 'notif',    icon: IconBell,     label: 'Уведомления',   sub: 'Включены · за 15 мин' },
    { id: 'privacy',  icon: IconLock,     label: 'Приватность',   sub: 'Face ID, PIN-код' },
    { id: 'about',    icon: IconInfo,     label: 'О приложении',  sub: 'Версия 2.4' },
  ];
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '12px 24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 600 }}>А</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Алиса К.</div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>alice@mail.com</div>
        </div>
        <button style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', fontWeight: 600, fontSize: 12, padding: '6px 12px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit' }}>Plus</button>
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

      <div style={{ padding: '22px 24px 8px', textAlign: 'center' }}>
        <button style={{ background: 'none', border: 'none', color: '#E44', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <IconLogOut size={16} strokeWidth={1.75} /> Выйти из аккаунта
        </button>
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
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <Row label="Редактировать профиль" value="Алиса К." onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <Row label="Сменить пароль" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <Row label="Устройства" value="3" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <SectionHead>Подписка</SectionHead>
      <Row label="Тариф" value="Plus" valueColor="var(--accent)" />
      <Row label="Продлевается" value="12 мая 2026" />
      <Row label="Управлять подпиской" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <SectionHead>Опасная зона</SectionHead>
      <Row label={<span style={{ color: '#E44' }}>Удалить аккаунт</span>} onClick={() => {}} />
    </div>
  );
}
// ─── Detail: Sync ────────────────────────────
function SyncDetail() {
  const [auto, setAuto] = useStateS(true);
  const [wifi, setWifi] = useStateS(false);
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <Row label="Статус" value="Синхронизировано" valueColor="#2E8B57" />
      <Row label="Последняя синхронизация" value="2 мин. назад" />
      <SectionHead>Параметры</SectionHead>
      <Row label="Автосинхронизация" onClick={() => setAuto(!auto)} right={<Toggle on={auto} />} />
      <Row label="Только по Wi-Fi" onClick={() => setWifi(!wifi)} right={<Toggle on={wifi} />} />
      <SectionHead>Диагностика</SectionHead>
      <Row label="Статус и журнал" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <Row label="Конфликты версий" value="1" valueColor="#FF8C1A" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <Row label="Принудительная синхронизация" onClick={() => {}} right={<span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>Запустить</span>} />
      <Row label={<span style={{ color: '#E44' }}>Сбросить локальную копию</span>} onClick={() => {}} />
    </div>
  );
}
// ─── Detail: Theme ───────────────────────────
function ThemeDetail() {
  const [theme, setTheme] = useStateS('system');
  const [accent, setAccent] = useStateS('violet');
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <SectionHead>Тема</SectionHead>
      {[['system','Системная'],['light','Светлая'],['dark','Тёмная'],['warm','Тёплая бежевая']].map(([k,l]) => (
        <Row key={k} label={l} onClick={() => setTheme(k)} right={theme === k ? <IconCheck size={16} color="var(--accent)" strokeWidth={2.2} /> : null} />
      ))}
      <SectionHead>Акцентный цвет</SectionHead>
      <div style={{ padding: '12px 24px 16px', display: 'flex', gap: 12, borderBottom: '1px solid var(--line)' }}>
        {[['violet','#6D3CF0'],['blue','#007AFF'],['orange','#FF6A00'],['green','#2E8B57']].map(([k,hex]) => (
          <button key={k} onClick={() => setAccent(k)} style={{
            width: 32, height: 32, borderRadius: 16, background: hex,
            border: accent === k ? '2.5px solid var(--text)' : '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer', padding: 0,
          }} />
        ))}
      </div>
      <SectionHead>Текст</SectionHead>
      <Row label="Шрифт" value="Inter" right={<IconChevronRight size={14} color="var(--sub)" />} onClick={() => {}} />
    </div>
  );
}
// ─── Detail: Notifications ───────────────────
function NotifDetail() {
  const [on, setOn] = useStateS(true);
  const [tasks, setTasks] = useStateS(true);
  const [habits, setHabits] = useStateS(true);
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <Row label="Уведомления" onClick={() => setOn(!on)} right={<Toggle on={on} />} />
      <SectionHead>Для задач</SectionHead>
      <Row label="Напоминания" onClick={() => setTasks(!tasks)} right={<Toggle on={tasks} />} />
      <Row label="За сколько предупреждать" value="За 15 мин" right={<IconChevronRight size={14} color="var(--sub)" />} onClick={() => {}} />
      <SectionHead>Для привычек</SectionHead>
      <Row label="Напоминания" onClick={() => setHabits(!habits)} right={<Toggle on={habits} />} />
      <Row label="Время" value="09:00" right={<IconChevronRight size={14} color="var(--sub)" />} onClick={() => {}} />
      <SectionHead>Общее</SectionHead>
      <Row label="Тихие часы" value="22:00 — 08:00" right={<IconChevronRight size={14} color="var(--sub)" />} onClick={() => {}} />
      <Row label="Звуки" value="Колокольчик" right={<IconChevronRight size={14} color="var(--sub)" />} onClick={() => {}} />
    </div>
  );
}
// ─── Detail: Privacy ─────────────────────────
function PrivacyDetail() {
  const [bio, setBio] = useStateS(true);
  const [pin, setPin] = useStateS(true);
  const [analytics, setAnalytics] = useStateS(false);
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <SectionHead>Замок</SectionHead>
      <Row label="Face ID / Touch ID" onClick={() => setBio(!bio)} right={<Toggle on={bio} />} />
      <Row label="PIN-код" onClick={() => setPin(!pin)} right={<Toggle on={pin} />} />
      <Row label="Автозамок" value="Через 1 мин." onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <SectionHead>Данные</SectionHead>
      <Row label="Сквозное шифрование" value="Включено" valueColor="#2E8B57" />
      <Row label="Экспорт данных" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
      <Row label="Аналитика использования" onClick={() => setAnalytics(!analytics)} right={<Toggle on={analytics} />} />
      <Row label="История активности" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
    </div>
  );
}
// ─── Detail: About ───────────────────────────
function AboutDetail() {
  return (
    <div>
      <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
        <Logo size={32} />
        <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 8 }}>Версия 2.4 (103)</div>
      </div>
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <Row label="Что нового" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
        <Row label="Помощь и FAQ" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
        <Row label="Правовые документы" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
        <Row label="Лицензии open source" onClick={() => {}} right={<IconChevronRight size={14} color="var(--sub)" />} />
        <Row label="Оценить в App Store" onClick={() => {}} right={<window.IconExternalLink size={14} color="var(--sub)" strokeWidth={1.75} />} />
      </div>
    </div>
  );
}

// Shell used by Design Canvas: `id="index"` shows the index, other ids show detail pane.
function SettingsShell({ id = 'index' }) {
  if (id === 'index') return <SettingsIndex />;
  return <SettingsDetail id={id} />;
}

Object.assign(window, { SettingsIndex, SettingsDetail, SettingsShell });
