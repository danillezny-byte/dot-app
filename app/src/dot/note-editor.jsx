import React from 'react';
// Редактор страницы «Базы» — Notion-like, но без визуального шума.
// Блочная модель: H1, H2, параграф (с inline bold/italic/link),
// маркированный/нумерованный список, чек-лист, цитата, разделитель.
//
// Четыре состояния, связанные одной страницей:
//   NoteReading       — режим чтения (как видит «обычный» пользователь)
//   NoteEditing       — курсор в блоке, слева видны ручка ⋮⋮ и «+»
//   NoteSlashMenu     — открыт слэш-список типов блоков (bottom sheet)
//   NoteFormatBar     — выделение текста, плавает тулбар форматирования

// ─── Данные: заметка по книге ──────────────────────────────────────
const NOTE_BLOCKS = [
  { t: 'breadcrumbs', items: ['База', 'Работа'] },
  { t: 'h1', text: 'Запуск лендинга' },
  { t: 'props', rows: [
    { key: 'Статус',    kind: 'select', value: 'В работе', color: '#F59E0B' },
    { key: 'Дедлайн',   kind: 'date',   value: '30 июня' },
    { key: 'Владелец',  kind: 'person', value: 'Я' },
    { key: 'Приоритет', kind: 'select', value: 'Высокий', color: '#EF4444' },
  ]},
  { t: 'p', text: 'Нужен одностраничный сайт под запуск в **июне**. Цель — собрать заявки на ранний доступ.' },
  { t: 'h2', text: 'Задачи' },
  { t: 'todo', done: true,  text: 'Собрать референсы конкурентов' },
  { t: 'todo', done: true,  text: 'Согласовать структуру с командой' },
  { t: 'todo', done: false, text: 'Написать тексты первого экрана' },
  { t: 'todo', done: false, text: 'Забрифовать дизайнера' },
  { t: 'todo', done: false, text: 'Настроить форму и аналитику' },
  { t: 'h2', text: 'Открытые вопросы' },
  { t: 'bullet', text: 'Ставим ли *видео* на первый экран или статичный макет?' },
  { t: 'bullet', text: 'Какой CTA — «Попробовать» или «Оставить заявку»?' },
  { t: 'quote', text: 'Лучше простой лендинг вовремя, чем идеальный — через полгода.' },
];

// ─── Рендеринг inline-разметки: **bold**, *italic*, [link](…) ───
function renderInline(text, { accentLink } = {}) {
  const nodes = [];
  let i = 0, key = 0;
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        nodes.push(<b key={key++} style={{ fontWeight: 600, color: 'var(--text)' }}>{text.slice(i + 2, end)}</b>);
        i = end + 2; continue;
      }
    }
    if (text[i] === '*' && text[i + 1] !== ' ') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        nodes.push(<i key={key++} style={{ fontStyle: 'italic' }}>{text.slice(i + 1, end)}</i>);
        i = end + 1; continue;
      }
    }
    // plain run up to next marker
    let nextBold = text.indexOf('**', i);
    let nextIt = text.indexOf('*', i);
    const stops = [nextBold, nextIt].filter((n) => n !== -1);
    const stop = stops.length ? Math.min(...stops) : text.length;
    nodes.push(<React.Fragment key={key++}>{text.slice(i, stop)}</React.Fragment>);
    i = stop;
  }
  return nodes;
}

// ─── Хедер страницы ────────────────────────────────────────────────
function NoteHeader({ saving, onMenu }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px', borderBottom: '1px solid var(--line)',
      background: 'var(--bg)',
    }}>
      <button style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
        <IconChevronLeft size={22} strokeWidth={1.75} />
      </button>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <IconBriefcase size={13} strokeWidth={1.8} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>База / Работа</span>
      </div>
      <div style={{ fontSize: 12, color: saving ? 'var(--accent)' : 'var(--sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {saving ? <><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)', display: 'inline-block' }} /> Сохранение…</> : 'Сохранено'}
      </div>
      <button onClick={onMenu} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', cursor: 'pointer', display: 'flex' }}>
        <IconMore size={20} strokeWidth={1.75} />
      </button>
    </div>
  );
}

// ─── Сам контент (переиспользуется всеми состояниями) ─────────────
function NoteBody({ activeIdx, selectionIdx, showHandle = false }) {
  return (
    <div style={{ padding: '18px 20px 140px', flex: 1, overflowY: 'auto' }}>
      {NOTE_BLOCKS.map((b, i) => (
        <Block key={i} block={b} idx={i}
          active={activeIdx === i}
          selection={selectionIdx === i}
          showHandle={showHandle && activeIdx === i}
        />
      ))}
    </div>
  );
}

