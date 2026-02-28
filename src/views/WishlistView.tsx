import { Heart, PackageCheck, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCartStore, useWishlistStore } from '@/store';
import { formatMoney } from '@/utils/moneyUtils';

export const WishlistView = () => {
  const items = useWishlistStore((state) => state.items);
  const removeProduct = useWishlistStore((state) => state.removeProduct);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addProduct = useCartStore((state) => state.addProduct);
  const inStockCount = items.filter((item) => item.stock > 0).length;
  const totalValue = items.reduce((sum, item) => sum + item.priceCents, 0);

  if (!items.length) {
    return <EmptyState title="No Wishlist Items" subtitle="Tap the heart on products to save them here." />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#d5e4e7] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7f83]">Saved Items</p>
            <h2 className="mt-1 text-2xl font-bold text-[#12353a]">Wishlists</h2>
          </div>
          <Button variant="outline" onClick={clearWishlist}>
            Clear all
          </Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6b7f83]">
              <Heart size={13} /> Saved
            </p>
            <p className="mt-1 text-xl font-bold text-[#12353a]">{items.length}</p>
          </div>
          <div className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6b7f83]">
              <PackageCheck size={13} /> In Stock
            </p>
            <p className="mt-1 text-xl font-bold text-[#12353a]">{inStockCount}</p>
          </div>
          <div className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6b7f83]">
              <Sparkles size={13} /> Value
            </p>
            <p className="mt-1 text-lg font-bold text-[#12353a]">{formatMoney(totalValue)}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((product) => (
          <Card key={product.id} className="border-[#d5e4e7] bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#6b7f83]">{product.sku}</p>
                <h3 className="mt-1 text-lg font-semibold text-[#12353a]">{product.name}</h3>
              </div>
              <span className="rounded-full bg-[#e7eef0] p-2 text-[#0f4a52]">
                <Heart size={14} className="fill-current" />
              </span>
            </div>

            <p className="min-h-12 text-sm text-[#4f666b]">{product.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-semibold text-[#0f4a52]">{formatMoney(product.priceCents)}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1 bg-[#0f4a52] text-white hover:bg-[#0a3a41]"
                onClick={() => addProduct(product, 1)}
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={14} className="mr-1" />
                Add to Cart
              </Button>
              <Button variant="outline" onClick={() => removeProduct(product.id)} aria-label={`Remove ${product.name}`}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
