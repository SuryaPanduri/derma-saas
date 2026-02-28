import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { ProductDTO } from '@/types';

export const useUpsertProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (product: ProductDTO) => services.productService.upsertProduct(product),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products', product.clinicId] });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
