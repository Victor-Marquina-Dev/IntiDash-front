import { landingColors, serifFont } from './theme';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
  light?: boolean; // texto claro para secciones oscuras
}

export function SectionHeading({ eyebrow, title, lead, align = 'center', light = false }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const leadColor = light ? 'rgba(255,255,255,0.72)' : landingColors.muted;
  const titleColor = light ? '#ffffff' : landingColors.ink;
  const eyebrowColor = light ? 'rgba(255,255,255,0.6)' : landingColors.rust;

  return (
    <div className={`max-w-[680px] ${alignClass}`}>
      {eyebrow && (
        <p
          className="mb-3"
          style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: eyebrowColor }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="mb-4"
        style={{
          fontFamily: serifFont, fontWeight: 400,
          fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: titleColor,
        }}
      >
        {title}
      </h2>
      {lead && (
        <p style={{ fontSize: 18, lineHeight: 1.5, letterSpacing: '-0.009em', color: leadColor }}>
          {lead}
        </p>
      )}
    </div>
  );
}
