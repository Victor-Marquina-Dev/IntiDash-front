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
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[12px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FA88F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'bg-[#171C1A] text-white hover:bg-[#27302B] active:bg-[#0F1512] shadow-[0_1px_3px_rgba(23,28,26,0.22)] hover:shadow-[0_8px_24px_rgba(23,28,26,0.22)]',
  secondary:
    'bg-white/70 text-[#171C1A] border border-[rgba(23,28,26,0.16)] hover:bg-white hover:border-[#8FA88F]',
  ghost:
    'bg-transparent text-[#171C1A] hover:bg-[#EEF4EE]',
};

const sizes: Record<Size, string> = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
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
