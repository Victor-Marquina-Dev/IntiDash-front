import { IntiDashWordmark } from '@/components/brand/IntiDashLogo';

interface LogoMarkProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 22, md: 28, lg: 36 };

export function LogoMark({ variant = 'dark', size = 'md' }: LogoMarkProps) {
  return <IntiDashWordmark dark={variant === 'light'} size={sizes[size]} />;
}
