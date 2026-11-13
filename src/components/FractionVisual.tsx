import React from 'react';
import { VisualFractionSpec } from '../types/game';

interface FractionVisualProps {
  spec: VisualFractionSpec;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selectedIndices?: number[];
  onToggleIndex?: (index: number) => void;
}

const THEME_COLORS: Record<
  NonNullable<VisualFractionSpec['colorTheme']>,
  { fill: string; fillHover: string; stroke: string; empty: string }
> = {
  emerald: { fill: '#10b981', fillHover: '#059669', stroke: '#065f46', empty: '#ecfdf5' },
  tomato: { fill: '#f97316', fillHover: '#ea580c', stroke: '#9a3412', empty: '#fff7ed' },
  berry: { fill: '#ec4899', fillHover: '#db2777', stroke: '#9d174d', empty: '#fdf2f8' },
  chocolate: { fill: '#92400e', fillHover: '#78350f', stroke: '#451a03', empty: '#fef3c7' },
  amber: { fill: '#f59e0b', fillHover: '#d97706', stroke: '#92400e', empty: '#fffbeb' },
  sky: { fill: '#0ea5e9', fillHover: '#0284c7', stroke: '#075985', empty: '#f0f9ff' },
  royal: { fill: '#6366f1', fillHover: '#4f46e5', stroke: '#3730a3', empty: '#eef2ff' },
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSector(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

export const FractionVisual: React.FC<FractionVisualProps> = ({
  spec,
  size = 'md',
  interactive = false,
  selectedIndices,
  onToggleIndex,
}) => {
  const palette = THEME_COLORS[spec.colorTheme || 'emerald'];
  const denom = Math.max(1, spec.denominator);

  const isFilled = (idx: number) => {
    if (interactive && selectedIndices) {
      return selectedIndices.includes(idx);
    }
    return idx < spec.numerator;
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (!interactive || !onToggleIndex) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleIndex(idx);
    }
  };

  // PIZZA or CAKE (Circular radial slices)
  if (spec.shape === 'pizza' || spec.shape === 'cake') {
    const dim = size === 'sm' ? 96 : size === 'md' ? 148 : 230;
    const cx = 100;
    const cy = 100;
    const outerR = 88;
    const innerR = spec.shape === 'pizza' ? 76 : 82;
    const sliceAngle = 360 / denom;

    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 200 200"
        className="select-none overflow-visible"
        role={interactive ? 'group' : 'img'}
        aria-label={
          interactive
            ? `Figura circular dividida en ${denom} porciones iguales`
            : `Representación de ${spec.numerator} de ${denom}`
        }
      >
        {/* Outer crust / plate */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 4}
          fill={spec.shape === 'pizza' ? '#fde68a' : '#fef3c7'}
          stroke={spec.shape === 'pizza' ? '#d97706' : '#cbd5e1'}
          strokeWidth="3"
        />
        {spec.shape === 'pizza' && (
          <circle cx={cx} cy={cy} r={outerR} fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
        )}

        {Array.from({ length: denom }).map((_, i) => {
          const startAngle = i * sliceAngle;
          const endAngle = (i + 1) * sliceAngle;
          const filled = isFilled(i);
          const midAngle = startAngle + sliceAngle / 2;
          const toppingPos = polarToCartesian(cx, cy, innerR * 0.56, midAngle);

          return (
            <g
              key={i}
              onClick={() => interactive && onToggleIndex?.(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? filled : undefined}
              aria-label={interactive ? `Porción ${i + 1} de ${denom}` : undefined}
              className={
                interactive
                  ? 'cursor-pointer transition-opacity duration-150 hover:opacity-90 focus:outline-none'
                  : undefined
              }
            >
              <path
                d={describeSector(cx, cy, innerR, startAngle, endAngle)}
                fill={filled ? palette.fill : palette.empty}
                stroke={palette.stroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Pizza pepperoni or cake berry dot on filled slices */}
              {filled && spec.shape === 'pizza' && (
                <circle
                  cx={toppingPos.x}
                  cy={toppingPos.y}
                  r={denom >= 8 ? 6 : 8}
                  fill="#b91c1c"
                  opacity="0.88"
                />
              )}
              {filled && spec.shape === 'cake' && (
                <circle
                  cx={toppingPos.x}
                  cy={toppingPos.y}
                  r={denom >= 8 ? 5 : 6.5}
                  fill="#ffffff"
                  opacity="0.45"
                />
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="3.5" fill={palette.stroke} />
      </svg>
    );
  }

  // BAR (Horizontal fraction strip)
  if (spec.shape === 'bar') {
    const width = size === 'sm' ? 140 : size === 'md' ? 220 : 380;
    const height = size === 'sm' ? 38 : size === 'md' ? 52 : 76;
    const viewW = 360;
    const viewH = 72;
    const cellW = (viewW - 12) / denom;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="select-none"
        role={interactive ? 'group' : 'img'}
        aria-label={
          interactive
            ? `Barra dividida en ${denom} partes iguales`
            : `Barra representando ${spec.numerator} de ${denom}`
        }
      >
        <rect
          x="4"
          y="6"
          width={viewW - 8}
          height={viewH - 12}
          rx="10"
          fill="#ffffff"
          stroke={palette.stroke}
          strokeWidth="3"
        />
        {Array.from({ length: denom }).map((_, i) => {
          const filled = isFilled(i);
          const x = 6 + i * cellW;
          return (
            <g
              key={i}
              onClick={() => interactive && onToggleIndex?.(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? filled : undefined}
              aria-label={interactive ? `Parte ${i + 1} de ${denom}` : undefined}
              className={interactive ? 'cursor-pointer hover:opacity-90' : undefined}
            >
              <rect
                x={x + 1}
                y="8"
                width={Math.max(4, cellW - 2)}
                height={viewH - 16}
                rx="4"
                fill={filled ? palette.fill : palette.empty}
                stroke={palette.stroke}
                strokeWidth="2"
              />
              {filled && spec.colorTheme === 'chocolate' && (
                <rect
                  x={x + 6}
                  y="14"
                  width={Math.max(2, cellW - 12)}
                  height={viewH - 28}
                  rx="2"
                  fill="none"
                  stroke="#b45309"
                  strokeWidth="1.5"
                  opacity="0.55"
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // GRID (Rectangular rows x cols)
  if (spec.shape === 'grid') {
    const cols = spec.cols || Math.ceil(Math.sqrt(denom));
    const rows = spec.rows || Math.ceil(denom / cols);
    const cellPx = size === 'sm' ? 28 : size === 'md' ? 40 : 58;
    const width = cols * cellPx + 12;
    const height = rows * cellPx + 12;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${cols * 48 + 12} ${rows * 48 + 12}`}
        className="select-none"
        role={interactive ? 'group' : 'img'}
        aria-label={
          interactive
            ? `Cuadrícula de ${denom} casillas iguales`
            : `Cuadrícula representando ${spec.numerator} de ${denom}`
        }
      >
        {Array.from({ length: denom }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const filled = isFilled(i);
          return (
            <rect
              key={i}
              x={6 + c * 48 + 2}
              y={6 + r * 48 + 2}
              width="44"
              height="44"
              rx="8"
              fill={filled ? palette.fill : palette.empty}
              stroke={palette.stroke}
              strokeWidth="2.5"
              onClick={() => interactive && onToggleIndex?.(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? filled : undefined}
              aria-label={interactive ? `Casilla ${i + 1} de ${denom}` : undefined}
              className={interactive ? 'cursor-pointer hover:opacity-90' : undefined}
            />
          );
        })}
      </svg>
    );
  }

  // JUG (Graduated measuring pitcher, levels filled from bottom to top)
  const jugW = size === 'sm' ? 84 : size === 'md' ? 120 : 170;
  const jugH = size === 'sm' ? 104 : size === 'md' ? 150 : 210;
  const bodyTop = 24;
  const bodyBottom = 166;
  const levelH = (bodyBottom - bodyTop) / denom;

  return (
    <svg
      width={jugW}
      height={jugH}
      viewBox="0 0 140 184"
      className="select-none"
      role={interactive ? 'group' : 'img'}
      aria-label={
        interactive
          ? `Jarra graduada en ${denom} niveles iguales`
          : `Jarra llena hasta ${spec.numerator} de ${denom}`
      }
    >
      {/* Handle */}
      <path
        d="M 106 46 C 128 46, 128 118, 106 118"
        fill="none"
        stroke="#64748b"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Spout */}
      <path d="M 24 24 L 34 14 L 106 14 L 106 24" fill="#f8fafc" stroke="#475569" strokeWidth="3" />

      {/* Levels (index 0 at bottom, denom - 1 at top) */}
      {Array.from({ length: denom }).map((_, i) => {
        const y = bodyBottom - (i + 1) * levelH;
        const filled = isFilled(i);
        return (
          <g
            key={i}
            onClick={() => interactive && onToggleIndex?.(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-pressed={interactive ? filled : undefined}
            aria-label={interactive ? `Nivel ${i + 1} de ${denom}` : undefined}
            className={interactive ? 'cursor-pointer hover:opacity-90' : undefined}
          >
            <rect
              x="34"
              y={y}
              width="72"
              height={levelH}
              fill={filled ? palette.fill : '#f8fafc'}
              stroke="#64748b"
              strokeWidth="1.8"
            />
            {/* Tick mark */}
            <line x1="34" y1={y} x2="46" y2={y} stroke="#1e293b" strokeWidth="2.5" />
          </g>
        );
      })}
      {/* Outer outline */}
      <rect
        x="34"
        y={bodyTop}
        width="72"
        height={bodyBottom - bodyTop}
        rx="4"
        fill="none"
        stroke="#334155"
        strokeWidth="3.5"
      />
    </svg>
  );
};

interface NumberLineVisualProps {
  divisions: number;
  selectedTick: number | null;
  onSelectTick: (tick: number) => void;
  disabled?: boolean;
}

export const NumberLineVisual: React.FC<NumberLineVisualProps> = ({
  divisions,
  selectedTick,
  onSelectTick,
  disabled = false,
}) => {
  const paddingX = 48;
  const width = 560;
  const lineWidth = width - paddingX * 2;
  const step = lineWidth / divisions;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox={`0 0 ${width} 140`}
        className="w-full h-auto select-none overflow-visible"
        role="group"
        aria-label={`Recta numérica de 0 a 1 dividida en ${divisions} partes iguales`}
      >
        {/* Track base */}
        <line
          x1={paddingX}
          y1="82"
          x2={width - paddingX}
          y2="82"
          stroke="#cbd5e1"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Active progress from 0 to selectedTick */}
        {selectedTick !== null && selectedTick > 0 && (
          <line
            x1={paddingX}
            y1="82"
            x2={paddingX + selectedTick * step}
            y2="82"
            stroke="#0284c7"
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}

        {/* Interactive ticks 0..divisions */}
        {Array.from({ length: divisions + 1 }).map((_, idx) => {
          const x = paddingX + idx * step;
          const isEndpoint = idx === 0 || idx === divisions;
          const isSelected = selectedTick === idx;

          return (
            <g
              key={idx}
              onClick={() => !disabled && onSelectTick(idx)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectTick(idx);
                }
              }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-label={`Marca ${idx} de ${divisions}`}
              className={disabled ? 'cursor-default' : 'cursor-pointer'}
            >
              {/* Generous invisible hit area >= 44px */}
              <circle cx={x} cy="82" r="22" fill="transparent" />

              {/* Tick mark */}
              <line
                x1={x}
                y1={isEndpoint ? 64 : 70}
                x2={x}
                y2={isEndpoint ? 100 : 94}
                stroke={isSelected ? '#0369a1' : '#334155'}
                strokeWidth={isEndpoint ? '4' : '3'}
                strokeLinecap="round"
              />

              {/* Selectable node */}
              <circle
                cx={x}
                cy="82"
                r={isSelected ? 11 : 7}
                fill={isSelected ? '#f59e0b' : '#ffffff'}
                stroke={isSelected ? '#92400e' : '#0284c7'}
                strokeWidth="3"
              />

              {/* Explorer flag above selected tick */}
              {isSelected && (
                <g className="animate-pop-in">
                  <line x1={x} y1="70" x2={x} y2="24" stroke="#92400e" strokeWidth="3" />
                  <path d={`M ${x} 24 L ${x + 28} 34 L ${x} 44 Z`} fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />
                </g>
              )}

              {/* Labels for 0 and 1 */}
              {idx === 0 && (
                <text x={x} y="124" textAnchor="middle" className="fill-slate-800 text-lg font-bold font-mono-num">
                  0
                </text>
              )}
              {idx === divisions && (
                <text x={x} y="124" textAnchor="middle" className="fill-slate-800 text-lg font-bold font-mono-num">
                  1
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
