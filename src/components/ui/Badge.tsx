import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('inline-flex rounded-full bg-[#F5F0EA] px-2.5 py-1 text-xs font-semibold text-[#8A6F5F]', className)}
    {...props}
  />
);
