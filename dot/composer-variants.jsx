// Полноэкранные композеры для создания задачи и привычки.

const { useState: useStateCV } = React;


// Отдельный экран. Ничего лишнего — только поле, ниже «пилюли»
// с основными параметрами и одна кнопка.
function ComposerFullscreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 6px',
      }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 15, fontFamily: 'inherit' }}>Отмена</button>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Новая задача</div>
        <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Готово</button>
      </div>

      <div style={{ padding: '32px 24px 0', flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, color: 'var(--text)', letterSpacing: -0.4 }}>
          Подготовить отчёт<Caret big />
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--sub)' }}>Описание или заметка…</div>

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BigPill icon={<IconCalendar size={16} />} label="Сегодня"       value="16 апр" />
          <BigPill icon={<IconClock size={16} />}    label="Напоминание"   value="—" muted />
          <BigPill icon={<IconFlag size={16} />}     label="Приоритет"     value="—" muted />
        </div>
      </div>

      <SystemKeyboard mode="lower" />
    </div>
  );
}


// но поля соответствуют привычке: цвет/иконка плитки, повторение,
// цель за неделю, напоминание.
function ComposerFullscreenHabit() {
  // образец цветных плиток привычек
  const swatches = ['#6E2BF5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#A855F7'];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 6px',
      }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 15, fontFamily: 'inherit' }}>Отмена</button>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Новая привычка</div>
        <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Создать</button>
      </div>

      <div style={{ padding: '28px 24px 0', flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, color: 'var(--text)', letterSpacing: -0.4 }}>
          Медитация<Caret big />
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--sub)' }}>10 минут каждое утро</div>

        {/* Выбор цвета плитки — напрямую связан с тем, как привычка
            выглядит в сетке на главном экране «Привычки». */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' }}>Цвет</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {swatches.map((c, i) => (
              <div key={c} style={{
                width: 28, height: 28, borderRadius: 8, background: c,
                outline: i === 0 ? '2px solid var(--text)' : 'none',
                outlineOffset: 2, cursor: 'pointer',
              }} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BigPill icon={<IconRepeat size={16} />}    label="Повторение"  value="Ежедневно" />
          <BigPill icon={<IconTarget size={16} />}    label="Цель"        value="7 / неделя" />
          <BigPill icon={<IconClock size={16} />}     label="Напоминание" value="08:00" />
        </div>
      </div>

      <SystemKeyboard mode="lower" />
    </div>
  );
}


// ───────────────────────────────────────────────────────────────
// ПРИМИТИВЫ
// ───────────────────────────────────────────────────────────────

function Caret({ big }) {
  return (
    <span style={{
      display: 'inline-block', width: 2, height: big ? 24 : 16,
      background: 'var(--accent)', verticalAlign: 'middle',
      marginLeft: 2, animation: 'dotv-caret 1s steps(2) infinite',
    }}>
      <style>{`@keyframes dotv-caret { 50% { opacity: 0; } }`}</style>
    </span>
  );
}

function BigPill({ icon, label, value, muted }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 14,
      background: 'var(--chip)',
    }}>
      <div style={{ color: 'var(--sub)' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14, color: 'var(--sub)' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500,
        color: muted ? 'var(--sub)' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

// Fake system keyboard — тонкая имитация, чтобы экран «чувствовался» как живой
function SystemKeyboard({ mode = 'lower' }) {
  return <IosKeyboard mode={mode} />;
}

Object.assign(window, {
  ComposerFullscreen, ComposerFullscreenHabit,
  SystemKeyboard,
});
