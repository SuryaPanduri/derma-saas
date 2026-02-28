import type { ProductDTO } from '@/types';

export interface ProductService {
  listProducts(clinicId: string): Promise<ProductDTO[]>;
  getProductById(productId: string): Promise<ProductDTO | null>;
  upsertProduct(product: ProductDTO): Promise<ProductDTO>;
}
