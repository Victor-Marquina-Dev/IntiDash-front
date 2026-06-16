import { SectionHeading } from './SectionHeading';
import { cardShadow, landingColors, landingRadius, sectionPadding } from './theme';

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
    <section style={{ background: landingColors.paper, paddingBlock: sectionPadding }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading
            title="De datos sueltos a decisiones claras."
            lead="El flujo está pensado para que no tengas que cambiar tu forma de trabajar desde el primer día."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div
            className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px opacity-50"
            style={{ background: `linear-gradient(to right, ${landingColors.sky}, ${landingColors.apricot}, ${landingColors.sky})` }}
            aria-hidden="true"
          />

          {steps.map((s, i) => {
            const color = [landingColors.income, landingColors.debt, landingColors.expense][i];
            const soft = [landingColors.incomeSoft, landingColors.debtSoft, landingColors.expenseSoft][i];
            return (
              <article
                key={s.n}
                className="flex flex-col items-center border bg-white p-7 text-center md:items-start md:text-left"
                style={{
                  borderColor: 'rgba(23,25,28,0.07)',
                  borderRadius: landingRadius.card,
                  boxShadow: cardShadow,
                }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-6 relative z-10"
                  style={{ background: soft, borderRadius: landingRadius.media }}
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
                  className="text-[20px] font-semibold mb-3 leading-[1.3]"
                  style={{ color: landingColors.ink, fontFamily: 'var(--font-ui)' }}
                >
                  {s.title}
                </h3>
                <p className="text-[16px] leading-[1.65]" style={{ color: landingColors.muted }}>{s.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
