import { create } from 'zustand';
import type { OrderItemDTO, ProductDTO } from '@/types';

interface CartState {
  items: OrderItemDTO[];
  addProduct: (product: ProductDTO, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addProduct: (product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const existing = get().items.find((item) => item.productId === product.id);

    if (existing) {
      const cappedQuantity = Math.min(product.stock, existing.quantity + safeQuantity);
      set({
        items: get().items.map((item) =>
          item.productId === product.id ? { ...item, quantity: cappedQuantity } : item
        )
      });
      return;
    }

    set({
      items: [
        ...get().items,
        {
          productId: product.id,
          name: product.name,
          quantity: safeQuantity,
          unitPriceCents: product.priceCents
        }
      ]
    });
  },
  removeProduct: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },
  clearCart: () => set({ items: [] })
}));
