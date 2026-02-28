import type { SlotDTO, SlotManagementDTO } from '@/types';

export interface SlotService {
  listSlotsByDate(dateISO: string, clinicId: string): Promise<SlotDTO[]>;
  getSlotManagement(clinicId: string): Promise<SlotManagementDTO>;
  upsertSlotManagement(config: SlotManagementDTO): Promise<SlotManagementDTO>;
}
