import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import type { AnalyticsService, AnalyticsEventName } from '@/api/interfaces';
import { db } from './firebase.config';
import { buildBookingTrend, buildRevenueSummary, mapAppointmentDoc, mapOrderDoc } from './mappers';
import type { BookingTrendDTO, RevenueSummaryDTO } from '@/types';

export class FirebaseAnalyticsService implements AnalyticsService {
  async trackEvent(event: AnalyticsEventName, payload: Record<string, unknown>): Promise<void> {
    try {
      await addDoc(collection(db, 'analytics_events'), {
        event,
        payload,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';

      if (code.includes('permission-denied')) {
        return;
      }

      throw error;
    }
  }

  async getRevenueSummary(
    clinicId: string,
    periodStartISO: string,
    periodEndISO: string
  ): Promise<RevenueSummaryDTO> {
    const ordersSnapshot = await getDocs(
      query(collection(db, 'orders'), where('clinicId', '==', clinicId))
    );

    const appointmentsSnapshot = await getDocs(
      query(collection(db, 'appointments'), where('clinicId', '==', clinicId))
    );

    const orders = ordersSnapshot.docs
      .map((doc) => mapOrderDoc(doc.id, doc.data()))
      .filter((order) => order.createdAt >= periodStartISO && order.createdAt <= periodEndISO);
    const appointments = appointmentsSnapshot.docs
      .map((doc) => mapAppointmentDoc(doc.id, doc.data()))
      .filter((appointment) => appointment.createdAt >= periodStartISO && appointment.createdAt <= periodEndISO);

    const summary = buildRevenueSummary(periodStartISO, periodEndISO, orders, appointments);

    return {
      periodStartISO,
      periodEndISO,
      totalRevenueCents: summary.totalRevenueCents,
      totalOrders: summary.totalOrders,
      totalAppointments: summary.totalAppointments,
      averageOrderValueCents: summary.averageOrderValueCents
    };
  }

  async getBookingTrend(
    clinicId: string,
    periodStartISO: string,
    periodEndISO: string
  ): Promise<BookingTrendDTO[]> {
    const snapshot = await getDocs(
      query(collection(db, 'appointments'), where('clinicId', '==', clinicId))
    );

    const appointments = snapshot.docs
      .map((doc) => mapAppointmentDoc(doc.id, doc.data()))
      .filter((appointment) => appointment.dateISO >= periodStartISO && appointment.dateISO <= periodEndISO);
    return buildBookingTrend(appointments);
  }
}
