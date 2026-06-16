import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

interface CtaButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a6af] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  // CTA sólido único: Ink, pill, texto blanco (peso medio, no bold)
  primary:
    'bg-[#17191c] text-white font-medium hover:bg-[#000000] active:bg-[#000000] shadow-[0_1px_2px_rgba(23,28,26,0.18)] hover:shadow-[0_10px_28px_rgba(23,28,26,0.20)]',
  // Secundario: text-link, para mantener un solo CTA sólido por bloque.
  secondary:
    'bg-transparent text-[#17191c] font-medium hover:bg-[#f7f7f8]',
  // Terciario: text-link sin fondo
  ghost:
    'bg-transparent text-[#17191c] font-medium hover:opacity-70',
};

const sizes: Record<Size, string> = {
  md: 'h-10 px-5 text-[15px] tracking-[-0.009em]',
  lg: 'h-12 px-6 text-[15px] tracking-[-0.009em]',
};

export function CtaButton({
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  type = 'button',
  disabled,
}: CtaButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {content}
    </button>
  );
}
