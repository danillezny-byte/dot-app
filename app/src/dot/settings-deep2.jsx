import React from 'react';
// ─── Глубокие экраны остальных разделов настроек ──────────────
// Синхро · Оформление · Уведомления · Приватность · О приложении
(function () {
  const {
    DeepShell, FieldLabel, Note, TextField,
    IconChevronLeft, IconChevronRight, IconCheck, IconX,
    IconCheckCircle, IconAlertTriangle, IconWifiOff, IconRefresh, IconCloud,
    IconSun, IconMoon, IconType, IconPalette,
    IconBell, IconClock, IconVolume,
    IconFingerprint, IconDownload, IconActivity, IconShield, IconTrash,
    IconInfo, IconFileText, IconCode, IconExternalLink,
  } = window;

  // ══════════════════════════════════════════════════════════════
  // СИНХРО
  // ══════════════════════════════════════════════════════════════

  // ── 1. Синхронизация сейчас (статус + лог) ────────────────────
  function SettingsSyncStatus() {
    const items = [
      { Icon: IconCheckCircle, col: '#2E8B57', t: 'Все изменения синхронизированы', s: '34 секунды назад' },
      { Icon: IconCloud,       col: 'var(--accent)', t: 'Загружено: 6 задач, 2 привычки', s: 'с iPhone · 09:42' },
      { Icon: IconCloud,       col: 'var(--accent)', t: 'Получено: 1 страница базы', s: 'с MacBook Pro · 09:15' },
      { Icon: IconWifiOff,     col: 'var(--sub)', t: 'Нет сети — работаем офлайн', s: 'вчера, 23:14 – 23:28' },
      { Icon: IconCheckCircle, col: '#2E8B57', t: 'Синхронизация восстановлена', s: 'вчера, 23:28' },
    ];
    return (
      <DeepShell title="Синхронизация">
        <div style={{ padding: '24px 24px 8px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32, margin: '0 auto 14px',
            background: 'rgba(46,139,87,0.14)', color: '#2E8B57',
            display: 'grid', placeItems: 'center',
          }}>
            <IconCheckCircle size={28} strokeWidth={1.75} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>Синхронизировано</div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--sub)' }}>34 секунды назад · через Wi-Fi</div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <button style={{
            width: '100%', padding: '13px 16px',
            background: 'var(--chip)', border: 'none', borderRadius: 12,
            color: 'var(--accent)', fontSize: 15, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <IconRefresh size={16} strokeWidth={1.75} />
            Синхронизировать сейчас
          </button>
        </div>

        <FieldLabel>Журнал</FieldLabel>
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              padding: '12px 12px', display: 'flex', gap: 12, alignItems: 'flex-start',
              borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                background: 'color-mix(in srgb, currentColor 14%, transparent)',
                color: it.col,
                display: 'grid', placeItems: 'center', marginTop: 1,
              }}>
                <it.Icon size={14} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{it.t}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{it.s}</div>
              </div>
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ── 2. Разрешение конфликтов ──────────────────────────────────
  function SettingsSyncConflicts() {
    return (
      <DeepShell title="Конфликт" onSave={() => {}} saveLabel="Готово" saveDisabled>
        <div style={{ padding: '18px 24px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: 'rgba(228,68,68,0.08)', borderRadius: 10,
            color: '#E44', fontSize: 13,
          }}>
            <IconAlertTriangle size={16} strokeWidth={1.75} />
            <span>Одна задача изменена на двух устройствах</span>
          </div>
        </div>

        <FieldLabel>Задача</FieldLabel>
        <div style={{ padding: '0 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Подготовить презентацию для Q2</div>
        </div>

        <FieldLabel>Выберите версию</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { pick: true,  where: 'iPhone 15 Pro',  when: 'Сегодня, 14:22', changes: ['Срок → 24 апреля', 'Приоритет → Высокий'] },
            { pick: false, where: 'MacBook Pro',    when: 'Сегодня, 14:18', changes: ['Срок → 26 апреля', 'Добавлена заметка'] },
          ].map((v, i) => (
            <div key={i} style={{
              padding: 16, borderRadius: 14,
              background: v.pick ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))' : 'var(--chip)',
              border: v.pick ? '1.5px solid color-mix(in srgb, var(--accent) 40%, transparent)' : '1.5px solid transparent',
              display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 10, flexShrink: 0,
                border: `1.5px solid ${v.pick ? 'var(--accent)' : 'rgba(60,60,67,0.3)'}`,
                background: v.pick ? 'var(--accent)' : 'transparent',
                display: 'grid', placeItems: 'center', marginTop: 2,
              }}>
                {v.pick && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }} />}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v.where}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)' }}>{v.when}</div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {v.changes.map((c, j) => (
                    <div key={j} style={{ fontSize: 13, color: 'var(--text)' }}>· {c}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <FieldLabel>Или</FieldLabel>
        <div style={{ padding: '0 16px 20px' }}>
          <button style={{
            width: '100%', padding: '13px 16px',
            background: 'transparent', border: '1px solid var(--line)', borderRadius: 12,
            color: 'var(--text)', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Оставить обе копии
          </button>
        </div>
      </DeepShell>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ОФОРМЛЕНИЕ
  // ══════════════════════════════════════════════════════════════

  // ── 3. Тема ───────────────────────────────────────────────────
  function SettingsTheme() {
    const modes = [
      { id: 'light',  Icon: IconSun,  label: 'Светлая',  sub: 'Всегда',               on: true  },
      { id: 'dark',   Icon: IconMoon, label: 'Тёмная',   sub: 'Всегда',               on: false },
      { id: 'auto',   Icon: null,     label: 'Системная', sub: 'Следует настройкам iOS', on: false },
    ];
    return (
      <DeepShell title="Тема">
        <FieldLabel>Режим</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {modes.map((m, i) => (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 12,
              background: m.on ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              {m.Icon ? (
                <m.Icon size={18} strokeWidth={1.75} color="var(--text)" />
              ) : (
                <div style={{ display: 'flex' }}>
                  <IconSun size={18} strokeWidth={1.75} color="var(--text)" />
                  <IconMoon size={18} strokeWidth={1.75} color="var(--text)" style={{ marginLeft: -6 }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: m.on ? 500 : 400 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{m.sub}</div>
              </div>
              {m.on && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>

        <FieldLabel>Превью</FieldLabel>
        <div style={{ padding: '0 16px 24px', display: 'flex', gap: 12 }}>
          {[
            { bg: '#fff', text: '#111', sub: '#8b8b93', label: 'Светлая' },
            { bg: '#111', text: '#fff', sub: '#8b8b93', label: 'Тёмная' },
          ].map((p, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                background: p.bg, borderRadius: 14, padding: 14,
                border: '1px solid var(--line)', height: 110, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: p.text }}>Сегодня</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${p.sub}` }} />
                  <span style={{ fontSize: 11, color: p.text }}>Задача</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)' }} />
                  <span style={{ fontSize: 11, color: p.sub, textDecoration: 'line-through' }}>Сделано</span>
                </div>
                <div style={{ marginTop: 'auto', fontSize: 10, color: p.sub }}>3 из 8 · 38%</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--sub)', textAlign: 'center' }}>{p.label}</div>
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ── 4. Акцентный цвет ─────────────────────────────────────────
  function SettingsAccent() {
    const colors = [
      { id: 'indigo',  hex: '#4F5BD5', name: 'Индиго',     on: true },
      { id: 'orange',  hex: '#D97757', name: 'Терракот',   on: false },
      { id: 'forest',  hex: '#2E8B57', name: 'Лес',        on: false },
      { id: 'crimson', hex: '#E44444', name: 'Малина',     on: false },
      { id: 'amber',   hex: '#F5A623', name: 'Янтарь',     on: false },
      { id: 'plum',    hex: '#8B5CF6', name: 'Слива',      on: false },
      { id: 'teal',    hex: '#0EA5A4', name: 'Бирюза',     on: false },
      { id: 'graph',   hex: '#555',    name: 'Графит',     on: false },
    ];
    return (
      <DeepShell title="Акцент">
        <FieldLabel>Цвет</FieldLabel>
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {colors.map((c, i) => (
            <div key={i} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: 54, height: 54, borderRadius: 27, margin: '0 auto',
                background: c.hex,
                border: c.on ? '3px solid var(--bg)' : 'none',
                outline: c.on ? `2px solid ${c.hex}` : 'none',
                display: 'grid', placeItems: 'center',
              }}>
                {c.on && <IconCheck size={20} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--sub)', fontWeight: c.on ? 600 : 400 }}>{c.name}</div>
            </div>
          ))}
        </div>

        <FieldLabel>Где применяется</FieldLabel>
        <div style={{ padding: '0 24px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
          Кнопки действий, выделения, прогресс, чекбоксы, активная вкладка, ссылки в базе знаний.
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--chip)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', letterSpacing: 0.1, textTransform: 'uppercase' }}>Превью</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
                <IconCheck size={11} strokeWidth={3} color="#fff" />
              </span>
              <span style={{ fontSize: 14, color: 'var(--sub)', textDecoration: 'line-through' }}>Отправить отчёт</span>
            </div>
            <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{ width: '62%', height: '100%', background: 'var(--accent)' }} />
            </div>
            <button style={{
              marginTop: 14, padding: '10px 14px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Основная кнопка</button>
          </div>
        </div>
      </DeepShell>
    );
  }

  // ── 5. Шрифт ──────────────────────────────────────────────────
  function SettingsFont() {
    const fonts = [
      { id: 'figtree', name: 'Figtree',          sample: 'Sans·Geometric·Default', css: 'Figtree, system-ui', on: true },
      { id: 'inter',   name: 'Inter',            sample: 'Sans·Neutral',           css: 'Inter, system-ui',   on: false },
      { id: 'jakarta', name: 'Plus Jakarta Sans', sample: 'Sans·Friendly',         css: 'Plus Jakarta Sans, system-ui', on: false },
      { id: 'system',  name: 'Системный',        sample: 'SF Pro на iOS',          css: '-apple-system',      on: false },
    ];
    return (
      <DeepShell title="Шрифт">
        <FieldLabel>Интерфейс</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fonts.map((f, i) => (
            <div key={i} style={{
              padding: '16px', borderRadius: 12,
              background: f.on ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 14,
              borderBottom: !f.on && i < fonts.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: f.css, fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>{f.name}</div>
                <div style={{ fontFamily: f.css, fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{f.sample}</div>
              </div>
              {f.on && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>

        <FieldLabel>Превью</FieldLabel>
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ padding: 16, background: 'var(--chip)', borderRadius: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Подготовить презентацию</div>
            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>Срок — пятница · 3 подзадачи</div>
            <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 10, lineHeight: 1.55 }}>
              Сделать слайды, собрать цифры за квартал и согласовать с маркетингом к обеду четверга.
            </div>
          </div>
        </div>
      </DeepShell>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // УВЕДОМЛЕНИЯ
  // ══════════════════════════════════════════════════════════════

  // ── 6. Время напоминаний по умолчанию ─────────────────────────
  function SettingsReminderTime() {
    const rows = [
      { k: 'Для задач',    v: '09:00', sub: 'Если не указано конкретное время' },
      { k: 'Для привычек', v: '21:00', sub: 'Проверить выполнение' },
      { k: 'Для событий',  v: '15 минут до', sub: '' },
    ];
    return (
      <DeepShell title="Время напоминаний">
        <FieldLabel>По умолчанию</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              padding: '14px 16px', background: 'var(--chip)', borderRadius: 12, marginBottom: 2,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, color: 'var(--text)' }}>{r.k}</div>
                {r.sub && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{r.sub}</div>}
              </div>
              <div style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 500 }}>{r.v}</div>
            </div>
          ))}
        </div>

        <FieldLabel>Превью</FieldLabel>
        <div style={{ padding: '0 24px' }}>
          <div style={{
            background: 'rgba(60,60,67,0.06)', borderRadius: 14, padding: '14px 16px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>•</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>dot. · сейчас</div>
              <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 2 }}>Подготовить презентацию</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Напоминание 09:00 · свайп чтобы отложить</div>
            </div>
          </div>
        </div>

        <FieldLabel>Повторы</FieldLabel>
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Один раз', true],
            ['Повторить через 10 минут', false],
            ['Повторить каждый час до выполнения', false],
          ].map(([t, on], i) => (
            <div key={i} style={{
              padding: '13px 16px', borderRadius: 12,
              background: on ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))' : 'transparent',
              display: 'flex', alignItems: 'center',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 10, marginRight: 14,
                border: `1.5px solid ${on ? 'var(--accent)' : 'rgba(60,60,67,0.3)'}`,
                background: on ? 'var(--accent)' : 'transparent',
                display: 'grid', placeItems: 'center',
              }}>
                {on && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }} />}
              </span>
              <span style={{ fontSize: 15, color: 'var(--text)' }}>{t}</span>
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ── 7. Расписание / тихие часы ────────────────────────────────
  function SettingsQuietHours() {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return (
      <DeepShell title="Тихие часы">
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            padding: '14px 16px', background: 'var(--chip)', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: 'var(--text)' }}>Включить тихие часы</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Никаких звуков и баннеров</div>
            </div>
            <div style={{ width: 44, height: 26, borderRadius: 13, background: 'var(--accent)', position: 'relative' }}>
              <div style={{ position: 'absolute', right: 2, top: 2, width: 22, height: 22, borderRadius: 11, background: '#fff' }} />
            </div>
          </div>
        </div>

        <FieldLabel>Время</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', gap: 12 }}>
          {[['С', '22:00'], ['До', '07:30']].map(([l, v], i) => (
            <div key={i} style={{
              flex: 1, padding: '14px 16px', background: 'var(--chip)', borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 600, letterSpacing: 0.12, textTransform: 'uppercase' }}>{l}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            </div>
          ))}
        </div>

        <FieldLabel>Дни недели</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {days.map((d, i) => {
            const on = i < 5;
            return (
              <div key={i} style={{
                flex: 1, padding: '11px 0',
                borderRadius: 10,
                background: on ? 'var(--accent)' : 'var(--chip)',
                color: on ? '#fff' : 'var(--text)',
                fontSize: 13, fontWeight: 500, textAlign: 'center',
                cursor: 'pointer',
              }}>{d}</div>
            );
          })}
        </div>

        <FieldLabel>Исключения</FieldLabel>
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Разрешить срочные задачи', true],
            ['Разрешить повторные напоминания', false],
            ['Тонкий звук вместо полного', true],
          ].map(([t, on], i) => (
            <div key={i} style={{
              padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
            }}>
              <span style={{ fontSize: 15, color: 'var(--text)' }}>{t}</span>
              <div style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'var(--accent)' : 'rgba(60,60,67,0.2)', position: 'relative' }}>
                <div style={{ position: 'absolute', [on ? 'right' : 'left']: 2, top: 2, width: 22, height: 22, borderRadius: 11, background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ── 8. Звуки ──────────────────────────────────────────────────
  function SettingsSounds() {
    const sounds = [
      { name: 'Тонкий', sub: 'По умолчанию', on: true },
      { name: 'Капля',       sub: '',          on: false },
      { name: 'Колокольчик', sub: '',          on: false },
      { name: 'Гонг',        sub: '',          on: false },
      { name: 'Деликатно',   sub: 'Очень тихо', on: false },
      { name: 'Без звука',   sub: '',          on: false },
    ];
    return (
      <DeepShell title="Звуки">
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            padding: '14px 16px', background: 'var(--chip)', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <IconVolume size={18} strokeWidth={1.75} color="var(--text)" />
            <div style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>Громкость</div>
            <div style={{ fontSize: 13, color: 'var(--sub)' }}>60%</div>
          </div>
        </div>

        <FieldLabel>Звук напоминаний</FieldLabel>
        <div style={{ padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sounds.map((s, i) => (
            <div key={i} style={{
              padding: '13px 16px', borderRadius: 12,
              background: s.on ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))' : 'transparent',
              display: 'flex', alignItems: 'center',
              borderBottom: !s.on && i < sounds.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--text)' }}>{s.name}</div>
                {s.sub && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{s.sub}</div>}
              </div>
              {s.on && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>

        <FieldLabel>Вибрация</FieldLabel>
        <div style={{ padding: '0 16px 24px' }}>
          {['Лёгкая', 'Средняя', 'Отключена'].map((t, i) => (
            <div key={i} style={{
              padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
            }}>
              <span style={{ fontSize: 15, color: 'var(--text)' }}>{t}</span>
              {i === 0 && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ПРИВАТНОСТЬ
  // ══════════════════════════════════════════════════════════════

  // ── 9. Экспорт данных ─────────────────────────────────────────
  function SettingsExport() {
    const items = [
      { t: 'Задачи',         n: '342 записи',  on: true },
      { t: 'Привычки',       n: '6 привычек · 184 чека', on: true },
      { t: 'База знаний',    n: '47 страниц · 12 МБ',    on: true },
      { t: 'События календаря', n: '128 событий',        on: false },
      { t: 'Вложения (изображения, файлы)', n: '42 файла · 86 МБ', on: false },
    ];
    return (
      <DeepShell title="Экспорт данных" onSave={() => {}} saveLabel="Скачать">
        <div style={{ padding: '20px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, margin: '0 auto 14px',
            background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)',
            display: 'grid', placeItems: 'center',
          }}>
            <IconDownload size={24} strokeWidth={1.75} />
          </div>
          <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>
            Выгрузите ваши данные в одном архиве. Это можно сделать в любой момент.
          </div>
        </div>

        <FieldLabel>Что включить</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              padding: '13px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${it.on ? 'var(--accent)' : 'rgba(60,60,67,0.3)'}`,
                background: it.on ? 'var(--accent)' : 'transparent',
                display: 'grid', placeItems: 'center',
              }}>
                {it.on && <IconCheck size={13} color="#fff" strokeWidth={2.5} />}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--text)' }}>{it.t}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{it.n}</div>
              </div>
            </div>
          ))}
        </div>

        <FieldLabel>Формат</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
          {[
            { t: 'JSON', sub: 'Для импорта обратно', on: true },
            { t: 'CSV',  sub: 'Для таблиц',          on: false },
            { t: 'Markdown', sub: 'База знаний',     on: false },
          ].map((f, i) => (
            <div key={i} style={{
              flex: 1, padding: '12px 10px', textAlign: 'center',
              borderRadius: 10, cursor: 'pointer',
              background: f.on ? 'color-mix(in srgb, var(--accent) 10%, var(--chip))' : 'var(--chip)',
              border: f.on ? '1.5px solid var(--accent)' : '1.5px solid transparent',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{f.t}</div>
              <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 3 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '18px 24px 24px', fontSize: 12, color: 'var(--sub)', lineHeight: 1.5 }}>
          Размер архива — ~14 МБ. Готовность за 10–15 секунд.
        </div>
      </DeepShell>
    );
  }

  // ── 10. История активности ────────────────────────────────────
  function SettingsActivity() {
    const log = [
      { when: 'Сегодня, 14:22', what: 'Обновлена задача «Презентация»', where: 'iPhone 15 Pro · Москва' },
      { when: 'Сегодня, 12:08', what: 'Добавлена страница «Онбординг»',  where: 'MacBook Pro · Москва' },
      { when: 'Сегодня, 09:40', what: 'Вход в аккаунт',                   where: 'iPhone 15 Pro · Москва' },
      { when: 'Вчера, 22:14',   what: '6 изменений в задачах',            where: 'iPad Air · дом' },
      { when: 'Вчера, 14:03',   what: 'Экспорт данных (JSON)',            where: 'MacBook Pro · Москва' },
      { when: '20 апр, 09:12',  what: 'Вход в аккаунт',                   where: 'Chrome (Windows) · СПб', warn: true },
      { when: '19 апр, 18:30',  what: 'Смена пароля',                     where: 'MacBook Pro · Москва' },
    ];
    return (
      <DeepShell title="История активности">
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            display: 'flex', gap: 8, padding: 4,
            background: 'var(--chip)', borderRadius: 10,
          }}>
            {['Всё', 'Вход', 'Данные', 'Безопасность'].map((t, i) => (
              <div key={i} style={{
                flex: 1, padding: '7px 0', textAlign: 'center',
                fontSize: 13, fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? 'var(--text)' : 'var(--sub)',
                background: i === 0 ? 'var(--bg)' : 'transparent',
                borderRadius: 7, cursor: 'pointer',
              }}>{t}</div>
            ))}
          </div>
        </div>

        <FieldLabel>Последние 30 дней</FieldLabel>
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {log.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 7,
                background: l.warn ? '#E44' : 'var(--accent)',
              }} />
              <div style={{ flex: 1, paddingBottom: i < log.length - 1 ? 0 : 0 }}>
                <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 600, letterSpacing: 0.1, textTransform: 'uppercase' }}>{l.when}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 3, lineHeight: 1.4 }}>{l.what}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>
                  {l.where}
                  {l.warn && <span style={{ color: '#E44', marginLeft: 6 }}>· незнакомое устройство</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ── 11. Face ID / блокировка ──────────────────────────────────
  function SettingsLock() {
    return (
      <DeepShell title="Блокировка">
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: 38, margin: '0 auto 14px',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)',
            display: 'grid', placeItems: 'center',
          }}>
            <IconFingerprint size={34} strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>Face ID для dot.</div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--sub)', lineHeight: 1.5, padding: '0 12px' }}>
            Защитите приложение биометрией или кодом при открытии.
          </div>
        </div>

        <FieldLabel>Способ</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Face ID',          true],
            ['Код-пароль (6 цифр)', false],
            ['Не требовать',      false],
          ].map(([t, on], i) => (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 12,
              background: on ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))' : 'transparent',
              display: 'flex', alignItems: 'center',
              borderBottom: !on && i < 2 ? '1px solid var(--line)' : 'none',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 10, marginRight: 14,
                border: `1.5px solid ${on ? 'var(--accent)' : 'rgba(60,60,67,0.3)'}`,
                background: on ? 'var(--accent)' : 'transparent',
                display: 'grid', placeItems: 'center',
              }}>
                {on && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }} />}
              </span>
              <span style={{ fontSize: 15, color: 'var(--text)', flex: 1 }}>{t}</span>
            </div>
          ))}
        </div>

        <FieldLabel>Когда блокировать</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Сразу', false],
            ['Через 1 минуту', true],
            ['Через 5 минут', false],
            ['Через 15 минут', false],
          ].map(([t, on], i) => (
            <div key={i} style={{
              padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
            }}>
              <span style={{ fontSize: 15, color: 'var(--text)' }}>{t}</span>
              {on && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>

        <FieldLabel>Скрывать в списке приложений</FieldLabel>
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{
            padding: '14px 16px', background: 'var(--chip)', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: 'var(--text)' }}>Скрывать содержимое</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>При переключении задач показывать заглушку</div>
            </div>
            <div style={{ width: 44, height: 26, borderRadius: 13, background: 'var(--accent)', position: 'relative' }}>
              <div style={{ position: 'absolute', right: 2, top: 2, width: 22, height: 22, borderRadius: 11, background: '#fff' }} />
            </div>
          </div>
        </div>
      </DeepShell>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // О ПРИЛОЖЕНИИ
  // ══════════════════════════════════════════════════════════════

  // ── 12. Версия / changelog ────────────────────────────────────
  function SettingsChangelog() {
    const versions = [
      {
        v: '2.14.0', date: 'Сегодня', label: 'Текущая',
        items: [
          { type: 'new', t: 'Серии привычек с возможностью пропустить день' },
          { type: 'new', t: 'Новый композер заметок с командами «/»' },
          { type: 'fix', t: 'Починили синхронизацию после долгого офлайна' },
        ],
      },
      {
        v: '2.13.2', date: '19 апреля',
        items: [
          { type: 'fix', t: 'Быстрее открытие страниц в базе знаний' },
          { type: 'fix', t: 'Не пропадают вложения при смене аккаунта' },
        ],
      },
      {
        v: '2.13.0', date: '10 апреля',
        items: [
          { type: 'new', t: 'Виджеты на главный экран' },
          { type: 'new', t: 'Поиск по всей базе знаний' },
          { type: 'fix', t: 'Поправили 14 багов со шрифтами' },
        ],
      },
    ];
    const typeCol = (t) => t === 'new'
      ? { bg: 'rgba(46,139,87,0.14)', col: '#2E8B57', label: 'NEW' }
      : { bg: 'rgba(79,91,213,0.12)', col: 'var(--accent)', label: 'FIX' };
    return (
      <DeepShell title="Обновления">
        <div style={{ padding: '22px 24px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>2.14.0</div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: 0.1, textTransform: 'uppercase' }}>Актуальная</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>Сборка 4218 · 23 апреля 2026</div>
        </div>

        <div style={{ padding: '14px 16px 0' }}>
          <button style={{
            width: '100%', padding: '12px 16px',
            background: 'var(--chip)', border: 'none', borderRadius: 12,
            color: 'var(--accent)', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Проверить обновления
          </button>
        </div>

        <FieldLabel>История</FieldLabel>
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {versions.map((ver, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{ver.v}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{ver.date}</div>
                {ver.label && <span style={{
                  padding: '2px 7px', borderRadius: 99,
                  background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.05, textTransform: 'uppercase',
                }}>{ver.label}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ver.items.map((it, j) => {
                  const s = typeCol(it.type);
                  return (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                        background: s.bg, color: s.col,
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.05,
                        minWidth: 30, textAlign: 'center',
                      }}>{s.label}</span>
                      <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.45 }}>{it.t}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DeepShell>
    );
  }

  // ── 13. Лицензии / open source ────────────────────────────────
  function SettingsLicenses() {
    const libs = [
      { n: 'React',       v: '18.3.1',  l: 'MIT' },
      { n: 'Figtree',     v: 'Variable', l: 'OFL-1.1' },
      { n: 'Inter',       v: 'Variable', l: 'OFL-1.1' },
      { n: 'Lucide Icons', v: '0.468',   l: 'ISC' },
      { n: 'Popmotion',   v: '11.0',    l: 'MIT' },
      { n: 'date-fns',    v: '3.6',     l: 'MIT' },
      { n: 'TanStack Query', v: '5.28', l: 'MIT' },
      { n: 'Zod',         v: '3.22',    l: 'MIT' },
    ];
    return (
      <DeepShell title="Лицензии">
        <div style={{ padding: '20px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, margin: '0 auto 14px',
            background: 'var(--chip)', color: 'var(--text)',
            display: 'grid', placeItems: 'center',
          }}>
            <IconCode size={24} strokeWidth={1.75} />
          </div>
          <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>
            dot. использует открытые библиотеки. Спасибо их авторам.
          </div>
        </div>

        <FieldLabel>Используемые компоненты</FieldLabel>
        <div style={{ padding: '0 24px 6px', display: 'flex', flexDirection: 'column' }}>
          {libs.map((l, i) => (
            <div key={i} style={{
              padding: '13px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < libs.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{l.n}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>v{l.v}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '3px 8px', borderRadius: 4,
                  background: 'var(--chip)', color: 'var(--sub)',
                  fontSize: 10, fontWeight: 600, letterSpacing: 0.05,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}>{l.l}</span>
                <IconChevronRight size={16} color="var(--sub)" strokeWidth={1.75} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <button style={{
            width: '100%', padding: '13px 16px',
            background: 'var(--chip)', border: 'none', borderRadius: 12,
            color: 'var(--accent)', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Полный список на GitHub
            <IconExternalLink size={14} strokeWidth={1.75} />
          </button>
        </div>
      </DeepShell>
    );
  }

  // ── 14. Политика / документы ──────────────────────────────────
  function SettingsPolicy() {
    const docs = [
      { Icon: IconShield,  t: 'Политика конфиденциальности', s: 'Обновлено 12 апреля 2026' },
      { Icon: IconFileText, t: 'Пользовательское соглашение', s: 'Обновлено 12 апреля 2026' },
      { Icon: IconFileText, t: 'Условия оплаты и возврата',   s: 'Для подписчиков Plus' },
      { Icon: IconShield,  t: 'Соглашение об обработке данных', s: 'Для юридических лиц' },
      { Icon: IconInfo,    t: 'Как мы храним ваши данные',   s: 'Шифрование, серверы, бэкапы' },
      { Icon: IconInfo,    t: 'Cookies и аналитика',          s: 'Что, зачем, как отключить' },
    ];
    return (
      <DeepShell title="Документы">
        <FieldLabel>Юридическое</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          {docs.map((d, i) => (
            <div key={i} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              borderBottom: i < docs.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--chip)', color: 'var(--sub)',
                display: 'grid', placeItems: 'center',
              }}>
                <d.Icon size={16} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.3 }}>{d.t}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{d.s}</div>
              </div>
              <IconExternalLink size={16} color="var(--sub)" strokeWidth={1.75} />
            </div>
          ))}
        </div>

        <FieldLabel>Контакты</FieldLabel>
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>
          <div>ООО «Доткор», ИНН 7702123456</div>
          <div>123056, Москва, ул. Образцова, 14с2</div>
          <div style={{ color: 'var(--accent)' }}>legal@dot.app</div>
        </div>
      </DeepShell>
    );
  }

  // ── 15. Задачи со сроком (за сколько напоминать) ─────────────
  function SettingsTaskLead() {
    const options = [
      { label: 'В момент срока',   sub: 'Точно в дедлайн' },
      { label: 'За 5 минут',       sub: null },
      { label: 'За 15 минут',      sub: 'По умолчанию', on: true },
      { label: 'За 30 минут',      sub: null },
      { label: 'За 1 час',         sub: null },
      { label: 'За 1 день',        sub: 'Утром накануне' },
      { label: 'Не напоминать',    sub: null },
    ];
    return (
      <DeepShell title="Задачи со сроком">
        <FieldLabel>Напоминать</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          {options.map((o, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < options.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--text)' }}>{o.label}</div>
                {o.sub && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{o.sub}</div>}
              </div>
              {o.on && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>
        <Note>Применяется ко всем задачам, где вы указали точное время. В каждой задаче это можно переопределить.</Note>
      </DeepShell>
    );
  }

  // ── 16. Автозамок (когда блокировать) ────────────────────────
  function SettingsAutoLock() {
    const options = [
      { label: 'Сразу',           sub: 'Как только свернул' },
      { label: 'Через 1 минуту',  sub: 'Рекомендуется', on: true },
      { label: 'Через 5 минут',   sub: null },
      { label: 'Через 15 минут',  sub: null },
      { label: 'Через 1 час',     sub: null },
      { label: 'Никогда',         sub: 'Только вручную' },
    ];
    return (
      <DeepShell title="Автозамок">
        <FieldLabel>Блокировать приложение</FieldLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          {options.map((o, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < options.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--text)' }}>{o.label}</div>
                {o.sub && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{o.sub}</div>}
              </div>
              {o.on && <IconCheck size={18} strokeWidth={2} color="var(--accent)" />}
            </div>
          ))}
        </div>
        <Note>После блокировки для входа потребуется Face ID или PIN-код.</Note>
      </DeepShell>
    );
  }

  Object.assign(window, {
    SettingsSyncStatus, SettingsSyncConflicts,
    SettingsTheme, SettingsAccent, SettingsFont,
    SettingsReminderTime, SettingsQuietHours, SettingsSounds,
    SettingsExport, SettingsActivity, SettingsLock,
    SettingsChangelog, SettingsLicenses, SettingsPolicy,
    SettingsTaskLead, SettingsAutoLock,
  });
})();