function Block({ block, idx, active, selection, showHandle }) {
  const wrap = (children, extraStyle = {}) => (
    <div style={{
      position: 'relative',
      margin: '2px -8px', padding: '4px 8px',
      borderRadius: 6,
      background: active ? 'rgba(109,60,240,0.04)' : 'transparent',
      ...extraStyle,
    }}>
      {showHandle && (
        <div style={{
          position: 'absolute', left: -30, top: 6,
          display: 'flex', gap: 2,
        }}>
          <div style={{ width: 14, height: 22, borderRadius: 4, display: 'grid', placeItems: 'center', color: 'var(--sub)', background: 'var(--chip)' }}>
            <IconPlusSmall size={11} strokeWidth={2.2} />
          </div>
          <div style={{ width: 14, height: 22, borderRadius: 4, display: 'grid', placeItems: 'center', color: 'var(--sub)', background: 'var(--chip)' }}>
            <IconGrip size={11} strokeWidth={2} />
          </div>
        </div>
      )}
      {children}
    </div>
  );

  if (block.t === 'breadcrumbs') {
    return (
      <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {block.items.map((it, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: 'var(--line)' }}>/</span>}
            <span>{it}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }
  if (block.t === 'h1') {
    return wrap(
      <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.15, margin: 0 }}>
        {block.text}
        {active && <Caret />}
      </h1>
    );
  }
  if (block.t === 'props') {
    return (
      <div style={{ margin: '10px 0 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {block.rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 0', fontSize: 13,
          }}>
            <div style={{ width: 104, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {r.kind === 'select' && <IconHash size={12} strokeWidth={1.8} />}
              {r.kind === 'date'   && <IconCalendar size={12} strokeWidth={1.8} />}
              {r.kind === 'person' && <IconUser size={12} strokeWidth={1.8} />}
              {r.kind === 'rating' && <IconStar size={12} strokeWidth={1.8} />}
              <span>{r.key}</span>
            </div>
            <div style={{ flex: 1, color: 'var(--text)' }}>
              {r.kind === 'select' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '2px 8px', borderRadius: 6,
                  background: r.color ? `${r.color}22` : 'var(--chip)',
                  color: r.color || 'var(--text)',
                  fontSize: 12, fontWeight: 500,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: r.color || 'var(--sub)' }} />
                  {r.value}
                </span>
              )}
              {r.kind === 'date' && <span>{r.value}</span>}
              {r.kind === 'person' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600 }}>Я</span>
                  {r.value}
                </span>
              )}
              {r.kind === 'rating' && (
                <span style={{ display: 'inline-flex', gap: 2 }}>
                  {[1,2,3,4,5].map((n) => (
                    <IconStar key={n} size={13} strokeWidth={2} color={n <= r.value ? 'var(--accent)' : 'var(--line)'} />
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 0 0', fontSize: 12, color: 'var(--sub)',
        }}>
          <IconPlusSmall size={12} strokeWidth={2} />
          <span>Добавить свойство</span>
        </div>
      </div>
    );
  }
  if (block.t === 'h2') {
    return wrap(
      <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.25, margin: '18px 0 6px' }}>
        {block.text}
        {active && <Caret />}
      </h2>
    );
  }
  if (block.t === 'p') {
    return wrap(
      <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text)', margin: '4px 0' }}>
        {selection ? <SelectedInline text={block.text} /> : renderInline(block.text)}
        {active && <Caret />}
      </p>
    );
  }
  if (block.t === 'bullet') {
    return wrap(
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '2px 0' }}>
        <span style={{ color: 'var(--sub)', fontSize: 18, lineHeight: 1.4, marginTop: -2 }}>·</span>
        <div style={{ flex: 1, fontSize: 15, lineHeight: 1.55 }}>
          {renderInline(block.text)}
          {active && <Caret />}
        </div>
      </div>
    );
  }
  if (block.t === 'todo') {
    return wrap(
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '2px 0' }}>
        <button style={{
          width: 18, height: 18, borderRadius: 4, padding: 0, marginTop: 2,
          border: `1.6px solid ${block.done ? 'var(--accent)' : 'var(--line)'}`,
          background: block.done ? 'var(--accent)' : 'transparent',
          display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          {block.done && <IconCheck size={10} color="#fff" strokeWidth={3} />}
        </button>
        <div style={{
          flex: 1, fontSize: 15, lineHeight: 1.55,
          color: block.done ? 'var(--sub)' : 'var(--text)',
          textDecoration: block.done ? 'line-through' : 'none',
        }}>
          {block.text}
          {active && <Caret />}
        </div>
      </div>
    );
  }
  if (block.t === 'quote') {
    return wrap(
      <div style={{
        borderLeft: '3px solid var(--accent)',
        paddingLeft: 14, margin: '8px 0',
        fontSize: 15, lineHeight: 1.5, color: 'var(--text)',
        fontStyle: 'italic',
      }}>
        «{block.text}»
        {active && <Caret />}
      </div>
    );
  }
  return null;
}

function Caret() {
  return (
    <span style={{
      display: 'inline-block', width: 1.5, height: '1em', background: 'var(--accent)',
      marginLeft: 1, verticalAlign: 'text-bottom',
      animation: 'dotCaret 1s steps(2) infinite',
    }}>
      <style>{`@keyframes dotCaret{50%{opacity:0}}`}</style>
    </span>
  );
}

// Параграф с подсвеченным выделением посередине
function SelectedInline({ text }) {
  // Выделяем кусок «то, что важно» (имитация пользовательского выделения)
  const needle = 'то, что важно';
  const i = text.indexOf(needle);
  if (i === -1) return <>{renderInline(text)}</>;
  const before = text.slice(0, i);
  const mid = text.slice(i, i + needle.length);
  const after = text.slice(i + needle.length);
  return (
    <>
      {renderInline(before)}
      <span style={{ background: 'var(--accent-soft)', borderRadius: 3, padding: '0 1px' }}>{mid}</span>
      {renderInline(after)}
    </>
  );
}

// ─── Состояние 1: Чтение ───────────────────────────────────────────
function NoteReading() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <NoteHeader />
      <NoteBody />
    </div>
  );
}

// ─── Состояние 2: Редактирование (курсор + ручка) ─────────────────
// Снизу по порядку: содержимое → accessory-bar (над клавиатурой) → сама клавиатура.
function NoteEditing() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <NoteHeader saving />
      <div style={{ paddingLeft: 20, flex: 1, overflowY: 'auto' }}>
        <NoteBody activeIdx={5} showHandle />
      </div>
      <EditorFooterBar />
      <SystemKeyboard mode="lower" />
    </div>
  );
}

