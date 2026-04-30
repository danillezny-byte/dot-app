import React from 'react';
// Полноэкранные композеры для создания задачи и привычки.

const { useState: useStateCV } = React;


// Отдельный экран. Ничего лишнего — только поле, ниже «пилюли»
// с основными параметрами и одна кнопка.
//
// В мок-режиме (без props) — статичный артборд для дизайн-канваса.
// В live-режиме (live=true) — рабочая форма создания задачи:
//   - реальные textarea для заголовка и описания
//   - тап по пилюле открывает соответствующий bottom-sheet пикер
//   - «Готово» вызывает onSubmit({ title, notes, date, reminder, priority })
function ComposerFullscreen({ live, onClose, onSubmit, initialTask, onDelete }) {
  // По умолчанию в live-режиме дата = «Сегодня», как в дизайне «Задачи · все поля заполнены».
  const todayDefault = live ? (() => { const d = new Date(); d.setHours(12,0,0,0); return d; })() : null;
  const isEdit = !!initialTask;
  const wdShort = ['вс','пн','вт','ср','чт','пт','сб'];
  const monShort = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  const fmtDate = (d) => `${wdShort[d.getDay()]}, ${d.getDate()} ${monShort[d.getMonth()]}`;
  const labelFromDate = (d) => {
    if (!d) return 'Без даты';
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate()+1);
    const di = new Date(d); di.setHours(0,0,0,0);
    if (di.getTime() === today.getTime()) return 'Сегодня';
    if (di.getTime() === tomorrow.getTime()) return 'Завтра';
    return fmtDate(d);
  };
  const prioUiToLabel = { urgent: 'Срочно', normal: 'Обычный', low: 'Низкий' };

  const initDate = initialTask?.dueIso ? new Date(initialTask.dueIso) : (isEdit ? null : todayDefault);
  const initLabel = isEdit ? labelFromDate(initDate) : (live ? 'Сегодня' : null);
  const initPrio = initialTask?.priority ? (prioUiToLabel[initialTask.priority] || null) : null;

  const [title, setTitle]       = useStateCV(initialTask?.title ?? (live ? '' : 'Подготовить отчёт'));
  const [notes, setNotes]       = useStateCV('');
  const [dateValue, setDateValue] = useStateCV(initDate);
  const [dateLabel, setDateLabel] = useStateCV(initLabel);
  const [reminder, setReminder] = useStateCV(null);
  const [priority, setPriority] = useStateCV(initPrio);
  const [picker, setPicker]     = useStateCV(null); // 'date' | 'rem' | 'prio' | null
  const [busy, setBusy]         = useStateCV(false);

  const dateDisplay = live
    ? (dateValue === null ? 'Без даты' : (dateLabel || '—'))
    : '16 апр';
  const remLabel  = live ? (reminder || '—') : '—';
  const prioLabel = live ? (priority || '—') : '—';
  const dateMuted = live ? (dateValue === undefined) : false;
  const remMuted  = live ? !reminder : true;
  const prioMuted = live ? !priority : true;

  const submit = async () => {
    if (!live || !onSubmit) return;
    if (!title.trim() || busy) return;
    setBusy(true);
    await onSubmit({
      title: title.trim(),
      notes: notes.trim(),
      dueIso: dateValue instanceof Date ? dateValue.toISOString() : null,
      reminder,
      priority,
    });
    setBusy(false);
    onClose && onClose();
  };

  const remove = async () => {
    if (!live || !onDelete) return;
    if (!window.confirm('Удалить задачу? Действие можно отменить.')) return;
    setBusy(true);
    await onDelete();
    setBusy(false);
    onClose && onClose();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 6px',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 15, fontFamily: 'inherit', cursor: live ? 'pointer' : 'default', padding: 0 }}>Отмена</button>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{isEdit ? 'Изменить задачу' : 'Новая задача'}</div>
        <button onClick={submit} disabled={live && (!title.trim() || busy)} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600,
          fontFamily: 'inherit', cursor: live ? 'pointer' : 'default',
          opacity: (live && (!title.trim() || busy)) ? 0.4 : 1,
        }}>{busy ? '…' : 'Готово'}</button>
      </div>

      <div style={{ padding: '32px 24px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {live ? (
          <textarea
            autoFocus
            rows={1}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Что нужно сделать?"
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontSize: 26, fontWeight: 500, lineHeight: 1.25,
              color: 'var(--text)', letterSpacing: -0.4,
              fontFamily: 'inherit', padding: 0,
            }}
          />
        ) : (
          <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, color: 'var(--text)', letterSpacing: -0.4 }}>
            {title}<Caret big />
          </div>
        )}
        {live ? (
          <textarea
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Описание или заметка…"
            style={{
              width: '100%', marginTop: 6,
              border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontSize: 14, color: 'var(--text)',
              fontFamily: 'inherit', padding: 0,
            }}
          />
        ) : (
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--sub)' }}>Описание или заметка…</div>
        )}

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BigPill icon={<IconCalendar size={16} />} label="Дата"        value={dateDisplay} muted={dateMuted} onClick={live ? () => setPicker('date') : undefined} />
          <BigPill icon={<IconClock size={16} />}    label="Напоминание" value={remLabel}  muted={remMuted}  onClick={live ? () => setPicker('rem')  : undefined} />
          <BigPill icon={<IconFlag size={16} />}     label="Приоритет"   value={prioLabel} muted={prioMuted} onClick={live ? () => setPicker('prio') : undefined} />
        </div>

        {live && isEdit && (
          <div style={{ marginTop: 28, paddingBottom: 8, textAlign: 'center' }}>
            <button onClick={remove} disabled={busy} style={{
              background: 'none', border: 'none', color: '#E44',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}><IconTrash size={16} strokeWidth={1.75} /> Удалить задачу</button>
          </div>
        )}
      </div>

      {!live && <SystemKeyboard mode="lower" />}

      {live && picker === 'date' && (
        <DatePickerSheet
          live
          value={dateValue}
          onSelect={(v, label) => { setDateValue(v); setDateLabel(label); }}
          onCancel={() => setPicker(null)}
          onDone={() => setPicker(null)}
        />
      )}
      {live && picker === 'rem' && (
        <ReminderPickerSheet
          value={reminder || 'Без напоминания'}
          onSelect={(v) => setReminder(v === 'Без напоминания' ? null : v)}
          onCancel={() => setPicker(null)}
          onDone={() => setPicker(null)}
        />
      )}
      {live && picker === 'prio' && (
        <PriorityPickerSheet
          value={priority || 'Без приоритета'}
          onSelect={(v) => setPriority(v === 'Без приоритета' ? null : v)}
          onCancel={() => setPicker(null)}
          onDone={() => setPicker(null)}
        />
      )}
    </div>
  );
}


