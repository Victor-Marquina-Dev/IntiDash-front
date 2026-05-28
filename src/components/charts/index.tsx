'use client';

import React from 'react';
import { C } from '@/lib/colors';

export function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  const d = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`);
  }
  return d.join(' ');
}

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
  strokeWidth?: number;
}

export function Sparkline({ data, color = C.primary, height = 60, width = 220, fill = true, strokeWidth = 2 }: SparklineProps) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pad = 4;
  const W = width, H = height;
  const pts: [number, number][] = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (W - pad * 2),
    pad + (1 - (v - min) / range) * (H - pad * 2),
  ]);
  const path = smoothPath(pts);
  const area = `${path} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  const id = React.useId();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3"
        fill={C.card} stroke={color} strokeWidth="2"
      />
    </svg>
  );
}

interface ResponsiveSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  strokeWidth?: number;
}

export function ResponsiveSparkline({ data, color, height, strokeWidth = 2 }: ResponsiveSparklineProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(280);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const cw = Math.max(80, Math.floor(e.contentRect.width));
        setW(cw);
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <Sparkline data={data} color={color} width={w} height={height} strokeWidth={strokeWidth} />
    </div>
  );
}

interface DualAreaChartProps {
  months?: string[];
  income?: (number | null)[];
  expense?: (number | null)[];
  height?: number;
}

export function DualAreaChart({
  months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  income = [3800,4200,4500,4100,4700,4900,4600,5000,4800,5100,5200,null],
  expense = [2800,3000,3200,2900,3400,3300,3100,3500,3200,3250,3180,null],
  height = 240,
}: DualAreaChartProps) {
  const W = 800, H = height;
  const padL = 44, padR = 16, padT = 16, padB = 28;
  const all = [...income, ...expense].filter((v): v is number => v != null);
  const max = Math.ceil(Math.max(...all) / 1000) * 1000;
  const xs = months.map((_, i) => padL + (i / (months.length - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const pathOf = (arr: (number | null)[]) => {
    const valid = arr.map((v, i) => v == null ? null : [xs[i], y(v)] as [number, number]).filter((v): v is [number, number] => v !== null);
    return smoothPath(valid);
  };
  const areaOf = (arr: (number | null)[]) => {
    const valid = arr.map((v, i) => v == null ? null : [xs[i], y(v)] as [number, number]).filter((v): v is [number, number] => v !== null);
    const p = smoothPath(valid);
    const last = valid[valid.length - 1], first = valid[0];
    return `${p} L ${last[0]} ${H - padB} L ${first[0]} ${H - padB} Z`;
  };
  const id = React.useId();
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max * i) / ticks));
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${id}-pos`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.pos} stopOpacity="0.22" />
          <stop offset="100%" stopColor={C.pos} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-neg`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.neg} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.neg} stopOpacity="0" />
        </linearGradient>
      </defs>
      {tickVals.map((v, i) => {
        const yy = y(v);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={C.border} strokeWidth="1" strokeDasharray="2 4" />
            <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize="11" fill={C.textMute} fontFamily="Inter">
              {v >= 1000 ? `S/${(v / 1000).toFixed(0)}k` : `S/${v}`}
            </text>
          </g>
        );
      })}
      {months.map((m, i) => (
        <text key={m} x={xs[i]} y={H - 8} textAnchor="middle" fontSize="11" fill={C.textMute} fontFamily="Inter">{m}</text>
      ))}
      <path d={areaOf(income)} fill={`url(#${id}-pos)`} />
      <path d={areaOf(expense)} fill={`url(#${id}-neg)`} />
      <path d={pathOf(income)} fill="none" stroke={C.pos} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={pathOf(expense)} fill="none" stroke={C.neg} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {(() => {
        const lastIdx = income.findIndex(v => v == null) - 1;
        const idx = lastIdx < 0 ? income.length - 1 : lastIdx;
        const iv = income[idx] as number;
        const ev = expense[idx] as number;
        return (
          <g>
            <circle cx={xs[idx]} cy={y(iv)} r="4" fill={C.card} stroke={C.pos} strokeWidth="2" />
            <circle cx={xs[idx]} cy={y(ev)} r="4" fill={C.card} stroke={C.neg} strokeWidth="2" />
          </g>
        );
      })()}
    </svg>
  );
}