// ─── Состояние 3a: Слэш-меню, вызванное через «+» в accessory-bar.
//     Клавиатура НЕ закрывается — sheet висит над ней. Так юзер
//     может передумать и просто продолжить печатать.
function NoteSlashMenu() {
  const items = [
    { icon: IconType,         label: 'Текст',               sub: 'Обычный параграф', kbd: '' },
    { icon: IconHash,         label: 'Заголовок 1',         sub: 'Крупный раздел',   kbd: '# ' },
    { icon: IconHash,         label: 'Заголовок 2',         sub: 'Подраздел',        kbd: '## ' },
    { icon: IconList,         label: 'Маркированный список', sub: 'Точки',           kbd: '- ' },
    { icon: IconListOrdered,  label: 'Нумерованный список', sub: '1. 2. 3.',         kbd: '1. ' },
    { icon: IconCheckSquare,  label: 'Чек-лист',            sub: 'Задачи прямо в тексте', kbd: '[ ] ' },
    { icon: IconQuote,        label: 'Цитата',              sub: 'С акцентной полосой',  kbd: '> ' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <NoteHeader saving />
      <div style={{ flex: 1, overflow: 'hidden', paddingLeft: 20, opacity: 0.5 }}>
        <NoteBody activeIdx={5} showHandle />
      </div>

      {/* затемнение */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 4 }} />

      {/* bottom sheet — поверх footer-bar'а и клавиатуры */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        paddingBottom: 16, zIndex: 6, maxHeight: '70%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>

        {/* поле с «/» */}
        <div style={{ padding: '6px 16px 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 40, padding: '0 14px', borderRadius: 12,
            background: 'var(--chip)',
          }}>
            <IconSlash size={14} color="var(--sub)" strokeWidth={2.2} />
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Вставить блок</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--sub)', fontFamily: 'ui-monospace, Menlo, monospace' }}>ESC</span>
          </div>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 20px',
              background: i === 0 ? 'var(--accent-soft)' : 'transparent',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--chip)', display: 'grid', placeItems: 'center',
                color: i === 0 ? 'var(--accent)' : 'var(--text)',
              }}>
                <it.icon size={18} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: i === 0 ? 'var(--accent)' : 'var(--text)' }}>{it.label}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{it.sub}</div>
              </div>
              {it.kbd && (
                <span style={{
                  fontSize: 11, padding: '3px 7px', borderRadius: 5,
                  background: 'var(--chip)', color: 'var(--sub)',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                }}>{it.kbd}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Состояние 4: Тулбар форматирования над выделением ─────────────
// Клавиатура на месте — юзер в любой момент может продолжить печатать.
// Тулбар всплывает прямо над выделенным абзацем.
function NoteFormatBar() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <NoteHeader saving />
      <div style={{ flex: 1, overflow: 'hidden', paddingLeft: 20, position: 'relative' }}>
        <NoteBody activeIdx={15} selectionIdx={15} showHandle />

        {/* Плавающий тулбар — над выделенным абзацем, прямо в тексте */}
        <div style={{
          position: 'absolute',
          left: '50%', top: 230,
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '6px 8px', borderRadius: 12,
          background: '#1A1620', color: '#fff',
          boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
          zIndex: 5,
        }}>
          <FmtBtn><IconBold size={16} strokeWidth={2.2} /></FmtBtn>
          <FmtBtn active><IconItalic size={16} strokeWidth={2} /></FmtBtn>
          <FmtBtn><span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.02 }}>S̶</span></FmtBtn>
          <FmtBtn><IconLink size={16} strokeWidth={2} /></FmtBtn>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <FmtBtn>
            <span style={{
              width: 14, height: 14, borderRadius: 4, background: 'var(--accent)',
              display: 'inline-block',
            }} />
          </FmtBtn>
          <FmtBtn><IconMore size={16} strokeWidth={2} /></FmtBtn>
        </div>
      </div>
      <EditorFooterBar />
      <SystemKeyboard mode="lower" />
    </div>
  );
}
function FmtBtn({ children, active }) {
  return (
    <button style={{
      width: 32, height: 30, borderRadius: 8, border: 'none',
      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,0.85)',
      cursor: 'pointer', display: 'grid', placeItems: 'center',
      padding: 0, fontFamily: 'inherit',
    }}>{children}</button>
  );
}

// ─── Панель «над клавиатурой»: inline-форматирование + «+» для слэш-меню
function EditorFooterBar() {
  return (
    <div style={{
      borderTop: '1px solid var(--line)',
      background: 'var(--bg)',
      padding: '8px 10px 20px',
      display: 'flex', gap: 6, alignItems: 'center',
    }}>
      {/* Плюс — открывает слэш-меню */}
      <button style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none',
        background: 'var(--accent-soft)', color: 'var(--accent)',
        cursor: 'pointer', display: 'grid', placeItems: 'center',
      }}>
        <IconPlusSmall size={18} strokeWidth={2.2} />
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />

      {/* inline-форматирование */}
      {[IconBold, IconItalic, IconLink].map((Ic, i) => (
        <button key={i} style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'transparent', color: 'var(--text)',
          cursor: 'pointer', display: 'grid', placeItems: 'center',
        }}>
          <Ic size={16} strokeWidth={1.9} />
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <button style={{
        fontSize: 14, color: 'var(--accent)',
        background: 'none', border: 'none', padding: '0 10px',
        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
      }}>Готово</button>
    </div>
  );
}

