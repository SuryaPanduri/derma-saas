export interface ProductDTO {
  id: string;
  clinicId: string;
  name: string;
  description: string;
  sku: string;
  stock: number;
  priceCents: number;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
