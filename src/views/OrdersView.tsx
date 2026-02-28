import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { useCreateOrder, useOrders } from '@/hooks';
import { useAuthStore, useCartStore } from '@/store';
import { formatMoney } from '@/utils/moneyUtils';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/Input';
import { formatDateLabel } from '@/utils/dateUtils';
import { CheckCircle2, Clock3, PackageCheck, Truck } from 'lucide-react';

const COUPONS = [
  { code: 'SKINTHEORY25', label: '25% OFF up to Rs 500' },
  { code: 'GLOW10', label: '10% OFF up to Rs 250' }
];

export const OrdersView = ({
  clinicId,
  showTracking = true,
  showCheckout = true
}: {
  clinicId: string;
  showTracking?: boolean;
  showCheckout?: boolean;
}) => {
  const user = useAuthStore((state) => state.user);
  const { items, clearCart, removeProduct } = useCartStore();
  const ordersQuery = useOrders(user?.id ?? '');
  const { mutateAsync, isLoading } = useCreateOrder();
  const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const couponRule = COUPONS.find((coupon) => coupon.code === appliedCouponCode);
  const rawDiscountCents = couponRule
    ? Math.floor((subtotal * (couponRule.code === 'SKINTHEORY25' ? 25 : 10)) / 100)
    : 0;
  const maxDiscountCents = couponRule ? (couponRule.code === 'SKINTHEORY25' ? 50000 : 25000) : 0;
  const discountCents = couponRule ? Math.min(rawDiscountCents, maxDiscountCents) : 0;
  const total = Math.max(0, subtotal - discountCents);
  const recentOrders = useMemo(
    () => [...ordersQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ordersQuery.data]
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 20000);
    return () => window.clearInterval(timer);
  }, []);

  const getTrackingStep = (createdAtISO: string, status: string) => {
    if (status === 'cancelled' || status === 'failed') {
      return 0;
    }
    const elapsedMinutes = Math.max(0, Math.floor((nowTick - new Date(createdAtISO).getTime()) / 60000));
    if (elapsedMinutes < 3) return 0;
    if (elapsedMinutes < 8) return 1;
    if (elapsedMinutes < 16) return 2;
    return 3;
  };

  const applyCoupon = () => {
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      setAppliedCouponCode(null);
      setCheckoutMessage({ type: 'error', text: 'Enter a coupon code.' });
      return;
    }
    const isValid = COUPONS.some((coupon) => coupon.code === normalized);
    if (!isValid) {
      setAppliedCouponCode(null);
      setCheckoutMessage({ type: 'error', text: 'Invalid coupon code.' });
      return;
    }
    setAppliedCouponCode(normalized);
    setCheckoutMessage({ type: 'success', text: `Coupon applied: ${normalized}` });
  };

  const handleCheckout = async () => {
    if (!user || !items.length) {
      return;
    }

    try {
      setCheckoutMessage(null);
      await mutateAsync({
        clinicId,
        patientUid: user.id,
        items,
        couponCode: appliedCouponCode ?? undefined
      });
      clearCart();
      setAppliedCouponCode(null);
      setCouponInput('');
      setCheckoutMessage({ type: 'success', text: 'Order placed successfully.' });
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unable to place order.';
      setCheckoutMessage({ type: 'error', text: `Order failed: ${message}` });
    }
  };

  const renderTrackingPanel = () => (
    <Card className="p-4 sm:p-5">
      <h3 className="text-lg font-bold text-slate-800">Order Tracking</h3>
      {!recentOrders.length ? (
        <div className="mt-4">
          <EmptyState title="No Orders Yet" subtitle="Your placed orders and tracking updates will appear here." />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {recentOrders.map((order) => {
            const step = getTrackingStep(order.createdAt, order.status);
            const steps = [
              { label: 'Placed', icon: Clock3 },
              { label: 'Packed', icon: PackageCheck },
              { label: 'Shipped', icon: Truck },
              { label: 'Delivered', icon: CheckCircle2 }
            ];
            return (
              <div key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">Order {order.id.slice(0, 8)}...</p>
                  <span className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-xs font-semibold text-teal-700">
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatDateLabel(order.createdAt)} | {order.items.length} items</p>
                <p className="text-xs text-slate-600">Total: {formatMoney(order.totalCents)}</p>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {steps.map((s, idx) => (
                    <div key={`${order.id}-${s.label}`} className="flex flex-col items-center gap-1">
                      <div
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                          idx <= step ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white text-slate-500'
                        } ${idx === step ? 'animate-pulse' : ''}`}
                      >
                        <s.icon size={14} />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card className="border-teal-100 bg-gradient-to-r from-white to-teal-50 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Order Review</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {showCheckout ? (showTracking ? 'Checkout & Tracking' : 'Cart Checkout') : 'Order History & Tracking'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {showCheckout
            ? showTracking
              ? 'Place new orders and monitor live order progress.'
              : 'Review cart items and place your order.'
            : 'View placed orders and real-time tracking updates.'}
        </p>
      </Card>
      {showTracking && !showCheckout ? renderTrackingPanel() : null}

      {showCheckout && checkoutMessage ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            checkoutMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {checkoutMessage.text}
        </div>
      ) : null}

      {showCheckout ? (
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {showTracking ? renderTrackingPanel() : null}

        {!items.length ? (
          <Card className="h-fit p-4 sm:p-5">
            <EmptyState title="Your Cart Is Empty" subtitle="Add products from the catalog to continue checkout." />
          </Card>
        ) : (
          <div className={`${showTracking ? 'grid gap-4 lg:col-span-2 lg:grid-cols-[1fr_320px]' : 'grid gap-4 lg:grid-cols-[1fr_320px]'}`}>
          <Card className="p-4 sm:p-5">
            <h3 className="text-lg font-bold text-slate-800">Cart Items</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="font-semibold text-teal-700">{formatMoney(item.unitPriceCents * item.quantity)}</p>
                    <Button variant="ghost" onClick={() => removeProduct(item.productId)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="h-fit p-4 sm:p-5">
            <h3 className="text-lg font-bold text-slate-800">Summary</h3>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Apply Coupon</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code"
                  className="uppercase"
                />
                <Button variant="outline" onClick={applyCoupon} className="sm:min-w-[92px]">
                  Apply
                </Button>
              </div>
              <p className="text-xs text-slate-500">{COUPONS.map((coupon) => `${coupon.code} (${coupon.label})`).join(' | ')}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="text-lg font-bold text-slate-800">{formatMoney(subtotal)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-slate-600">Discount</p>
              <p className="text-sm font-semibold text-emerald-700">- {formatMoney(discountCents)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-lg font-bold text-slate-900">{formatMoney(total)}</p>
            </div>
            <Button className="mt-5 w-full" onClick={handleCheckout} disabled={!user || !items.length || isLoading}>
              {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
          </Card>
          </div>
        )}
      </div>
      ) : null}
    </div>
  );
};
