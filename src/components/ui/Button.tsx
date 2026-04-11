import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: 'bg-[#8A6F5F] text-white hover:bg-[#5D4A3E]',
  outline: 'border border-[#D4C8BC] text-[#8A6F5F] hover:bg-[#F5F0EA]',
  ghost: 'text-[#191919]/70 hover:bg-[#191919]/5'
};

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
      styles[variant],
      className
    )}
    {...props}
  />
);
