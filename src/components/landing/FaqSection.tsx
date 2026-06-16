import { SectionHeading } from './SectionHeading';
import { cardShadow, landingColors, landingRadius, sectionPadding } from './theme';

const faqs = [
  {
    q: '¿IntiDash reemplaza mi hoja de cálculo?',
    a: 'Puede reemplazarla para el seguimiento diario, pero también puedes exportar tu información a Excel cuando quieras revisar, respaldar o compartir datos.',
  },
  {
    q: '¿Tengo que usar Notion?',
    a: 'No. Puedes registrar datos manualmente. Notion es una integración para quienes ya tienen una plantilla financiera y quieren convertirla en dashboard.',
  },
  {
    q: '¿Puedo compartir un workspace?',
    a: 'Sí. Puedes invitar a otra persona como editor o solo lectura, útil para pareja, familia, socio o administración compartida.',
  },
  {
    q: '¿Necesito conectar mi banco?',
    a: 'No. IntiDash no pide claves bancarias. Trabaja con datos que registras, importas desde Notion o exportas para análisis.',
  },
  {
    q: '¿Mis datos sensibles están protegidos?',
    a: 'Los tokens sensibles se guardan cifrados y el acceso al workspace pasa por sesión, membresía y rol.',
  },
  {
    q: '¿Puedo probar sin registrarme?',
    a: 'Sí. La demo muestra el flujo con datos de ejemplo para que evalúes si la estructura te sirve antes de crear tu cuenta.',
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      style={{ background: landingColors.paper, paddingBlock: sectionPadding, scrollMarginTop: '64px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center mb-16">
          <SectionHeading title="Preguntas frecuentes" align="center" />
        </div>

        <div className="max-w-[760px] mx-auto flex flex-col gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group bg-white border overflow-hidden"
              style={{
                borderColor: 'rgba(23,25,28,0.07)',
                borderRadius: landingRadius.input,
                boxShadow: cardShadow,
              }}
            >
              <summary
                className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer text-[16px] font-semibold select-none list-none"
                style={{ color: landingColors.ink, fontFamily: 'var(--font-ui)' }}
              >
                {f.q}
                <svg
                  className="flex-shrink-0 w-4 h-4 transition-transform duration-200 group-open:rotate-180"
                  style={{ color: landingColors.softText }}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="px-6 pb-5 text-[15px] leading-[1.65] border-t border-[rgba(23,25,28,0.06)] pt-4" style={{ color: landingColors.muted }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
