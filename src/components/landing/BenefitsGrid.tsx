import { SectionHeading } from './SectionHeading';
import { cardShadow, landingColors, landingRadius, sectionPadding } from './theme';

const benefits = [
  {
    mark: 'I',
    color: landingColors.income,
    soft: landingColors.incomeSoft,
    title: 'Ingresos claros por mes',
    desc: 'Visualiza sueldo, bonos, pagos extra y fuentes recurrentes sin mezclarlo todo en una tabla difícil de leer.',
  },
  {
    mark: 'G',
    color: landingColors.expense,
    soft: landingColors.expenseSoft,
    title: 'Gastos bajo control',
    desc: 'Detecta categorías infladas, gastos hormiga y cambios contra el mes anterior antes de que te descuadren.',
  },
  {
    mark: 'D',
    color: landingColors.debt,
    soft: landingColors.debtSoft,
    title: 'Deudas y préstamos visibles',
    desc: 'Ten cuotas, préstamos, tarjetas y suscripciones en una sola vista para priorizar qué pagar primero.',
  },
  {
    mark: 'N',
    color: landingColors.ink,
    soft: '#F0F2EF',
    title: 'Sincroniza tu plantilla de Notion',
    desc: 'Convierte tus bases de datos de Notion en un dashboard financiero sin abandonar tu sistema actual.',
  },
  {
    mark: 'X',
    color: landingColors.income,
    soft: landingColors.incomeSoft,
    title: 'Exporta a hoja de cálculo',
    desc: 'Descarga toda tu data del workspace en Excel para revisar, respaldar o compartir reportes cuando lo necesites.',
  },
  {
    mark: 'W',
    color: landingColors.debt,
    soft: landingColors.debtSoft,
    title: 'Trabaja con otra persona',
    desc: 'Crea workspaces compartidos para pareja, familia o negocio, con roles de edición y solo lectura.',
  },
];

export function BenefitsGrid() {
  return (
    <section
      id="caracteristicas"
      style={{ background: landingColors.band, paddingBlock: sectionPadding, scrollMarginTop: '64px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading
            eyebrow="Por qué IntiDash"
            title="Menos caos, más decisiones."
            lead="No es solo registrar gastos. Es entender qué entra, qué sale y qué compromisos vienen después."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="bg-white p-7 border transition-all duration-200 hover:-translate-y-[3px]"
              style={{
                borderColor: 'rgba(23,25,28,0.07)',
                borderRadius: landingRadius.card,
                boxShadow: cardShadow,
              }}
            >
              <div
                className="inline-flex items-center justify-center w-11 h-11 text-[15px] font-black mb-5"
                style={{ background: b.soft, borderRadius: landingRadius.media, color: b.color }}
              >
                {b.mark}
              </div>
              <h3
                className="text-[18px] font-semibold mb-2 leading-[1.3]"
                style={{ color: landingColors.ink, fontFamily: 'var(--font-ui)' }}
              >
                {b.title}
              </h3>
              <p className="text-[15px] leading-[1.65]" style={{ color: landingColors.muted }}>{b.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
