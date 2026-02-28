import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-teal-400 transition focus:ring-2',
      className
    )}
    {...props}
  />
);
