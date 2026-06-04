import type { CSSProperties, ReactNode } from 'react';
import { C } from '@/lib/colors';

export function money(value: number | null | undefined) {
  return value != null ? `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-';
}

export function HeaderCell({ children }: Readonly<{ children: string }>) {
  return (
    <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, background: 'rgba(63,86,28,0.04)', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}

export function EmptyRow({ colSpan }: Readonly<{ colSpan: number }>) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '20px 14px', textAlign: 'center', color: C.textMute, fontSize: 13 }}>Sin datos. Sincroniza primero.</td>
    </tr>
  );
}

export function tableShell(children: ReactNode) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${C.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        {children}
      </table>
    </div>
  );
}

export function TableShell({ children }: Readonly<{ children: ReactNode }>) {
  return tableShell(children);
}

export function rowBg(index: number) {
  return index % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.015)';
}

export function bottomBorder(index: number, length: number) {
  return index < length - 1 ? `1px solid ${C.border}` : 'none';
}

export function rowStyle(index: number): CSSProperties {
  return { background: rowBg(index) };
}

export function cellStyle(index: number, length: number, style: CSSProperties = {}): CSSProperties {
  return {
    padding: '10px 14px',
    borderBottom: bottomBorder(index, length),
    ...style,
  };
}
