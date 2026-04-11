import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'w-full rounded-xl border border-[#D4C8BC] bg-white px-3 py-2 text-sm text-[#191919] outline-none ring-[#8A6F5F]/40 transition focus:ring-2',
      className
    )}
    {...props}
  />
);
