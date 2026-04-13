import { useState } from 'react';
import { Heart, ShoppingBag, Plus, Eye, X, ShieldCheck, Zap } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks';
import { useCartStore, useWishlistStore } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import type { ProductDTO } from '@/types';
import { formatMoney } from '@/utils/moneyUtils';

export const ProductGrid = ({ clinicId }: { clinicId: string }) => {
  const { data, isLoading } = useProducts(clinicId);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDTO | null>(null);
  const toast = useToast();

  const addProduct = useCartStore((state) => state.addProduct);
  const toggleWishlist = useWishlistStore((state) => state.toggleProduct);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data?.length) return <EmptyState title="No Products" subtitle="Coming soon." />;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-[#2C2420]">Products</h2>
        <p className="mt-1 text-[13px] text-[#B5A99A]">Professional skincare formulas</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((product: ProductDTO) => (
          <div key={product.id} className="group rounded-xl border border-[#E8E2DC] bg-white overflow-hidden transition-all hover:border-[#8A6F5F] hover:shadow-sm">
            {/* Image Area */}
            <div className="relative aspect-square bg-[#F5F0EB] flex items-center justify-center">
              <ShoppingBag size={40} className="text-[#8A6F5F]/10" />
              {product.stock < 5 && (
                <span className="absolute top-3 left-3 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 border border-red-100">
                  Low Stock
                </span>
              )}
              {/* Hover Controls */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1A1A1A] shadow-sm transition-colors hover:bg-[#8A6F5F] hover:text-white"
                >
                  <Heart size={16} className={isWishlisted(product.id) ? 'fill-current text-[#8A6F5F]' : ''} />
                </button>
                <button
                  onClick={() => setQuickViewProduct(product)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1A1A1A] shadow-sm transition-colors hover:bg-[#8A6F5F] hover:text-white"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => {
                    const result = addProduct(product, 1);
                    if (result.success) {
                      toast.success(result.error || `${product.name} added to cart`);
                    } else {
                      toast.error(result.error || 'Failed to add product');
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A1A1A] text-white shadow-sm transition-colors hover:bg-[#8A6F5F]"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-[11px] text-[#B5A99A] mb-1">{product.sku}</p>
              <h4 className="text-sm font-semibold text-[#1A1A1A] line-clamp-1 group-hover:text-[#8A6F5F] transition-colors">
                {product.name}
              </h4>
              <p className="mt-2 text-sm font-bold text-[#1A1A1A]">{formatMoney(product.priceCents)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40" onClick={() => setQuickViewProduct(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-[#E8E2DC] bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="w-full md:w-1/2 bg-[#F5F0EB] p-12 flex items-center justify-center">
                <ShoppingBag size={80} className="text-[#8A6F5F]/10" />
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2 p-8 flex flex-col">
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute right-4 top-4 p-2 text-[#B5A99A] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F0EB] transition-colors"
                >
                  <X size={18} />
                </button>

                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Professional Grade</p>
                <h3 className="font-['Playfair_Display'] mt-2 text-2xl font-bold text-[#2C2420]">{quickViewProduct.name}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-[#B5A99A]">
                  Formulated to restore the skin's natural barrier while delivering intense hydration with clinically tested active ingredients.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-[#F5F0EB] p-3">
                    <ShieldCheck size={16} className="text-[#8A6F5F]" />
                    <span className="text-[12px] font-medium text-[#1A1A1A]">Derm tested</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-[#F5F0EB] p-3">
                    <Zap size={16} className="text-[#8A6F5F]" />
                    <span className="text-[12px] font-medium text-[#1A1A1A]">Fast absorb</span>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <p className="text-2xl font-bold text-[#1A1A1A] mb-4">{formatMoney(quickViewProduct.priceCents)}</p>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-10 rounded-lg bg-[#1A1A1A] text-[13px] font-medium text-white hover:bg-[#8A6F5F] transition-colors"
                      onClick={() => {
                        const result = addProduct(quickViewProduct, 1);
                        if (result.success) {
                          toast.success(result.error || `${quickViewProduct.name} added to cart`);
                          setQuickViewProduct(null);
                        } else {
                          toast.error(result.error || 'Failed to add product');
                        }
                      }}
                    >
                      Add to Cart
                    </Button>
                    <button
                      onClick={() => toggleWishlist(quickViewProduct)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                        isWishlisted(quickViewProduct.id)
                          ? 'bg-[#8A6F5F] text-white border-[#8A6F5F]'
                          : 'border-[#E8E2DC] text-[#8A6F5F] hover:border-[#8A6F5F]'
                      }`}
                    >
                      <Heart size={18} className={isWishlisted(quickViewProduct.id) ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
