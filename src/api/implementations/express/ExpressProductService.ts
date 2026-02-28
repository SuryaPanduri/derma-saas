import type { ProductService } from '@/api/interfaces';
import type { ProductDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressProductService implements ProductService {
  async listProducts(clinicId: string): Promise<ProductDTO[]> {
    const response = await axiosInstance.get<ProductDTO[]>('/products', {
      params: { clinicId }
    });
    return response.data;
  }

  async getProductById(productId: string): Promise<ProductDTO | null> {
    const response = await axiosInstance.get<ProductDTO | null>(`/products/${productId}`);
    return response.data;
  }

  async upsertProduct(product: ProductDTO): Promise<ProductDTO> {
    const response = await axiosInstance.put<ProductDTO>(`/products/${product.id}`, product);
    return response.data;
  }
}
