import type { ServiceDTO } from '@/types';

export interface ServiceCatalogService {
  listServices(clinicId: string): Promise<ServiceDTO[]>;
  getServiceById(serviceId: string): Promise<ServiceDTO | null>;
  upsertService(service: ServiceDTO): Promise<ServiceDTO>;
}
