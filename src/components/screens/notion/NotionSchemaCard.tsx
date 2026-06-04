import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Button, Card, CardHeader } from '@/components/ui';
import type { DbProperty } from '@/shared/types/finance.types';
import type { Status } from './types';

const PROP_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  title: { label: 'Título', color: C.text },
  rich_text: { label: 'Texto', color: C.textDim },
  number: { label: 'Número', color: C.cyan },
  select: { label: 'Selección', color: C.purple },
  multi_select: { label: 'Multi-selección', color: C.purple },
  date: { label: 'Fecha', color: C.warn },
  checkbox: { label: 'Casilla', color: C.pos },
  relation: { label: 'Relación', color: C.primary },
  formula: { label: 'Fórmula', color: C.primary },
  rollup: { label: 'Resumen', color: C.primary },
  people: { label: 'Persona', color: C.textDim },
  files: { label: 'Archivo', color: C.textDim },
  url: { label: 'URL', color: C.cyan },
  email: { label: 'Email', color: C.cyan },
  phone_number: { label: 'Teléfono', color: C.cyan },
  created_time: { label: 'Creación', color: C.textDim },
  last_edited_time: { label: 'Últ. edición', color: C.textDim },
  status: { label: 'Estado', color: C.pos },
  unique_id: { label: 'ID único', color: C.textDim },
};

function propMeta(type: string): { label: string; color: string } {
  return PROP_TYPE_LABEL[type] ?? { label: type, color: C.textDim };
}

interface NotionSchemaCardProps {
  activeDbId: string;
  activeDbName: string;
  schema: DbProperty[];
  schemaStatus: Status;
  schemaDbId: string;
  onLoadSchema: (dbId: string) => void;
}

export function NotionSchemaCard({ activeDbId, activeDbName, schema, schemaStatus, schemaDbId, onLoadSchema }: NotionSchemaCardProps) {
  if (!activeDbId) return null;

  return (
    <Card>
      <CardHeader
        title="Columnas de la base de datos"
        subtitle={activeDbName || 'Base de datos seleccionada'}
        right={
          <Button
            icon={schemaStatus === 'loading' ? undefined : <Icon.list size={13} />}
            onClick={() => onLoadSchema(activeDbId)}
            disabled={schemaStatus === 'loading'}
          >
            {schemaStatus === 'loading' ? 'Cargando...' : schemaDbId === activeDbId && schema.length > 0 ? 'Actualizar' : 'Ver columnas'}
          </Button>
        }
      />

      {schemaStatus === 'error' && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 13, color: '#c83c3c' }}>
          No se pudieron cargar las propiedades. Verifica que el token tenga acceso a esta base de datos.
        </div>
      )}

      {schemaStatus === 'idle' && schema.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center', color: C.textMute, fontSize: 13 }}>
          Haz clic en «Ver columnas» para ver las propiedades de esta base de datos.
        </div>
      )}

      {schema.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', padding: '8px 16px', background: 'rgba(63,86,28,0.04)', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.9 }}>Nombre</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.9 }}>Tipo</span>
          </div>
          {schema.map((prop, i) => {
            const meta = propMeta(prop.type);
            return (
              <React.Fragment key={`${prop.name}-${i}`}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', padding: '10px 16px', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{prop.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: C.textDim }}>{meta.label}</span>
                  </span>
                </div>
                {i < schema.length - 1 && <div style={{ height: 1, background: C.border, margin: '0 16px' }} />}
              </React.Fragment>
            );
          })}
          <div style={{ padding: '8px 16px', background: 'rgba(63,86,28,0.02)', borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, color: C.textMute }}>{schema.length} propiedades</span>
          </div>
        </div>
      )}
    </Card>
  );
}
