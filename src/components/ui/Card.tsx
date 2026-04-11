import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-2xl border border-[#D4C8BC] bg-white/90 shadow-sm', className)} {...props} />
);
