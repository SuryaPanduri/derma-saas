import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCartStore, VALID_COUPONS } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { formatMoney } from '@/utils/moneyUtils';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ShieldCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export const CartView = ({ onProceedToCheckout }: { onProceedToCheckout: () => void }) => {
  const { items, removeProduct, addProduct, appliedCoupon, setAppliedCoupon } = useCartStore();
  const toast = useToast();
  const [couponInput, setCouponInput] = useState(appliedCoupon || '');
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const discountPercent = appliedCoupon ? (VALID_COUPONS[appliedCoupon as keyof typeof VALID_COUPONS] || 0) : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    
    setIsApplying(true);
    setTimeout(() => {
      const code = couponInput.toUpperCase();
      if (code in VALID_COUPONS) {
        setAppliedCoupon(code);
        toast.success(`Coupon '${code}' applied successfully!`);
      } else {
        toast.error("Invalid coupon code. Please try again.");
      }
      setIsApplying(false);
    }, 600);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.info("Coupon removed.");
  };

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
              <button
                onClick={() => removeProduct(item.productId)}
                className="absolute right-2 top-2 p-2 text-[#B5A99A] hover:text-red-500 transition-colors z-10"
                aria-label="Remove item"
              >
                <X size={16} />
              </button>

              <div className="flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-[#F5F0EB] flex items-center justify-center text-[#8A6F5F]/20">
                  <ShoppingBag size={24} />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-[14px] font-bold text-[#1A1A1A] leading-tight truncate">{item.name}</h4>
                  <p className="mt-1 text-[12px] text-[#B5A99A]">{formatMoney(item.unitPriceCents)} each</p>
                  
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

        {/* Unified Summary & Coupon Section */}
        <div className="lg:sticky lg:top-24 mt-4 lg:mt-0">
          <div className="rounded-2xl border border-[#E8E2DC] bg-white p-6 shadow-sm">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[#8A6F5F] border-b border-[#F5F0EA] pb-3 mb-6">Order Checkout</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <span className="text-[13px] text-[#B5A99A] font-medium tracking-wide">Basket Subtotal</span>
                <span className="text-[14px] font-bold text-[#1A1A1A]">{formatMoney(subtotal)}</span>
              </div>

              {/* Enhanced Coupon Input within Summary */}
              <div className="py-2">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5A99A]" />
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="PROMO CODE"
                        className="h-10 border-[#E8E2DC] bg-[#FAF8F5] pl-9 text-[11px] font-bold uppercase tracking-wider"
                      />
                    </div>
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput || isApplying}
                      className="h-10 px-4 bg-[#2C2420] text-[10px] font-bold text-white hover:bg-[#1A1A1A] transition-all"
                    >
                      {isApplying ? '...' : 'APPLY'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">{appliedCoupon}</p>
                        <p className="text-[9px] font-medium text-emerald-600">Saved {formatMoney(discountAmount)}</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="p-1 text-emerald-400 hover:text-emerald-600">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <span className="text-[13px] text-[#B5A99A] font-medium tracking-wide">Delivery Fees</span>
                <span className="text-[13px] font-bold text-emerald-600 uppercase tracking-tight">Complementary</span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E8E2DC] grid grid-cols-[1fr_auto] gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Final Settlement</span>
                  <p className="text-[10px] text-[#B5A99A]">Tax Included</p>
                </div>
                <span className="text-2xl font-black text-[#1A1A1A]">{formatMoney(total)}</span>
              </div>
            </div>

            <Button
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#CA8A04] text-[15px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#CA8A04]/20 hover:bg-[#B87D03] transition-all active:scale-[0.98]"
              onClick={() => {
                toast.success("Proceeding to secure checkout");
                onProceedToCheckout();
              }}
            >
              Confirm & Pay <ArrowRight size={18} />
            </Button>
            
            <div className="mt-5 flex items-center justify-center gap-2 text-[#B5A99A] opacity-60">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold tracking-widest uppercase">Vault Secure Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
