import { CURRENCY } from '@/utils/constants';

export const formatMoney = (cents: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2
  }).format(cents / 100);
