import Link from 'next/link';
import { financeSeries, landingColors, sectionPadding, serifFont } from './theme';

export function FinalCta() {
  return (
    <section
      className="relative overflow-hidden text-center"
      style={{ background: landingColors.ink, fontFamily: 'var(--font-ui)', paddingBlock: sectionPadding }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 900px 420px at 50% -18%, rgba(251,225,209,0.20), transparent 72%)' }}
      />
      <div className="relative z-10 max-w-[760px] mx-auto px-6">
        <div className="flex justify-center gap-2 mb-8">
          {financeSeries.map(item => (
            <span key={item.label} className="h-2 w-12 rounded-full" style={{ background: item.color }} />
          ))}
        </div>

        <h2
          className="font-bold text-white mb-5 leading-[1.12]"
          style={{
            fontFamily: serifFont,
            fontSize: 'clamp(34px, 4.6vw, 64px)',
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          Convierte tu información financiera en un sistema que sí puedes sostener.
        </h2>

        <p className="text-[18px] mb-10 leading-[1.6]" style={{ color: landingColors.dove }}>
          Empieza con tu data actual, invita a quien necesites y exporta todo cuando quieras.
        </p>

        <Link
          href="/registro"
          className="mx-auto inline-flex h-12 items-center justify-center rounded-full px-7 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a6af] focus-visible:ring-offset-2"
          style={{
            background: '#FFFFFF',
            color: landingColors.ink,
            border: '1px solid rgba(255,255,255,0.24)',
            boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
          }}
        >
          Crear cuenta gratis
        </Link>

        <p className="mt-4 text-[13px]" style={{ color: landingColors.dove }}>
          Sin tarjeta · Sin claves bancarias · Con demo disponible
        </p>
      </div>
    </section>
  );
}
