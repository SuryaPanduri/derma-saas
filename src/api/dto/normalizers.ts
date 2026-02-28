import type { AppError } from '@/types';

const hasToDate = (value: unknown): value is { toDate: () => Date } => {
  return typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function';
};

export const toISO = (value: unknown): string => {
  if (!value) {
    return new Date(0).toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  return new Date(0).toISOString();
};

export const normalizeError = (error: unknown, fallbackCode = 'UNKNOWN_ERROR'): AppError => {
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return {
      code: String((error as { code: unknown }).code),
      message: String((error as { message: unknown }).message)
    };
  }

  if (error instanceof Error) {
    return {
      code: fallbackCode,
      message: error.message
    };
  }

  return {
    code: fallbackCode,
    message: 'Unexpected application error.'
  };
};
