import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';
import type { AnalyticsService, BookingService } from '@/api/interfaces';
import type { AppointmentDTO, AppError, CreateAppointmentInputDTO } from '@/types';
import { auth, db } from './firebase.config';
import { mapAppointmentDoc } from './mappers';
import { buildDefaultSlotManagement, normalizeSlotManagement, resolveSlotsForDate } from './slotManagement';

export class FirebaseBookingService implements BookingService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async createAppointment(input: CreateAppointmentInputDTO): Promise<AppointmentDTO> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      throw {
        code: 'UNAUTHENTICATED',
        message: 'You must be signed in to create an appointment.'
      } as AppError;
    }

    const normalizedInput: CreateAppointmentInputDTO = {
      ...input,
      patientUid: currentUid
    };

    await this.analyticsService.trackEvent('booking_attempt', {
      patientUid: normalizedInput.patientUid,
      clinicId: normalizedInput.clinicId,
      dateISO: normalizedInput.dateISO,
      timeSlot: normalizedInput.timeSlot
    });

    const appointmentRef = doc(collection(db, 'appointments'));
    const slotRef = doc(db, 'slots', normalizedInput.dateISO, 'times', normalizedInput.timeSlot);
    const slotManagementRef = doc(db, 'slot_management', normalizedInput.clinicId);

    try {
      await runTransaction(db, async (transaction) => {
        const slotManagementDoc = await transaction.get(slotManagementRef);
        const slotManagement = slotManagementDoc.exists()
          ? normalizeSlotManagement(normalizedInput.clinicId, slotManagementDoc.data() as Record<string, unknown>)
          : buildDefaultSlotManagement(normalizedInput.clinicId);
        const allowedSlots = resolveSlotsForDate(slotManagement, normalizedInput.dateISO);
        if (!allowedSlots.includes(normalizedInput.timeSlot)) {
          const unavailableError: AppError = {
            code: 'BOOKING_SLOT_UNAVAILABLE',
            message: 'Selected slot is unavailable for this date.'
          };
          throw unavailableError;
        }

        const slotDoc = await transaction.get(slotRef);
        const slotData = slotDoc.data() as { isBooked?: boolean } | undefined;

        if (slotData?.isBooked) {
          const conflictError: AppError = {
            code: 'BOOKING_CONFLICT',
            message: 'Selected slot is already booked.'
          };
          throw conflictError;
        }

        transaction.set(
          slotRef,
          {
            isBooked: true,
            appointmentId: appointmentRef.id,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        transaction.set(appointmentRef, {
          ...normalizedInput,
          status: 'scheduled',
          createdAtISO: new Date().toISOString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      return {
        id: appointmentRef.id,
        ...normalizedInput,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      const appError: AppError =
        typeof error === 'object' && error !== null && 'code' in error && 'message' in error
          ? (error as AppError)
          : {
              code: 'BOOKING_TRANSACTION_FAILED',
              message: 'Failed to create appointment.'
            };

      await this.analyticsService.trackEvent('booking_failed', {
        patientUid: normalizedInput.patientUid,
        clinicId: normalizedInput.clinicId,
        dateISO: normalizedInput.dateISO,
        timeSlot: normalizedInput.timeSlot,
        code: appError.code,
        message: appError.message
      });

      throw appError;
    }
  }

  async listAppointmentsByUser(patientUid: string): Promise<AppointmentDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'appointments'), where('patientUid', '==', patientUid)));
    return snapshot.docs.map((item) => mapAppointmentDoc(item.id, item.data()));
  }

  async listAppointmentsByClinic(clinicId: string): Promise<AppointmentDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId)));
    return snapshot.docs.map((item) => mapAppointmentDoc(item.id, item.data()));
  }

  async cancelAppointment(appointmentId: string, patientUid: string): Promise<AppointmentDTO> {
    const appointmentRef = doc(db, 'appointments', appointmentId);

    await runTransaction(db, async (transaction) => {
      const appointmentDoc = await transaction.get(appointmentRef);

      if (!appointmentDoc.exists()) {
        throw {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found.'
        } as AppError;
      }

      const appointmentData = appointmentDoc.data() as Record<string, unknown>;
      if (String(appointmentData.patientUid) !== patientUid) {
        throw {
          code: 'UNAUTHORIZED_APPOINTMENT_ACCESS',
          message: 'You can only cancel your own appointments.'
        } as AppError;
      }

      const slotRef = doc(db, 'slots', String(appointmentData.dateISO), 'times', String(appointmentData.timeSlot));

      transaction.set(
        appointmentRef,
        {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      transaction.set(
        slotRef,
        {
          isBooked: false,
          appointmentId: null,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    });

    const snapshot = await getDoc(appointmentRef);
    return mapAppointmentDoc(snapshot.id, snapshot.data() ?? {});
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: 'completed' | 'cancelled'
  ): Promise<AppointmentDTO> {
    const appointmentRef = doc(db, 'appointments', appointmentId);

    await runTransaction(db, async (transaction) => {
      const appointmentDoc = await transaction.get(appointmentRef);

      if (!appointmentDoc.exists()) {
        throw {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found.'
        } as AppError;
      }

      const appointmentData = appointmentDoc.data() as Record<string, unknown>;
      transaction.set(
        appointmentRef,
        {
          status,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      if (status === 'cancelled') {
        const slotRef = doc(db, 'slots', String(appointmentData.dateISO), 'times', String(appointmentData.timeSlot));
        transaction.set(
          slotRef,
          {
            isBooked: false,
            appointmentId: null,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
    });

    const snapshot = await getDoc(appointmentRef);
    return mapAppointmentDoc(snapshot.id, snapshot.data() ?? {});
  }
}
