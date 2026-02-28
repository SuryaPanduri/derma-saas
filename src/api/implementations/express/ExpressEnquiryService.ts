import type { EnquiryService } from '@/api/interfaces';
import type { CreateEnquiryInputDTO, EnquiryDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressEnquiryService implements EnquiryService {
  async createEnquiry(input: CreateEnquiryInputDTO): Promise<EnquiryDTO> {
    const response = await axiosInstance.post<EnquiryDTO>('/enquiries', input);
    return response.data;
  }

  async listEnquiriesByClinic(clinicId: string): Promise<EnquiryDTO[]> {
    const response = await axiosInstance.get<EnquiryDTO[]>(`/enquiries/clinic/${clinicId}`);
    return response.data;
  }
}

