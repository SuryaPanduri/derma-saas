import type { ServiceCatalogService } from '@/api/interfaces';
import type { ServiceDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressServiceCatalogService implements ServiceCatalogService {
  async listServices(clinicId: string): Promise<ServiceDTO[]> {
    const response = await axiosInstance.get<ServiceDTO[]>(`/services`, {
      params: { clinicId }
    });
    return response.data;
  }

  async getServiceById(serviceId: string): Promise<ServiceDTO | null> {
    const response = await axiosInstance.get<ServiceDTO | null>(`/services/${serviceId}`);
    return response.data;
  }

  async upsertService(service: ServiceDTO): Promise<ServiceDTO> {
    const response = await axiosInstance.put<ServiceDTO>(`/services/${service.id}`, service);
    return response.data;
  }
}
