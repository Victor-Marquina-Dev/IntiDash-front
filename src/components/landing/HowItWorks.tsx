import { SectionHeading } from './SectionHeading';
import { landingColors } from './theme';

const steps = [
  {
    n: '01',
    title: 'Conecta o registra',
    desc: 'Empieza manual, importa tu plantilla de Notion o carga la data que ya tienes organizada.',
  },
  {
    n: '02',
    title: 'Ordena tu workspace',
    desc: 'Agrupa cuentas, gastos, deudas, préstamos, suscripciones y metas en un espacio personal o compartido.',
  },
  {
    n: '03',
    title: 'Decide con contexto',
    desc: 'Compara ingresos, gastos y deudas por mes para saber qué ajustar, qué pagar y cuánto puedes ahorrar.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-[112px]" style={{ background: landingColors.paper }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading
            title="De datos sueltos a decisiones claras."
            lead="El flujo está pensado para que no tengas que cambiar tu forma de trabajar desde el primer día."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div
            className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ background: `linear-gradient(to right, ${landingColors.income}, ${landingColors.debt}, ${landingColors.expense})` }}
            aria-hidden="true"
          />

          {steps.map((s, i) => {
            const color = [landingColors.income, landingColors.debt, landingColors.expense][i];
            const soft = [landingColors.incomeSoft, landingColors.debtSoft, landingColors.expenseSoft][i];
            return (
              <div key={s.n} className="flex flex-col items-center text-center md:items-start md:text-left">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative z-10"
                  style={{ border: `2px solid ${color}55`, background: soft }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 28,
                      fontWeight: 700,
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </span>
                </div>
                <h3
                  className="text-[20px] font-semibold text-[#171C1A] mb-3 leading-[1.3]"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {s.title}
                </h3>
                <p className="text-[16px] text-[#5A6661] leading-[1.65]">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
