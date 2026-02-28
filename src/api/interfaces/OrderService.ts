import type { CreateOrderInputDTO, OrderDTO } from '@/types';

export interface OrderService {
  createOrder(input: CreateOrderInputDTO): Promise<OrderDTO>;
  listOrdersByUser(patientUid: string): Promise<OrderDTO[]>;
  listOrdersByClinic(clinicId: string): Promise<OrderDTO[]>;
}
