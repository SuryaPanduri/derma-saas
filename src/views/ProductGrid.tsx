import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks';
import { useCartStore, useWishlistStore } from '@/store';
import type { ProductDTO } from '@/types';
import { formatMoney } from '@/utils/moneyUtils';

export const ProductGrid = ({ clinicId }: { clinicId: string }) => {
  const { data, isLoading } = useProducts(clinicId);
  const addProduct = useCartStore((state) => state.addProduct);
  const toggleWishlist = useWishlistStore((state) => state.toggleProduct);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [heartAnimatingId, setHeartAnimatingId] = useState<string | null>(null);

  const openQuantityPopup = (product: ProductDTO) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeQuantityPopup = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) {
      return;
    }
    addProduct(selectedProduct, quantity);
    closeQuantityPopup();
  };

  const handleWishlistToggle = (product: ProductDTO) => {
    toggleWishlist(product);
    setHeartAnimatingId(product.id);
    window.setTimeout(() => setHeartAnimatingId((current) => (current === product.id ? null : current)), 450);
  };

  if (isLoading) {
    return (
      <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title="No Products Found" subtitle="Inventory has not been configured yet." />;
  }

  return (
    <div className="space-y-10 md:space-y-16">
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f6]/56 via-[#faf9f6]/30 to-transparent" />
        <div className="relative flex min-h-[38vh] items-center bg-[linear-gradient(120deg,#e6ddcf,#dbd2c5,#ece5da)] px-4 py-8 sm:min-h-[42vh] sm:px-6 sm:py-10 md:min-h-[48vh] md:px-12 md:py-14">
          <div className="max-w-xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3a4a3a] [text-shadow:0_1px_1px_rgba(255,255,255,0.35)]">
              Skincare Collection
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-[0.01em] text-[#2f3d2f] [text-shadow:0_1px_2px_rgba(255,255,255,0.3)] sm:text-4xl md:text-6xl">
              Ritual-led skincare with clinical confidence.
            </h2>
            <p className="text-sm leading-relaxed text-[#465646] [text-shadow:0_1px_2px_rgba(255,255,255,0.25)] sm:text-base md:text-lg">
              Discover dermatologist-guided essentials crafted for everyday calm, barrier support, and long-term skin health.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3 md:space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">Shop Products</p>
          <h3 className="text-2xl font-semibold text-[#1E1E1E] sm:text-3xl">Featured Formulations</h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:gap-8 xl:grid-cols-3">
          {data.map((product) => (
            <Card
              key={product.id}
              className="rounded-2xl border border-[#e6dfd3] bg-[#FAF8F4] p-6 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="group relative mb-4 overflow-hidden rounded-xl bg-[#f1eadf] p-5">
                <div className="inline-flex rounded-full border border-[#d9d1c1] bg-[#FAF8F4]/90 p-2 text-[#4E5D4A] transition-all duration-300 ease-in-out group-hover:scale-110">
                  <ShoppingBag size={18} />
                </div>
                <button
                  onClick={() => handleWishlistToggle(product)}
                  className={`absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d1c1] bg-[#FAF8F4]/90 text-[#4E5D4A] transition-all duration-300 hover:scale-110 ${
                    heartAnimatingId === product.id ? 'scale-125' : ''
                  }`}
                  aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  title={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={16}
                    className={`transition-all duration-300 ${
                      isWishlisted(product.id) ? 'fill-[#4E5D4A] text-[#4E5D4A]' : 'text-[#4E5D4A]'
                    }`}
                  />
                </button>
                <span className="absolute right-3 top-3 rounded-full bg-[#4E5D4A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Offer
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.15em] text-[#6B6B6B]">{product.sku}</p>
              <h4 className="mt-2 text-xl font-medium text-[#1E1E1E]">{product.name}</h4>
              <p className="mt-2 min-h-12 text-sm leading-relaxed text-[#6B6B6B]">{product.description}</p>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm font-medium text-[#6B6B6B]">{formatMoney(product.priceCents)}</p>
                <p
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    product.stock <= 5 ? 'bg-[#4E5D4A]/15 text-[#4E5D4A]' : 'bg-[#ece4d8] text-[#6B6B6B]'
                  }`}
                >
                  Stock {product.stock}
                </p>
              </div>

              <Button
                className="mt-5 w-full border border-[#4E5D4A] bg-[#4E5D4A] text-[#FAF8F4] transition-all duration-300 ease-in-out hover:opacity-90"
                onClick={() => openQuantityPopup(product)}
                disabled={product.stock <= 0}
              >
                Add to Cart
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#4E5D4A] px-4 py-10 text-white sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Newsletter</p>
          <h3 className="text-3xl font-semibold md:text-4xl">Join our calm skin journal</h3>
          <p className="text-white/85">Get treatment insights, ingredient notes, and curated routines for healthier skin.</p>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 rounded-full border-white/30 bg-white/95 px-5 text-[#1E1E1E] focus:ring-white/40"
            />
            <Button className="h-12 rounded-full bg-white px-8 text-[#4E5D4A] transition-all duration-300 ease-in-out hover:bg-[#4E5D4A] hover:text-white">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-2 md:pt-4">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">Instagram</p>
          <h3 className="text-3xl font-semibold text-[#1E1E1E]">Follow Our Skin Stories</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-6 md:gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-xl bg-[linear-gradient(130deg,#d8cfbf,#ebe4d9)] transition-all duration-300 ease-in-out hover:scale-[1.03]"
            />
          ))}
        </div>
      </section>

      {selectedProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E1E]/30 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-[#e6dfd3] bg-[#FAF8F4] p-5">
            <h3 className="text-lg font-semibold text-[#1E1E1E]">Select Quantity</h3>
            <p className="mt-1 text-sm text-[#6B6B6B]">{selectedProduct.name}</p>
            <p className="mt-1 text-sm text-[#4E5D4A]">{formatMoney(selectedProduct.priceCents)} each</p>
            <p className="mt-1 text-xs text-[#6B6B6B]">Available stock: {selectedProduct.stock}</p>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                className="h-10 w-10 border-[#d9d1c1] px-0 text-[#4E5D4A] hover:bg-[#4E5D4A]/10"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </Button>
              <Input
                type="number"
                min={1}
                max={selectedProduct.stock}
                value={quantity}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isNaN(next)) {
                    setQuantity(1);
                    return;
                  }
                  setQuantity(Math.max(1, Math.min(selectedProduct.stock, Math.floor(next))));
                }}
                className="border-[#d9d1c1] bg-white text-center text-[#1E1E1E]"
              />
              <Button
                variant="outline"
                className="h-10 w-10 border-[#d9d1c1] px-0 text-[#4E5D4A] hover:bg-[#4E5D4A]/10"
                onClick={() => setQuantity((prev) => Math.min(selectedProduct.stock, prev + 1))}
                disabled={quantity >= selectedProduct.stock}
              >
                <Plus size={16} />
              </Button>
            </div>

            <p className="mt-3 text-sm text-[#6B6B6B]">
              Total: <span className="font-semibold text-[#4E5D4A]">{formatMoney(selectedProduct.priceCents * quantity)}</span>
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" className="text-[#6B6B6B] hover:bg-[#4E5D4A]/10" onClick={closeQuantityPopup}>
                Cancel
              </Button>
              <Button className="bg-[#4E5D4A] text-[#FAF8F4] hover:opacity-90" onClick={handleConfirmAdd}>
                Add to Cart
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
