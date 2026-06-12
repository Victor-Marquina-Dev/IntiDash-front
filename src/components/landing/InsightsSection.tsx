import { SectionHeading } from './SectionHeading';
import { landingColors } from './theme';

const insights = [
  { tone: landingColors.income, text: 'Este mes tus ingresos crecieron <strong>8.2%</strong> frente al mes anterior.' },
  { tone: landingColors.expense, text: 'Tu categoría con mayor gasto fue <strong>Restaurantes: S/ 642</strong>.' },
  { tone: landingColors.debt, text: 'Tienes <strong>3 préstamos activos</strong> que conviene priorizar este mes.' },
  { tone: landingColors.income, text: 'Si mantienes este ritmo, podrías ahorrar <strong>S/ 2,800</strong> este año.' },
];

export function InsightsSection() {
  return (
    <section className="py-[112px]" style={{ background: landingColors.paper }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative flex flex-col gap-4 py-8">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-[16px] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(10,46,34,0.12)]"
                style={{
                  border: '1px solid rgba(10,46,34,0.08)',
                  boxShadow: '0 1px 3px rgba(10,46,34,0.05)',
                  transform: `rotate(${i % 2 === 0 ? '-0.7' : '0.5'}deg)`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <span className="mt-1 h-3 w-3 rounded-full flex-shrink-0" style={{ background: ins.tone }} />
                <p
                  className="text-[15px] text-[#171C1A] leading-[1.6]"
                  dangerouslySetInnerHTML={{ __html: ins.text }}
                />
              </div>
            ))}
          </div>

          <div>
            <SectionHeading
              eyebrow="Inteligencia"
              title="Tus números deberían decirte qué hacer después."
              lead="IntiDash convierte movimientos sueltos en señales: qué subió, qué bajó, qué deuda pesa más y cuánto margen real tienes."
              align="left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