// ─── Состояние: пустая новая страница ─────────────────────────────
// Это то, что открывается по «+» из списка базы.
// Никакой формы — просто пустой холст с курсором в заголовке.
function NoteEmpty() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid var(--line)',
        background: 'var(--bg)',
      }}>
        <button style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <IconBriefcase size={13} strokeWidth={1.8} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>База / Работа</span>
        </div>
        <button style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', cursor: 'pointer', display: 'flex' }}>
          <IconMore size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Заголовок с каретом и плейсхолдером */}
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.15, margin: 0, color: 'var(--sub)', display: 'flex', alignItems: 'center' }}>
          <Caret />
          <span style={{ opacity: 0.5, marginLeft: 2 }}>Без названия</span>
        </h1>
        <div style={{ fontSize: 15, color: 'var(--sub)', opacity: 0.7, lineHeight: 1.5 }}>
          Начните писать или нажмите <span style={{
            fontFamily: 'ui-monospace, Menlo, monospace',
            background: 'var(--chip)', color: 'var(--text)',
            padding: '1px 6px', borderRadius: 4, fontSize: 13,
          }}>/</span> для выбора типа блока
        </div>
      </div>
      <EditorFooterBar />
      <SystemKeyboard mode="upper" />
    </div>
  );
}

// ─── Страница «Книги 2026» — сама страница, содержащая другие страницы
// Между списком базы и отдельной книжной заметкой.
function BookListPage() {
  const books = [
    { title: 'Четыре тысячи недель',          author: 'Оливер Буркеман',    read: 'Фев 2026', rating: 4, accent: true },
    { title: 'Как работает мозг',             author: 'Дэвид Иглмен',       read: 'Янв 2026', rating: 5 },
    { title: 'Атомные привычки',              author: 'Джеймс Клир',        read: 'Янв 2026', rating: 5 },
    { title: 'Тихая сила',                    author: 'Сьюзан Кейн',        read: 'Дек 2025', rating: 3 },
    { title: 'Глубокая работа',               author: 'Кэл Ньюпорт',        read: 'Дек 2025', rating: 4 },
    { title: 'Никогда не ешьте в одиночку',   author: 'Кейт Феррацци',      read: 'Читаю',    rating: 0 },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid var(--line)',
        background: 'var(--bg)',
      }}>
        <button style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <IconBook size={13} strokeWidth={1.8} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>База / Жизнь</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--sub)' }}>Сохранено</div>
        <button style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', cursor: 'pointer', display: 'flex' }}>
          <IconMore size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 24px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.15, margin: 0 }}>Книги 2026</h1>
        <p style={{ fontSize: 14, color: 'var(--sub)', margin: '8px 0 4px', lineHeight: 1.5 }}>
          Читаю, перечитываю, выписываю главное. {books.length} страниц.
        </p>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column' }}>
          {books.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: i < books.length - 1 ? '1px solid var(--line)' : 'none',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: b.accent ? 'var(--accent-soft)' : 'var(--chip)',
                color: b.accent ? 'var(--accent)' : 'var(--sub)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <IconFile size={16} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: b.accent ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{b.author}</span>
                  <span style={{ color: 'var(--line)' }}>·</span>
                  <span>{b.read}</span>
                </div>
              </div>
              {b.rating > 0 && (
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  {[1,2,3,4,5].map((n) => (
                    <IconStar key={n} size={10} strokeWidth={2} color={n <= b.rating ? 'var(--accent)' : 'var(--line)'} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* добавить новую */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 0', color: 'var(--sub)',
            fontSize: 14, cursor: 'pointer',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent', border: '1px dashed var(--line)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <IconPlusSmall size={14} strokeWidth={2} />
            </div>
            <span>Добавить книгу</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Состояние 3b: Слэш-поповер прямо у курсора ───────────────────
// Пользователь напечатал «/» в пустой строке. Меню всплывает компактным
// попапом под строкой с «/» — как в Notion/Craft на десктопе.
function NoteSlashPopover() {
  const items = [
    { icon: IconType,        label: 'Текст' },
    { icon: IconHash,        label: 'Заголовок 1' },
    { icon: IconHash,        label: 'Заголовок 2' },
    { icon: IconList,        label: 'Список' },
    { icon: IconCheckSquare, label: 'Чек-лист' },
    { icon: IconQuote,       label: 'Цитата' },
  ];
  // Рендерим NoteBody до «idx=5» (первый bullet), затем активную строку с «/»,
  // поповер прямо под ней, и продолжение контента — но в приглушённом виде,
  // чтобы фокус был на поповере.
  const head = NOTE_BLOCKS.slice(0, 5);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <NoteHeader saving />
      <div style={{ paddingLeft: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '18px 20px 0 0' }}>
          {head.map((b, i) => <Block key={i} block={b} idx={i} />)}

          {/* активная строка — юзер только что напечатал «/» */}
          <div style={{
            margin: '2px -8px', padding: '4px 8px',
            borderRadius: 6, background: 'rgba(109,60,240,0.04)',
            position: 'relative',
          }}>
            {/* ручка + «+» слева */}
            <div style={{
              position: 'absolute', left: -30, top: 6,
              display: 'flex', gap: 2,
            }}>
              <div style={{ width: 14, height: 22, borderRadius: 4, display: 'grid', placeItems: 'center', color: 'var(--sub)', background: 'var(--chip)' }}>
                <IconPlusSmall size={11} strokeWidth={2.2} />
              </div>
              <div style={{ width: 14, height: 22, borderRadius: 4, display: 'grid', placeItems: 'center', color: 'var(--sub)', background: 'var(--chip)' }}>
                <IconGrip size={11} strokeWidth={2} />
              </div>
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text)', display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'ui-monospace, Menlo, monospace',
                background: 'var(--accent-soft)', color: 'var(--accent)',
                padding: '0 4px', borderRadius: 3,
              }}>/</span>
              <Caret />
            </div>

            {/* Поповер прямо под активной строкой */}
            <div style={{
              marginTop: 8, width: 260,
              background: 'var(--bg)',
              borderRadius: 12, border: '1px solid var(--line)',
              boxShadow: '0 16px 40px rgba(16,12,30,0.18), 0 2px 6px rgba(16,12,30,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px 12px', fontSize: 11, color: 'var(--sub)',
                letterSpacing: 0.4, textTransform: 'uppercase',
                borderBottom: '1px solid var(--line)',
              }}>Блоки</div>
              {items.map((it, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px',
                  background: i === 0 ? 'var(--accent-soft)' : 'transparent',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: 'var(--chip)', display: 'grid', placeItems: 'center',
                    color: i === 0 ? 'var(--accent)' : 'var(--text)',
                  }}>
                    <it.icon size={13} strokeWidth={1.9} />
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: i === 0 ? 'var(--accent)' : 'var(--text)', fontWeight: i === 0 ? 500 : 400 }}>{it.label}</div>
                  {i === 0 && (
                    <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'ui-monospace, Menlo, monospace' }}>⏎</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <EditorFooterBar />
      <SystemKeyboard mode="lower" />
    </div>
  );
}

// ─── Состояние: Свойства страницы ─────────────────────────────────
// Под заголовком — блок «Свойства». Пользователь сам выбирает, какие
// свойства добавить к странице. У проекта — свои, у книги — свои,
// у рецепта — свои. Тип решает, как редактировать (кликабельные звёзды,
// дропдаун, дата-пикер и т.д.).
function NoteProperties() {
  const props = [
    { icon: IconHash,     label: 'Статус',    type: 'select', value: 'В работе',  color: '#F59E0B' },
    { icon: IconCalendar, label: 'Дедлайн',   type: 'date',   value: '30 июня' },
    { icon: IconUser,     label: 'Владелец',  type: 'person', value: 'Я' },
    { icon: IconHash,     label: 'Приоритет', type: 'select', value: 'Высокий',   color: '#EF4444' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <NoteHeader saving />
      <div style={{ paddingLeft: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '18px 20px 0 0' }}>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 6, display: 'flex', gap: 6 }}>
            <span>База</span><span style={{ color: 'var(--line)' }}>/</span>
            <span>Работа</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.15, margin: 0 }}>
            Запуск лендинга
          </h1>
        </div>

        {/* Блок свойств */}
        <div style={{ margin: '16px 20px 0 0', display: 'flex', flexDirection: 'column' }}>
          {props.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--line)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: 130, flexShrink: 0, color: 'var(--sub)',
              }}>
                <p.icon size={14} strokeWidth={1.8} />
                <span style={{ fontSize: 13 }}>{p.label}</span>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.type === 'select' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: `${p.color}22`, color: p.color,
                    padding: '2px 8px', borderRadius: 4, fontSize: 13, fontWeight: 500,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: p.color }} />
                    {p.value}
                  </span>
                )}
                {p.type === 'date' && <span>{p.value}</span>}
                {p.type === 'person' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 10, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600 }}>Я</span>
                    {p.value}
                  </span>
                )}
                {p.type === 'rating' && (
                  <>
                    {[1,2,3,4,5].map((n) => (
                      <IconStar key={n} size={14} strokeWidth={2} color={n <= p.value ? 'var(--accent)' : 'var(--line)'} />
                    ))}
                  </>
                )}
                {p.type === 'text' && <span>{p.value}</span>}
              </div>
            </div>
          ))}

          {/* Добавить свойство — в фокусе (активное) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 0', color: 'var(--accent)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}>
            <IconPlusSmall size={14} strokeWidth={2.2} />
            <span>Добавить свойство</span>
          </div>
        </div>

        {/* Далее — тело страницы */}
        <div style={{ paddingTop: 10, paddingRight: 20 }}>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text)', margin: '4px 0' }}>
            Нужен одностраничный сайт под запуск в <b style={{ fontWeight: 600 }}>июне</b>. Цель — собрать заявки на ранний доступ.
            <Caret />
          </p>
        </div>
      </div>
      <EditorFooterBar />
      <SystemKeyboard mode="lower" />
    </div>
  );
}

