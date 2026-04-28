// Email verification flow + ограниченный режим

const { useState: useStateEV } = React;

// 1) После регистрации — промежуточный экран «Проверьте почту»
function VerifyEmailSent({ email = 'alice@mail.com' }) {
  return (
    <div style={{ padding: '48px 28px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'grid', placeItems: 'center', marginBottom: 28,
        }}><IconMail size={36} strokeWidth={1.5} /></div>

        <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>Почти готово</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, margin: '0 0 14px', lineHeight: 1.15 }}>Проверьте почту</h1>
        <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
          Мы отправили письмо со ссылкой подтверждения на <span style={{ color: 'var(--text)', fontWeight: 500 }}>{email}</span>. Откройте его, чтобы активировать аккаунт.
        </p>

        <div style={{
          marginTop: 20, padding: 14, borderRadius: 14, background: 'var(--chip)',
          display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--sub)', lineHeight: 1.5,
        }}>
          <IconInfo size={16} strokeWidth={1.75} />
          <span>Не получили письмо? Проверьте папку «Спам» или отправьте заново через минуту.</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button kind="primary" full>Открыть почту</Button>
        <Button kind="ghost" full>Отправить письмо снова</Button>
        <button style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 14, padding: 12, fontFamily: 'inherit' }}>
          Изменить email
        </button>
      </div>
    </div>
  );
}

// 2) Успех — почта подтверждена (после клика на ссылку в письме)
function VerifyEmailSuccess({ onGo }) {
  return (
    <div style={{ padding: '48px 28px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: 'var(--accent)', color: '#fff',
          display: 'grid', placeItems: 'center', marginBottom: 28,
          boxShadow: '0 12px 28px rgba(109,60,240,0.28)',
        }}><IconCheck size={38} strokeWidth={2.2} /></div>

        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.7, margin: '0 0 14px', lineHeight: 1.12 }}>Почта подтверждена</h1>
        <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
          Аккаунт активирован. Синхронизация между устройствами включена — все изменения будут появляться мгновенно.
        </p>
      </div>

      <Button kind="primary" full onClick={() => onGo && onGo('home')}>Перейти в dot.</Button>
    </div>
  );
}

// 3) Главный экран — ограниченный режим (баннер сверху + задачи внизу)
function HomeUnverified() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Баннер */}
      <div style={{
        margin: '8px 12px 0', padding: '10px 14px',
        borderRadius: 12, background: '#FFF4D6', color: '#7A5A00',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, lineHeight: 1.4,
      }}>
        <IconMail size={16} strokeWidth={1.9} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: '#5A4200' }}>Подтвердите почту</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Синхронизация между устройствами выключена</div>
        </div>
        <button style={{
          background: '#7A5A00', color: '#fff', border: 'none',
          borderRadius: 99, padding: '5px 11px', fontSize: 12, fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>Отправить</button>
      </div>

      <ForcedTab tab="tasks" />
    </div>
  );
}

// 4) Строка в настройках / профиле — статус «не подтверждена»
function UnverifiedAccountSection() {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
        <button style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex', fontFamily: 'inherit' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Аккаунт</div>
      </div>

      {/* Карточка-предупреждение */}
      <div style={{
        margin: '4px 24px 14px', padding: 16,
        borderRadius: 16, background: '#FFF4D6',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#7A5A00', color: '#fff',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}><IconMail size={18} strokeWidth={2} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#3E2B00' }}>Почта не подтверждена</div>
          <div style={{ fontSize: 12, color: '#6A4F00', marginTop: 4, lineHeight: 1.45 }}>
            Мы отправили письмо на alice@mail.com 3 дня назад. Нажмите ссылку в нём, чтобы включить синхронизацию и восстановление пароля.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={{
              background: '#7A5A00', color: '#fff', border: 'none',
              borderRadius: 99, padding: '6px 12px', fontSize: 12, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Отправить снова</button>
            <button style={{
              background: 'transparent', color: '#7A5A00', border: 'none',
              padding: '6px 8px', fontSize: 12, fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Изменить email</button>
          </div>
        </div>
      </div>

      {/* Обычные поля аккаунта, но с отметкой неподтверждённости */}
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <AccRow label="Имя" value="Алиса К." />
        <AccRow label="Email" value="alice@mail.com" right={
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7A5A00', background: '#FFF4D6', padding: '2px 8px', borderRadius: 99 }}>Не подтверждён</span>
        } />
        <AccRow label="Сменить пароль" value="Доступно после подтверждения" disabled />
      </div>
    </div>
  );
}

function AccRow({ label, value, right, disabled }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 24px', borderBottom: '1px solid var(--line)',
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
      {right ? right : <span style={{ color: 'var(--sub)', fontSize: 14 }}>{value}</span>}
      {!right && !disabled && <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />}
    </div>
  );
}

Object.assign(window, {
  VerifyEmailSent, VerifyEmailSuccess, HomeUnverified, UnverifiedAccountSection,
});
