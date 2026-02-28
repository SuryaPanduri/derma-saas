import type { AnalyticsService, AnalyticsEventName } from '@/api/interfaces';
import { normalizeError } from '@/api/dto/normalizers';
import type { AppError } from '@/types';

export const detectMonitoringSignal = (error: AppError): AnalyticsEventName | null => {
  if (error.code === 'BOOKING_CONFLICT') {
    return 'booking_failed';
  }

  if (error.code === 'INVENTORY_CONFLICT') {
    return 'checkout_failed';
  }

  if (error.code === 'BOOKING_DROP_OFF') {
    return 'booking_failed';
  }

  return null;
};

const withFunnelSignal = (
  signal: AnalyticsEventName | null,
  context: Record<string, unknown>
): Record<string, unknown> => {
  if (context.step === 'create_booking') {
    return {
      ...context,
      funnel: 'booking',
      stage: 'checkout',
      dropOff: true
    };
  }

  return context;
};

export const logAppError = async (
  analyticsService: AnalyticsService,
  error: unknown,
  context: Record<string, unknown>
): Promise<AppError> => {
  const normalized = normalizeError(error);
  const signal = detectMonitoringSignal(normalized);

  if (signal) {
    try {
      await analyticsService.trackEvent(signal, {
        ...withFunnelSignal(signal, context),
        code: normalized.code,
        message: normalized.message,
        timestamp: new Date().toISOString()
      });
    } catch {
      // Never block product flows because telemetry failed.
    }
  }

  console.error('[DermaSaaS]', normalized.code, normalized.message, context);
  return normalized;
};