interface DonutSegment {
  v: number;
  c: string;
  label?: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function Donut({ segments, size = 180, thickness = 22, centerLabel, centerValue }: DonutProps) {
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  const C2 = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.v, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(63,86,28,0.06)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const len = (s.v / total) * C2;
        const off = -acc;
        acc += len;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.c} strokeWidth={thickness}
            strokeDasharray={`${len - 2} ${C2 - len + 2}`}
            strokeDashoffset={off}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
            style={{ transition: 'stroke-width .2s' }}
          />
        );
      })}
      {centerValue && (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill={C.textDim} fontFamily="Inter" letterSpacing="0.5">
            {centerLabel}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="22" fontWeight="600" fill={C.text} fontFamily="Inter">
            {centerValue}
          </text>
        </>
      )}
    </svg>
  );
}

interface PairedBarsProps {
  months?: string[];
  income?: number[];
  expense?: number[];
  height?: number;
}

export function PairedBars({
  months = ['jun','jul','ago','sep','oct','nov'],
  income = [4900,4600,5000,4800,5100,5200],
  expense = [3300,3100,3500,3200,3250,3180],
  height = 200,
}: PairedBarsProps) {
  const W = 600, H = height;
  const padL = 40, padR = 12, padT = 12, padB = 26;
  const max = Math.ceil(Math.max(...income, ...expense) / 1000) * 1000;
  const slotW = (W - padL - padR) / months.length;
  const barW = Math.min(18, slotW * 0.32);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const id = React.useId();
  const ticks = 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-pos`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.pos} stopOpacity="1" />
          <stop offset="100%" stopColor={C.pos} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`${id}-neg`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.neg} stopOpacity="1" />
          <stop offset="100%" stopColor={C.neg} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = Math.round((max * i) / ticks);
        const yy = y(v);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={C.border} strokeDasharray="2 4" />
            <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="10" fill={C.textMute} fontFamily="Inter">
              S/{(v / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
      {months.map((m, i) => {
        const x = padL + i * slotW + slotW / 2;
        const hIn = (H - padT - padB) * (income[i] / max);
        const hOut = (H - padT - padB) * (expense[i] / max);
        return (
          <g key={m}>
            <rect x={x - barW - 1} y={y(income[i])} width={barW} height={hIn} rx="3" fill={`url(#${id}-pos)`} />
            <rect x={x + 1} y={y(expense[i])} width={barW} height={hOut} rx="3" fill={`url(#${id}-neg)`} />
            <text x={x} y={H - 8} textAnchor="middle" fontSize="11" fill={C.textMute} fontFamily="Inter">{m}</text>
          </g>
        );
      })}
    </svg>
  );
}

interface ProgressBarProps {
  pct: number;
  color?: string;
  height?: number;
  track?: string;
}

export function ProgressBar({ pct, color = C.primary, height = 6, track = 'rgba(63,86,28,0.08)' }: ProgressBarProps) {
  return (
    <div style={{ height, borderRadius: 999, background: track, overflow: 'hidden', position: 'relative' }}>
      <div style={{
        width: `${Math.min(100, pct)}%`, height: '100%',
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: 999,
        transition: 'width .8s cubic-bezier(.2,.8,.2,1)',
      }} />
    </div>
  );
}

interface RadialProgressProps {
  pct: number;
  size?: number;
  thickness?: number;
  color?: string;
  label?: string;
  value?: string;
}

export function RadialProgress({ pct, size = 100, thickness = 8, color = C.neg, label, value }: RadialProgressProps) {
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  const C2 = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(63,86,28,0.06)" strokeWidth={thickness} />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={thickness}
        strokeDasharray={`${(pct / 100) * C2} ${C2}`}
        strokeDashoffset="0" strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)' }}
      />
      {value && (
        <>
          <text x={cx} y={cy + 2} textAnchor="middle" fontSize="18" fontWeight="600" fill={C.text} fontFamily="Inter">
            {value}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" fill={C.textDim} fontFamily="Inter">
            {label}
          </text>
        </>
      )}
    </svg>
  );
}