// ─── Состояние: Выбор типа свойства ─────────────────────────────────
// Пользователь нажал «+ Добавить свойство» → всплывает bottom sheet
// со списком типов. Ключевое: рейтинг — не отдельная фича «для книг»,
// это один из типов свойства, как дата или текст.
function NotePropertyType() {
  const types = [
    { icon: IconType,     label: 'Текст',         sub: 'Произвольная строка' },
    { icon: IconHash,     label: 'Число',         sub: '42, 3.14, —' },
    { icon: IconCalendar, label: 'Дата',          sub: '30 июня, сегодня' },
    { icon: IconHash,     label: 'Выбор',         sub: 'Один из вариантов с цветом' },
    { icon: IconHash,     label: 'Мульти-выбор',  sub: 'Несколько тегов' },
    { icon: IconCheckSquare, label: 'Чек-бокс',   sub: 'Да / нет' },
    { icon: IconStar,     label: 'Рейтинг',       sub: '★★★★★',  highlight: true },
    { icon: IconLink,     label: 'Ссылка',        sub: 'URL-адрес' },
    { icon: IconUser,     label: 'Человек',       sub: 'Из списка контактов' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* фон — страница в режиме свойств, приглушённая */}
      <div style={{ flex: 1, opacity: 0.4, pointerEvents: 'none', overflow: 'hidden' }}>
        <NoteProperties />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 4 }} />

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        zIndex: 6, display: 'flex', flexDirection: 'column',
        maxHeight: '75%',
      }}>
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '4px 20px 10px' }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Тип свойства</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>Как будет выглядеть и редактироваться это свойство.</div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {types.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px',
              background: t.highlight ? 'var(--accent-soft)' : 'transparent',
              borderBottom: i < types.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: t.highlight ? 'var(--accent)' : 'var(--chip)',
                color: t.highlight ? '#fff' : 'var(--text)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <t.icon size={15} strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: t.highlight ? 600 : 500, color: t.highlight ? 'var(--accent)' : 'var(--text)' }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{t.sub}</div>
              </div>
              {t.highlight && <IconCheck size={16} strokeWidth={2.2} color="var(--accent)" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Пустая база (первый запуск) ──────────────────────────────
function BaseEmpty({ onCreate, embedded }) {
  // Визуально идентично TasksEmpty/HabitsEmpty в app-screens.jsx — иконка 64×64,
  // titleSize 22, тот же ритм отступов, та же accent-pill кнопка. Шаблоны убраны
  // (no-op без templates feature; вернётся когда сделаем).
  const InnerCore = (
    <>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'grid', placeItems: 'center', marginBottom: 22,
      }}>
        <IconBook size={28} strokeWidth={1.6} />
      </div>
      <h2 style={{
        fontSize: 22, fontWeight: 600, letterSpacing: -0.4,
        margin: '0 0 10px', color: 'var(--text)',
      }}>Ваша база пока пуста</h2>
      <p style={{
        fontSize: 14, color: 'var(--sub)', lineHeight: 1.5,
        margin: '0 0 22px', maxWidth: 280,
      }}>Создайте пространство — это папка верхнего уровня. Внутри будут страницы: заметки, проекты, списки.</p>
      <button onClick={onCreate} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '13px 22px', borderRadius: 14,
        background: 'var(--accent)', color: '#fff',
        border: 'none', cursor: onCreate ? 'pointer' : 'default',
        fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
        boxShadow: '0 8px 20px -8px var(--accent)',
      }}>
        <IconPlus size={18} strokeWidth={2.2} /> Новое пространство
      </button>
    </>
  );

  // Embedded — занимает min-height родителя и центрирует контент.
  // Identical layout to EmptyShell in app-screens.jsx (общие отступы 32px 32px 64px).
  if (embedded) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '32px 32px 64px',
      }}>{InnerCore}</div>
    );
  }
  // Non-embedded (старый figma-canvas) — оставляем как было, но с теми же inner-стилями.
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '20px 22px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>dot<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '32px 32px 64px',
      }}>{InnerCore}</div>
    </div>
  );
}

