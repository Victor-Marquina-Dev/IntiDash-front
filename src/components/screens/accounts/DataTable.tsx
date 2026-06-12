'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';

export interface Col { key: string; label: string; align?: 'left' | 'right'; width?: number; separator?: boolean; sortField?: string }

export function DataTable({ cols, rows, emptyMsg, accent, darkMode = false, onEdit, onDelete, sortKey, sortDir, onSort }: Readonly<{
  cols: Col[];
  rows: Record<string, React.ReactNode>[];
  emptyMsg: string;
  accent: string;
  darkMode?: boolean;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}>) {
  const D = darkMode;
  const hasActions = Boolean(onEdit || onDelete);
  const border = D ? 'rgba(255,255,255,0.07)' : C.border;

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: 13, fontWeight: 700, color: accent,
    textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap',
    borderBottom: `2px solid ${accent}30`, fontFamily: 'var(--font-ui)',
    background: D ? `${accent}18` : `${accent}10`,
    position: 'sticky', top: 0, zIndex: 1,
  };
  const tdStyle = (align: 'left' | 'right' = 'left', separator?: boolean): React.CSSProperties => ({
    padding: '14px 16px', fontSize: 16, color: D ? 'rgba(255,255,255,0.88)' : C.text, fontFamily: 'var(--font-ui)',
    borderBottom: `1px solid ${border}`,
    borderRight: separator ? `2px solid ${accent}20` : undefined,
    textAlign: align,
    fontVariantNumeric: 'tabular-nums',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  });
  const ActionBtn = ({ danger, onClick, title, children }: { danger?: boolean; onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode }) => {
    const [h, setH] = React.useState(false);
    return (
      <button
        onClick={onClick} title={title}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: 28, height: 28, borderRadius: 8,
          border: `1px solid ${danger ? (h ? C.neg : `${C.neg}40`) : (h ? (D ? 'rgba(255,255,255,0.20)' : 'rgba(17,24,39,0.25)') : border)}`,
          background: danger ? (h ? `${C.neg}18` : `${C.neg}08`) : (h ? (D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.07)') : (D ? 'rgba(255,255,255,0.05)' : '#fff')),
          display: 'grid', placeItems: 'center',
          cursor: 'pointer',
          color: danger ? C.neg : (h ? (D ? 'rgba(255,255,255,0.88)' : C.text) : (D ? 'rgba(255,255,255,0.50)' : C.textDim)),
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          flexShrink: 0,
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {cols.map(c => {
              const field = c.sortField ?? c.key;
              const isSorted = sortKey === field;
              const sortable = Boolean(onSort);
              return (
                <th key={c.key}
                    onClick={sortable ? () => onSort!(field) : undefined}
                    style={{ ...thStyle, textAlign: c.align ?? 'left', width: c.width,
                      borderRight: c.separator ? `2px solid ${accent}20` : undefined,
                      cursor: sortable ? 'pointer' : 'default', userSelect: 'none',
                    }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {c.label}
                    {sortable && (
                      <span style={{ fontSize: 8, lineHeight: 1, color: isSorted ? accent : `${accent}50` }}>
                        {isSorted && sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
            {hasActions && (
              <th style={{ ...thStyle, width: 84, padding: '10px 14px 10px 8px', textAlign: 'right' }}>
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length + (hasActions ? 1 : 0)} style={{ padding: '56px 20px', textAlign: 'center', color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontSize: 16 }}>
                {emptyMsg}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="fz-row" style={{ cursor: 'default' }}>
              {cols.map(c => (
                <td key={c.key} style={tdStyle(c.align, c.separator)}>{row[c.key]}</td>
              ))}
              {hasActions && (
                <td style={{ padding: '0 14px 0 8px', width: 84, verticalAlign: 'middle', borderBottom: `1px solid ${border}`, textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 5 }}>
                    {onEdit && (
                      <ActionBtn onClick={e => { e.stopPropagation(); onEdit(i); }} title="Editar">
                        <Icon.edit size={12} strokeWidth={1.8} />
                      </ActionBtn>
                    )}
                    {onDelete && (
                      <ActionBtn danger onClick={e => { e.stopPropagation(); onDelete(i); }} title="Eliminar">
                        <Icon.trash size={12} strokeWidth={1.8} />
                      </ActionBtn>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Modal ver/editar cuenta ────────────────────────────────────────────────

