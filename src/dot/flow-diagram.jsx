import React from 'react';
// Flow diagram — логика переходов между экранами auth + onboarding.

function FlowNode({ x, y, w = 132, h = 56, title, sub, accent, kind = 'screen' }) {
  const colors = {
    screen: { bg: '#fff', border: '#E5E5EA', label: '#8E8E93' },
    entry:  { bg: 'var(--dot-accent, #6D3CF0)', border: 'transparent', label: 'rgba(255,255,255,0.75)', text: '#fff' },
    end:    { bg: '#F2F2F4', border: '#E5E5EA', label: '#8E8E93' },
  };
  const c = colors[kind] || colors.screen;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={w} height={h} rx={12} ry={12}
        fill={c.bg} stroke={c.border} strokeWidth={1} />
      <text x={12} y={22} fontSize={10} fontWeight={600}
        fill={c.label} style={{ letterSpacing: 0.08, textTransform: 'uppercase' }}>{sub}</text>
      <text x={12} y={41} fontSize={14} fontWeight={600}
        fill={c.text || '#0B0B0D'}>{title}</text>
    </g>
  );
}

function FlowEdge({ d, label, labelX, labelY, dashed }) {
  return (
    <g>
      <path d={d} stroke="#B0B0B8" strokeWidth={1.2} fill="none"
        strokeDasharray={dashed ? '4 4' : 'none'}
        markerEnd="url(#flow-arrow)" />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect x={-label.length * 3 - 6} y={-9} width={label.length * 6 + 12} height={18}
            rx={9} fill="#fff" stroke="#E5E5EA" />
          <text x={0} y={4} fontSize={10} fontWeight={500}
            fill="#3A3A3C" textAnchor="middle">{label}</text>
        </g>
      )}
    </g>
  );
}

function FlowDiagram() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#FAFAFA',
      borderRadius: 14,
      padding: 24, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'inherit',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.12,
        textTransform: 'uppercase', color: '#8E8E93', marginBottom: 4 }}>Flow</div>
      <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>От входа до главного экрана</h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6A6A70', lineHeight: 1.45 }}>
        Миграция показывается только новым пользователям, у которых на устройстве есть локальные данные.
      </p>

      <svg viewBox="0 0 600 580" style={{ width: '100%', flex: 1, display: 'block' }}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#B0B0B8" />
          </marker>
        </defs>

        {/* Row 1 — вход */}
        <FlowNode x={234} y={10}  kind="entry" sub="Старт"  title="Вход" />

        {/* Row 2 — регистрация / восст. */}
        <FlowNode x={60}  y={110} sub="Auth"   title="Регистрация" />
        <FlowNode x={234} y={110} sub="Auth"   title="Есть аккаунт?" />
        <FlowNode x={408} y={110} sub="Auth"   title="Восстановление" />

        {/* Row 3 — онбординг */}
        <FlowNode x={60}  y={220} sub="Onb 1"  title="Добро пожаловать" />
        <FlowNode x={234} y={220} sub="Onb 2"  title="Одна цель" />
        <FlowNode x={408} y={220} sub="Onb 3"  title="Везде под рукой" />

        {/* Row 4 — миграция */}
        <FlowNode x={60}  y={330} sub="Data"   title="Нашли данные?" />
        <FlowNode x={234} y={330} sub="Flow"   title="Миграция" />
        <FlowNode x={408} y={330} sub="State"  title="Переносим…" />

        {/* Row 5 — home */}
        <FlowNode x={234} y={460} kind="entry" sub="Финал"  title="Задачи" />
        <FlowNode x={408} y={460} kind="end"   sub="Выход"  title="Готово" />

        {/* edges */}
        <FlowEdge d="M 300 66 L 300 110" />
        <FlowEdge d="M 270 138 L 126 138" label="Новый"  labelX={198} labelY={138} />
        <FlowEdge d="M 330 138 L 474 138" label="Забыл"  labelX={402} labelY={138} dashed />

        <FlowEdge d="M 126 166 L 126 220" />
        <FlowEdge d="M 300 166 L 300 220" />
        <FlowEdge d="M 474 166 L 474 220" />
        <FlowEdge d="M 474 245 Q 474 280 300 280 T 126 245" dashed />

        <FlowEdge d="M 126 276 L 126 330" />
        <FlowEdge d="M 300 276 L 300 330" />
        <FlowEdge d="M 474 276 L 474 330" />

        <FlowEdge d="M 192 358 L 234 358" label="Да" labelX={213} labelY={358} />
        <FlowEdge d="M 366 358 L 408 358" />
        <FlowEdge d="M 126 386 Q 126 430 300 430 T 474 460" label="Нет" labelX={300} labelY={425} dashed />

        <FlowEdge d="M 300 386 L 300 460" />
        <FlowEdge d="M 474 386 Q 474 420 434 460" dashed />
      </svg>
    </div>
  );
}

Object.assign(window, { FlowDiagram });


Object.assign(window, { FlowNode, FlowEdge, FlowDiagram });
