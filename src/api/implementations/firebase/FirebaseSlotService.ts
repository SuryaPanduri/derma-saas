import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import type { SlotService } from '@/api/interfaces';
import type { SlotDTO, SlotManagementDTO } from '@/types';
import { db } from './firebase.config';
import { mapSlotDoc } from './mappers';
import { buildDefaultSlotManagement, normalizeSlotManagement, resolveSlotsForDate } from './slotManagement';

export class FirebaseSlotService implements SlotService {
  async listSlotsByDate(dateISO: string, clinicId: string): Promise<SlotDTO[]> {
    const slotManagement = await this.getSlotManagement(clinicId);
    const allowedSlots = resolveSlotsForDate(slotManagement, dateISO);
    const timesCollection = collection(db, 'slots', dateISO, 'times');
    const snapshot = await getDocs(timesCollection);
    const bookedSlots = snapshot.docs
      .map((slotDoc) => mapSlotDoc(dateISO, slotDoc.id, slotDoc.data()))
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    const bookedByTime = new Map(bookedSlots.map((item) => [item.timeSlot, item]));

    const mergedTimes = [...new Set([...allowedSlots, ...bookedSlots.map((item) => item.timeSlot)])].sort((a, b) =>
      a.localeCompare(b)
    );

    return mergedTimes.map((timeSlot) => {
      const existing = bookedByTime.get(timeSlot);
      if (existing) {
        return existing;
      }
      return {
        dateISO,
        timeSlot,
        isBooked: false,
        appointmentId: null
      } satisfies SlotDTO;
    });
  }

  async getSlotManagement(clinicId: string): Promise<SlotManagementDTO> {
    const ref = doc(db, 'slot_management', clinicId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return buildDefaultSlotManagement(clinicId);
    }

    return normalizeSlotManagement(clinicId, snapshot.data() as Record<string, unknown>);
  }

  async upsertSlotManagement(config: SlotManagementDTO): Promise<SlotManagementDTO> {
    const normalized = normalizeSlotManagement(config.clinicId, config as unknown as Record<string, unknown>);
    const ref = doc(db, 'slot_management', normalized.clinicId);

    await setDoc(
      ref,
      {
        clinicId: normalized.clinicId,
        weeklySlots: normalized.weeklySlots,
        blockedDates: normalized.blockedDates,
        overrides: normalized.overrides,
        createdAt: normalized.createdAt,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return {
      ...normalized,
      updatedAt: new Date().toISOString()
    };
  }
}