// ─── Пустое пространство ──────────────────────────────
// Без props — статичный артборд (Работа · briefcase).
// С space + onBack/onCreatePage/onMenu — живой режим.
function SpaceEmpty({ space, onBack, onCreatePage, onMenu }) {
  const SPACE_ICONS = {
    briefcase: IconBriefcase, heart: IconHeart, compass: IconCompass,
    star: IconStar, book: IconBook, folder: IconFolder,
  };
  let meta = {};
  try { meta = space?.icon ? JSON.parse(space.icon) : {}; } catch (_) {}
  const iconKey = meta.key || (space ? 'folder' : 'briefcase');
  const accentColor = meta.color || 'var(--accent)';
  const Icon = SPACE_ICONS[iconKey] || IconFolder;
  const name = space?.name || 'Работа';
  const desc = meta.description || (space ? '' : 'Проекты, встречи и цели по работе');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid var(--line)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: onBack ? 'pointer' : 'default', display: 'flex' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} strokeWidth={1.8} /><span>База / {name}</span>
        </div>
        <button onClick={onMenu} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', cursor: onMenu ? 'pointer' : 'default', display: 'flex' }}>
          <IconMore size={20} strokeWidth={1.75} />
        </button>
      </div>
      <div style={{ padding: '22px 24px 0' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: accentColor, display: 'flex' }}><Icon size={24} strokeWidth={1.75} /></span>
          {name}
        </h1>
        {desc && <p style={{ fontSize: 14, color: 'var(--sub)', margin: '8px 0 0', lineHeight: 1.45 }}>{desc}</p>}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px', textAlign: 'center', gap: 14 }}>
        <div style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.5 }}>
          Создайте первую страницу в этом пространстве. Заметка, проект, список — всё это обычные страницы.
        </div>
        <button onClick={onCreatePage} style={{
          height: 42, padding: '0 22px', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: onCreatePage ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <IconPlusSmall size={16} strokeWidth={2.2} /> Создать страницу
        </button>
      </div>
    </div>
  );
}

