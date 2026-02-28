import type { SlotService } from '@/api/interfaces';
import type { SlotDTO, SlotManagementDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressSlotService implements SlotService {
  async listSlotsByDate(dateISO: string, clinicId: string): Promise<SlotDTO[]> {
    const response = await axiosInstance.get<SlotDTO[]>(`/slots/${dateISO}`, { params: { clinicId } });
    return response.data;
  }

  async getSlotManagement(clinicId: string): Promise<SlotManagementDTO> {
    const response = await axiosInstance.get<SlotManagementDTO>(`/slot-management/${clinicId}`);
    return response.data;
  }

  async upsertSlotManagement(config: SlotManagementDTO): Promise<SlotManagementDTO> {
    const response = await axiosInstance.put<SlotManagementDTO>(`/slot-management/${config.clinicId}`, config);
    return response.data;
  }
}
