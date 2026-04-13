import React, { useRef, useEffect } from 'react';
import { Search, Bell, Heart, ChevronRight, MessageCircle, Sparkles, ArrowRight, ShoppingBag, Stethoscope, Star, FlaskConical, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/layout/BottomNav';
import { ServiceCatalogView } from '@/views/ServiceCatalogView';
import { ProductGrid } from '@/views/ProductGrid';
import { WishlistView } from '@/views/WishlistView';
import { NotificationsView } from '@/views/NotificationsView';
import { CartView } from '@/views/CartView';
import { OrdersView } from '@/views/OrdersView';
import { ProfileView } from '@/views/ProfileView';

interface CustomerMobileViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  cartCount: number;
  wishlistCount: number;
  notificationsCount: number;
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  offerIndex: number;
  setOfferIndex: (fn: (cur: number) => number) => void;
  CUSTOMER_OFFERS: any[];
  clinicId: string;
  handleSignOut: () => void;
  setIsEnquiryOpen: (open: boolean) => void;
}

export const CustomerMobileView: React.FC<CustomerMobileViewProps> = ({
  activeTab,
  setActiveTab,
  user,
  cartCount,
  wishlistCount,
  notificationsCount,
  customerSearch,
  setCustomerSearch,
  offerIndex,
  setOfferIndex,
  CUSTOMER_OFFERS,
  clinicId,
  handleSignOut,
  setIsEnquiryOpen
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [profileSection, setProfileSection] = React.useState<'menu' | 'profile_edit' | 'bookings' | 'orders'>('menu');
  const [bannerProgress, setBannerProgress] = React.useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto Scroll & Progress Logic
  useEffect(() => {
    if (activeTab !== 'Home') return;
    
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setBannerProgress((prev) => {
        if (prev >= 100) {
          if (scrollRef.current) {
            const nextIndex = (offerIndex + 1) % CUSTOMER_OFFERS.length;
            scrollRef.current.scrollTo({
              left: nextIndex * scrollRef.current.clientWidth,
              behavior: 'smooth'
            });
          }
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [offerIndex, CUSTOMER_OFFERS.length, activeTab]);

  // Manual Scroll Sync (and reset progress)
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const clientWidth = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== offerIndex && newIndex < CUSTOMER_OFFERS.length) {
        setOfferIndex(() => newIndex);
        setBannerProgress(0); // Reset progress on manual scroll
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] pb-32 touch-pan-y">
      {/* ═══ Luxury Header ═══ */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md pt-[env(safe-area-inset-top)] border-b border-[#E8E2DC]/30">
        <div className="flex items-center justify-between px-5 py-2.5">
          <img 
            src="/logo.png" 
            alt="The Skin Theory" 
            className="h-6 w-auto cursor-pointer transition-transform active:scale-95" 
            onClick={() => setActiveTab('Home')}
          />
          {['Home', 'Services', 'Products'].includes(activeTab) && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
              <button 
                onClick={() => setActiveTab('Notifications')} 
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-[#D4C8BC] ${
                  activeTab === 'Notifications' ? 'bg-[#8A6F5F] text-white' : 'bg-[#EDE8E3] text-[#8A6F5F]'
                }`}
              >
                <Bell size={17} />
                {notificationsCount > 0 && (
                  <span className={`absolute -right-0.5 -top-0.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[8px] font-bold ring-2 ring-[#FAF8F5] ${
                    activeTab === 'Notifications' ? 'bg-[#CA8A04] text-white' : 'bg-[#8A6F5F] text-white'
                  }`}>
                    {notificationsCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('Wishlists')} 
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-[#D4C8BC] ${
                  activeTab === 'Wishlists' ? 'bg-[#8A6F5F] text-white' : 'bg-[#EDE8E3] text-[#8A6F5F]'
                }`}
              >
                <Heart size={17} />
                {wishlistCount > 0 && (
                  <span className={`absolute -right-0.5 -top-0.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[8px] font-bold ring-2 ring-[#FAF8F5] ${
                    activeTab === 'Wishlists' ? 'bg-[#CA8A04] text-white' : 'bg-[#8A6F5F] text-white'
                  }`}>
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
        {/* Search - Only on catalog/home tabs */}
        {['Home', 'Services', 'Products'].includes(activeTab) && (
          <div className="px-5 pb-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B5A99A]" />
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search treatments, products..."
                className="h-9 w-full rounded-xl border border-[#E8E2DC] bg-white pl-9 pr-4 text-[13px] text-[#2C2420] outline-none transition-all placeholder:text-[#C4B8AA] focus:border-[#8A6F5F] focus:shadow-sm"
              />
            </div>
          </div>
        )}
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1">
        {activeTab === 'Home' && (
          <div className="space-y-5 pt-1">
            {/* ─── Coupon Ribbon ─── */}
            <div className="px-5">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-100/50">
                <Sparkles size={14} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] font-bold text-emerald-800 leading-tight">Welcome Offer: Flat 10% OFF on your first booking. Code: <span className="underline decoration-wavy underline-offset-2">FIRSTGLOW</span></p>
              </div>
            </div>

            {/* ─── Personal Greeting ─── */}
            <section className="px-5 pt-1">
              <p className="text-[11px] font-medium tracking-wider text-[#B5A99A] uppercase">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</p>
              <h2 className="font-['Playfair_Display'] mt-0.5 text-[24px] font-bold tracking-tight text-[#2C2420] leading-tight">
                {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Welcome'}
              </h2>
            </section>

            {/* ─── Scrollable Hero Banners ─── */}
            {CUSTOMER_OFFERS.length > 0 && (
              <section className="px-5">
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
                >
                  {CUSTOMER_OFFERS.map((offer, idx) => (
                    <div 
                      key={idx}
                      className="min-w-full snap-center relative overflow-hidden rounded-[20px] bg-[#2C2420] p-5 shadow-lg"
                    >
                      {/* Subtle warm gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8A6F5F]/30 via-transparent to-[#5D4A3E]/20" />
                      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#8A6F5F]/10 blur-3xl" />

                      <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm border border-white/10">
                          <Sparkles size={9} /> {idx === 0 ? 'Featured Ritual' : 'Special Offer'}
                        </span>
                        <h3 className="font-['Playfair_Display'] mt-3 text-[20px] font-bold leading-tight text-white">
                          {offer.title}
                        </h3>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-white/60 max-w-[90%]">
                          {offer.subtitle}
                        </p>
                        <button
                          className="mt-4 rounded-full bg-white px-5 py-2 text-[12px] font-bold text-[#2C2420] shadow-md active:scale-95 transition-transform"
                          onClick={() => setActiveTab(offer.cta?.includes('Shop') || offer.cta?.includes('Product') ? 'Products' : 'Services')}
                        >
                          {offer.cta}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Visual indicator of total items */}
                <div className="mt-2 flex justify-center gap-1.5">
                  {CUSTOMER_OFFERS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full overflow-hidden transition-all duration-400 bg-[#E8E2DC] ${offerIndex === i ? 'w-8' : 'w-1.5'}`}
                    >
                      {offerIndex === i && (
                        <div 
                          className="h-full bg-[#8A6F5F]"
                          style={{ width: `${bannerProgress}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Quick Actions ─── */}
            <section className="grid grid-cols-2 gap-3 px-5">
              <button
                onClick={() => setActiveTab('Services')}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5F0EB] to-[#EDE8E3] p-5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8A6F5F] text-white shadow-md">
                    <Stethoscope size={18} />
                  </div>
                </div>
                <h4 className="text-[15px] font-semibold text-[#2C2420]">Treatments</h4>
                <p className="mt-0.5 text-[11px] text-[#8A6F5F]">Book a session</p>
                <div className="absolute -bottom-3 -right-3 opacity-[0.06]"><Stethoscope size={72} /></div>
              </button>
              <button
                onClick={() => setActiveTab('Products')}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EDE8E3] to-[#E4DDD6] p-5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2C2420] text-white shadow-md">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <h4 className="text-[15px] font-semibold text-[#2C2420]">Shop</h4>
                <p className="mt-0.5 text-[11px] text-[#8A6F5F]">Curated formulas</p>
                <div className="absolute -bottom-3 -right-3 opacity-[0.06]"><ShoppingBag size={72} /></div>
              </button>
            </section>

            {/* ─── Skin Journey ─── */}
            <section className="px-5">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A6F5F]">Your Journey</p>
                  <h3 className="font-['Playfair_Display'] mt-0.5 text-[18px] font-bold text-[#2C2420]">Clinical Protocol</h3>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                {[
                  { title: 'Consult', phase: '01 · Identify', icon: Stethoscope },
                  { title: 'Routine', phase: '02 · Curate', icon: FlaskConical },
                  { title: 'Treatment', phase: '03 · Transform', icon: Sparkles }
                ].map((item, i) => (
                  <div key={i} className="min-w-[140px] shrink-0 rounded-2xl bg-white border border-[#E8E2DC] p-4 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F0EB] text-[#8A6F5F] mb-4">
                      <item.icon size={16} />
                    </div>
                    <p className="text-[13px] font-semibold text-[#2C2420]">{item.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#B5A99A]">{item.phase}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Specialist Picks ─── */}
            <section className="px-5 pb-4">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A6F5F]">Expert Curated</p>
                  <h3 className="font-['Playfair_Display'] mt-0.5 text-[18px] font-bold text-[#2C2420]">Specialist's Edit</h3>
                </div>
                <button onClick={() => setActiveTab('Products')} className="flex items-center gap-0.5 text-[12px] font-semibold text-[#8A6F5F]">
                  All <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                {[
                  { name: 'Vitamin C 20%', price: '₹2,450', tag: 'Bestseller' },
                  { name: 'Retinol 0.5%', price: '₹3,200', tag: 'Expert Pick' },
                  { name: 'Hydra Cleanser', price: '₹1,250', tag: 'Daily' },
                  { name: 'SPF 50+ Shield', price: '₹1,850', tag: 'Essential' }
                ].map((item, i) => (
                  <div key={i} className="min-w-[150px] shrink-0 rounded-2xl bg-white border border-[#E8E2DC] overflow-hidden shadow-sm">
                    <div className="aspect-[4/3] bg-gradient-to-br from-[#F5F0EB] to-[#EDE8E3] flex items-center justify-center relative">
                      <FlaskConical size={32} className="text-[#8A6F5F]/10" />
                      <span className="absolute top-2 left-2 bg-white/90 rounded-md px-1.5 py-0.5 text-[8px] font-semibold text-[#8A6F5F] tracking-wide">{item.tag}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] font-semibold text-[#2C2420] leading-tight line-clamp-1">{item.name}</p>
                      <p className="mt-1 text-[12px] font-bold text-[#8A6F5F]">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Consultation CTA ─── */}
            <section className="px-5 pb-6">
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="flex w-full items-center gap-4 rounded-2xl bg-white border border-[#E8E2DC] p-5 shadow-sm text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F0EB] text-[#8A6F5F] shrink-0">
                  <MessageCircle size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#2C2420]">Need guidance?</p>
                  <p className="mt-0.5 text-[12px] text-[#B5A99A]">Connect with a skin specialist</p>
                </div>
                <ArrowRight size={16} className="text-[#D4C8BC]" />
              </button>
            </section>
          </div>
        )}

        {/* ═══ View Routing ═══ */}
        <div className={activeTab !== 'Home' ? 'px-4 pt-4' : ''}>
          {activeTab === 'Services' && (
            <ServiceCatalogView 
              clinicId={clinicId} 
              onNavigate={setActiveTab}
              wishlistCount={wishlistCount}
              notificationsCount={notificationsCount}
            />
          )}
          {activeTab === 'Products' && (
            <ProductGrid 
              clinicId={clinicId} 
              onNavigate={setActiveTab}
              wishlistCount={wishlistCount}
              notificationsCount={notificationsCount}
            />
          )}
        {activeTab === 'Wishlists' && <WishlistView />}
        {activeTab === 'Notifications' && (
          <NotificationsView 
            onNavigate={(tab, section) => {
              setActiveTab(tab as any);
              if (section) setProfileSection(section as any);
            }} 
          />
        )}
        {activeTab === 'Cart' && (
          <CartView 
            onProceedToCheckout={() => setActiveTab('Checkout')} 
            onNavigate={setActiveTab}
            wishlistCount={wishlistCount}
            notificationsCount={notificationsCount}
          />
        )}
        {activeTab === 'Checkout' && <OrdersView clinicId={clinicId} showHistory={false} showCheckout />}
        {activeTab === 'Profile' && (
          <ProfileView 
            clinicId={clinicId} 
            onSignOut={handleSignOut} 
            initialSection={profileSection} 
          />
        )}
        </div>
      </main>

      {/* ═══ Bottom Navigation ═══ */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} cartCount={cartCount} />
    </div>
  );
};
