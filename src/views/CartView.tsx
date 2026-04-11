import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCartStore } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { formatMoney } from '@/utils/moneyUtils';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartView = ({ onProceedToCheckout }: { onProceedToCheckout: () => void }) => {
  const { items, removeProduct, addProduct } = useCartStore();
  const toast = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!items.length) {
    return (
      <div className="py-16">
        <EmptyState title="Your cart is empty" subtitle="Add products from the catalog to get started." />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-[#2C2420]">Your Cart</h2>
        <p className="mt-1 text-[13px] text-[#B5A99A]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-5 rounded-xl border border-[#E8E2DC] bg-white p-5 transition-colors hover:border-[#D4C8BC]"
            >
              <div className="h-16 w-16 shrink-0 rounded-lg bg-[#F5F0EB] flex items-center justify-center text-[#8A6F5F]/20">
                <ShoppingBag size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#1A1A1A] truncate">{item.name}</h4>
                <p className="mt-0.5 text-[12px] text-[#B5A99A]">{formatMoney(item.unitPriceCents)} each</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#E8E2DC] px-2 py-1">
                <button
                  onClick={() => {
                    if (item.quantity > 1) {
                      // Remove and re-add with one less
                      removeProduct(item.productId);
                      addProduct({ id: item.productId, name: item.name, sku: '', priceCents: item.unitPriceCents, stock: 99, clinicId: '', isActive: true, description: '', imageUrl: '', createdAt: '', updatedAt: '' } as any, item.quantity - 1);
                    }
                  }}
                  className="p-1 text-[#B5A99A] hover:text-[#8A6F5F] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-[#1A1A1A]">{item.quantity}</span>
                <button
                  onClick={() => addProduct({ id: item.productId, name: item.name, sku: '', priceCents: item.unitPriceCents, stock: 99, clinicId: '', isActive: true, description: '', imageUrl: '', createdAt: '', updatedAt: '' } as any, 1)}
                  className="p-1 text-[#B5A99A] hover:text-[#8A6F5F] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="w-20 text-right text-sm font-semibold text-[#1A1A1A]">{formatMoney(item.unitPriceCents * item.quantity)}</p>
              <button
                onClick={() => removeProduct(item.productId)}
                className="p-1 text-[#B5A99A] hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-xl border border-[#E8E2DC] bg-white p-6">
            <h3 className="text-base font-semibold text-[#1A1A1A]">Order Summary</h3>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#B5A99A]">Subtotal</span>
                <span className="font-semibold text-[#1A1A1A]">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#B5A99A]">Shipping</span>
                <span className="font-medium text-[#8A6F5F]">Free</span>
              </div>
              <div className="border-t border-[#E8E2DC] pt-3 flex justify-between">
                <span className="text-sm font-semibold text-[#1A1A1A]">Total</span>
                <span className="text-lg font-bold text-[#1A1A1A]">{formatMoney(subtotal)}</span>
              </div>
            </div>
            <Button
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] text-[13px] font-medium text-white hover:bg-[#8A6F5F] transition-colors"
              onClick={() => {
                toast.success("Proceeding to checkout");
                onProceedToCheckout();
              }}
            >
              Checkout <ArrowRight size={16} />
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-[#B5A99A]">
              <ShieldCheck size={14} />
              <span className="text-[11px] font-medium">Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
