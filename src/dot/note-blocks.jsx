import React from 'react';
// ─── Редактор страницы «Базы» — блочная модель, как в Notion, но тихо ─────
//
// Все экраны редактора — это один <EditorScreen> с разным state:
// какой блок сейчас в фокусе, какого он типа, открыт ли слэш-поповер,
// выделен ли текст, открыт ли bottom-sheet типов. Это ближе к правде
// (в реальном продукте это один экран с состояниями), чем 10 копий.

// IIFE распакован — модуль теперь top-level.
// Иконки импортятся явно вместо чтения с window.
import {
  IconBold, IconBook, IconCalendar, IconCamera, IconCheck, IconCheckSquare,
  IconChevronLeft, IconFile, IconFlag, IconFolder, IconHash, IconItalic,
  IconLink, IconList, IconListOrdered, IconLogOut, IconMore, IconPlusSmall,
  IconQuote, IconStar, IconType, IconUser,
} from './icons.jsx';

const Caret = () => (
  <span style={{
    display: 'inline-block', width: 2, height: '1em', background: 'var(--accent)',
    marginLeft: 1, verticalAlign: 'middle', animation: 'caret 1s steps(1) infinite',
  }} />
);

  // ─── Accessory bar над клавиатурой ─────────────────────────────
  // B, I, 🔗 — форматы, применяемые к выделению. Если выделения нет,
  // B/I сработают на следующий введённый символ; 🔗 требует текст, на
  // который вешать ссылку, поэтому без выделения — disabled.
  function FooterBar({ onPlus, activePlus, onB, onI, onLink, boldActive, hasSelection, linkActive }) {
    const btn = (active, disabled) => ({
      width: 36, height: 36, borderRadius: 8, border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      display: 'grid', placeItems: 'center',
      background: active ? 'var(--accent-soft)' : 'transparent',
      color: active ? 'var(--accent)' : (disabled ? 'rgba(60,60,67,0.3)' : 'var(--text)'),
    });
    return (
      <div style={{
        height: 44, background: 'var(--bg)', borderTop: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px',
      }}>
        <button onClick={onPlus} style={btn(activePlus)}>
          <IconPlusSmall size={18} strokeWidth={2.2} />
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />
        <button onClick={onB} style={btn(boldActive)}>
          <IconBold size={16} strokeWidth={2.2} />
        </button>
        <button onClick={onI} style={btn(false)}>
          <IconItalic size={16} strokeWidth={2.2} />
        </button>
        <button onClick={onLink} disabled={!hasSelection} style={btn(linkActive, !hasSelection)}>
          <IconLink size={16} strokeWidth={2} />
        </button>
        <div style={{ flex: 1 }} />
        <button style={{
          background: 'none', border: 'none', color: 'var(--accent)',
          fontWeight: 600, fontSize: 14, padding: '0 6px', cursor: 'pointer',
        }}>Готово</button>
      </div>
    );
  }

  // ─── Один блок в теле страницы ─────────────────────────────────
  // type: 'p' | 'h1' | 'h2' | 'h3' | 'check' | 'bullet' | 'image' | 'quote'
  function Block({ block, focused, selection, slashQuery }) {
    const { type, text = '', checked, placeholder, linkRange } = block;

    // выделение: разбиваем text на три части
    const renderText = () => {
      if (focused && selection) {
        const [s, e] = selection;
        return (
          <>
            {text.slice(0, s)}
            <span style={{ background: 'rgba(109,60,240,0.18)', borderRadius: 2 }}>{text.slice(s, e)}</span>
            {text.slice(e)}
          </>
        );
      }
      if (linkRange) {
        const [s, e] = linkRange;
        return (
          <>
            {text.slice(0, s)}
            <span style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 0 }}>{text.slice(s, e)}</span>
            {text.slice(e)}
          </>
        );
      }
      if (focused && slashQuery !== undefined) {
        // показать «/» + query c кареткой
        return (
          <>
            {text}
            <span style={{ color: 'var(--sub)' }}>/</span>
            {slashQuery}
            <Caret />
          </>
        );
      }
      if (focused && !text) {
        return <span style={{ color: 'var(--sub)' }}>{placeholder || 'Начните писать или нажмите /'}<Caret /></span>;
      }
      if (focused) return <>{text}<Caret /></>;
      if (!text) return <span style={{ color: 'rgba(60,60,67,0.35)' }}>{placeholder}</span>;
      return text;
    };

    if (type === 'h1') return (
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, padding: '10px 0 6px' }}>
        {renderText()}
      </div>
    );
    if (type === 'h2') return (
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, padding: '14px 0 4px' }}>
        {renderText()}
      </div>
    );
    if (type === 'h3') return (
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25, padding: '10px 0 2px' }}>
        {renderText()}
      </div>
    );
    if (type === 'check') return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0' }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4, marginTop: 3,
          border: '1.5px solid ' + (checked ? 'var(--accent)' : 'var(--line)'),
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          {checked && <IconCheck size={12} color="#fff" strokeWidth={3} />}
        </div>
        <div style={{
          fontSize: 15, lineHeight: 1.5, flex: 1,
          textDecoration: checked ? 'line-through' : 'none',
          color: checked ? 'var(--sub)' : 'var(--text)',
        }}>{renderText()}</div>
      </div>
    );
    if (type === 'bullet') return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0' }}>
        <span style={{ color: 'var(--sub)', fontSize: 15, lineHeight: 1.5, marginTop: 1 }}>•</span>
        <div style={{ fontSize: 15, lineHeight: 1.5, flex: 1 }}>{renderText()}</div>
      </div>
    );
    if (type === 'link') {
      // Пустой блок-ссылка: плейсхолдер для ввода URL
      if (!block.url && !text) {
        return (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', margin: '6px 0',
            border: '1px dashed var(--line)', borderRadius: 10,
            background: 'var(--bg)',
          }}>
            <div style={{ color: 'var(--sub)', display: 'flex' }}>
              <IconLink size={16} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, fontSize: 14, color: 'var(--sub)', display: 'flex', alignItems: 'center' }}>
              <span>Вставьте URL</span>
              {focused && <Caret />}
            </div>
            {block.fromClipboard && (
              <span style={{
                fontSize: 11, color: 'var(--accent)',
                background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 4,
              }}>из буфера</span>
            )}
          </div>
        );
      }
      // Загрузка превью
      if (block.loading) {
        return (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', margin: '6px 0',
            border: '1px solid var(--line)', borderRadius: 10,
            background: 'var(--bg)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'var(--chip)', flexShrink: 0,
              animation: 'pulse 1.4s ease-in-out infinite',
            }} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ height: 10, width: '60%', background: 'var(--chip)', borderRadius: 3, animation: 'pulse 1.4s ease-in-out infinite' }} />
              <div style={{ height: 8, width: '38%', background: 'var(--chip)', borderRadius: 3, animation: 'pulse 1.4s ease-in-out infinite 0.2s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--sub)' }}>Загружаем…</div>
          </div>
        );
      }
      // Готовая карточка: favicon-плашка + название + домен
      const domain = (block.url || '').replace(/^https?:\/\//, '').split('/')[0] || block.domain;
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', margin: '6px 0',
          border: '1px solid var(--line)', borderRadius: 10,
          background: 'var(--bg)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: block.color || 'var(--chip)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>{block.initials || '·'}</div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{
              fontSize: 14, color: 'var(--text)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{text}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>{domain}</div>
          </div>
        </div>
      );
    }
    if (type === 'page-ref') {
      // Внутренняя ссылка на страницу базы
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px', margin: '3px 0', borderRadius: 6,
          background: 'var(--chip)', width: 'fit-content',
        }}>
          <IconFile size={13} color="var(--sub)" strokeWidth={1.75} />
          <span style={{ fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--line)' }}>{text}</span>
        </div>
      );
    }
    if (type === 'quote') return (
      <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 12, margin: '8px 0' }}>
        <div style={{ fontSize: 15, lineHeight: 1.5, fontStyle: 'italic', color: 'var(--text)' }}>{renderText()}</div>
      </div>
    );
    if (type === 'image') return (
      <div style={{
        margin: '10px 0', borderRadius: 12, border: '1px dashed var(--line)',
        background: 'var(--chip)', padding: '22px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
          <IconCamera size={18} strokeWidth={1.75} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center' }}>Добавить изображение</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            height: 32, padding: '0 12px', borderRadius: 8,
            background: 'var(--accent)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
          }}>Снять фото</button>
          <button style={{
            height: 32, padding: '0 12px', borderRadius: 8,
            background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--line)',
            fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          }}>Из галереи</button>
        </div>
      </div>
    );
    // 'p' — обычный параграф
    return (
      <div style={{ fontSize: 15, lineHeight: 1.55, padding: '6px 0', color: 'var(--text)' }}>
        {renderText()}
      </div>
    );
  }

  // ─── Свойства страницы (Автор, Дата, Рейтинг...) ───────────────
  function PropertiesPanel({ props, adding, readonly }) {
    return (
      <div style={{ borderBottom: '1px solid var(--line)', padding: '4px 0 12px' }}>
        {props.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', minHeight: 32 }}>
            <div style={{ width: 110, color: 'var(--sub)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <p.Icon size={13} strokeWidth={1.75} />
              {p.editingName ? (
                <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center' }}>
                  {p.name || <span style={{ color: 'rgba(60,60,67,0.35)' }}>{p.namePlaceholder || 'Имя свойства'}</span>}
                  <Caret />
                </span>
              ) : (
                <span>{p.name}</span>
              )}
            </div>
            <div style={{ flex: 1, fontSize: 14 }}>
              {/* Рейтинг — 5 звёзд */}
              {p.kind === 'rating' ? (
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <IconStar
                      key={n}
                      size={16}
                      strokeWidth={1.75}
                      style={{
                        color: n <= (p.value || 0) ? 'var(--accent)' : 'rgba(60,60,67,0.25)',
                        fill: n <= (p.value || 0) ? 'var(--accent)' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              ) : p.kind === 'checkbox' ? (
                // Чек-бокс — iOS тоггл
                <div style={{
                  width: 42, height: 26, borderRadius: 13,
                  background: p.value ? 'var(--accent)' : 'rgba(120,120,128,0.16)',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{
                    position: 'absolute', top: 2,
                    left: p.value ? 18 : 2,
                    width: 22, height: 22, borderRadius: 11,
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    transition: 'left 0.2s',
                  }} />
                </div>
              ) : (
                // Текст / Число / Дата / Ссылка — строка с кареткой при editing
                <span style={{ color: p.empty ? 'rgba(60,60,67,0.35)' : 'var(--text)' }}>
                  {p.empty && !p.editing ? 'Пусто' : p.value}
                  {p.editing && <Caret />}
                </span>
              )}
            </div>
          </div>
        ))}
        {!readonly && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 0', color: 'var(--sub)', fontSize: 13, cursor: 'pointer',
          }}>
            <IconPlusSmall size={14} strokeWidth={2} />
            <span>{adding ? 'Выберите тип свойства…' : 'Добавить свойство'}</span>
          </div>
        )}
      </div>
    );
  }

  // ─── Главный экран редактора ───────────────────────────────────
  function EditorScreen({
    mode = 'edit',        // 'edit' | 'read'
    crumbs = ['База', 'Работа'],
    title = '',
    titlePlaceholder = 'Без названия',
    titleFocused = false,
    blocks = [],
    focusedBlock = null,  // индекс
    selection = null,     // [start, end] у текущего блока
    slashQuery,           // если строка — поповер у курсора
    slashHighlight = 0,
    slashShowAll = false,
    properties = null,    // null | [...]
    addingProp = false,
    showKeyboard = false,
    keyboardMode = 'lower',
    footerBarPlus = false,
    bottomSheet = null,   // 'blocks' | 'propertyType' | 'blockActions' | null
    formatBar = null,     // {x, y, bold} | null
    linkActive = false,
    linkPopover = null,   // { value, fromClipboard } | null
    kbHasReturn = true,
    datePicker = false,   // показать колесо-date-picker вместо клавиатуры
  }) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
        {/* header — хлебные крошки (путь + текущая страница) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px 10px',
        }}>
          <IconChevronLeft size={22} color="var(--text)" strokeWidth={1.75} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sub)', flex: 1, minWidth: 0 }}>
            <IconBook size={14} strokeWidth={1.75} />
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
                <span style={{ opacity: 0.5 }}>/</span>
              </React.Fragment>
            ))}
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: title ? 'var(--text)' : 'rgba(60,60,67,0.45)',
              fontStyle: title ? 'normal' : 'italic',
              fontWeight: title ? 500 : 400,
            }}>
              {title || 'Новая страница'}
            </span>
          </div>
          <IconMore size={20} color="var(--sub)" strokeWidth={1.75} />
        </div>

        {/* scrollable body */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '4px 22px 12px', position: 'relative' }}>
          {/* title */}
          <div style={{
            fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15,
            padding: '8px 0 6px',
            color: title ? 'var(--text)' : 'rgba(60,60,67,0.35)',
          }}>
            {title || titlePlaceholder}
            {titleFocused && <Caret />}
          </div>

          {/* properties */}
          {properties && <PropertiesPanel props={properties} adding={addingProp} readonly={mode === 'read'} />}

          {/* blocks */}
          <div style={{ paddingTop: properties ? 10 : 2 }}>
            {blocks.map((b, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <Block
                  block={b}
                  focused={i === focusedBlock}
                  selection={i === focusedBlock ? selection : null}
                  slashQuery={i === focusedBlock ? slashQuery : undefined}
                />
                {/* слэш-поповер крепится к фокусному блоку */}
                {i === focusedBlock && slashQuery !== undefined && (
                  <SlashPopover query={slashQuery} highlight={slashHighlight} showAll={slashShowAll} />
                )}
                {/* попап ввода URL (после тапа по 🔗) */}
                {i === focusedBlock && linkPopover && (
                  <LinkInputPopover value={linkPopover.value} fromClipboard={linkPopover.fromClipboard} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* footer bar (accessory над клавиатурой) */}
        {showKeyboard && !datePicker && <FooterBar activePlus={footerBarPlus} hasSelection={!!selection} linkActive={linkActive} />}
        {/* клавиатура */}
        {showKeyboard && !bottomSheet && !datePicker && <IosKeyboard mode={keyboardMode} />}
        {/* date picker (колесо) */}
        {datePicker && <DatePickerSheet />}

        {/* bottom sheet (перекрывает клавиатуру) */}
        {bottomSheet === 'blocks' && <BlocksSheet />}
        {bottomSheet === 'propertyType' && <PropertyTypeSheet />}
        {bottomSheet === 'blockActions' && <BlockActionsSheet />}
      </div>
    );
  }

  // ─── Поповер слэш-меню у курсора ───────────────────────────────
  // «Текст» тут нет намеренно: слэш = превратить текущий блок во что-то
  // другое. Оставить его как есть = просто не выбирать ничего.
  function SlashPopover({ query = '', highlight = 0 }) {
    const items = [
      { Icon: IconType, label: 'Заголовок 1', hint: 'Большой раздел' },
      { Icon: IconType, label: 'Заголовок 2', hint: 'Подраздел' },
      { Icon: IconList, label: 'Маркир. список', hint: '• пункт' },
      { Icon: IconCheckSquare, label: 'Чек-лист', hint: '☐ задача' },
      { Icon: IconQuote, label: 'Цитата', hint: 'Выделенный текст' },
      { Icon: IconLink, label: 'Ссылка', hint: 'Карточка со ссылкой' },
      { Icon: IconCamera, label: 'Изображение', hint: 'Фото или из галереи' },
    ];
    const filtered = query
      ? items.filter(x => x.label.toLowerCase().includes(query.toLowerCase()))
      : items;
    return (
      <div style={{
        position: 'absolute', left: -4, top: '100%', zIndex: 20,
        width: 260, background: 'var(--bg)', border: '1px solid var(--line)',
        borderRadius: 12, boxShadow: '0 16px 40px -8px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.06)',
        padding: 6, marginTop: 4,
      }}>
        <div style={{ padding: '6px 10px 4px', fontSize: 11, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Тип блока
        </div>
        {filtered.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: i === highlight ? 'var(--accent-soft)' : 'transparent',
            color: i === highlight ? 'var(--accent)' : 'var(--text)',
          }}>
            <it.Icon size={16} strokeWidth={1.75} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</span>
              <span style={{ fontSize: 11, color: 'var(--sub)' }}>{it.hint}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Плавающий тулбар форматирования у выделения ───────────────
  function FormatPopover({ bold }) {
    const btn = (active) => ({
      width: 36, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
      display: 'grid', placeItems: 'center',
      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: '#fff',
    });
    return (
      <div style={{
        position: 'absolute', left: 0, top: -44, zIndex: 30,
        background: '#1C1C1E', borderRadius: 10,
        boxShadow: '0 12px 30px -6px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', padding: 3, gap: 2,
      }}>
        <button style={btn(bold)}><IconBold size={15} strokeWidth={2.4} /></button>
        <button style={btn(false)}><IconItalic size={15} strokeWidth={2.4} /></button>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.18)' }} />
        <button style={btn(false)}><IconLink size={14} strokeWidth={2} /></button>
        <button style={{ ...btn(false), padding: '0 10px', width: 'auto', fontSize: 13, fontWeight: 500 }}>H1</button>
        <button style={{ ...btn(false), padding: '0 10px', width: 'auto', fontSize: 13, fontWeight: 500 }}>H2</button>
      </div>
    );
  }

  // ─── Попап ввода URL (после тапа по 🔗 в FooterBar) ────────────
  function LinkInputPopover({ value = '', fromClipboard = false }) {
    return (
      <div style={{
        position: 'absolute', left: 0, right: 0, top: -56, zIndex: 35,
        background: 'var(--bg)', border: '1px solid var(--line)',
        borderRadius: 10, padding: 6, display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 14px 34px -8px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ color: 'var(--sub)', display: 'flex', paddingLeft: 4 }}>
          <IconLink size={15} strokeWidth={2} />
        </div>
        <div style={{
          flex: 1, fontSize: 14, padding: '6px 0',
          color: value ? 'var(--text)' : 'var(--sub)',
          display: 'flex', alignItems: 'center', minWidth: 0,
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || 'Вставьте ссылку'}
          </span>
          <Caret />
          {fromClipboard && (
            <span style={{
              marginLeft: 8, fontSize: 11, color: 'var(--accent)',
              background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: 4,
              whiteSpace: 'nowrap',
            }}>из буфера</span>
          )}
        </div>
        <button style={{
          height: 30, padding: '0 12px', borderRadius: 6,
          background: value ? 'var(--accent)' : 'var(--chip)',
          color: value ? '#fff' : 'var(--sub)',
          border: 'none', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          cursor: value ? 'pointer' : 'default',
        }}>Готово</button>
      </div>
    );
  }

  // ─── Bottom sheets ─────────────────────────────────────────────
  function Sheet({ title, children }) {
    return (
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -10px 30px -8px rgba(0,0,0,0.18)',
        paddingBottom: 20,
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        {title && (
          <div style={{ padding: '4px 22px 10px', fontSize: 15, fontWeight: 600 }}>{title}</div>
        )}
        {children}
      </div>
    );
  }

  function BlocksSheet() {
    const sections = [
      {
        title: 'Текст',
        items: [
          { Icon: IconType, label: 'Текст', hint: 'Обычный параграф' },
          { Icon: IconType, label: 'Заголовок 1' },
          { Icon: IconType, label: 'Заголовок 2' },
          { Icon: IconType, label: 'Заголовок 3' },
        ],
      },
      {
        title: 'Списки',
        items: [
          { Icon: IconList, label: 'Маркированный' },
          { Icon: IconListOrdered, label: 'Нумерованный' },
          { Icon: IconCheckSquare, label: 'Чек-лист' },
        ],
      },
      {
        title: 'Медиа и блоки',
        items: [
          { Icon: IconCamera, label: 'Изображение' },
          { Icon: IconLink, label: 'Ссылка', hint: 'Карточка с превью' },
          { Icon: IconQuote, label: 'Цитата' },
          { Icon: IconFile, label: 'Вложенная страница' },
        ],
      },
    ];
    return (
      <Sheet title="Вставить блок">
        <div style={{ padding: '0 14px' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{
                padding: '10px 8px 4px', fontSize: 11, color: 'var(--sub)',
                textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600,
              }}>{s.title}</div>
              {s.items.map((it, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 8px', borderRadius: 8,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--chip)', display: 'grid', placeItems: 'center',
                    color: 'var(--text)',
                  }}>
                    <it.Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</span>
                    {it.hint && <span style={{ fontSize: 12, color: 'var(--sub)' }}>{it.hint}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Sheet>
    );
  }

  function PropertyTypeSheet() {
    const items = [
      { Icon: IconType,     label: 'Текст',    hint: 'Любая строка' },
      { Icon: IconCalendar, label: 'Дата',     hint: 'Одиночная дата' },
      { Icon: IconHash,     label: 'Число',    hint: 'Целое или дробное' },
      { Icon: IconStar,     label: 'Рейтинг',  hint: '★ от 1 до 5' },
      { Icon: IconCheck,    label: 'Чек-бокс', hint: 'Да / нет' },
      { Icon: IconLink,     label: 'Ссылка',   hint: 'URL' },
    ];
    return (
      <Sheet title="Тип свойства">
        <div style={{ padding: '0 14px' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 8px', borderRadius: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--chip)', display: 'grid', placeItems: 'center',
                color: 'var(--text)',
              }}>
                <it.Icon size={16} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</span>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>{it.hint}</span>
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    );
  }

  function BlockActionsSheet() {
    const items = [
      { Icon: IconType, label: 'Преобразовать в…' },
      { Icon: IconFile, label: 'Дублировать' },
      { Icon: IconFolder, label: 'Переместить в…' },
      { Icon: IconLink, label: 'Скопировать ссылку на блок' },
      { Icon: IconLogOut, label: 'Удалить блок', danger: true },
    ];
    return (
      <Sheet title="Действия с блоком">
        <div style={{ padding: '0 14px' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 8px', borderRadius: 8,
              color: it.danger ? '#D93025' : 'var(--text)',
            }}>
              <it.Icon size={18} strokeWidth={1.75} />
              <span style={{ fontSize: 15 }}>{it.label}</span>
            </div>
          ))}
        </div>
      </Sheet>
    );
  }

  // ─── iOS-style date picker (колесо) — для свойства типа «Дата» ──
  function DatePickerSheet() {
    const days   = ['24','25','26','27','28','29','30'];
    const months = ['янв','фев','мар','апр','май','июн'];
    const years  = ['2024','2025','2026','2027','2028'];
    const Wheel = ({ values, selectedIdx }) => (
      <div style={{ flex: 1, position: 'relative', height: 176, overflow: 'hidden' }}>
        {/* подложка-хайлайт посередине */}
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
                fontSize: 18, fontWeight: dist === 0 ? 600 : 400,
                color: 'var(--text)', opacity,
                fontVariantNumeric: 'tabular-nums',
              }}>{v}</div>
            );
          })}
        </div>
      </div>
    );
    return (
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface, #fff)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 22,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderBottom: '1px solid var(--line)',
        }}>
          <span style={{ fontSize: 14, color: 'var(--sub)' }}>Отмена</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Дедлайн</span>
          <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>Готово</span>
        </div>
        <div style={{ display: 'flex', padding: '12px 16px' }}>
          <Wheel values={days}   selectedIdx={4} />
          <Wheel values={months} selectedIdx={2} />
          <Wheel values={years}  selectedIdx={2} />
        </div>
      </div>
    );
  }

  // ─── Конкретные экраны — это просто <EditorScreen> с пропсами ───
  //
  // Маппинг артбордов:
  //  3  · note-read    → NoteReading       — режим чтения «Четыре тысячи недель»
  //  4  · note-edit    → NoteEditing       — та же страница, фокус на блоке
  //  5a · note-props   → NoteProperties    — свойства у проекта (редактируем)
  //  5b · note-prop-type → NotePropertyType — лист с типами свойства
  //  6a · note-slash-pop → NoteSlashPopover — «/» в пустой странице, поповер у курсора
  //  6b · note-slash   → NoteSlashMenu     — bottom-sheet через «+» в footer-bar
  //  7  · note-format  → NoteFormatBar     — выделил текст → плавающий тулбар
  //  5  · base-new     → NoteEmpty         — только что создали, фокус в заголовке
  //
  // Плюс новые по пути заполнения (добавим артборды в HTML):
  //  5-pA · NoteTitleTyped  — набрал заголовок, курсор ушёл на первый блок
  //  5-pB · NoteChecklist   — превратили блок в чек-лист, добавили пункт
  //  5-pC · NoteImageBlock  — превратили в изображение
  //  5-pD · NoteBlockActions — long-press по блоку → меню действий

  // Словари примеров
  const BOOK_PROPS = [
    { Icon: IconUser,     name: 'Автор',     value: 'Оливер Буркеман' },
    { Icon: IconCalendar, name: 'Прочитано', value: 'Февраль 2026' },
    { Icon: IconStar,     name: 'Рейтинг',   value: '★★★★☆' },
  ];
  const PROJECT_PROPS = [
    { Icon: IconFlag,     name: 'Статус',      value: 'В работе' },
    { Icon: IconCalendar, name: 'Дедлайн',     value: '28 марта' },
    { Icon: IconUser,     name: 'Ответственный', value: 'Настя' },
  ];
  const PROJECT_PROPS_EMPTY = [
    { Icon: IconFlag,     name: 'Статус',      empty: true },
    { Icon: IconCalendar, name: 'Дедлайн',     empty: true },
  ];

  const BOOK_BODY = [
    { type: 'h2', text: 'Главное' },
    { type: 'p',  text: 'Жизнь короткая — не пытайтесь успеть всё. Это манифест против продуктивности ради продуктивности. Автор предлагает принять ограниченность времени и перестать гнаться за недостижимым.' },
    { type: 'h2', text: 'Заметки' },
    { type: 'bullet', text: 'Время — не ресурс для оптимизации, а сама ткань жизни' },
    { type: 'bullet', text: 'Бэклог «когда-нибудь» — это кладбище, а не план' },
    { type: 'bullet', text: 'Выбирать — значит отказываться. Без отказа нет выбора' },
    { type: 'quote', text: 'Жизнь — это то, что идёт, пока вы составляете списки дел.' },
  ];

  const PROJECT_BODY = [
    { type: 'h2', text: 'Задачи' },
    { type: 'check', text: 'Собрать требования от команды', checked: true },
    { type: 'check', text: 'Сделать wireframe главной', checked: true },
    { type: 'check', text: 'Утвердить копирайтинг', checked: false },
    { type: 'check', text: 'Передать в разработку', checked: false },
    { type: 'h2', text: 'Ссылки' },
    { type: 'link', text: 'Черновик главной', url: 'figma.com/file/x9k/landing', initials: 'F', color: '#0ACF83' },
    { type: 'link', text: 'Доска с референсами', url: 'miro.com/app/board/ref-2026', initials: 'M', color: '#FFD02F' },
    { type: 'h2', text: 'Связанные страницы' },
    { type: 'page-ref', text: 'Бриф' },
    { type: 'page-ref', text: 'Контент и копии' },
  ];

  // ── Экспортируемые экраны ──────────────────────────────────────

  // 3 · Чтение
  function NoteReading() {
    return <EditorScreen
      mode="read"
      crumbs={['База', 'Жизнь']}
      title="Четыре тысячи недель"
      properties={BOOK_PROPS}
      blocks={BOOK_BODY}
    />;
  }

  // 4 · Редактирование (курсор в параграфе)
  function NoteEditing() {
    return <EditorScreen
      crumbs={['База', 'Жизнь']}
      title="Четыре тысячи недель"
      properties={BOOK_PROPS}
      blocks={BOOK_BODY}
      focusedBlock={1}
      showKeyboard
    />;
  }

  // 5a · Свойства — добавляем новое у проекта
  function NoteProperties() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      properties={PROJECT_PROPS_EMPTY}
      addingProp={false}
      blocks={PROJECT_BODY}
    />;
  }

  // 6 · Проект — готовая страница (режим чтения). Демонстрирует блоки:
  //     чек-лист, блок-ссылки, вложенные страницы.
  function NoteProject() {
    return <EditorScreen
      mode="read"
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      properties={PROJECT_PROPS}
      blocks={PROJECT_BODY}
    />;
  }

  // 5b · Выбор типа свойства (bottom sheet)
  function NotePropertyType() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      properties={PROJECT_PROPS_EMPTY}
      addingProp
      blocks={PROJECT_BODY.slice(0, 3)}
      bottomSheet="propertyType"
    />;
  }

  // 5 · Новая пустая страница — фокус в заголовке
  function NoteEmpty() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title=""
      titleFocused
      blocks={[{ type: 'p', text: '', placeholder: 'Начните писать или нажмите / для выбора типа блока' }]}
      showKeyboard
      keyboardMode="upper"
    />;
  }

  // 5-pA · Заголовок введён, курсор перешёл на первый блок
  function NoteTitleTyped() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      blocks={[{ type: 'p', text: '', placeholder: 'Начните писать или нажмите / для выбора типа блока' }]}
      focusedBlock={0}
      showKeyboard
      keyboardMode="upper"
    />;
  }

  // 5b · Слэш-поповер — напечатали «/» в пустом блоке после заголовка
  function NoteSlashPopover() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[{ type: 'p', text: '' }]}
      focusedBlock={0}
      slashQuery=""
      showKeyboard
    />;
  }

  // 5j · Слэш-меню, фокус на «Изображение» — после чек-листа и ссылки
  function NoteSlashImage() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        ...LAYER_LINK,
        { type: 'h2', text: 'Макет главной' },
        { type: 'p', text: '' },
      ]}
      focusedBlock={6}
      slashQuery="изобр"
      slashHighlight={0}
      slashShowAll
      showKeyboard
    />;
  }

  // 5f-5h дубликаты — V1 был dead code до распаковки IIFE (last-wins).
  // Активная версия ниже на строке ~1101.
  // 5f · Пустой блок-ссылка — карточка с полем «Вставьте URL»
  function _NoteLinkBlockEmptyV1() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      blocks={[
        { type: 'h2', text: 'Ссылки' },
        { type: 'link', fromClipboard: true }, // пустой, плейсхолдер
      ]}
      focusedBlock={1}
      showKeyboard
    />;
  }

  // 5g · Загрузка превью
  function _NoteLinkBlockLoadingV1() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      blocks={[
        { type: 'h2', text: 'Ссылки' },
        { type: 'link', url: 'figma.com/file/x9k/landing', loading: true },
      ]}
      focusedBlock={1}
      showKeyboard
    />;
  }

  // 5h · Готовая карточка (превью загрузилось)
  function _NoteLinkBlockReadyV1() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      blocks={[
        { type: 'h2', text: 'Ссылки' },
        { type: 'link', text: 'Черновик главной', url: 'figma.com/file/x9k/landing', initials: 'F', color: '#0ACF83' },
        { type: 'p', text: '' },
      ]}
      focusedBlock={2}
      showKeyboard
    />;
  }

  // 6d · «+» в FooterBar → лист типов свойств (не блоков!)
  function NotePlusProperty() {
    return <EditorScreen
      crumbs={['База', 'Работа']}
      title="Запуск лендинга"
      properties={PROJECT_PROPS_EMPTY}
      addingProp
      blocks={PROJECT_BODY.slice(0, 3)}
      focusedBlock={0}
      showKeyboard
      footerBarPlus
      bottomSheet="propertyType"
    />;
  }

  // 7 · Выделение текста — форматы применяются через FooterBar
  function NoteFormatBar() {
    return <EditorScreen
      crumbs={['База', 'Жизнь']}
      title="Четыре тысячи недель"
      properties={BOOK_PROPS}
      blocks={BOOK_BODY}
      focusedBlock={1}
      selection={[10, 35]}
      showKeyboard
    />;
  }

  // 7a · Выделение + курсор на 🔗 в FooterBar (кнопка активна)
  function NoteLinkButton() {
    return <EditorScreen
      crumbs={['База', 'Жизнь']}
      title="Четыре тысячи недель"
      properties={BOOK_PROPS}
      blocks={BOOK_BODY}
      focusedBlock={1}
      selection={[10, 35]}
      linkActive
      showKeyboard
    />;
  }

  // 7b · Тапнули по 🔗 — открылся попап с полем URL
  function NoteLinkInput() {
    return <EditorScreen
      crumbs={['База', 'Жизнь']}
      title="Четыре тысячи недель"
      properties={BOOK_PROPS}
      blocks={BOOK_BODY}
      focusedBlock={1}
      selection={[10, 35]}
      linkActive
      linkPopover={{ value: 'https://oliverburkeman.com', fromClipboard: true }}
      showKeyboard
    />;
  }

  // 7c · Ссылка применена — выделенный фрагмент стал inline-ссылкой
  function NoteLinkApplied() {
    const body = BOOK_BODY.map((b, i) =>
      i === 1 ? { ...b, linkRange: [10, 35] } : b
    );
    return <EditorScreen
      crumbs={['База', 'Жизнь']}
      title="Четыре тысячи недель"
      properties={BOOK_PROPS}
      blocks={body}
      focusedBlock={1}
      showKeyboard
    />;
  }

  // ─── Единый сценарий для секции A (первое использование) ─────
  // Пользователь строит страницу «Запуск лендинга» слой за слоем.
  // Каждый следующий экран = предыдущий + ещё один шаг.
  const SCENARIO_TITLE = 'Запуск лендинга';
  const SCENARIO_CRUMBS = ['База', 'Работа'];

  // Слой 1: два чек-пункта
  const LAYER_CHECKS = [
    { type: 'h2', text: 'Задачи' },
    { type: 'check', text: 'Собрать требования от команды', checked: true },
    { type: 'check', text: 'Сделать wireframe главной', checked: true },
  ];
  // Слой 2: + блок-ссылка Figma
  const LAYER_LINK = [
    { type: 'h2', text: 'Ссылки' },
    { type: 'link', text: 'Черновик главной', url: 'figma.com/file/x9k/landing', initials: 'F', color: '#0ACF83' },
  ];
  // Слой 3: + изображение макета
  const LAYER_IMAGE = [
    { type: 'h2', text: 'Макет главной' },
    { type: 'image' },
  ];

  // 5-pB · Превратили первый блок в чек-лист, начали второй пункт
  function NoteChecklist() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        { type: 'h2', text: 'Задачи' },
        { type: 'check', text: 'Собрать требования от команды', checked: true },
        { type: 'check', text: '', placeholder: 'Следующая задача…' },
      ]}
      focusedBlock={2}
      showKeyboard
      keyboardMode="upper"
    />;
  }

  // 5e · Напечатали «/ссылка» — фокус на пункте «Ссылка» в поповере
  function NoteSlashLink() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        { type: 'h2', text: 'Ссылки' },
        { type: 'p', text: '' },
      ]}
      focusedBlock={4}
      slashQuery="ссы"
      slashHighlight={0}
      slashShowAll
      showKeyboard
    />;
  }

  // 5f · Пустой блок-ссылка — поле «Вставьте URL», чип «из буфера»
  function NoteLinkBlockEmpty() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        { type: 'h2', text: 'Ссылки' },
        { type: 'link', fromClipboard: true },
      ]}
      focusedBlock={4}
      showKeyboard
    />;
  }

  // 5g · Загрузка превью
  function NoteLinkBlockLoading() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        { type: 'h2', text: 'Ссылки' },
        { type: 'link', url: 'figma.com/file/x9k/landing', loading: true },
      ]}
      focusedBlock={4}
      showKeyboard
    />;
  }

  // 5h · Превью подтянулось — готовая карточка
  function NoteLinkBlockReady() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        ...LAYER_LINK,
        { type: 'p', text: '' },
      ]}
      focusedBlock={5}
      showKeyboard
    />;
  }

  // 5-pC · Превратили новый блок в изображение
  function NoteImageBlock() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        ...LAYER_LINK,
        { type: 'h2', text: 'Макет главной' },
        { type: 'image' },
        { type: 'p', text: '', placeholder: 'Начните писать или нажмите / для выбора типа блока' },
      ]}
      focusedBlock={8}
      showKeyboard
    />;
  }

  // 5-pD · Long-press по блоку → меню действий (на полной странице)
  function NoteBlockActions() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      blocks={[
        ...LAYER_CHECKS,
        ...LAYER_LINK,
        ...LAYER_IMAGE,
      ]}
      focusedBlock={6}
      bottomSheet="blockActions"
    />;
  }

  // ─── Подсценарий: добавление свойств на готовой странице ───────
  // Каждый тип свойства требует свой UI ввода — поэтому по экрану на тип.
  const FULL_PAGE_BLOCKS = [
    ...LAYER_CHECKS,
    ...LAYER_LINK,
    ...LAYER_IMAGE,
  ];
  // Блоки для экранов со свойствами — минимум, чтобы всё помещалось:
  // заголовок «Задачи» + 2 чек-пункта. Для листа типов — ещё короче.
  const HEAD_ONLY = LAYER_CHECKS;  // h2 Задачи + 2 чек-пункта

  // 5k · Шапка до любых свойств — видна кнопка «+ Добавить свойство»
  function NotePropTap() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={[]}
      blocks={HEAD_ONLY}
    />;
  }

  // 5l · Лист «Тип свойства» — 6 типов: Текст/Дата/Число/Рейтинг/Чек-бокс/Ссылка
  function NotePropTypes() {
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={[]}
      addingProp
      blocks={HEAD_ONLY}
      bottomSheet="propertyType"
    />;
  }

  // 5m · Текст — курсор на имени свойства («Ответственный»), значение «Пусто»
  function NotePropTextName() {
    const P = [{ Icon: IconType, name: 'Ответственный', editingName: true, empty: true, namePlaceholder: 'Имя свойства' }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
      showKeyboard
      keyboardMode="upper"
    />;
  }

  // 5n · Текст — ввели значение «Настя»
  function NotePropTextFilled() {
    const P = [{ Icon: IconType, name: 'Ответственный', value: 'Настя', editing: true }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
      showKeyboard
      keyboardMode="upper"
    />;
  }

  // 5o · Дата — открылся iOS-колёсный picker снизу
  function NotePropDateWheel() {
    const P = [{ Icon: IconCalendar, name: 'Дедлайн', value: '28 марта 2026', editing: true }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
      datePicker
    />;
  }

  // 5p · Число — цифровая клавиатура, значение «120»
  function NotePropNumberKb() {
    const P = [{ Icon: IconHash, name: 'Бюджет', value: '120', editing: true }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
      showKeyboard
      keyboardMode="num"
    />;
  }

  // 5q · Рейтинг — 5 звёзд, выбрали 4
  function NotePropRatingStars() {
    const P = [{ Icon: IconStar, name: 'Приоритет', kind: 'rating', value: 4 }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
    />;
  }

  // 5r · Чек-бокс — тоггл (на скрине включён)
  function NotePropCheckbox() {
    const P = [{ Icon: IconCheck, name: 'Согласовано', kind: 'checkbox', value: true }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
    />;
  }

  // 5s · Ссылка — URL-клавиатура, ввели figma.com/...
  function NotePropLinkInput() {
    const P = [{ Icon: IconLink, name: 'Документ', value: 'figma.com/file/x9k', editing: true }];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
      showKeyboard
      keyboardMode="lower"
    />;
  }

  // 5t · Финал — 3 разных свойства в шапке на полной странице
  function NotePropsAll() {
    const P = [
      { Icon: IconType,     name: 'Ответственный', value: 'Настя' },
      { Icon: IconCalendar, name: 'Дедлайн',       value: '28 марта' },
      { Icon: IconStar,     name: 'Приоритет',     kind: 'rating', value: 4 },
    ];
    return <EditorScreen
      crumbs={SCENARIO_CRUMBS}
      title={SCENARIO_TITLE}
      properties={P}
      blocks={HEAD_ONLY}
    />;
  }

export {
  NoteReading, NoteEditing,
  NoteProperties, NotePropertyType, NoteProject,
  NoteEmpty, NoteTitleTyped,
  NoteSlashPopover, NotePlusProperty, NoteSlashImage,
  NoteSlashLink, NoteLinkBlockEmpty, NoteLinkBlockLoading, NoteLinkBlockReady,
  NoteFormatBar, NoteLinkButton, NoteLinkInput, NoteLinkApplied,
  NoteChecklist, NoteImageBlock, NoteBlockActions,
  NotePropTap, NotePropTypes,
  NotePropTextName, NotePropTextFilled,
  NotePropDateWheel, NotePropNumberKb,
  NotePropRatingStars, NotePropCheckbox, NotePropLinkInput,
  NotePropsAll,
};
