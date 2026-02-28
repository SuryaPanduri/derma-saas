import type { AppError } from '@/types';

export const ErrorState = ({ error }: { error: AppError }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
    {error.code}: {error.message}
  </div>
);
