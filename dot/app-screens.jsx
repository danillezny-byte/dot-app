// Main app — rebuilt to match real dot. visuals.
// Structure: Header (logo + ⋯), body, FAB, bottom tabs (no labels glyphs only).
// Tabs: Задачи · Привычки · База · Профиль

const { useState: useStateH } = React;

function Home({ onGo, initialTab }) {
  const [tab, setTab] = useStateH(initialTab || 'tasks');
  const [tasks, setTasks] = useStateH(window.TASKS);
  const toggle = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 72, position: 'relative' }}>
      <DotHeader />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'tasks'  && <TasksView tasks={tasks} toggle={toggle} />}
        {tab === 'habits' && <HabitsView />}
        {tab === 'base'   && <BaseView onGo={onGo} />}
        {tab === 'me'     && <ProfileView onGo={onGo} />}
      </div>
      <Fab />
      <DotTabs active={tab} onChange={setTab} />
    </div>
  );
}

function DotHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px 10px' }}>
      <Logo size={24} />
    </div>
  );
}

function Fab() {
  return (
    <button style={{
      position: 'absolute', right: 22, bottom: 92,
      width: 56, height: 56, borderRadius: 28,
      background: 'var(--accent)', color: '#fff',
      border: 'none', cursor: 'pointer',
      boxShadow: '0 10px 24px -6px var(--accent), 0 2px 6px rgba(0,0,0,0.12)',
      display: 'grid', placeItems: 'center', zIndex: 5,
    }}>
      <IconPlus size={24} strokeWidth={2.2} />
    </button>
  );
}

