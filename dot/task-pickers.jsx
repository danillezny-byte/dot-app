// ─── Пикеры полей задачи: Дата / Напоминание / Проект / Приоритет ───
// Каждый экран — это композер новой задачи с открытым bottom-sheet-пикером
// для одного из полей. Пользователь уже видит: «я в задаче, тап по пилюле,
// открылся выбор».

(function () {
  const { IconCalendar, IconClock, IconFolder, IconFlag, IconCheck } = window;

  // ─── Общий шелл bottom sheet ──────────────────────────────────
  function Sheet({ title, children, height }) {
    return (
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface, #fff)',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
        paddingBottom: 22,
        display: 'flex', flexDirection: 'column',
        maxHeight: height || 480,
      }}>
        <div style={{
          height: 4, width: 36, borderRadius: 4, background: 'rgba(60,60,67,0.25)',
          alignSelf: 'center', marginTop: 6,
        }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px 6px',
        }}>
          <span style={{ fontSize: 14, color: 'var(--sub)' }}>Отмена</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
          <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>Готово</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '4px 0 10px' }}>
          {children}
        </div>
      </div>
    );
  }

  // ─── Общий шелл композера — без клавиатуры, потому что вместо
  //     неё снизу шит-пикер. Скопировано из ComposerFullscreen,
  //     чтобы не зависеть от изменений там.
  function ComposerShell({ activeField, values = {}, sheet, title = 'Новая задача' }) {
    const Pill = ({ icon: Icon, label, value, muted, active }) => (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderRadius: 14,
        background: active ? 'color-mix(in srgb, var(--accent) 10%, var(--chip))' : 'var(--chip)',
        border: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
        minHeight: 52,
      }}>
        <Icon size={16} strokeWidth={1.75} color="var(--sub)" />
        <span style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>{label}</span>
        <span style={{
          fontSize: 15,
          color: muted ? 'rgba(60,60,67,0.4)' : 'var(--text)',
          fontWeight: muted ? 400 : 500,
        }}>{value}</span>
      </div>
    );

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 6px',
        }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 15, fontFamily: 'inherit' }}>Отмена</button>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Готово</button>
        </div>

        <div style={{ padding: '28px 24px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, color: 'var(--text)', letterSpacing: -0.4 }}>
            Подготовить отчёт
          </div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'rgba(60,60,67,0.4)' }}>Описание или заметка…</div>

          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Pill icon={IconCalendar} label="Дата"        value={values.date  || '—'} muted={!values.date}  active={activeField === 'date'} />
            <Pill icon={IconClock}    label="Напоминание" value={values.rem   || '—'} muted={!values.rem}   active={activeField === 'rem'} />
            <Pill icon={IconFlag}     label="Приоритет"   value={values.prio  || '—'} muted={!values.prio}  active={activeField === 'prio'} />
          </div>
        </div>

        {sheet}
      </div>
    );
  }

  // ─── 1. Дата — пресеты + календарная сетка ─────────────────────
  function DatePickerSheet() {
    const presets = [
      { label: 'Сегодня',      hint: 'пн, 16 апр' },
      { label: 'Завтра',       hint: 'вт, 17 апр' },
      { label: 'Через 3 дня',  hint: 'пт, 19 апр' },
      { label: 'На след. неделе', hint: 'пн, 22 апр' },
      { label: 'Без даты',     hint: '' },
    ];
    // апрель 2026, 16 выбран, выделенный
    const startOfMonth = 3; // пн=0 … 1 апр = ср
    const daysInMonth = 30;
    const cells = [];
    for (let i = 0; i < startOfMonth; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);

    return (
      <Sheet title="Дата" height={560}>
        <div style={{ padding: '0 14px' }}>
          {presets.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 8px', borderRadius: 10,
              background: p.label === 'Сегодня' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            }}>
              <span style={{ flex: 1, fontSize: 15, color: p.label === 'Сегодня' ? 'var(--accent)' : 'var(--text)', fontWeight: p.label === 'Сегодня' ? 600 : 400 }}>{p.label}</span>
              <span style={{ fontSize: 13, color: 'var(--sub)' }}>{p.hint}</span>
              {p.label === 'Сегодня' && <IconCheck size={16} color="var(--accent)" strokeWidth={2} />}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, padding: '10px 20px 0',
          borderTop: '1px solid var(--line)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 10px' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Апрель 2026</span>
            <div style={{ display: 'flex', gap: 10, fontSize: 16, color: 'var(--sub)' }}>
              <span>‹</span><span>›</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, fontSize: 11, color: 'var(--sub)', paddingBottom: 4 }}>
            {['пн','вт','ср','чт','пт','сб','вс'].map(w => (
              <div key={w} style={{ textAlign: 'center', padding: '4px 0' }}>{w}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              const selected = d === 16;
              return (
                <div key={i} style={{
                  height: 34, display: 'grid', placeItems: 'center',
                  fontSize: 14, fontVariantNumeric: 'tabular-nums',
                  color: !d ? 'transparent' : selected ? '#fff' : 'var(--text)',
                  background: selected ? 'var(--accent)' : 'transparent',
                  borderRadius: 10, fontWeight: selected ? 600 : 400,
                }}>{d || '•'}</div>
              );
            })}
          </div>
        </div>
      </Sheet>
    );
  }

  // ─── 2. Напоминание — пресеты времени до дедлайна ───────────────
  function ReminderPickerSheet() {
    const opts = [
      'За 5 минут',
      'За 15 минут',
      'За 30 минут',
      'За час',
      'За день',
      'В это же время накануне',
      'Без напоминания',
    ];
    return (
      <Sheet title="Напоминание" height={420}>
        <div style={{ padding: '0 14px' }}>
          {opts.map((o, i) => {
            const selected = o === 'За 15 минут';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 8px', borderRadius: 10,
              }}>
                <span style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>{o}</span>
                {selected && <IconCheck size={16} color="var(--accent)" strokeWidth={2} />}
              </div>
            );
          })}
        </div>
      </Sheet>
    );
  }

  // ─── 3. Проект — список пространств + «Без проекта» ─────────────
  function ProjectPickerSheet({ empty }) {
    const spaces = [
      { name: 'Работа',       hint: '12 страниц', emoji: '💼', selected: true },
      { name: 'Жизнь',        hint: '8 страниц',  emoji: '🌿' },
      { name: 'Справочник',   hint: '5 страниц',  emoji: '📘' },
    ];
    return (
      <Sheet title="Проект" height={empty ? 340 : 380}>
        <div style={{ padding: '0 14px' }}>
          {/* Без проекта */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 8px', borderRadius: 10,
            color: 'var(--sub)',
          }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, border: '1px dashed rgba(60,60,67,0.3)' }} />
            <span style={{ flex: 1, fontSize: 15 }}>Без проекта</span>
            {empty && <IconCheck size={16} color="var(--accent)" strokeWidth={2} />}
          </div>

          {empty ? (
            <div style={{
              margin: '12px 8px 0',
              padding: '22px 18px',
              borderRadius: 12,
              border: '1px dashed var(--line)',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.4 }}>
                У вас пока нет пространств. Создайте первое, чтобы группировать задачи и страницы базы.
              </span>
              <button style={{
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 99,
                padding: '9px 16px', fontSize: 14, fontWeight: 600,
                fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                + Создать пространство
              </button>
            </div>
          ) : (
            spaces.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 8px', borderRadius: 10,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'var(--chip)', display: 'grid', placeItems: 'center', fontSize: 14,
                }}>{s.emoji}</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--sub)' }}>{s.hint}</span>
                </div>
                {s.selected && <IconCheck size={16} color="var(--accent)" strokeWidth={2} />}
              </div>
            ))
          )}
        </div>
      </Sheet>
    );
  }

  // ─── 4. Приоритет — 3 уровня ────────────────────────────────────
  function PriorityPickerSheet() {
    const opts = [
      { label: 'Срочно',   color: '#EF4444', selected: false },
      { label: 'Обычный',  color: '#F59E0B', selected: true },
      { label: 'Низкий',   color: 'rgba(60,60,67,0.3)' },
      { label: 'Без приоритета', color: null },
    ];
    return (
      <Sheet title="Приоритет" height={320}>
        <div style={{ padding: '0 14px' }}>
          {opts.map((o, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 8px', borderRadius: 10,
            }}>
              {o.color ? (
                <IconFlag size={18} strokeWidth={1.75} style={{ color: o.color, fill: o.color }} />
              ) : (
                <IconFlag size={18} strokeWidth={1.75} color="rgba(60,60,67,0.3)" />
              )}
              <span style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>{o.label}</span>
              {o.selected && <IconCheck size={16} color="var(--accent)" strokeWidth={2} />}
            </div>
          ))}
        </div>
      </Sheet>
    );
  }

  // ─── Экспортируемые артборды ───────────────────────────────────
  function TaskDateField() {
    return <ComposerShell activeField="date" sheet={<DatePickerSheet />} />;
  }
  function TaskReminderField() {
    return <ComposerShell activeField="rem" values={{ date: '16 апр' }} sheet={<ReminderPickerSheet />} />;
  }
  function TaskProjectField() {
    return <ComposerShell activeField="proj" values={{ date: '16 апр', rem: 'За 15 мин' }} sheet={<ProjectPickerSheet />} />;
  }
  function TaskProjectEmpty() {
    return <ComposerShell activeField="proj" values={{ date: '16 апр', rem: 'За 15 мин' }} sheet={<ProjectPickerSheet empty />} />;
  }
  function TaskPriorityField() {
    return <ComposerShell activeField="prio" values={{ date: '16 апр', rem: 'За 15 мин' }} sheet={<PriorityPickerSheet />} />;
  }
  function TaskAllFilled() {
    return <ComposerShell values={{ date: '16 апр', rem: 'За 15 мин', prio: 'Обычный' }} />;
  }

  Object.assign(window, {
    TaskDateField, TaskReminderField,
    TaskPriorityField, TaskAllFilled,
  });
})();
