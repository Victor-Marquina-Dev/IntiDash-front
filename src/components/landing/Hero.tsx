import { CtaButton } from './CtaButton';
import { HeroMockup } from './HeroMockup';
import { financeSeries, landingColors } from './theme';

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" />
  </svg>
);

export function Hero() {
  return (
    <section
      className="relative pt-[140px] pb-24 overflow-hidden"
      style={{ background: landingColors.paper }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 900px 540px at 50% 0%, rgba(143,168,143,0.24), transparent 70%)',
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold mb-8"
          style={{
            background: '#fff',
            border: '1px solid rgba(23,28,26,0.08)',
            color: landingColors.ink,
            boxShadow: '0 1px 2px rgba(23,28,26,0.04)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: landingColors.debt }} />
          Notion, Excel y workspaces en un solo dashboard
        </span>

        <h1
          className="font-bold leading-[1.05] tracking-[-0.03em] text-[#171C1A] mb-6 max-w-[900px]"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(36px, 5.5vw, 64px)',
          }}
        >
          Controla ingresos, gastos y deudas sin volver a armar otra hoja de cálculo.
        </h1>

        <p className="text-[18px] leading-[1.65] text-[#5A6661] max-w-[700px] mb-8">
          IntiDash convierte tus movimientos, cuentas, préstamos y metas en una vista clara para decidir mejor.
          Importa desde Notion, exporta a Excel y comparte tu workspace con quien maneja tus finanzas contigo.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {financeSeries.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold"
              style={{ background: item.soft, color: landingColors.ink }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <CtaButton href="/registro" variant="primary" size="lg">
            Crear mi dashboard
          </CtaButton>
          <CtaButton
            href="/demo"
            variant="secondary"
            size="lg"
            icon={<PlayIcon />}
            iconPosition="left"
          >
            Ver demo interactiva
          </CtaButton>
        </div>

        <p className="text-[13px] text-[#8B9690] mb-16">
          Sin tarjeta. Puedes empezar manual, con Notion o con una hoja de cálculo.
        </p>

        <div className="w-full max-w-[940px]">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
