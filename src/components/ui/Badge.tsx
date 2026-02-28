import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700', className)}
    {...props}
  />
);