// ─── Bottom-sheet создания пространства ──────────────────────────────
// Без props — статичный артборд для канваса.
// С `live` + `onSubmit({name, description, icon, color})` + `onClose` — рабочая форма.
function CreateSpaceSheet({ live, initialSpace, onClose, onSubmit, onDelete }) {
  const colors = ['#6E2BF5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#A855F7'];
  const iconKeys = ['briefcase', 'heart', 'compass', 'star', 'book', 'folder'];
  const iconCmps = [IconBriefcase, IconHeart, IconCompass, IconStar, IconBook, IconFolder];
  const isEdit = !!initialSpace;

  // Распаковка initialSpace для edit-режима
  let initialMeta = {};
  if (isEdit) { try { initialMeta = JSON.parse(initialSpace.icon || '{}'); } catch (_) {} }

  const [name, setName] = React.useState(initialSpace?.name ?? (live ? '' : 'Работа'));
  const [description, setDescription] = React.useState(initialMeta.description ?? (live ? '' : 'Проекты, встречи и цели по работе'));
  const [iconKey, setIconKey] = React.useState(initialMeta.key || 'briefcase');
  const [color, setColor] = React.useState(initialMeta.color || colors[0]);
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!live || !onSubmit) return;
    if (!name.trim() || busy) return;
    setBusy(true);
    // onSubmit сам решает, как закрывать форму (например, переход на новый экран
    // пространства). onClose тут НЕ вызываем — иначе перезатрём навигацию.
    await onSubmit({ name: name.trim(), description: description.trim(), icon: iconKey, color });
    setBusy(false);
  };

  const remove = async () => {
    if (!live || !onDelete) return;
    if (!window.confirm('Удалить пространство со всеми страницами? Действие можно отменить.')) return;
    setBusy(true);
    // onDelete сам решает, что делать с навигацией
    await onDelete();
    setBusy(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg)' }}>
      {/* фон — приглушённое содержимое под sheet'ом (только для статичного артборда) */}
      {!live && (
        <div style={{ flex: 1, opacity: 0.35, pointerEvents: 'none', overflow: 'hidden' }}>
          <BaseEmpty />
        </div>
      )}
      <div onClick={live ? onClose : undefined} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        padding: '10px 0 20px',
        maxHeight: '90%', overflowY: 'auto',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '2px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', fontSize: 15, fontFamily: 'inherit', cursor: live ? 'pointer' : 'default', visibility: live ? 'visible' : 'hidden' }}>Отмена</button>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{isEdit ? 'Изменить пространство' : 'Новое пространство'}</div>
            <span style={{ width: 60 }} />
          </div>

          {/* Название */}
          <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 8 }}>Название</div>
          {live ? (
            <input
              autoFocus={!isEdit}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Работа"
              style={{
                width: '100%', height: 44, borderRadius: 12, background: 'var(--chip)',
                border: 'none', outline: 'none',
                padding: '0 14px', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div style={{
              height: 44, borderRadius: 12, background: 'var(--chip)',
              display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: 'var(--text)',
            }}>
              {name}<Caret />
            </div>
          )}

          {/* Описание */}
          <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.3, textTransform: 'uppercase', margin: '18px 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Описание</span>
            <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--sub)', opacity: 0.7 }}>· необязательно</span>
          </div>
          {live ? (
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Что здесь будет"
              style={{
                width: '100%', minHeight: 44, borderRadius: 12, background: 'var(--chip)',
                border: 'none', outline: 'none', resize: 'none',
                padding: '12px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit',
                lineHeight: 1.4, boxSizing: 'border-box',
              }}
            />
          ) : (
            <div style={{
              minHeight: 44, borderRadius: 12, background: 'var(--chip)',
              display: 'flex', alignItems: 'flex-start', padding: '12px 14px', fontSize: 14, color: 'var(--text)',
              lineHeight: 1.4,
            }}>
              {description}<Caret />
            </div>
          )}

          {/* Иконка */}
          <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.3, textTransform: 'uppercase', margin: '18px 0 8px' }}>Иконка</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {iconCmps.map((Ic, i) => {
              const sel = iconKeys[i] === iconKey;
              return (
                <div key={i}
                  onClick={live ? () => setIconKey(iconKeys[i]) : undefined}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: sel ? 'var(--accent-soft)' : 'var(--chip)',
                    color: sel ? 'var(--accent)' : 'var(--sub)',
                    display: 'grid', placeItems: 'center',
                    border: sel ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                    cursor: live ? 'pointer' : 'default',
                  }}>
                  <Ic size={18} strokeWidth={1.75} />
                </div>
              );
            })}
          </div>

          {/* Цвет */}
          <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.3, textTransform: 'uppercase', margin: '18px 0 8px' }}>Цвет</div>
          <div style={{ display: 'flex', gap: 14, padding: '2px 2px' }}>
            {colors.map((c) => (
              <div key={c}
                onClick={live ? () => setColor(c) : undefined}
                style={{
                  width: 28, height: 28, borderRadius: 8, background: c,
                  boxShadow: c === color ? '0 0 0 2px var(--bg), 0 0 0 4px var(--text)' : 'none',
                  cursor: live ? 'pointer' : 'default',
                }} />
            ))}
          </div>

          <button onClick={submit} disabled={live && (!name.trim() || busy)} style={{
            marginTop: 24, width: '100%', height: 46, borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
            cursor: live ? 'pointer' : 'default',
            opacity: (live && (!name.trim() || busy)) ? 0.4 : 1,
          }}>{busy ? '…' : (isEdit ? 'Сохранить' : 'Создать')}</button>

          {live && isEdit && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button onClick={remove} disabled={busy} style={{
                background: 'none', border: 'none', color: '#E44',
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}><IconLogOut size={16} strokeWidth={1.75} /> Удалить пространство</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Long-press меню для страницы в дереве ──────────────────────────────
function PageLongPress() {
  const actions = [
    { icon: IconType,      label: 'Переименовать' },
    { icon: IconFolder,    label: 'Переместить в…' },
    { icon: IconPin,       label: 'Закрепить' },
    { icon: IconFile,      label: 'Дублировать' },
    { icon: IconMore,      label: 'Поделиться' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg)' }}>
      <div style={{ flex: 1, opacity: 0.3, pointerEvents: 'none', overflow: 'hidden' }}>
        <BaseEmpty />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        padding: '10px 0 20px',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '2px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '6px 20px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--sub)' }}>
            <IconFile size={15} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Запуск лендинга</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Работа · 2 дочерние</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {actions.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px', borderBottom: '1px solid var(--line)',
            }}>
              <a.icon size={18} strokeWidth={1.75} color="var(--text)" />
              <span style={{ fontSize: 15 }}>{a.label}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', color: '#E44',
          }}>
            <IconLogOut size={18} strokeWidth={1.75} />
            <span style={{ fontSize: 15 }}>Удалить</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Меню действий для пространства (⋯ на экране пространства) ─────
