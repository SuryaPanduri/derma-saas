import { Button } from '@/components/ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { useCreateOrder, useOrders } from '@/hooks';
import { useAuthStore, useCartStore } from '@/store';
import { formatMoney } from '@/utils/moneyUtils';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/Input';
import { formatDateLabel } from '@/utils/dateUtils';
import { useToast } from '@/contexts/ToastContext';
import { CheckCircle2, Clock3, PackageCheck, Truck, ShoppingBag, Calendar, X, Box } from 'lucide-react';

const COUPONS = [
  { code: 'SKINTHEORY25', label: '25% OFF up to Rs 500' },
  { code: 'GLOW10', label: '10% OFF up to Rs 250' }
];

export const OrdersView = ({
  clinicId,
  showHistory = true,
  showCheckout = true
}: {
  clinicId: string;
  showHistory?: boolean;
  showCheckout?: boolean;
}) => {
  const user = useAuthStore((state) => state.user);
  const { items, clearCart, removeProduct, addProduct } = useCartStore();
  const ordersQuery = useOrders(user?.id ?? '');
  const { mutateAsync, isLoading } = useCreateOrder();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'history' | 'checkout'>(items.length > 0 && showCheckout ? 'checkout' : 'history');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const couponRule = COUPONS.find((c) => c.code === appliedCouponCode);
  const rawDiscount = couponRule ? Math.floor((subtotal * (couponRule.code === 'SKINTHEORY25' ? 25 : 10)) / 100) : 0;
  const maxDiscount = couponRule ? (couponRule.code === 'SKINTHEORY25' ? 50000 : 25000) : 0;
  const discount = couponRule ? Math.min(rawDiscount, maxDiscount) : 0;
  const total = Math.max(0, subtotal - discount);

  const recentOrders = useMemo(
    () => [...ordersQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ordersQuery.data]
  );

  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 20000);
    return () => window.clearInterval(t);
  }, []);

  const getStep = (iso: string, status: string) => {
    if (status === 'cancelled' || status === 'failed') return 0;
    const mins = Math.max(0, Math.floor((nowTick - new Date(iso).getTime()) / 60000));
    if (mins < 3) return 0;
    if (mins < 8) return 1;
    if (mins < 16) return 2;
    return 3;
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (!COUPONS.some((c) => c.code === code)) { toast.error('Invalid code'); return; }
    setAppliedCouponCode(code);
    toast.success(`Coupon ${code} applied`);
  };

  const handleCheckout = async () => {
    if (!user || !items.length) return;
    try {
      await mutateAsync({ clinicId, patientUid: user.id, items, couponCode: appliedCouponCode ?? undefined });
      clearCart();
      setAppliedCouponCode(null);
      setCouponInput('');
      toast.success('Order placed successfully');
      setActiveTab('history');
    } catch { toast.error('Order failed'); }
  };

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addProduct({ id: item.productId, name: item.name, sku: '', priceCents: item.unitPriceCents, stock: 99, clinicId, isActive: true, description: '', imageUrl: '', createdAt: '', updatedAt: '' }, item.quantity);
    });
    toast.success("Items added to cart");
    setActiveTab('checkout');
  };

  const steps = [
    { label: 'Placed', icon: Clock3 },
    { label: 'Packed', icon: PackageCheck },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: CheckCircle2 }
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-[#2C2420]">Orders</h2>
        <p className="mt-1 text-[13px] text-[#B5A99A]">Track orders and manage checkout</p>
      </div>

      {/* Tabs */}
      {showCheckout && showHistory && (
        <div className="mb-8 flex gap-1 border-b border-[#E8E2DC]">
          {[
            { id: 'history' as const, label: 'Order History' },
            { id: 'checkout' as const, label: `Checkout${items.length ? ` (${items.length})` : ''}` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 pb-3 pt-1 text-[13px] font-medium transition-colors ${
                activeTab === tab.id ? 'text-[#1A1A1A]' : 'text-[#B5A99A] hover:text-[#8A6F5F]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#8A6F5F]" />}
            </button>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {!recentOrders.length ? (
            <div className="py-12"><EmptyState title="No orders yet" subtitle="Your order history will appear here." /></div>
          ) : (
            recentOrders.map((order) => {
              const step = getStep(order.createdAt, order.status);
              return (
                <div key={order.id} className="rounded-xl border border-[#E8E2DC] bg-white p-5 transition-colors hover:border-[#D4C8BC]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-[12px] text-[#B5A99A]">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateLabel(order.createdAt)}</span>
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#1A1A1A]">{formatMoney(order.totalCents)}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        order.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#F5F0EB] text-[#8A6F5F]'
                      }`}>{order.status}</span>
                    </div>
                  </div>

                  {/* Horizontal Tracking */}
                  <div className="flex items-center gap-2 mb-4">
                    {steps.map((s, idx) => (
                      <div key={s.label} className="flex items-center gap-2 flex-1">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                          idx <= step ? 'bg-[#8A6F5F] text-white' : 'bg-[#F5F0EB] text-[#D4C8BC]'
                        }`}>
                          <s.icon size={13} />
                        </div>
                        <span className={`text-[11px] font-medium ${idx <= step ? 'text-[#1A1A1A]' : 'text-[#D4C8BC]'}`}>{s.label}</span>
                        {idx < steps.length - 1 && <div className={`flex-1 h-px ${idx < step ? 'bg-[#8A6F5F]' : 'bg-[#E8E2DC]'}`} />}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    className="text-[12px] font-medium text-[#8A6F5F] hover:underline"
                  >
                    Reorder
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Checkout Tab */}
      {activeTab === 'checkout' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {!items.length ? (
              <div className="py-12"><EmptyState title="Cart is empty" subtitle="Add products to checkout." /></div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between rounded-xl border border-[#E8E2DC] bg-white p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#F5F0EB] flex items-center justify-center text-[#8A6F5F]/20"><Box size={20} /></div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{item.name}</p>
                      <p className="text-[12px] text-[#B5A99A]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#1A1A1A]">{formatMoney(item.unitPriceCents * item.quantity)}</span>
                    <button onClick={() => removeProduct(item.productId)} className="text-[#B5A99A] hover:text-red-500"><X size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-[#E8E2DC] bg-white p-6">
              <h3 className="text-base font-semibold text-[#1A1A1A] mb-5">Summary</h3>
              <div className="flex gap-2 mb-4">
                <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="h-9 rounded-lg border-[#E8E2DC] text-sm uppercase flex-1" />
                <Button variant="outline" onClick={applyCoupon} className="h-9 rounded-lg border-[#E8E2DC] text-[12px] px-3 text-[#8A6F5F]">Apply</Button>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-[#B5A99A]">Subtotal</span><span className="text-[#1A1A1A]">{formatMoney(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[#B5A99A]">Discount</span><span className="text-emerald-600">−{formatMoney(discount)}</span></div>
                <div className="border-t border-[#E8E2DC] pt-2 flex justify-between"><span className="font-semibold text-[#1A1A1A]">Total</span><span className="text-lg font-bold text-[#1A1A1A]">{formatMoney(total)}</span></div>
              </div>
              <Button onClick={handleCheckout} disabled={!items.length || isLoading} className="mt-5 h-10 w-full rounded-lg bg-[#1A1A1A] text-[13px] font-medium text-white hover:bg-[#8A6F5F]">
                {isLoading ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