// но поля соответствуют привычке: цвет/иконка плитки, повторение,
// цель за неделю, напоминание.
//
// Без props — статичный артборд.
// С `live` — рабочая форма создания/редактирования привычки.
function ComposerFullscreenHabit({ live, onClose, onSubmit, initialHabit, onDelete }) {
  const swatches = ['#6E2BF5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#A855F7'];
  const isEdit = !!initialHabit;
  const repeatLabels = { daily: 'Ежедневно', weekdays: 'По будням', weekends: 'По выходным' };

  const [title, setTitle] = useStateCV(initialHabit?.title ?? (live ? '' : 'Медитация'));
  const [color, setColor] = useStateCV(initialHabit?.color ?? swatches[0]);
  const [repeat, setRepeat]     = useStateCV(initialHabit?.repeat ?? 'daily');
  const [goal, setGoal]         = useStateCV(initialHabit?.goal ?? 7);
  const [reminder, setReminder] = useStateCV(initialHabit?.reminder ?? null); // 'HH:MM' | null
  const [picker, setPicker]     = useStateCV(null); // 'rep' | 'goal' | 'rem' | null
  const [busy, setBusy]         = useStateCV(false);

  const submit = async () => {
    if (!live || !onSubmit) return;
    if (!title.trim() || busy) return;
    setBusy(true);
    await onSubmit({ title: title.trim(), color, repeat, goal, reminder });
    setBusy(false);
    onClose && onClose();
  };

  const remove = async () => {
    if (!live || !onDelete) return;
    if (!window.confirm('Удалить привычку? Действие можно отменить.')) return;
    setBusy(true);
    await onDelete();
    setBusy(false);
    onClose && onClose();
  };

  const repeatLabel = live ? (repeatLabels[repeat] || 'Ежедневно') : 'Ежедневно';
  const goalLabel   = live ? (goal === 7 ? '7 / неделя' : `${goal} / неделя`) : '7 / неделя';
  const remLabel    = live ? (reminder || '—') : '08:00';
  const remMuted    = live && !reminder;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 6px',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 15, fontFamily: 'inherit', cursor: live ? 'pointer' : 'default', padding: 0 }}>Отмена</button>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{isEdit ? 'Изменить привычку' : 'Новая привычка'}</div>
        <button onClick={submit} disabled={live && (!title.trim() || busy)} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600,
          fontFamily: 'inherit', cursor: live ? 'pointer' : 'default',
          opacity: (live && (!title.trim() || busy)) ? 0.4 : 1,
        }}>{busy ? '…' : (isEdit ? 'Готово' : 'Создать')}</button>
      </div>

      <div style={{ padding: '28px 24px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {live ? (
          <textarea
            autoFocus
            rows={1}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название привычки"
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontSize: 26, fontWeight: 500, lineHeight: 1.25,
              color: 'var(--text)', letterSpacing: -0.4,
              fontFamily: 'inherit', padding: 0,
            }}
          />
        ) : (
          <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, color: 'var(--text)', letterSpacing: -0.4 }}>
            {title}<Caret big />
          </div>
        )}
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--sub)' }}>{live ? 'Например, читать 20 минут' : '10 минут каждое утро'}</div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' }}>Цвет</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {swatches.map((c) => (
              <div key={c}
                onClick={live ? () => setColor(c) : undefined}
                style={{
                  width: 28, height: 28, borderRadius: 8, background: c,
                  outline: c === color ? '2px solid var(--text)' : 'none',
                  outlineOffset: 2, cursor: live ? 'pointer' : 'default',
                }} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BigPill icon={<IconRepeat size={16} />} label="Повторение"  value={repeatLabel} onClick={live ? () => setPicker('rep')  : undefined} />
          <BigPill icon={<IconTarget size={16} />} label="Цель"        value={goalLabel}   onClick={live ? () => setPicker('goal') : undefined} />
          <BigPill icon={<IconClock size={16} />}  label="Напоминание" value={remLabel}    muted={remMuted} onClick={live ? () => setPicker('rem')  : undefined} />
        </div>

        {live && isEdit && (
          <div style={{ marginTop: 28, paddingBottom: 8, textAlign: 'center' }}>
            <button onClick={remove} disabled={busy} style={{
              background: 'none', border: 'none', color: '#E44',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}><IconTrash size={16} strokeWidth={1.75} /> Удалить привычку</button>
          </div>
        )}
      </div>

      {!live && <SystemKeyboard mode="lower" />}

      {live && picker === 'rep' && (
        <HabitRepeatPickerSheet
          value={repeat}
          onSelect={(v) => setRepeat(v)}
          onCancel={() => setPicker(null)}
          onDone={() => setPicker(null)}
        />
      )}
      {live && picker === 'goal' && (
        <HabitGoalPickerSheet
          value={goal}
          onSelect={(v) => setGoal(v)}
          onCancel={() => setPicker(null)}
          onDone={() => setPicker(null)}
        />
      )}
      {live && picker === 'rem' && (
        <HabitReminderPickerSheet
          value={reminder}
          onSelect={(v) => setReminder(v)}
          onCancel={() => setPicker(null)}
          onDone={() => setPicker(null)}
        />
      )}
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

function BigPill({ icon, label, value, muted, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 14,
      background: 'var(--chip)',
      border: 'none', cursor: onClick ? 'pointer' : 'default',
      fontFamily: 'inherit', textAlign: 'left', width: '100%',
    }}>
      <div style={{ color: 'var(--sub)' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14, color: 'var(--sub)' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500,
        color: muted ? 'var(--sub)' : 'var(--text)' }}>{value}</div>
    </Tag>
  );
}

// Fake system keyboard — тонкая имитация, чтобы экран «чувствовался» как живой
function SystemKeyboard({ mode = 'lower' }) {
  return <IosKeyboard mode={mode} />;
}

// Дуальный режим во время ESM-миграции: window для legacy, export для нового кода.
Object.assign(window, { ComposerFullscreen, ComposerFullscreenHabit, BigPill, SystemKeyboard });
export { ComposerFullscreen, ComposerFullscreenHabit, BigPill, SystemKeyboard };
