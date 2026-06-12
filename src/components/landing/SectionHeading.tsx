interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
  light?: boolean; // texto claro para secciones oscuras
}

export function SectionHeading({ eyebrow, title, lead, align = 'center', light = false }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const leadColor = light ? 'text-[#C6D4C7]' : 'text-[#5A6661]';
  const titleColor = light ? 'text-white' : 'text-[#171C1A]';

  return (
    <div className={`max-w-[680px] ${alignClass}`}>
      {eyebrow && (
        <p className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#8FA88F] mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-bold leading-[1.1] tracking-tight ${titleColor} mb-4`}
        style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontFamily: 'var(--font-ui)' }}
      >
        {title}
      </h2>
      {lead && (
        <p className={`text-[18px] leading-[1.6] ${leadColor}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
