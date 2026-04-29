import React from 'react';
// Русская iOS-клавиатура (строчная / заглавные / цифры).
// Упрощённая — без haptics и предиктива, чтобы держать в 1 файле.
// Рендерится как фиксированный блок снизу артборда.

const KB_RU_LOWER = [
  ['й','ц','у','к','е','н','г','ш','щ','з','х'],
  ['ф','ы','в','а','п','р','о','л','д','ж','э'],
  ['я','ч','с','м','и','т','ь','б','ю'],
];
const KB_RU_UPPER = KB_RU_LOWER.map((r) => r.map((k) => k.toUpperCase()));
const KB_NUM = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['-','/',':',';','(',')','₽','&','@','"'],
  ['.',',','?','!','\''],
];

function IosKeyboard({ variant = 'light', mode = 'lower' }) {
  const onLight = variant !== 'dark';
  const rows = mode === 'num' ? KB_NUM : (mode === 'upper' ? KB_RU_UPPER : KB_RU_LOWER);
  const keyBg = onLight ? '#fff' : '#6B6B6F';
  const sysBg = onLight ? '#ADB3BC' : '#4A4A4E';
  const keyColor = onLight ? '#000' : '#fff';
  const kbBg = onLight ? '#D0D4DB' : '#222';

  const keyStyle = (flex = 1, bg = keyBg, fontSize = 18) => ({
    flex, height: 38, background: bg, borderRadius: 5,
    boxShadow: onLight ? '0 1px 0 rgba(0,0,0,0.3)' : '0 1px 0 rgba(0,0,0,0.5)',
    display: 'grid', placeItems: 'center',
    fontSize, color: keyColor, fontWeight: 400,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  });

  return (
    <div style={{
      background: kbBg, padding: '10px 3px 6px',
      display: 'flex', flexDirection: 'column', gap: 8,
      userSelect: 'none',
    }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', gap: 5, padding: '0 3px',
          paddingLeft: ri === 1 && mode !== 'num' ? 18 : 3,
          paddingRight: ri === 1 && mode !== 'num' ? 18 : 3,
        }}>
          {ri === 2 && mode !== 'num' && (
            <div style={keyStyle(1.5, sysBg, 13)}>
              {mode === 'upper' ? '⇧' : '⇧'}
            </div>
          )}
          {row.map((k) => (<div key={k} style={keyStyle(1)}>{k}</div>))}
          {ri === 2 && mode !== 'num' && (
            <div style={keyStyle(1.5, sysBg, 13)}>⌫</div>
          )}
          {ri === 2 && mode === 'num' && (
            <div style={keyStyle(1.5, sysBg, 13)}>⌫</div>
          )}
        </div>
      ))}
      {/* Bottom row */}
      <div style={{ display: 'flex', gap: 5, padding: '0 3px' }}>
        <div style={keyStyle(1.5, sysBg, 12)}>{mode === 'num' ? 'АБВ' : '123'}</div>
        <div style={keyStyle(1.2, sysBg, 14)}>🌐</div>
        <div style={keyStyle(4.5, keyBg, 13)}>пробел</div>
        <div style={{ ...keyStyle(2, 'var(--accent)', 14), color: '#fff' }}>готово</div>
      </div>
      <div style={{ height: 6 }} />
    </div>
  );
}

Object.assign(window, { IosKeyboard });


Object.assign(window, { IosKeyboard });
