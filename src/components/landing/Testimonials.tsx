import { SectionHeading } from './SectionHeading';
import { landingColors } from './theme';

const testimonials = [
  {
    quote: 'Antes tenía Notion por un lado y Excel por otro. Ahora veo ingresos, gastos y deudas en una sola vista.',
    name: 'María Fernanda T.',
    role: 'Diseñadora, Lima',
    initials: 'MF',
    color: landingColors.incomeSoft,
  },
  {
    quote: 'Lo usamos en pareja para revisar pagos y préstamos. El workspace compartido nos quitó muchas conversaciones repetidas.',
    name: 'Renato C.',
    role: 'Contador, Trujillo',
    initials: 'RC',
    color: landingColors.debtSoft,
  },
  {
    quote: 'El reporte mensual me ayuda a decidir qué cortar sin sentir que estoy adivinando con mis gastos.',
    name: 'Jorge L.',
    role: 'Desarrollador, Arequipa',
    initials: 'JL',
    color: landingColors.expenseSoft,
  },
];

export function Testimonials() {
  return (
    <section className="py-[112px]" style={{ background: landingColors.band }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading
            title="Para personas que quieren claridad, no otra tabla."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            const color = [landingColors.income, landingColors.debt, landingColors.expense][i];
            return (
              <div
                key={t.name}
                className="bg-white rounded-[18px] p-8 flex flex-col gap-6"
                style={{
                  border: '1px solid rgba(10,46,34,0.06)',
                  boxShadow: '0 1px 2px rgba(10,46,34,0.04)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 48,
                    lineHeight: 1,
                    color,
                    display: 'block',
                    marginTop: -8,
                  }}
                >
                  &ldquo;
                </span>
                <p
                  className="text-[17px] leading-[1.65] text-[#171C1A] flex-1"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                    style={{ background: t.color, color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#171C1A]">{t.name}</p>
                    <p className="text-[12px] text-[#8B9690]">{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
