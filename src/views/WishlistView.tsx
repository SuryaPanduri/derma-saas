import { useState } from 'react';
import { Heart, PackageCheck, ShoppingCart, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { useCartStore, useWishlistStore } from '@/store';
import { formatMoney } from '@/utils/moneyUtils';
import { useToast } from '@/contexts/ToastContext';

export const WishlistView = () => {
  const items = useWishlistStore((state) => state.items);
  const removeProduct = useWishlistStore((state) => state.removeProduct);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addProduct = useCartStore((state) => state.addProduct);
  const toast = useToast();
  
  const inStockCount = items.filter((item) => item.stock > 0).length;
  const totalValue = items.reduce((sum, item) => sum + item.priceCents, 0);

  const [waitlistedIds, setWaitlistedIds] = useState<Set<string>>(new Set());

  const toggleWaitlist = (id: string) => {
    setWaitlistedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const isJoining = !waitlistedIds.has(id);
    toast.success(isJoining ? "You're on the priority waitlist" : "Removed from waitlist");
  };

  if (!items.length) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <EmptyState 
          title="Your Collection is Empty" 
          subtitle="Curate your skincare ritual by saving products you love. They will appear here for easy access." 
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-8 pb-12">
      {/* ─── Premium Glass Header ─── */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#CA8A04]/5 blur-[80px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#8A6F5F]/10 blur-[80px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-[#CA8A04] animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A6F5F]">Private Curation</p>
            </div>
            <h2 className="font-['Cormorant'] text-5xl font-light text-[#191919] -ml-0.5">Favourites</h2>
            <p className="max-w-md font-['Montserrat'] text-sm text-[#8A6F5F]/70 leading-relaxed font-medium">Your curated selection of professional skincare formulas and rituals.</p>
          </div>
          
          <button 
            onClick={clearWishlist}
            className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#B5A99A] hover:text-[#CA8A04] transition-all"
          >
            <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
            Clear Collection
          </button>
        </div>

        {/* Floating Stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Saved', val: items.length, icon: Heart, color: 'text-[#CA8A04]' },
            { label: 'Available', val: inStockCount, icon: PackageCheck, color: 'text-emerald-600' },
            { label: 'Total Value', val: formatMoney(totalValue), icon: Sparkles, color: 'text-[#8A6F5F]' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/40 bg-white/30 p-4 transition-all hover:bg-white/50 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <stat.icon size={16} className={`${stat.color} opacity-60`} />
                <span className={`text-[15px] font-black ${stat.color}`}>{stat.val}</span>
              </div>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#8A6F5F]/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Wishlist Grid ─── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const isWaitlisted = waitlistedIds.has(product.id);

          return (
            <div 
              key={product.id} 
              className={`group relative overflow-hidden rounded-[1.5rem] border border-white/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 ${
                isOutOfStock ? 'bg-black/[0.02]' : 'bg-white/60'
              }`}
            >
              {/* Iridescent Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#CA8A04]/5 via-transparent to-[#8A6F5F]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A99A] mb-1">{product.sku}</p>
                    <h3 className="font-['Cormorant'] text-2xl font-bold text-[#191919] leading-tight group-hover:text-[#CA8A04] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => removeProduct(product.id)}
                    className="rounded-full bg-white/80 p-2 text-[#CA8A04] shadow-sm transition-all hover:bg-[#CA8A04] hover:text-white"
                  >
                    <Heart size={14} className="fill-current" />
                  </button>
                </div>

                <p className="font-['Montserrat'] text-[13px] leading-relaxed text-[#8A6F5F] min-h-[3rem] line-clamp-2 italic">
                  {product.description || "Premium clinical formulation tailored for effective results."}
                </p>

                {isOutOfStock && (
                  <div className="mt-4 rounded-xl bg-[#CA8A04]/5 border border-[#CA8A04]/10 p-3">
                    <p className="text-[11px] font-['Montserrat'] font-semibold leading-relaxed text-[#CA8A04]">
                      This product is out of stock. We will notify you when it's back in stock.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-end justify-between border-t border-black/[0.04] pt-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A99A] mb-0.5">Price</p>
                    <p className="text-lg font-black text-[#191919]">{formatMoney(product.priceCents)}</p>
                  </div>
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                    product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {product.stock > 0 ? 'Allocated' : 'Waitlist Only'}
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {isOutOfStock ? (
                     <Button
                      className={`flex-1 rounded-xl h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                        isWaitlisted 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-[#CA8A04] text-white hover:bg-[#B67A03]'
                      }`}
                      onClick={() => toggleWaitlist(product.id)}
                    >
                      {isWaitlisted ? 'Notifications Active' : 'Notify Me'}
                      <ArrowRight size={14} className="ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-[#191919] hover:bg-[#CA8A04] text-white rounded-xl h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95"
                      onClick={() => {
                        const result = addProduct(product, 1);
                        if (result.success) {
                          toast.success(`${product.name} moved to basket`);
                        } else {
                          toast.error(result.error || 'Failed to sync with cart');
                        }
                      }}
                    >
                      <ShoppingCart size={14} className="mr-2" />
                      Move to Basket
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
