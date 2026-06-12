import { C } from '@/lib/colors';

export function DashboardStub({ label }: Readonly<{ label: string }>) {
  return (
    <div style={{ padding: '60px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 480, padding: 32, textAlign: 'center',
        background: C.card, border: `1px dashed ${C.borderHi}`, borderRadius: 16,
      }}>
        <div style={{ fontSize: 11, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2 }}>
          Pantalla en construcción
        </div>
        <div style={{ fontSize: 26, color: C.text, fontWeight: 600, marginTop: 8, letterSpacing: -0.6 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: C.textMute, marginTop: 10 }}>
          Aún no está implementada. Vuelve al Dashboard desde la barra de navegación.
        </div>
      </div>
    </div>
  );
}