function DotTabs({ active, onChange }) {
  const tabs = [
    { id: 'tasks',  label: 'Задачи',   Icon: IconCheckSquare },
    { id: 'habits', label: 'Привычки', Icon: IconRepeat },
    { id: 'base',   label: 'База',     Icon: IconBook },
    { id: 'me',     label: 'Профиль',  Icon: IconUser },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 22, paddingTop: 8,
      background: 'var(--bg)', borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around', zIndex: 10,
    }}>
      {tabs.map((t) => {
        const on = active === t.id;
        const c = on ? 'var(--accent)' : 'var(--sub)';
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '4px 14px', position: 'relative',
          }}>
            {on && <span style={{ position: 'absolute', top: -9, width: 22, height: 3, background: 'var(--accent)', borderRadius: 2 }} />}
            <t.Icon size={22} color={c} strokeWidth={on ? 2 : 1.75} />
            <span style={{ fontSize: 11, fontWeight: on ? 600 : 500, color: c }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────
const PRIO_COLORS = {
  urgent: '#EF4444',
  normal: '#F59E0B',
  low:    'rgba(60,60,67,0.35)',
};
function TasksView({ tasks, toggle }) {
  const order = ['Сегодня', 'Завтра', 'На неделе', 'Позже', 'Без даты'];
  return (
    <div style={{ paddingBottom: 24 }}>
      {order.map(sect => (
        <TaskSection key={sect} title={sect} items={tasks.filter(t => t.when === sect)} toggle={toggle} />
      ))}
    </div>
  );
}
function TaskSection({ title, items, toggle }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ padding: '8px 24px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--accent)' }}>{title}</div>
      <div>
        {items.map((t, i) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 24px', borderBottom: '1px solid var(--line)',
          }}>
            <RoundCheck checked={t.done} onChange={() => toggle(t.id)} />
            <div style={{
              fontSize: 15, fontWeight: 400, flex: 1,
              color: t.done ? 'var(--sub)' : 'var(--text)',
              textDecoration: t.done ? 'line-through' : 'none',
            }}>{t.title}</div>
            {t.prio && !t.done && (
              <IconFlag size={14} strokeWidth={1.75}
                style={{ color: PRIO_COLORS[t.prio], fill: PRIO_COLORS[t.prio] }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function RoundCheck({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 22, height: 22, borderRadius: 11, padding: 0,
      border: `1.6px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
      background: checked ? 'var(--accent)' : 'transparent',
      display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
    }}>
      {checked && <IconCheck size={12} color="#fff" strokeWidth={2.5} />}
    </button>
  );
}

// ─── HABITS ───────────────────────────────────────────────
// День недели подписан прямо над каждым квадратом — связь очевидна,
// ничего не «оторвано».
function HabitsView() {
  const days = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
  const todayIdx = 3; // Thursday
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 28px)',
    gap: 6,
    justifyContent: 'start',
  };
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      {window.HABITS.map((h) => (
        <div key={h.id} style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--line)',
        }}>
          {/* Строка 1: название + streak */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500 }}>{h.title}</div>
            {h.streak > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 12, fontWeight: 600,
                color: 'var(--accent)',
                background: 'var(--accent-soft)',
                padding: '3px 8px', borderRadius: 99,
              }}>
                <IconFlame size={12} strokeWidth={2} />
                <span>{h.streak}</span>
              </div>
            )}
          </div>

          {/* Дни недели — подпись прямо над своим квадратом */}
          <div style={{ ...gridStyle, marginBottom: 4 }}>
            {days.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center',
                fontSize: 9, fontWeight: 700, letterSpacing: 0.06,
                color: i === todayIdx ? 'var(--accent)' : 'var(--sub)',
              }}>{d}</div>
            ))}
          </div>

          {/* Квадраты */}
          <div style={gridStyle}>
            {h.days.map((v, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 7,
                background: v ? 'var(--accent)' : 'transparent',
                border: v ? 'none' : '1.5px solid var(--line)',
                outline: i === todayIdx && !v ? '1.5px dashed var(--accent)' : 'none',
                outlineOffset: -1.5,
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── KNOWLEDGE BASE (redesigned, Notion-lite) ────────────
const SPACE_ICON = { briefcase: IconBriefcase, heart: IconHeart, compass: IconCompass };

function BaseView({ onGo }) {
  const [openSpaces, setOpenSpaces] = useStateH({ 'sp-work': true, 'sp-life': true, 'sp-ref': false });
  const [openPages, setOpenPages] = useStateH({});
  const [q, setQ] = useStateH('');
  const pinned = collectPages(window.BASE_TREE).filter((p) => window.PINNED_PAGES.includes(p.id));

  const toggleSpace = (id) => setOpenSpaces((s) => ({ ...s, [id]: !s[id] }));
  const togglePage  = (id) => setOpenPages((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '0 22px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--chip)', borderRadius: 12, padding: '10px 14px', color: 'var(--sub)',
        }}>
          <IconSearch size={16} color="var(--sub)" strokeWidth={1.75} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по базе" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)',
          }}/>
        </div>
      </div>

      {pinned.length > 0 && (
        <>
          <BaseHeader>Закреплено</BaseHeader>
          {pinned.map((p) => <PageRow key={p.id} page={p} depth={0} pinned />)}
        </>
      )}

      <BaseHeader>Пространства</BaseHeader>
      {window.BASE_TREE.map((sp) => {
        const SpaceIcon = SPACE_ICON[sp.iconKey] || IconFolder;
        return (
        <div key={sp.id}>
          <div onClick={() => toggleSpace(sp.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 24px', cursor: 'pointer',
            borderBottom: '1px solid var(--line)',
          }}>
            <span style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: openSpaces[sp.id] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms' }}>
              <IconChevronDown size={14} strokeWidth={2} />
            </span>
            <span style={{ color: 'var(--accent)', display: 'flex' }}>
              <SpaceIcon size={16} strokeWidth={1.75} />
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{sp.title}</span>
            <span style={{ fontSize: 12, color: 'var(--sub)' }}>{sp.children.length}</span>
          </div>
          {openSpaces[sp.id] && sp.children.map((p) => (
            <PageNode key={p.id} page={p} depth={1} openPages={openPages} togglePage={togglePage} />
          ))}
        </div>
      );})}
    </div>
  );
}
function collectPages(tree) {
  const out = [];
  const walk = (nodes) => nodes.forEach((n) => {
    if (n.kind === 'page') out.push(n);
    if (n.children) walk(n.children);
  });
  walk(tree);
  return out;
}
function BaseHeader({ children }) {
  return <div style={{ padding: '14px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--accent)' }}>{children}</div>;
}
function PageNode({ page, depth, openPages, togglePage }) {
  const hasKids = page.children && page.children.length;
  const open = openPages[page.id];
  return (
    <>
      <PageRow page={page} depth={depth} onToggle={hasKids ? () => togglePage(page.id) : undefined} open={open} />
      {open && hasKids && page.children.map((c) => (
        <PageNode key={c.id} page={c} depth={depth + 1} openPages={openPages} togglePage={togglePage} />
      ))}
    </>
  );
}
function PageRow({ page, depth, onToggle, open, pinned }) {
  const hasKids = page.children && page.children.length;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 24px 10px', paddingLeft: 24 + depth * 18,
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      {onToggle ? (
        <span onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', cursor: 'pointer' }}>
          <IconChevronDown size={14} strokeWidth={2} />
        </span>
      ) : (
        <span style={{ width: 14 }} />
      )}
      <span style={{
        width: 18, height: 18, display: 'grid', placeItems: 'center',
        color: 'var(--sub)',
      }}>
        <IconFile size={16} color="var(--sub)" strokeWidth={1.5} />
      </span>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.title}</div>
      </div>
      {hasKids && <span style={{ fontSize: 11, color: 'var(--sub)' }}>{page.children.length}</span>}
      {pinned && <span style={{ color: 'var(--accent)', display: 'flex' }}><IconPin size={11} strokeWidth={2} /></span>}
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────
function ProfileView({ onGo }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Крупная шапка — человек, не список */}
      <div style={{
        margin: '8px 16px 20px', padding: '26px 20px',
        borderRadius: 20, background: 'var(--accent-soft)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: 'var(--accent)', color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 28, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>А</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 14, letterSpacing: -0.3 }}>Алиса Королёва</div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>alice@mail.com</div>
        <div style={{
          marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 99,
          background: 'var(--accent)', color: '#fff',
          fontSize: 12, fontWeight: 600, letterSpacing: 0.04,
        }}>
          <IconStar size={12} strokeWidth={2.2} /> dot. Plus
        </div>
      </div>

      {/* Сводка — маленькая статистика по делу, чтобы это был «я», а не «меню» */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 16px 22px' }}>
        <Stat n="127" l="Задач" />
        <Stat n="12"  l="Дней подряд" />
        <Stat n="42"  l="Страниц" />
      </div>

      {/* Короткий список — личные действия, не параметры приложения */}
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <PRow icon={<IconUser size={18} />}     label="Редактировать профиль" onClick={() => onGo && onGo('profile-edit')} />
        <PRow icon={<IconStar size={18} />}     label="Управление подпиской" sub="Plus · до 12 мая 2026" onClick={() => onGo && onGo('profile-sub')} />
        <PRow icon={<IconSettings size={18} />} label="Настройки приложения" onClick={() => onGo && onGo('settings')} />
        <PRow icon={<IconInfo size={18} />}     label="Помощь и поддержка" onClick={() => onGo && onGo('profile-help')} />
      </div>

      <div style={{ padding: '22px 24px 8px', textAlign: 'center' }}>
        <button onClick={() => onGo && onGo('login')} style={{
          background: 'none', border: 'none', color: '#E44',
          fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}><IconLogOut size={16} strokeWidth={1.75} /> Выйти из аккаунта</button>
      </div>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div style={{
      padding: '14px 10px', borderRadius: 14,
      background: 'var(--chip)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2, letterSpacing: 0.04 }}>{l}</div>
    </div>
  );
}

function PRow({ icon, label, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 24px', borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--text)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{sub}</div>}
      </div>
      <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
    </div>
  );
}
function MenuGroup({ rows }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      {rows.map(([label, value, color], i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid var(--line)',
          cursor: 'pointer',
        }}>
          <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
          {value && <span style={{ color: color || 'var(--sub)', fontSize: 14, marginRight: 10 }}>{value}</span>}
          <IconChevronRight size={14} color="var(--sub)" strokeWidth={1.75} />
        </div>
      ))}
    </div>
  );
}

// ─── PLANS ──────────────────────────────────────────────
function Plans({ onGo }) {
  const [plan, setPlan] = useStateH('year');
  return (
    <div style={{ padding: '14px 22px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => onGo && onGo('home')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <Logo size={22} />
        <span style={{ width: 22 }} />
      </div>

      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 14 }}>dot. Plus</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 10px', lineHeight: 1.1 }}>Без лимитов, везде</h1>
      <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, marginBottom: 22 }}>Синхронизация, неограниченная база знаний, история активности.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {[
          'Неограниченные страницы в базе',
          'Привычки и задачи без ограничений',
          'История активности, 1 год',
          'Приоритет в поддержке',
        ].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
              <IconCheck size={12} color="currentColor" strokeWidth={2.5} />
            </span>
            {f}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {[
          { id: 'month', label: 'Ежемесячно', price: '199 ₽ / мес.' },
          { id: 'year',  label: 'Ежегодно',   price: '1 490 ₽ / год', sub: '−37%' },
        ].map((o) => (
          <div key={o.id} onClick={() => setPlan(o.id)} style={{
            padding: 14, borderRadius: 14,
            border: `1.5px solid ${plan === o.id ? 'var(--accent)' : 'var(--line)'}`,
            background: plan === o.id ? 'var(--accent-soft)' : 'var(--surface)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              border: `1.5px solid ${plan === o.id ? 'var(--accent)' : 'var(--line)'}`,
              display: 'grid', placeItems: 'center',
            }}>
              {plan === o.id && <div style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--accent)' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: 'var(--sub)' }}>{o.price}</div>
            </div>
            {o.sub && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', padding: '3px 8px', borderRadius: 99, background: '#fff', border: '1px solid var(--accent)' }}>{o.sub}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Button kind="primary" full>Попробовать 7 дней бесплатно</Button>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--sub)', marginTop: 10 }}>Списание после пробного периода. Отмена в любой момент.</div>
      </div>
    </div>
  );
}

Object.assign(window, { Home, Plans });
