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
    <div className="animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      <div className="mb-5">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold tracking-tight text-[#2C2420]">Your Cart</h2>
        <p className="mt-0.5 text-[12px] text-[#B5A99A]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="relative group rounded-xl border border-[#E8E2DC] bg-white p-3.5 transition-colors hover:border-[#D4C8BC] overflow-hidden"
            >
              {/* Delete Button - Top Right */}
              <button
                onClick={() => removeProduct(item.productId)}
                className="absolute right-2 top-2 p-2 text-[#B5A99A] hover:text-red-500 transition-colors z-10"
                aria-label="Remove item"
              >
                <X size={16} />
              </button>

              <div className="flex gap-4">
                {/* Image Placeholder */}
                <div className="h-16 w-16 shrink-0 rounded-lg bg-[#F5F0EB] flex items-center justify-center text-[#8A6F5F]/20">
                  <ShoppingBag size={24} />
                </div>

                {/* Details Container */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-[14px] font-bold text-[#1A1A1A] leading-tight truncate">{item.name}</h4>
                  <p className="mt-1 text-[12px] text-[#B5A99A]">{formatMoney(item.unitPriceCents)} each</p>
                  
                  {/* Controls & Total Row - Stacked on Mobile */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-[#E8E2DC] px-2 py-1 bg-[#FAF8F5]">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            removeProduct(item.productId);
                            addProduct({ id: item.productId, name: item.name, sku: '', priceCents: item.unitPriceCents, stock: 99, clinicId: '', isActive: true, description: '', imageUrl: '', createdAt: '', updatedAt: '' } as any, item.quantity - 1);
                          }
                        }}
                        className="p-1 text-[#8A6F5F] hover:text-[#2C2420] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-[13px] font-bold text-[#1A1A1A]">{item.quantity}</span>
                      <button
                        onClick={() => addProduct({ id: item.productId, name: item.name, sku: '', priceCents: item.unitPriceCents, stock: 99, clinicId: '', isActive: true, description: '', imageUrl: '', createdAt: '', updatedAt: '' } as any, 1)}
                        className="p-1 text-[#8A6F5F] hover:text-[#2C2420] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[14px] font-black text-[#8A6F5F]">{formatMoney(item.unitPriceCents * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 mt-4 lg:mt-0 space-y-4">
          {/* Coupon Section */}
          <div className="rounded-2xl border border-[#E8E2DC] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Ticket size={16} className="text-[#8A6F5F]" />
              <h3 className="text-[13px] font-black uppercase tracking-widest text-[#1A1A1A]">Promo Code</h3>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  disabled={discountPercent > 0}
                  className="h-11 border-[#E8E2DC] bg-[#FAF8F5] text-[13px] uppercase tracking-wider"
                />
                {discountPercent > 0 && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
              <Button
                onClick={handleApplyCoupon}
                disabled={!couponInput || isApplying || discountPercent > 0}
                className={`h-11 px-6 text-[12px] font-bold transition-all ${
                  discountPercent > 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-[#1A1A1A] text-white hover:bg-[#8A6F5F]'
                }`}
              >
                {isApplying ? '...' : discountPercent > 0 ? 'Applied' : 'Apply'}
              </Button>
            </div>
            {discountPercent > 0 && (
              <p className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                Congrats! You've saved {formatMoney(discountAmount)}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-[#E8E2DC] bg-white p-5 shadow-sm">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[#8A6F5F] border-b border-[#F5F0EA] pb-3 mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <span className="text-[13px] text-[#B5A99A] font-medium tracking-wide">Subtotal</span>
                <span className="text-[14px] font-bold text-[#1A1A1A] min-w-[80px] text-right">{formatMoney(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-emerald-600">
                  <span className="text-[13px] font-medium tracking-wide italic">Discount (10%)</span>
                  <span className="text-[14px] font-bold min-w-[80px] text-right">-{formatMoney(discountAmount)}</span>
                </div>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <span className="text-[13px] text-[#B5A99A] font-medium tracking-wide">Shipping</span>
                <span className="text-[14px] font-bold text-[#8A6F5F] min-w-[80px] text-right">Free</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8E2DC] grid grid-cols-[1fr_auto] gap-4 items-center">
                <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-[#1A1A1A] min-w-[100px] text-right">{formatMoney(total)}</span>
              </div>
            </div>

            <Button
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#2C2420] text-[15px] font-bold text-white shadow-lg shadow-[#2C2420]/10 hover:bg-[#8A6F5F] transition-all active:scale-[0.98]"
              onClick={() => {
                toast.success("Proceeding to checkout");
                onProceedToCheckout();
              }}
            >
              Checkout <ArrowRight size={18} />
            </Button>
            
            <div className="mt-5 flex items-center justify-center gap-2 text-[#B5A99A]">
              <ShieldCheck size={16} />
              <span className="text-[12px] font-bold tracking-tight uppercase">Secure SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
