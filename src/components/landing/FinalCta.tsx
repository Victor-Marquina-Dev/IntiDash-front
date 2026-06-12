import Link from 'next/link';
import { financeSeries, landingColors } from './theme';

export function FinalCta() {
  return (
    <section
      className="py-[112px] text-center"
      style={{ background: landingColors.dark, fontFamily: 'var(--font-ui)' }}
    >
      <div className="max-w-[720px] mx-auto px-6">
        <div className="flex justify-center gap-2 mb-8">
          {financeSeries.map(item => (
            <span key={item.label} className="h-2 w-12 rounded-full" style={{ background: item.color }} />
          ))}
        </div>

        <h2
          className="font-bold text-white mb-5 leading-[1.12]"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(28px, 3.6vw, 42px)',
            letterSpacing: 0,
          }}
        >
          Convierte tu información financiera en un sistema que sí puedes sostener.
        </h2>

        <p className="text-[18px] text-[#C6D4C7] mb-10 leading-[1.6]">
          Empieza con tu data actual, invita a quien necesites y exporta todo cuando quieras.
        </p>

        <Link
          href="/registro"
          className="mx-auto inline-flex h-12 items-center justify-center rounded-[12px] px-7 text-base font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FA88F] focus-visible:ring-offset-2"
          style={{
            background: '#FFFFFF',
            color: landingColors.ink,
            border: '1px solid rgba(255,255,255,0.24)',
            boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
          }}
        >
          Crear cuenta gratis
        </Link>

        <p className="mt-4 text-[13px] text-[#8FA88F]">
          Sin tarjeta · Sin claves bancarias · Con demo disponible
        </p>
      </div>
    </section>
  );
}
