import type { OrderService } from '@/api/interfaces';
import type { CreateOrderInputDTO, OrderDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressOrderService implements OrderService {
  async createOrder(input: CreateOrderInputDTO): Promise<OrderDTO> {
    const response = await axiosInstance.post<OrderDTO>('/orders', input);
    return response.data;
  }

  async listOrdersByUser(patientUid: string): Promise<OrderDTO[]> {
    const response = await axiosInstance.get<OrderDTO[]>(`/orders/user/${patientUid}`);
    return response.data;
  }

  async listOrdersByClinic(clinicId: string): Promise<OrderDTO[]> {
    const response = await axiosInstance.get<OrderDTO[]>(`/orders/clinic/${clinicId}`);
    return response.data;
  }
}
