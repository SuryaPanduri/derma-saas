import { Button } from '@/components/ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { useCreateOrder, useOrders } from '@/hooks';
import { useAuthStore, useCartStore, VALID_COUPONS } from '@/store';
import { formatMoney } from '@/utils/moneyUtils';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/Input';
import { formatDateLabel } from '@/utils/dateUtils';
import { useToast } from '@/contexts/ToastContext';
import { 
  CheckCircle2, 
  Clock3, 
  PackageCheck, 
  Truck, 
  ShoppingBag, 
  Calendar, 
  X, 
  Box, 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

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
  const { items, clearCart, removeProduct, addProduct, appliedCoupon } = useCartStore();
  const ordersQuery = useOrders(user?.id ?? '');
  const { mutateAsync, isLoading } = useCreateOrder();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'history' | 'checkout'>(items.length > 0 && showCheckout ? 'checkout' : 'history');
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  
  // Clean discount logic using global store
  const discountPercent = appliedCoupon ? (VALID_COUPONS[appliedCoupon as keyof typeof VALID_COUPONS] || 0) : 0;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const total = Math.max(0, subtotal - discount);

  const recentOrders = useMemo(
    () => [...ordersQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ordersQuery.data]
  );

  const selectedOrder = useMemo(
    () => recentOrders.find(o => o.id === selectedOrderId),
    [recentOrders, selectedOrderId]
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

  const handleCheckout = async () => {
    if (!user || !items.length) return;
    try {
      await mutateAsync({ clinicId, patientUid: user.id, items, couponCode: appliedCoupon ?? undefined });
      clearCart();
      toast.success('Order placed successfully');
      setActiveTab('history');
    } catch { toast.error('Order failed'); }
  };

  const handleReorder = (order: any) => {
    let failedItems: string[] = [];
    order.items.forEach((item: any) => {
      const result = addProduct({ 
        id: item.productId, 
        name: item.name, 
        sku: '', 
        priceCents: item.unitPriceCents, 
        stock: 99, 
        clinicId, 
        isActive: true, 
        description: '', 
        imageUrl: '', 
        createdAt: '', 
        updatedAt: '' 
      }, item.quantity);
      
      if (!result.success) {
        failedItems.push(item.name);
      }
    });

    if (failedItems.length === 0) {
      toast.success("Items added to cart");
      setActiveTab('checkout');
    } else {
      toast.error(`Could not add items: ${failedItems.join(', ')}`);
    }
  };

  // ─── Sub-component: OrderDetailView ───
  if (selectedOrder) {
    const step = getStep(selectedOrder.createdAt, selectedOrder.status);
    const milestones = [
      { id: 0, label: 'Confirmed', desc: 'Order received', icon: ShoppingBag, date: formatDateLabel(selectedOrder.createdAt) },
      { id: 1, label: 'Processing', desc: 'Quality check active', icon: PackageCheck, date: 'Ready soon' },
      { id: 2, label: 'Shipped', desc: 'Via Luxury Express', icon: Truck, date: 'Estimated 2 days' },
      { id: 3, label: 'Delivered', desc: 'Final destination', icon: CheckCircle2, date: '-' }
    ];

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
        <button 
          onClick={() => setSelectedOrderId(null)}
          className="flex items-center gap-2 text-[13px] font-bold text-[#8A6F5F] hover:underline"
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        {/* Order Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A6F5F]">Tracking Journey</p>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#191919] mt-1">Order #{selectedOrder.id.slice(-6).toUpperCase()}</h2>
              <p className="mt-1 text-xs text-[#B5A99A]">Confirmed on {formatDateLabel(selectedOrder.createdAt)}</p>
            </div>
            <span className={`rounded-xl px-4 py-1.5 text-[11px] font-black uppercase tracking-widest ${
              selectedOrder.status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-[#191919] text-white'
            }`}>
              {selectedOrder.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Milestone Tracker */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-black/[0.03] bg-white p-5 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#191919] mb-6">Live Status</h3>
              <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E8E2DC]">
                {milestones.map((m, idx) => (
                  <div key={m.label} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white transition-all ${
                      idx <= step ? 'bg-[#8A6F5F] text-white' : 'bg-[#F2EDEA] text-[#D4C8BC]'
                    }`}>
                      <m.icon size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-[13px] font-bold ${idx <= step ? 'text-[#191919]' : 'text-[#B5A99A]'}`}>{m.label}</p>
                      <p className="text-[11px] font-medium text-[#B5A99A]">{m.desc}</p>
                      {idx <= step && <p className="mt-1 text-[10px] font-bold text-[#8A6F5F]">{m.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="rounded-2xl border border-black/[0.03] bg-white overflow-hidden shadow-sm">
              <div className="border-b border-black/[0.04] p-5">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#191919]">Items in Package</h3>
              </div>
              <div className="divide-y divide-black/[0.04]">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#D4C8BC]">
                        <Box size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#191919] tracking-tight">{item.name}</p>
                        <p className="text-[11px] font-bold text-[#B5A99A]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#191919]">{formatMoney(item.unitPriceCents * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Summary */}
            <div className="grid gap-6 sm:grid-cols-2">
               <div className="rounded-2xl border border-black/[0.03] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-[#8A6F5F]" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#191919]">Payment</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-[#191919]">Secure Gateway · CC</p>
                    <p className="text-[11px] text-[#B5A99A]">Transaction ID: TXN_SKY_{selectedOrder.id.slice(0, 4)}</p>
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                      <ShieldCheck size={14} />
                      <span className="text-[11px] font-bold">Authenticated</span>
                    </div>
                  </div>
               </div>

               <div className="rounded-2xl border border-[#2C2420] bg-[#2C2420] p-5 text-white shadow-lg">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-4">Order Summary</h3>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between font-medium opacity-60"><span>Subtotal</span><span>{formatMoney(selectedOrder.subtotalCents)}</span></div>
                    <div className="flex justify-between font-medium text-emerald-400"><span>Loyalty Discount</span><span>−{formatMoney(selectedOrder.discountCents)}</span></div>
                    <div className="pt-2 border-t border-white/10 flex justify-between">
                      <span className="font-bold">Total Paid</span>
                      <span className="text-lg font-black">{formatMoney(selectedOrder.totalCents)}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main View Tabs Layout ───
  return (
    <div className="animate-in fade-in duration-500">
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8A6F5F]/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-[#191919]">Transaction Suite</h2>
            <p className="text-sm font-medium text-[#8A6F5F]/60">Review your past skincare rituals and complete pending acquisitions.</p>
          </div>
          
          {showCheckout && showHistory && (
            <div className="flex gap-1 p-1 bg-black/[0.03] rounded-xl self-start md:self-end">
              {[
                { id: 'history' as const, label: 'Vault' },
                { id: 'checkout' as const, label: `Basket${items.length ? ` (${items.length})` : ''}` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-9 items-center px-6 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                    ? 'bg-[#191919] text-white shadow-md' 
                    : 'text-[#B5A99A] hover:text-[#191919]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {!recentOrders.length ? (
            <div className="py-20"><EmptyState title="Archive Empty" subtitle="Your journey records will materialize here once paths are taken." /></div>
          ) : (
            recentOrders.map((order) => {
              const step = getStep(order.createdAt, order.status);
              return (
                <div key={order.id} className="group relative overflow-hidden rounded-2xl border border-black/[0.03] bg-white p-5 shadow-sm transition-all hover:bg-[#FAF8F5] hover:shadow-md ring-1 ring-black/5">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F0EB] text-[#8A6F5F]">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-[#191919] tracking-tight">Order #{order.id.slice(-6).toUpperCase()}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[#B5A99A] uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateLabel(order.createdAt)}</span>
                          <span>{order.items.length} units</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#191919]">{formatMoney(order.totalCents)}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'paid' ? 'text-emerald-600' : 'text-[#8A6F5F]'
                        }`}>{order.status}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.05] bg-white transition-all hover:bg-[#191919] hover:text-white group-hover:scale-110 shadow-sm"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {[
                      { l: 'Ordered', i: Clock3 },
                      { l: 'Packed', i: PackageCheck },
                      { l: 'Shipped', i: Truck },
                      { l: 'Arrived', i: CheckCircle2 }
                    ].map((s, idx) => (
                      <div key={s.l} className="flex items-center gap-2 flex-1">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white transition-all ${
                          idx <= step ? 'bg-[#8A6F5F] text-white shadow-lg' : 'bg-[#F5F0EB] text-[#D4C8BC]'
                        }`}>
                          <s.i size={14} />
                        </div>
                        {idx < 3 && <div className={`flex-1 h-[2px] rounded-full ${idx < step ? 'bg-[#8A6F5F]' : 'bg-[#E8E2DC]/50'}`} />}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => handleReorder(order)}
                      className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8A6F5F] hover:text-[#191919] transition-colors"
                    >
                      Instant Reacquisition
                    </button>
                    <p className="text-[10px] font-bold text-[#B5A99A]">EST. DELIVERY: 2 DAYS</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Checkout Tab */}
      {activeTab === 'checkout' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {!items.length ? (
              <div className="py-20"><EmptyState title="Basket Empty" subtitle="Add items to initialize a formal request." /></div>
            ) : (
              <div className="rounded-2xl border border-black/[0.03] bg-white shadow-sm ring-1 ring-black/5 divide-y divide-black/[0.04]">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-5 group transition-colors hover:bg-[#FAF8F5]">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-[#F5F0EB] flex items-center justify-center text-[#8A6F5F]/20 group-hover:scale-105 transition-transform"><Box size={24} /></div>
                      <div>
                        <p className="text-[15px] font-bold text-[#191919] tracking-tight">{item.name}</p>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#B5A99A]">QUANTITY · {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[15px] font-bold text-[#191919]">{formatMoney(item.unitPriceCents * item.quantity)}</span>
                      <button onClick={() => removeProduct(item.productId)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[#2C2420] bg-[#2C2420] p-7 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-6">Settlement Summary</h3>
              
              <div className="space-y-3 text-[13px] font-medium">
                <div className="flex justify-between opacity-60"><span>Basket Total</span><span>{formatMoney(subtotal)}</span></div>
                <div className="flex justify-between text-emerald-400"><span>Applied Rewards</span><span>−{formatMoney(discount)}</span></div>
                <div className="border-t border-white/10 pt-4 mt-2 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Final Amount</p>
                    <span className="text-3xl font-black">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                disabled={!items.length || isLoading} 
                className="mt-8 h-12 w-full rounded-xl bg-[#CA8A04] text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#B87D03] shadow-lg transition-all active:scale-95"
              >
                {isLoading ? 'SECURE_TRANSACTION...' : 'PLACE ORDER'}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
