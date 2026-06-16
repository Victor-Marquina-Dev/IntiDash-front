import { SectionHeading } from './SectionHeading';
import { cardShadow, landingColors, landingRadius, sectionPadding } from './theme';

const goals = [
  { tag: 'FE', name: 'Fondo de emergencia', current: 6800, total: 10000 },
  { tag: 'VC', name: 'Viaje a Cusco', current: 1050, total: 3000 },
  { tag: 'LP', name: 'Laptop nueva', current: 2720, total: 4500 },
  { tag: 'CI', name: 'Cuota inicial', current: 4500, total: 18000 },
  { tag: 'DP', name: 'Departamento', current: 9000, total: 60000 },
];

function fmt(n: number) {
  return `S/ ${n.toLocaleString('es-PE')}`;
}

export function GoalsShowcase() {
  return (
    <section
      id="metas"
      style={{ background: landingColors.band, paddingBlock: sectionPadding, scrollMarginTop: '64px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading
            eyebrow="Metas de ahorro"
            title="Ahorra con un destino claro."
            lead="Relaciona tus metas con el balance real del mes para saber si puedes avanzar, pausar o reajustar."
            align="center"
          />
        </div>

        <div
          className="flex gap-5 pb-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible md:pb-0"
          style={{ scrollbarWidth: 'thin' }}
        >
          {goals.map((g, i) => {
            const pct = Math.round((g.current / g.total) * 100);
            const color = [landingColors.income, landingColors.debt, landingColors.expense][i % 3];
            const soft = [landingColors.incomeSoft, landingColors.debtSoft, landingColors.expenseSoft][i % 3];
            return (
              <div
                key={g.name}
                className="snap-start flex-shrink-0 w-[220px] md:w-auto bg-white p-5 flex flex-col gap-4"
                style={{
                  border: '1px solid rgba(23,25,28,0.07)',
                  borderRadius: landingRadius.card,
                  boxShadow: cardShadow,
                }}
              >
                <div className="w-11 h-11 grid place-items-center text-[13px] font-black" style={{ background: soft, borderRadius: landingRadius.media, color }}>
                  {g.tag}
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-[1.3] mb-1" style={{ color: landingColors.ink }}>{g.name}</p>
                  <p className="text-[12px]" style={{ color: landingColors.softText }}>
                    {fmt(g.current)} de {fmt(g.total)}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px]" style={{ color: landingColors.muted }}>Progreso</span>
                    <span className="text-[11px] font-semibold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: soft }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
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