function SpaceMenu() {
  const actions = [
    { icon: IconType,   label: 'Переименовать' },
    { icon: IconBriefcase, label: 'Изменить иконку' },
    { icon: IconStar,   label: 'Изменить цвет' },
    { icon: IconFile,   label: 'Изменить описание' },
    { icon: IconPin,    label: 'Закрепить в корне' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, opacity: 0.35, pointerEvents: 'none', overflow: 'hidden' }}>
        <SpaceEmpty />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        padding: '10px 0 20px',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '2px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '6px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
            <IconBriefcase size={16} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Работа</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Пространство</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {actions.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px', borderBottom: '1px solid var(--line)',
            }}>
              <a.icon size={18} strokeWidth={1.75} color="var(--text)" />
              <span style={{ fontSize: 15 }}>{a.label}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', color: '#E44',
          }}>
            <IconLogOut size={18} strokeWidth={1.75} />
            <span style={{ fontSize: 15 }}>Удалить пространство</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Меню действий для страницы (⋯ на экране страницы) ─────
function PageMenu() {
  const actions = [
    { icon: IconType,   label: 'Переименовать' },
    { icon: IconFolder, label: 'Переместить в…' },
    { icon: IconPin,    label: 'Закрепить' },
    { icon: IconFile,   label: 'Дублировать' },
    { icon: IconMore,   label: 'Поделиться' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, opacity: 0.35, pointerEvents: 'none', overflow: 'hidden' }}>
        <NoteReading />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
        padding: '10px 0 20px',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '2px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '6px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--sub)' }}>
            <IconFile size={15} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Запуск лендинга</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Работа</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {actions.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px', borderBottom: '1px solid var(--line)',
            }}>
              <a.icon size={18} strokeWidth={1.75} color="var(--text)" />
              <span style={{ fontSize: 15 }}>{a.label}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', color: '#E44',
          }}>
            <IconLogOut size={18} strokeWidth={1.75} />
            <span style={{ fontSize: 15 }}>Удалить страницу</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── База с одним пустым пространством (промежуточное состояние) ─────
function BaseOneSpaceScreen() {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px 10px' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>dot<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>
      {/* search */}
      <div style={{ padding: '0 22px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--chip)', borderRadius: 12, padding: '10px 14px', color: 'var(--sub)',
        }}>
          <IconSearch size={16} color="var(--sub)" strokeWidth={1.75} />
          <div style={{ fontSize: 14 }}>Поиск по базе</div>
        </div>
      </div>
      {/* one space */}
      <div style={{ padding: '14px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--accent)' }}>Пространства</div>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 24px', cursor: 'pointer',
        borderBottom: '1px solid var(--line)',
      }}>
        <span style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms' }}>
          <IconChevronDown size={14} strokeWidth={2} />
        </span>
        <span style={{ color: 'var(--accent)', display: 'flex' }}>
          <IconBriefcase size={16} strokeWidth={1.75} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Работа</span>
        <span style={{ fontSize: 12, color: 'var(--sub)' }}>0</span>
      </div>
      {open && (
        <div style={{
          padding: '18px 24px 20px 50px',
          borderBottom: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column', gap: 10,
          alignItems: 'flex-start',
        }}>
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
            В этом пространстве пока нет страниц.
          </div>
          <button style={{
            height: 34, padding: '0 14px', borderRadius: 10,
            border: '1px solid var(--line)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <IconPlusSmall size={14} strokeWidth={2.2} /> Создать страницу
          </button>
        </div>
      )}

      {/* hint to create another space */}
      <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--sub)' }}>
        <IconPlusSmall size={14} strokeWidth={2} />
        <span style={{ fontSize: 13 }}>Новое пространство</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* FAB */}
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

      {/* Tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 22, paddingTop: 8,
        background: 'var(--bg)', borderTop: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-around', zIndex: 10,
      }}>
        {[
          { id: 'tasks',  label: 'Задачи',   Icon: IconCheckSquare, on: false },
          { id: 'habits', label: 'Привычки', Icon: IconRepeat,      on: false },
          { id: 'base',   label: 'База',     Icon: IconBook,        on: true },
          { id: 'me',     label: 'Профиль',  Icon: IconUser,        on: false },
        ].map((t) => {
          const c = t.on ? 'var(--accent)' : 'var(--sub)';
          return (
            <div key={t.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 14px', position: 'relative',
            }}>
              {t.on && <span style={{ position: 'absolute', top: -9, width: 22, height: 3, background: 'var(--accent)', borderRadius: 2 }} />}
              <t.Icon size={22} color={c} strokeWidth={t.on ? 2 : 1.75} />
              <span style={{ fontSize: 11, fontWeight: t.on ? 600 : 500, color: c }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Дуальный режим во время ESM-миграции: window для legacy, export для нового кода.
Object.assign(window, { NoteHeader, NoteBody, Block, Caret, SelectedInline, NoteReading, NoteEditing, NoteSlashMenu, NoteFormatBar, FmtBtn, EditorFooterBar, NoteEmpty, BookListPage, NoteSlashPopover, NoteProperties, NotePropertyType, BaseEmpty, SpaceEmpty, CreateSpaceSheet, PageLongPress, SpaceMenu, PageMenu, BaseOneSpaceScreen });
export { NoteHeader, NoteBody, Block, Caret, SelectedInline, NoteReading, NoteEditing, NoteSlashMenu, NoteFormatBar, FmtBtn, EditorFooterBar, NoteEmpty, BookListPage, NoteSlashPopover, NoteProperties, NotePropertyType, BaseEmpty, SpaceEmpty, CreateSpaceSheet, PageLongPress, SpaceMenu, PageMenu, BaseOneSpaceScreen };
