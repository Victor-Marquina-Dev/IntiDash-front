'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { PresupuestoLimiteRow } from '@/shared/types/finance.types';
import { COLOR_OPTS, FONT } from './constants';

export interface LimiteFormProps {
  initial?: PresupuestoLimiteRow;
  quickPreset?: { categoria: string; limite: number; color: string };
  categoriasDisponibles: string[];
  onSaved: (row: PresupuestoLimiteRow) => void;
  onCancel: () => void;
}
export function LimiteForm({ initial, quickPreset, categoriasDisponibles, onSaved, onCancel }: LimiteFormProps) {
  const [categoria, setCategoria] = React.useState(initial?.categoria ?? quickPreset?.categoria ?? '');
  const [limite,    setLimite]    = React.useState(initial?.limite != null ? String(initial.limite) : quickPreset?.limite != null ? String(quickPreset.limite) : '');
  const [color,     setColor]     = React.useState(initial?.color ?? quickPreset?.color ?? COLOR_OPTS[0]);
  const [saving,    setSaving]    = React.useState(false);
  const [error,     setError]     = React.useState('');

  const isEdit = !!initial;

  const save = async () => {
    if (!categoria.trim()) { setError('Escribe una categoría.'); return; }
    const lim = parseFloat(limite);
    if (isNaN(lim) || lim < 0) { setError('Ingresa un monto válido.'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await notionPaymentsService.updatePresupuestoLimite(initial.id, { categoria: categoria.trim(), limite: lim, color });
        onSaved({ ...initial, categoria: categoria.trim(), limite: lim, color });
      } else {
        const result = await notionPaymentsService.createPresupuestoLimite({ categoria: categoria.trim(), limite: lim, color });
        onSaved({ id: (result as { id: string }).id, categoria: categoria.trim(), limite: lim, color });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    }
    setSaving(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
    padding: '0 10px', fontSize: 13, fontFamily: FONT, color: C.text,
    background: '#fff', boxSizing: 'border-box', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    fontSize: 10.5, color: C.textMute, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT, display: 'block', marginBottom: 4,
  };

  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${color}40`,
      background: `${color}06`, padding: 18, marginBottom: 12,
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14, fontFamily: FONT }}>
        {isEdit ? 'Editar categoría' : 'Nueva categoría de presupuesto'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={lbl}>Categoría</label>
          {categoriasDisponibles.length > 0 ? (
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={inp}
            >
              <option value="">— Selecciona o escribe —</option>
              {categoriasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              placeholder="Ej: Comida, Transporte..."
              autoFocus
              style={inp}
            />
          )}
        </div>
        <div>
          <label style={lbl}>Límite mensual (S/)</label>
          <input
            type="number" min="0" step="1"
            value={limite}
            onChange={e => setLimite(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); }}
            placeholder="0"
            style={inp}
          />
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_OPTS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: c,
                boxShadow: color === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : 'none',
                transition: 'box-shadow 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: C.neg, marginBottom: 10, fontFamily: FONT }}>{error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onCancel}
          style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textDim, cursor: 'pointer', fontSize: 12.5, fontFamily: FONT }}
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={saving}
          style={{
            height: 32, padding: '0 18px', borderRadius: 8, border: 'none',
            background: color, color: '#fff', cursor: 'pointer', fontSize: 12.5,
            fontFamily: FONT, fontWeight: 600, opacity: saving ? 0.6 : 1,
            boxShadow: saving ? 'none' : `0 4px 12px ${color}40`,
            transition: 'opacity 0.15s, box-shadow 0.15s',
          }}
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </div>
  );
}

