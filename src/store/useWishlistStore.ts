import { create } from 'zustand';
import type { ProductDTO } from '@/types';

interface WishlistState {
  items: ProductDTO[];
  toggleProduct: (product: ProductDTO) => void;
  removeProduct: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  toggleProduct: (product) => {
    const exists = get().items.some((item) => item.id === product.id);
    if (exists) {
      set({ items: get().items.filter((item) => item.id !== product.id) });
      return;
    }
    set({ items: [...get().items, product] });
  },
  removeProduct: (productId) => set({ items: get().items.filter((item) => item.id !== productId) }),
  isWishlisted: (productId) => get().items.some((item) => item.id === productId),
  clearWishlist: () => set({ items: [] })
}));
