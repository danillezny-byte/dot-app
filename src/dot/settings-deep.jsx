import React from 'react';
// ─── Глубокие экраны настроек аккаунта ────────────────────────
// «Сменить имя», «Изменить email», «Сменить пароль», «Устройства», «Удалить аккаунт»
import {
  IconChevronLeft, IconChevronRight, IconCheck, IconX,
  IconMonitor, IconSmartphone, IconTablet, IconShield, IconMail,
  IconClock, IconLaptop, IconTrash, IconEye, IconEyeOff,
} from './icons.jsx';
import { SystemKeyboard } from './composer-variants.jsx';

// ─── Shell: header + optional save button ─────────────────────
  function DeepShell({ title, onBack, onSave, saveLabel = 'Сохранить', saveDisabled, saveDanger, children, footerNote }) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
          borderBottom: '1px solid var(--line)',
        }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
            <IconChevronLeft size={22} strokeWidth={1.75} />
          </button>
          <div style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>{title}</div>
          {onSave && (
            <button onClick={onSave} disabled={saveDisabled} style={{
              background: 'none', border: 'none', padding: 0,
              color: saveDisabled ? 'rgba(60,60,67,0.4)' : (saveDanger ? '#E44' : 'var(--accent)'),
              fontSize: 15, fontWeight: 600, cursor: saveDisabled ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}>{saveLabel}</button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
        {footerNote}
      </div>
    );
  }

  function FieldLabel({ children }) {
    return (
      <div style={{ padding: '16px 24px 6px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>{children}</div>
    );
  }
  function Note({ children }) {
    return (
      <div style={{ padding: '10px 24px 0', fontSize: 12, color: 'var(--sub)', lineHeight: 1.45 }}>{children}</div>
    );
  }
  function TextField({ value, placeholder, caret, action, type = 'text', monospace }) {
    return (
      <div style={{
        margin: '0 16px', padding: '14px 16px',
        background: 'var(--chip)', borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          flex: 1,
          fontSize: 16,
          fontFamily: monospace ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
          color: value ? 'var(--text)' : 'rgba(60,60,67,0.4)',
          display: 'flex', alignItems: 'center',
          minHeight: 20,
          letterSpacing: type === 'password' && value ? 2 : 0,
        }}>
          {value || placeholder}
          {caret && <span style={{
            display: 'inline-block', width: 2, height: 18, marginLeft: 2,
            background: 'var(--accent)', animation: 'caret-blink 1s step-end infinite',
            verticalAlign: 'middle',
          }} />}
        </div>
        {action}
      </div>
    );
  }

  // ─── 1. Изменить имя ──────────────────────────────────────────
  function SettingsChangeName() {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DeepShell title="Имя" onSave={() => {}} saveLabel="Готово">
          <FieldLabel>Как вас зовут</FieldLabel>
          <TextField value="Алиса Королёва" caret />
          <Note>Имя показывается в профиле и в общих пространствах.</Note>
        </DeepShell>
        <SystemKeyboard mode="lower" />
      </div>
    );
  }

  // ─── 2. Изменить email ────────────────────────────────────────
  function SettingsChangeEmail() {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DeepShell title="Email" onSave={() => {}} saveLabel="Сохранить" saveDisabled>
          <FieldLabel>Текущий</FieldLabel>
          <div style={{ margin: '0 16px', padding: '14px 16px', background: 'var(--chip)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconMail size={16} strokeWidth={1.75} color="var(--sub)" />
            <div style={{ flex: 1, fontSize: 15, color: 'var(--text)' }}>alice@mail.com</div>
            <div style={{
              padding: '3px 8px', borderRadius: 99,
              background: 'rgba(46,139,87,0.14)', color: '#2E8B57',
              fontSize: 11, fontWeight: 600,
            }}>Подтверждён</div>
          </div>

          <FieldLabel>Новый email</FieldLabel>
          <TextField value="alice.k@gmail.co" caret />
          <Note>
            Мы отправим письмо со ссылкой для подтверждения. До подтверждения вход в аккаунт останется по старому адресу.
          </Note>
        </DeepShell>
        <SystemKeyboard mode="email" />
      </div>
    );
  }

  // ─── 3. Сменить пароль ────────────────────────────────────────
  function SettingsChangePassword() {
    const reqs = [
      { ok: true,  t: 'Не меньше 8 символов' },
      { ok: true,  t: 'Заглавная и строчная буквы' },
      { ok: true,  t: 'Хотя бы одна цифра' },
      { ok: false, t: 'Не совпадает с предыдущим' },
    ];
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DeepShell title="Сменить пароль" onSave={() => {}} saveLabel="Сохранить" saveDisabled>
          <FieldLabel>Текущий пароль</FieldLabel>
          <TextField type="password" value="••••••••••••" action={
            <IconEyeOff size={16} strokeWidth={1.75} color="var(--sub)" />
          } />

          <FieldLabel>Новый пароль</FieldLabel>
          <TextField type="password" value="••••••••••" caret action={
            <IconEye size={16} strokeWidth={1.75} color="var(--sub)" />
          } />

          <FieldLabel>Повторите новый</FieldLabel>
          <TextField type="password" value="••••••" action={
            <IconEye size={16} strokeWidth={1.75} color="var(--sub)" />
          } />

          <div style={{ padding: '18px 24px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--sub)' }}>
            Требования
          </div>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 18 }}>
            {reqs.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                  background: r.ok ? 'rgba(46,139,87,0.14)' : 'rgba(60,60,67,0.08)',
                  color: r.ok ? '#2E8B57' : 'rgba(60,60,67,0.4)',
                  display: 'grid', placeItems: 'center',
                }}>
                  {r.ok ? <IconCheck size={11} strokeWidth={2.5} /> : <span style={{ fontSize: 10 }}>·</span>}
                </span>
                <span style={{ color: r.ok ? 'var(--text)' : 'var(--sub)' }}>{r.t}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '0 24px 20px' }}>
            <div style={{
              padding: 14, borderRadius: 12,
              background: 'rgba(228,68,68,0.08)',
              color: 'var(--text)',
              fontSize: 13, lineHeight: 1.45,
            }}>
              После смены пароля все ваши устройства кроме текущего выйдут из аккаунта.
            </div>
          </div>
        </DeepShell>
        <SystemKeyboard mode="lower" />
      </div>
    );
  }

  // ─── 4. Устройства ────────────────────────────────────────────
  function SettingsDevices() {
    const list = [
      { name: 'iPhone 15 Pro',   meta: 'Это устройство · Москва',       last: 'Активно сейчас',      current: true,  Icon: IconSmartphone },
      { name: 'MacBook Pro',     meta: 'Safari · macOS 14 · Москва',    last: '2 часа назад',        Icon: IconLaptop },
      { name: 'iPad Air',        meta: 'dot. · iPadOS 17 · дом',        last: 'Вчера, 22:14',        Icon: IconTablet },
      { name: 'Chrome (Windows)', meta: 'dot. Web · Санкт-Петербург',   last: '3 дня назад',         untrusted: true, Icon: IconMonitor },
    ];
    return (
      <DeepShell title="Устройства">
        <FieldLabel>Активные сеансы</FieldLabel>
        {list.map((d, i) => (
          <div key={i} style={{
            margin: i === 0 ? '0 16px 8px' : '0 16px 8px',
            padding: 14, borderRadius: 14,
            background: d.current ? 'color-mix(in srgb, var(--accent) 8%, var(--chip))'
                                  : 'var(--chip)',
            border: d.current ? '1.5px solid color-mix(in srgb, var(--accent) 40%, transparent)'
                              : '1.5px solid transparent',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--surface, #fff)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              border: '1px solid var(--line)',
            }}>
              <d.Icon size={18} strokeWidth={1.75} color="var(--text)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {d.name}
                {d.untrusted && <span style={{
                  padding: '2px 7px', borderRadius: 99,
                  background: 'rgba(228,68,68,0.14)', color: '#E44',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.05, textTransform: 'uppercase',
                }}>Незнакомое</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.meta}</div>
              <div style={{ fontSize: 11, color: d.current ? 'var(--accent)' : 'var(--sub)', marginTop: 4, fontWeight: d.current ? 600 : 400 }}>{d.last}</div>
            </div>
            {!d.current && (
              <button style={{
                padding: '7px 12px', borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--line)',
                color: '#E44', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}>Выйти</button>
            )}
          </div>
        ))}

        <div style={{ padding: '12px 24px 0' }}>
          <button style={{
            width: '100%', padding: '13px 16px',
            background: 'rgba(228,68,68,0.08)',
            border: 'none', borderRadius: 12,
            color: '#E44', fontSize: 15, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Выйти на всех других устройствах
          </button>
        </div>

        <div style={{ padding: '18px 24px 24px', fontSize: 12, color: 'var(--sub)', lineHeight: 1.45 }}>
          Если вы видите незнакомое устройство — завершите сеанс и смените пароль.
        </div>
      </DeepShell>
    );
  }

  // ─── 5. Удалить аккаунт ───────────────────────────────────────
  function SettingsDeleteAccount() {
    const checks = [
      { on: true,  t: 'Я понимаю, что все мои задачи, привычки и страницы базы будут удалены' },
      { on: true,  t: 'Я понимаю, что активная подписка не будет возвращена' },
      { on: false, t: 'Я экспортировал(а) свои данные или мне они не нужны' },
    ];
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DeepShell title="Удалить аккаунт">
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(228,68,68,0.14)', color: '#E44',
              display: 'grid', placeItems: 'center', margin: '0 auto 14px',
            }}>
              <IconTrash size={24} strokeWidth={1.75} />
            </div>
            <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, letterSpacing: -0.3, color: 'var(--text)' }}>
              Удалить аккаунт навсегда?
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 14, color: 'var(--sub)', lineHeight: 1.5 }}>
              Все данные будут удалены без возможности восстановления. Это действие нельзя отменить.
            </div>
          </div>

          <FieldLabel>Что будет удалено</FieldLabel>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['24', 'активные задачи'],
              ['6',  'привычки со всей историей'],
              ['47', 'страниц в базе знаний'],
              ['3',  'подключённых устройства'],
            ].map(([n, t], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'var(--text)' }}>
                <span style={{ fontWeight: 600, minWidth: 30, textAlign: 'right', color: '#E44' }}>{n}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <FieldLabel>Подтверждение</FieldLabel>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checks.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  border: `1.5px solid ${c.on ? 'var(--accent)' : 'rgba(60,60,67,0.3)'}`,
                  background: c.on ? 'var(--accent)' : 'transparent',
                  display: 'grid', placeItems: 'center',
                }}>
                  {c.on && <IconCheck size={12} color="#fff" strokeWidth={2.5} />}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{c.t}</span>
              </div>
            ))}
          </div>

          <FieldLabel>Введите пароль для подтверждения</FieldLabel>
          <TextField type="password" value="••••••" caret />

          <div style={{ padding: '22px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button style={{
              padding: '14px 16px',
              background: 'rgba(228,68,68,0.5)', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: 'not-allowed', fontFamily: 'inherit',
            }}>
              Удалить аккаунт навсегда
            </button>
            <button style={{
              padding: '14px 16px',
              background: 'transparent', color: 'var(--text)',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Отмена
            </button>
          </div>
        </DeepShell>
      </div>
    );
  }

export {
  SettingsChangeName,
  SettingsChangeEmail,
  SettingsChangePassword,
  SettingsDevices,
  SettingsDeleteAccount,
  DeepShell, FieldLabel, Note, TextField,
};
