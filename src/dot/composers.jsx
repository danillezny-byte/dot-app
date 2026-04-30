import React from 'react';
import {
  IconBook, IconCalendar, IconChevronLeft, IconChevronRight, IconClock,
  IconFile, IconFlag, IconFolder, IconHash, IconList, IconLock, IconPin, IconTarget,
} from './icons.jsx';
import { IosKeyboard } from './keyboard.jsx';
// Inline composers: создание задачи и страницы в базе.
// Ключевая идея — модификаторы вынесены в отдельный ряд чипов НАД клавиатурой,
// так что они всегда видны и доступны одним тапом.

const { useState: useStateC } = React;

// ─── ADD TASK COMPOSER ────────────────────────────────────
// Статичный bottom-sheet превью для дизайн-канваса. Для реального
// создания задачи в live-режиме используется ComposerFullscreen.
function AddTaskComposer({ onClose }) {
  const [text] = useStateC('Подготовить отчёт');
  const [when] = useStateC('today');
  const [priority] = useStateC(null);
  const [project] = useStateC('Работа');
  const [reminder] = useStateC(null);

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      background: 'rgba(0,0,0,0.35)', zIndex: 30,
    }}>
      <div onClick={onClose} style={{ flex: 1 }} />
      <div style={{
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '14px 20px 6px' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '4px 0',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11,
              border: '1.6px solid var(--line)',
              flexShrink: 0, marginTop: 2,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 16, lineHeight: 1.4, color: 'var(--text)',
                position: 'relative',
              }}>
                {text}
                <span style={{
                  display: 'inline-block', width: 2, height: 18,
                  background: 'var(--accent)', verticalAlign: 'middle',
                  marginLeft: 2, animation: 'dot-caret 1s steps(2) infinite',
                }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
                {when === 'today' && 'Сегодня'}
                {priority && ' · ' + (priority === 'high' ? 'Важное' : 'Обычное')}
                {project && ' · ' + project}
                {reminder && ' · напомнить ' + reminder}
              </div>
            </div>
            <button style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Готово</button>
          </div>
          <style>{`@keyframes dot-caret { 50% { opacity: 0; } }`}</style>
        </div>

        <div style={{
          padding: '8px 16px 10px',
          display: 'flex', gap: 6, overflowX: 'auto',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
          scrollbarWidth: 'none',
        }}>
          <ModChip icon={<IconCalendar size={14} />} active={!!when}
            label={when === 'today' ? 'Сегодня' : when === 'tomorrow' ? 'Завтра' : 'Дата'} />
          <ModChip icon={<IconClock size={14} />} active={!!reminder}
            label={reminder || 'Напомнить'} />
          <ModChip icon={<IconFlag size={14} />} active={!!priority}
            label={priority === 'high' ? 'Важное' : 'Приоритет'} />
          <ModChip icon={<IconFolder size={14} />} active={!!project}
            label={project || 'Проект'} />
          <ModChip icon={<IconHash size={14} />} label="Тег" />
        </div>

        <IosKeyboard mode="lower" />
      </div>
    </div>
  );
}

function ModChip({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 99,
      background: active ? 'var(--accent-soft)' : 'var(--chip)',
      color: active ? 'var(--accent)' : 'var(--text)',
      border: 'none', fontSize: 13, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'inherit',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─── ADD PAGE COMPOSER (knowledge base) ──────────────────
// Двухшаговый: (1) выбор типа → (2) ввод заголовка + клавиатура.
function AddPageComposer({ onClose, initialStep = 'type' }) {
  const [step, setStep] = useStateC(initialStep); // 'type' | 'title'
  const DEFAULT_TYPE = { id: 'note', label: 'Заметка', desc: 'Свободный текст', Icon: IconFile };
  const [type, setType] = useStateC(initialStep === 'title' ? DEFAULT_TYPE : null);
  const [space, setSpace] = useStateC('Работа');
  const [title, setTitle] = useStateC('Новая страница');

  const TYPES = [
    { id: 'note', label: 'Заметка',  desc: 'Свободный текст',      Icon: IconFile },
    { id: 'list', label: 'Список',   desc: 'Чек-лист или перечень', Icon: IconList },
    { id: 'proj', label: 'Проект',   desc: 'Подзадачи и сроки',     Icon: IconTarget },
    { id: 'log',  label: 'Журнал',   desc: 'Записи по датам',       Icon: IconCalendar },
    { id: 'ref',  label: 'Справочник', desc: 'Факты, ссылки',       Icon: IconBook },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      background: 'rgba(0,0,0,0.35)', zIndex: 30,
    }}>
      <div onClick={onClose} style={{ flex: 1 }} />
      <div style={{
        background: 'var(--bg)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        display: 'flex', flexDirection: 'column',
        maxHeight: '85%',
      }}>
        {/* Handle */}
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>

        {step === 'type' && (
          <>
            <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>Новая страница</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Отмена</button>
            </div>
            <div style={{ padding: '0 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TYPES.map((t) => (
                <button key={t.id} onClick={() => { setType(t); setStep('title'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <t.Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--sub)' }}>{t.desc}</div>
                  </div>
                  <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'title' && (
          <>
            <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setStep('type')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
                <IconChevronLeft size={20} strokeWidth={1.75} />
              </button>
              <div style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>Заголовок</div>
              <button style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Создать</button>
            </div>
            <div style={{ padding: '0 20px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' }}>
                {title}
                <span style={{ display: 'inline-block', width: 2, height: 22, background: 'var(--accent)', verticalAlign: 'middle', marginLeft: 2, animation: 'dot-caret 1s steps(2) infinite' }} />
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sub)' }}>
                <type.Icon size={14} strokeWidth={1.75} />
                <span>{type.label}</span>
                <span>·</span>
                <IconFolder size={14} strokeWidth={1.75} />
                <span>{space}</span>
              </div>
            </div>
            <div style={{
              padding: '8px 16px 10px',
              display: 'flex', gap: 6, overflowX: 'auto',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
              scrollbarWidth: 'none',
            }}>
              <ModChip icon={<IconFolder size={14} />} active label={space} />
              <ModChip icon={<IconHash size={14} />}   label="Теги" />
              <ModChip icon={<IconPin size={14} />}    label="Закрепить" />
              <ModChip icon={<IconLock size={14} />}   label="Защитить PIN" />
            </div>
            <IosKeyboard mode="upper" />
          </>
        )}
      </div>
    </div>
  );
}

// Shortcut for canvas: композер, открытый сразу на шаге ввода заголовка
function AddPageComposerTitle(props) {
  // Pre-seed type so 'title' step has something to render
  const wrapped = () => <AddPageComposer {...props} initialStep="title" />;
  return wrapped();
}

export { AddTaskComposer, ModChip, AddPageComposer, AddPageComposerTitle };
