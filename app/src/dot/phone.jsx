import React from 'react';
// Reusable phone frame + primitives themed by variant + accent.
// Simpler than the generic iOS starter — tuned for our dot. redesign.

const { useState: useStateP } = React;

function Phone({ variant = 'light', accent = 'blue', font = 'inter', children, label }) {
  const v = window.VARIANT_META[variant];
  const a = window.ACCENTS[accent];
  const f = window.FONTS[font];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 390, height: 800,
        borderRadius: 46,
        background: v.bg,
        color: v.text,
        fontFamily: f.stack,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.08), 0 0 0 12px #111',
        WebkitFontSmoothing: 'antialiased',
        // CSS vars for children
        '--bg': v.bg, '--surface': v.surface, '--text': v.text,
        '--sub': v.sub, '--line': v.line, '--chip': v.chip,
        '--accent': a.hex, '--accent-soft': a.soft,
      }}>
        <StatusBar dark={variant === 'dark'} />
        <div style={{ paddingTop: 46, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <HomeIndicator dark={variant === 'dark'} />
      </div>
      {label && <div style={{ fontSize: 12, color: '#888', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 0.04 }}>{label}</div>}
    </div>
  );
}

function StatusBar({ dark }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 46,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', zIndex: 5,
    }}>
      <span style={{ fontWeight: 600, fontSize: 15, color: c, paddingTop: 16 }}>9:41</span>
      <div style={{ paddingTop: 16, display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="3" height="4" rx="0.5" fill={c}/><rect x="4" y="4" width="3" height="6" rx="0.5" fill={c}/><rect x="8" y="2" width="3" height="8" rx="0.5" fill={c}/><rect x="12" y="0" width="3" height="10" rx="0.5" fill={c}/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke={c} strokeOpacity=".4" fill="none"/><rect x="2" y="2" width="16" height="7" rx="1.5" fill={c}/></svg>
      </div>
    </div>
  );
}

function HomeIndicator({ dark }) {
  return (
    <div style={{
      position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
      width: 134, height: 5, borderRadius: 3,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)', zIndex: 20,
    }} />
  );
}

// ── Primitives used by screens ──────────────────────────────

function Logo({ size = 20, color = 'currentColor' }) {
  // Simple mark — lowercase "dot." with a coloured dot
  return (
    <span style={{ fontSize: size, fontWeight: 600, letterSpacing: -0.02 * size, color }}>
      dot<span style={{ color: 'var(--accent)' }}>.</span>
    </span>
  );
}

function Button({ children, kind = 'primary', onClick, disabled, full }) {
  const base = {
    height: 50, borderRadius: 14, fontWeight: 600, fontSize: 15,
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '0 20px', width: full ? '100%' : 'auto',
    transition: 'transform 80ms, opacity 120ms',
    opacity: disabled ? 0.45 : 1,
  };
  const styles = {
    primary: { ...base, background: 'var(--accent)', color: '#fff' },
    ghost: { ...base, background: 'transparent', color: 'var(--text)', border: '1px solid var(--line)' },
    soft: { ...base, background: 'var(--accent-soft)', color: 'var(--accent)' },
    plain: { ...base, background: 'transparent', color: 'var(--accent)', padding: 0, height: 'auto' },
  };
  return <button onClick={disabled ? undefined : onClick} style={styles[kind]}>{children}</button>;
}

function Field({ label, type = 'text', value, onChange, placeholder, error, trailing }) {
  const [focus, setFocus] = useStateP(false);
  return (
    <label style={{ display: 'block', width: '100%' }}>
      {label && <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 6, fontWeight: 500 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 50, borderRadius: 14,
        background: 'var(--surface)',
        border: `1px solid ${error ? '#E44' : (focus ? 'var(--accent)' : 'var(--line)')}`,
        padding: '0 14px', transition: 'border-color 120ms',
      }}>
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            color: 'var(--text)', fontSize: 16, fontFamily: 'inherit',
          }}
        />
        {trailing}
      </div>
      {error && <div style={{ fontSize: 12, color: '#E44', marginTop: 6 }}>{error}</div>}
    </label>
  );
}

function Card({ children, pad = 16, style }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18, padding: pad,
      border: '1px solid var(--line)',
      ...style,
    }}>{children}</div>
  );
}

function Row({ children, onClick, last }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      minHeight: 52, padding: '10px 16px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      cursor: onClick ? 'pointer' : 'default',
    }}>{children}</div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8, background: 'var(--bg)',
      borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around',
      zIndex: 10,
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? 'var(--accent)' : 'var(--sub)',
            padding: '6px 14px',
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.glyph}</span>
            <span style={{ fontSize: 11, fontWeight: 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 22, height: 22, borderRadius: 11,
      border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
      background: checked ? 'var(--accent)' : 'transparent',
      display: 'grid', placeItems: 'center', flexShrink: 0, cursor: 'pointer',
      padding: 0,
    }}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
}

// Row коллидирует с settings.jsx — НЕ вешаем на window, экспортим только в ESM.
// Дуальный режим: window для legacy-потребителей, export для нового кода.
Object.assign(window, { Phone, StatusBar, HomeIndicator, Logo, Button, Field, Card, TabBar, Checkbox });
export { Phone, StatusBar, HomeIndicator, Logo, Button, Field, Card, Row, TabBar, Checkbox };
