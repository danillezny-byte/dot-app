// ─── Пикеры полей привычки: Повторение / Цель / Напоминание ───
// Каждый экран — это композер новой привычки с открытым bottom-sheet-пикером
// для одного из полей.

(function () {
  const { IconRepeat, IconTarget, IconClock, IconCheck } = window;

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

  // ─── Шелл композера новой привычки (без клавиатуры) ────────────
  function HabitComposerShell({ activeField, values = {}, sheet }) {
    const swatches = ['#6E2BF5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#A855F7'];
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>Новая привычка</div>
          <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Создать</button>
        </div>

        <div style={{ padding: '28px 24px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, color: 'var(--text)', letterSpacing: -0.4 }}>
            Медитация
          </div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'rgba(60,60,67,0.4)' }}>10 минут каждое утро</div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>Цвет</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {swatches.map((c, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: 8, background: c,
                  border: i === 0 ? '2px solid var(--accent)' : 'none',
                  outlineOffset: 2,
                }} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Pill icon={IconRepeat} label="Повторение" value={values.rep || 'Ежедневно'}    active={activeField === 'rep'} />
            <Pill icon={IconTarget} label="Цель"       value={values.goal || '7 / неделя'}   active={activeField === 'goal'} />
            <Pill icon={IconClock}  label="Напоминание" value={values.rem || '08:00'}        active={activeField === 'rem'} />
          </div>
        </div>

        {sheet}
      </div>
    );
  }

  // ─── 1. Повторение — пресеты частоты ───────────────────────────
  function RepeatPickerSheet() {
    const opts = [
      { label: 'Ежедневно',      hint: 'каждый день',       selected: true },
      { label: 'По будням',      hint: 'пн–пт' },
      { label: 'По выходным',    hint: 'сб, вс' },
      { label: 'По дням недели', hint: 'выбрать дни…', chevron: true },
      { label: 'Раз в N дней',   hint: 'указать интервал…', chevron: true },
    ];
    return (
      <Sheet title="Повторение" height={400}>
        <div style={{ padding: '0 14px' }}>
          {opts.map((o, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '13px 8px', borderRadius: 10,
              background: o.selected ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 15, color: o.selected ? 'var(--accent)' : 'var(--text)', fontWeight: o.selected ? 600 : 400 }}>{o.label}</span>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>{o.hint}</span>
              </div>
              {o.selected && <IconCheck size={16} color="var(--accent)" strokeWidth={2} />}
              {o.chevron && !o.selected && <span style={{ color: 'var(--sub)', fontSize: 16 }}>›</span>}
            </div>
          ))}
        </div>
      </Sheet>
    );
  }

  // ─── 2. Цель — сегментированный выбор 1-7 раз в неделю ─────────
  function GoalPickerSheet() {
    const selected = 7;
    return (
      <Sheet title="Цель" height={280}>
        <div style={{ padding: '8px 20px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 14, lineHeight: 1.4 }}>
            Сколько раз в неделю вы хотите выполнять эту привычку?
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {[1,2,3,4,5,6,7].map(n => {
              const on = n === selected;
              return (
                <div key={n} style={{
                  flex: 1, height: 48,
                  borderRadius: 12,
                  background: on ? 'var(--accent)' : 'var(--chip)',
                  color: on ? '#fff' : 'var(--text)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 17, fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}>{n}</div>
              );
            })}
          </div>
          <div style={{
            marginTop: 14, textAlign: 'center',
            fontSize: 13, color: 'var(--sub)',
          }}>
            {selected === 7 ? 'каждый день' : `${selected} раз${selected === 1 ? '' : selected < 5 ? 'а' : ''} в неделю`}
          </div>
        </div>
      </Sheet>
    );
  }

  // ─── 3. Напоминание — время (iOS колесо HH:MM) ─────────────────
  function ReminderPickerSheet() {
    const hours   = ['06','07','08','09','10','11','12'];
    const mins    = ['00','15','30','45'];
    const Wheel = ({ values, selectedIdx }) => (
      <div style={{ flex: 1, position: 'relative', height: 176, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 4, right: 4, top: 72, height: 32,
          borderRadius: 6, background: 'rgba(120,120,128,0.12)', pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 72 - selectedIdx * 32 }}>
          {values.map((v, i) => {
            const dist = Math.abs(i - selectedIdx);
            const opacity = dist === 0 ? 1 : dist === 1 ? 0.55 : dist === 2 ? 0.28 : 0.12;
            return (
              <div key={i} style={{
                height: 32, display: 'grid', placeItems: 'center',
                fontSize: 20, fontWeight: dist === 0 ? 600 : 400,
                color: 'var(--text)', opacity,
                fontVariantNumeric: 'tabular-nums',
              }}>{v}</div>
            );
          })}
        </div>
      </div>
    );
    return (
      <Sheet title="Напоминание" height={320}>
        <div style={{
          display: 'flex', padding: '12px 40px 0',
          alignItems: 'center',
          position: 'relative',
        }}>
          <Wheel values={hours} selectedIdx={2} />
          <span style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)', fontSize: 22, fontWeight: 600, color: 'var(--text)',
          }}>:</span>
          <Wheel values={mins}  selectedIdx={0} />
        </div>
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 10,
            background: 'var(--chip)', color: 'var(--sub)', fontSize: 14,
          }}>Без напоминания</div>
        </div>
      </Sheet>
    );
  }

  // ─── 1b. По дням недели — выбор дней ───────────────────────────
  function WeekdaysPickerSheet() {
    const days = [
      { l: 'Пн', on: true  },
      { l: 'Вт', on: true  },
      { l: 'Ср', on: false },
      { l: 'Чт', on: true  },
      { l: 'Пт', on: true  },
      { l: 'Сб', on: false },
      { l: 'Вс', on: false },
    ];
    return (
      <Sheet title="По дням недели" height={320}>
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 16, lineHeight: 1.4 }}>
            В какие дни недели выполнять привычку?
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {days.map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 48, borderRadius: 12,
                background: d.on ? 'var(--accent)' : 'var(--chip)',
                color: d.on ? '#fff' : 'var(--text)',
                display: 'grid', placeItems: 'center',
                fontSize: 14, fontWeight: 600,
              }}>{d.l}</div>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'var(--sub)' }}>
            4 раза в неделю
          </div>
        </div>
      </Sheet>
    );
  }

  // ─── 1c. Раз в N дней — степпер ────────────────────────────────
  function EveryNDaysSheet() {
    const n = 3;
    const Btn = ({ ch, dis }) => (
      <div style={{
        width: 44, height: 44, borderRadius: 22,
        background: 'var(--chip)',
        display: 'grid', placeItems: 'center',
        fontSize: 22, fontWeight: 500,
        color: dis ? 'rgba(60,60,67,0.3)' : 'var(--text)',
      }}>{ch}</div>
    );
    return (
      <Sheet title="Раз в N дней" height={260}>
        <div style={{ padding: '8px 20px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18, lineHeight: 1.4 }}>
            Привычка будет повторяться с указанным интервалом.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <Btn ch="−" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--sub)' }}>дня</div>
            </div>
            <Btn ch="+" />
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--sub)' }}>
            каждые {n} дня — например, пн, чт, вс
          </div>
        </div>
      </Sheet>
    );
  }

  // ─── Экспортируемые артборды ───────────────────────────────────
  function HabitRepeatField() {
    return <HabitComposerShell activeField="rep" sheet={<RepeatPickerSheet />} />;
  }
  function HabitRepeatWeekdays() {
    return <HabitComposerShell activeField="rep" values={{ rep: 'По дням недели' }} sheet={<WeekdaysPickerSheet />} />;
  }
  function HabitRepeatEveryN() {
    return <HabitComposerShell activeField="rep" values={{ rep: 'Раз в 3 дня' }} sheet={<EveryNDaysSheet />} />;
  }
  function HabitGoalField() {
    return <HabitComposerShell activeField="goal" sheet={<GoalPickerSheet />} />;
  }
  function HabitReminderField() {
    return <HabitComposerShell activeField="rem" sheet={<ReminderPickerSheet />} />;
  }

  Object.assign(window, {
    HabitRepeatField, HabitRepeatWeekdays, HabitRepeatEveryN,
    HabitGoalField, HabitReminderField,
  });
})();
