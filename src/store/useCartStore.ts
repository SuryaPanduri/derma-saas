import { create } from 'zustand';
import type { OrderItemDTO, ProductDTO } from '@/types';

interface AddProductResult {
  success: boolean;
  error?: string;
}

interface CartState {
  items: OrderItemDTO[];
  appliedCoupon: string | null;
  addProduct: (product: ProductDTO, quantity?: number) => AddProductResult;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
  setAppliedCoupon: (code: string | null) => void;
}

export const VALID_COUPONS = {
  'FIRSTGLOW': 10,
  'GLOW10': 10,
  'SKINTHEORY25': 25
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  appliedCoupon: null,
  addProduct: (product, quantity = 1): AddProductResult => {
    if (product.stock <= 0) {
      return { success: false, error: 'Product is currently out of stock.' };
    }

    const safeQuantity = Math.max(1, Math.floor(quantity));
    const items = get().items;
    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      const newQuantity = existing.quantity + safeQuantity;
      if (newQuantity > product.stock) {
        set({
          items: items.map((item) =>
            item.productId === product.id ? { ...item, quantity: product.stock } : item
          )
        });
        return { success: true, error: `Only ${product.stock} items available. Quantity adjusted.` };
      }

      set({
        items: items.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQuantity } : item
        )
      });
      return { success: true };
    }

    if (safeQuantity > product.stock) {
      set({
        items: [
          ...items,
          {
            productId: product.id,
            name: product.name,
            quantity: product.stock,
            unitPriceCents: product.priceCents
          }
        ]
      });
      return { success: true, error: `Only ${product.stock} items available. Quantity adjusted.` };
    }

    set({
      items: [
        ...items,
        {
          productId: product.id,
          name: product.name,
          quantity: safeQuantity,
          unitPriceCents: product.priceCents
        }
      ]
    });
    return { success: true };
  },
  removeProduct: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },
  clearCart: () => set({ items: [], appliedCoupon: null }),
  setAppliedCoupon: (code) => set({ appliedCoupon: code })
}));
