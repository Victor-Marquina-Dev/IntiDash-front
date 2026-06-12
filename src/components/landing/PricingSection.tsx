import { CtaButton } from './CtaButton';
import { SectionHeading } from './SectionHeading';
import { landingColors } from './theme';

const features = [
  'Dashboard de ingresos, gastos y deudas',
  'Cuentas, créditos, préstamos y suscripciones',
  'Metas de ahorro y presupuestos',
  'Workspaces compartidos con roles',
  'Importación desde Notion',
  'Exportación completa a Excel',
  'Demo con datos de ejemplo',
  'Sin conexión bancaria obligatoria',
];

export function PricingSection() {
  return (
    <section
      id="precios"
      className="py-[112px]"
      style={{ background: landingColors.paper, scrollMarginTop: '64px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading
            eyebrow="Precios"
            title="Empieza gratis. Vende orden desde el primer día."
            lead="El plan personal te deja probar el flujo completo antes de decidir si lo conviertes en tu sistema financiero principal."
            align="center"
          />
        </div>

        <div className="max-w-[460px] mx-auto">
          <div
            className="rounded-[22px] p-10 text-center"
            style={{
              background: '#fff',
              border: '1px solid rgba(10,46,34,0.08)',
              boxShadow: '0 12px 40px -12px rgba(10,46,34,0.12)',
            }}
          >
            <p className="text-[13px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: landingColors.income }}>
              Plan Personal
            </p>
            <div className="flex items-baseline justify-center gap-1 my-4">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 56,
                  fontWeight: 700,
                  color: landingColors.ink,
                  lineHeight: 1,
                }}
              >
                Gratis
              </span>
            </div>
            <p className="text-[14px] text-[#8B9690] mb-8">Ideal para validar tu sistema financiero personal</p>

            <CtaButton href="/registro" variant="primary" size="lg" className="w-full justify-center mb-8">
              Crear cuenta gratis
            </CtaButton>

            <ul className="list-none m-0 p-0 flex flex-col gap-3 text-left">
              {features.map((f, i) => {
                const color = [landingColors.income, landingColors.expense, landingColors.debt][i % 3];
                const soft = [landingColors.incomeSoft, landingColors.expenseSoft, landingColors.debtSoft][i % 3];
                return (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-[#5A6661]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 font-black"
                      style={{ background: soft, color }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
