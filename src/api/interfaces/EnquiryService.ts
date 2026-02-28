import type { CreateEnquiryInputDTO, EnquiryDTO } from '@/types';

export interface EnquiryService {
  createEnquiry(input: CreateEnquiryInputDTO): Promise<EnquiryDTO>;
  listEnquiriesByClinic(clinicId: string): Promise<EnquiryDTO[]>;
}

