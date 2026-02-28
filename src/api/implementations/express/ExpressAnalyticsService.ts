import type { AnalyticsEventName, AnalyticsService } from '@/api/interfaces';
import type { BookingTrendDTO, RevenueSummaryDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressAnalyticsService implements AnalyticsService {
  async trackEvent(event: AnalyticsEventName, payload: Record<string, unknown>): Promise<void> {
    await axiosInstance.post('/analytics/events', { event, payload });
  }

  async getRevenueSummary(
    clinicId: string,
    periodStartISO: string,
    periodEndISO: string
  ): Promise<RevenueSummaryDTO> {
    const response = await axiosInstance.get<RevenueSummaryDTO>('/analytics/revenue-summary', {
      params: { clinicId, periodStartISO, periodEndISO }
    });
    return response.data;
  }

  async getBookingTrend(
    clinicId: string,
    periodStartISO: string,
    periodEndISO: string
  ): Promise<BookingTrendDTO[]> {
    const response = await axiosInstance.get<BookingTrendDTO[]>('/analytics/booking-trend', {
      params: { clinicId, periodStartISO, periodEndISO }
    });
    return response.data;
  }
}
