import type { BookingTrendDTO, RevenueSummaryDTO } from '@/types';

export type AnalyticsEventName =
  | 'booking_attempt'
  | 'booking_failed'
  | 'checkout_failed'
  | 'low_stock_warning';

export interface AnalyticsService {
  trackEvent(event: AnalyticsEventName, payload: Record<string, unknown>): Promise<void>;
  getRevenueSummary(clinicId: string, periodStartISO: string, periodEndISO: string): Promise<RevenueSummaryDTO>;
  getBookingTrend(clinicId: string, periodStartISO: string, periodEndISO: string): Promise<BookingTrendDTO[]>;
}
