import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCartStore } from '@/store';
import { formatMoney } from '@/utils/moneyUtils';
import { BadgePercent, Package, ShieldCheck, Truck } from 'lucide-react';

export const CartView = ({ onProceedToCheckout }: { onProceedToCheckout: () => void }) => {
  const { items, removeProduct } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      <Card className="border-teal-100 bg-gradient-to-r from-white to-teal-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Cart</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Cart Items</h2>
            <p className="mt-1 text-sm text-slate-600">Review products in your cart, then continue to checkout.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700">
            <Package size={14} />
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[#d5e4e7] bg-white p-3 text-sm text-[#4f666b]">
            <p className="inline-flex items-center gap-1 font-semibold text-[#12353a]"><ShieldCheck size={14} /> Secure checkout</p>
            <p className="mt-1 text-xs">Transaction-safe order placement</p>
          </div>
          <div className="rounded-xl border border-[#d5e4e7] bg-white p-3 text-sm text-[#4f666b]">
            <p className="inline-flex items-center gap-1 font-semibold text-[#12353a]"><Truck size={14} /> Fast dispatch</p>
            <p className="mt-1 text-xs">Live tracking after order confirmation</p>
          </div>
          <div className="rounded-xl border border-[#d5e4e7] bg-white p-3 text-sm text-[#4f666b]">
            <p className="inline-flex items-center gap-1 font-semibold text-[#12353a]"><BadgePercent size={14} /> Offers ready</p>
            <p className="mt-1 text-xs">Apply coupons during checkout</p>
          </div>
        </div>
      </Card>

      {!items.length ? (
        <Card className="p-4 sm:p-5">
          <EmptyState title="Your Cart Is Empty" subtitle="Add products from the catalog to continue." />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="p-4 sm:p-5">
            <h3 className="text-lg font-bold text-slate-800">Items</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
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
            <h3 className="text-lg font-bold text-slate-800">Cart Summary</h3>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="text-lg font-bold text-slate-900">{formatMoney(subtotal)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-slate-600">Items</p>
              <p className="text-sm font-semibold text-slate-800">{itemCount}</p>
            </div>
            <Button className="mt-5 w-full" onClick={onProceedToCheckout}>
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
