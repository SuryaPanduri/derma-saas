export interface OrderItemDTO {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderDTO {
  id: string;
  patientUid: string;
  clinicId: string;
  items: OrderItemDTO[];
  subtotalCents: number;
  discountCents: number;
  couponCode: string | null;
  totalCents: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInputDTO {
  patientUid: string;
  clinicId: string;
  items: OrderItemDTO[];
  couponCode?: string;
}
