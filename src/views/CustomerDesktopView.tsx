import React from 'react';
import { Search, Bell, Heart, ShoppingCart, User, ChevronRight, MessageCircle, ShieldCheck, FlaskConical, HeartHandshake, ChevronDown, Stethoscope, Instagram, Facebook, Youtube, ArrowRight, Sparkles, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ServiceCatalogView } from '@/views/ServiceCatalogView';
import { ProductGrid } from '@/views/ProductGrid';
import { WishlistView } from '@/views/WishlistView';
import { NotificationsView } from '@/views/NotificationsView';
import { CartView } from '@/views/CartView';
import { OrdersView } from '@/views/OrdersView';
import { ProfileView } from '@/views/ProfileView';

interface CustomerDesktopViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  cartCount: number;
  wishlistCount: number;
  notificationsCount: number;
  ordersCount: number;
  bookingsCount: number;
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  offerIndex: number;
  setOfferIndex: (fn: (cur: number) => number) => void;
  CUSTOMER_OFFERS: any[];
  HOME_FAQS: any[];
  openFaqIndex: number | null;
  setOpenFaqIndex: (fn: (cur: number | null) => number | null) => void;
  clinicId: string;
  handleSignOut: () => void;
  setIsEnquiryOpen: (open: boolean) => void;
}

export const CustomerDesktopView: React.FC<CustomerDesktopViewProps> = ({
  activeTab,
  setActiveTab,
  user,
  cartCount,
  wishlistCount,
  notificationsCount,
  ordersCount,
  bookingsCount,
  customerSearch,
  setCustomerSearch,
  offerIndex,
  setOfferIndex,
  CUSTOMER_OFFERS,
  HOME_FAQS,
  openFaqIndex,
  setOpenFaqIndex,
  clinicId,
  handleSignOut,
  setIsEnquiryOpen
}) => {
  const navTabs = ['Home', 'Services', 'Products'];
  const iconTabs = [
    { id: 'Notifications', icon: Bell, count: notificationsCount },
    { id: 'Wishlists', icon: Heart, count: wishlistCount },
    { id: 'Cart', icon: ShoppingCart, count: cartCount },
    { id: 'Profile', icon: User, count: 0 }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* ─── Minimal Navigation ─── */}
      <nav className="sticky top-0 z-40 border-b border-[#E8E2DC]/60 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <img src="/logo.png" alt="The Skin Theory" className="h-8 w-auto" />
            <div className="flex items-center gap-1">
              {navTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2 text-[13px] font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-[#1A1A1A]'
                      : 'text-[#B5A99A] hover:text-[#8A6F5F]'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#8A6F5F] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5A99A]" />
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search..."
                className="h-9 w-52 rounded-lg border border-[#E8E2DC] bg-[#FAFAF8] pl-9 pr-3 text-[13px] text-[#1A1A1A] outline-none transition-all focus:w-72 focus:border-[#8A6F5F] focus:bg-white"
              />
            </div>
            <div className="ml-2 flex items-center gap-1">
              {iconTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#F5F0EB] text-[#8A6F5F]'
                      : 'text-[#B5A99A] hover:bg-[#FAFAF8] hover:text-[#8A6F5F]'
                  }`}
                >
                  <item.icon size={18} />
                  {item.count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8A6F5F] text-[9px] font-bold text-white">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Page Content ─── */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1120px] px-6 py-10">
        {activeTab === 'Home' && (
          <div className="space-y-16 animate-in fade-in duration-500">
            
            {/* ─── Greeting + Quick Actions ─── */}
            <section>
              <div className="mb-8">
                <p className="text-[12px] font-medium tracking-wide uppercase text-[#B5A99A]">
                  Welcome back
                </p>
                <h2 className="font-['Playfair_Display'] mt-1 text-4xl font-bold tracking-tight text-[#2C2420]">
                  {user?.fullName || user?.email?.split('@')[0] || 'Guest'}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('Services')}
                  className="group flex items-center justify-between rounded-xl border border-[#E8E2DC] bg-white p-6 transition-all hover:border-[#8A6F5F] hover:shadow-sm"
                >
                  <div>
                    <p className="text-left text-base font-semibold text-[#1A1A1A]">Book a Treatment</p>
                    <p className="mt-1 text-[13px] text-[#B5A99A]">Browse clinical services</p>
                  </div>
                  <ArrowRight size={18} className="text-[#B5A99A] transition-transform group-hover:translate-x-1 group-hover:text-[#8A6F5F]" />
                </button>
                <button
                  onClick={() => setActiveTab('Products')}
                  className="group flex items-center justify-between rounded-xl border border-[#E8E2DC] bg-white p-6 transition-all hover:border-[#8A6F5F] hover:shadow-sm"
                >
                  <div>
                    <p className="text-left text-base font-semibold text-[#1A1A1A]">Shop Products</p>
                    <p className="mt-1 text-[13px] text-[#B5A99A]">Professional skincare formulas</p>
                  </div>
                  <ArrowRight size={18} className="text-[#B5A99A] transition-transform group-hover:translate-x-1 group-hover:text-[#8A6F5F]" />
                </button>
              </div>
            </section>

            {/* ─── Featured Offer (Single Panel) ─── */}
            {CUSTOMER_OFFERS.length > 0 && (
              <section className="relative rounded-2xl overflow-hidden bg-[#2C2420] shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8A6F5F]/20 via-transparent to-[#5D4A3E]/30" />
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#8A6F5F]/8 blur-[100px]" />
                <div className="relative flex flex-col md:flex-row">
                  <div className="flex-1 p-12 flex flex-col justify-center">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                      <Sparkles size={10} /> Featured Ritual
                    </span>
                    <h3 className="font-['Playfair_Display'] mt-5 text-3xl font-bold tracking-tight text-white leading-tight">
                      {CUSTOMER_OFFERS[offerIndex]?.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/50 max-w-md">
                      {CUSTOMER_OFFERS[offerIndex]?.subtitle}
                    </p>
                    <div className="mt-8 flex items-center gap-5">
                      <Button
                        onClick={() => setActiveTab(CUSTOMER_OFFERS[offerIndex]?.cta?.toLowerCase().includes('product') ? 'Products' : 'Services')}
                        className="h-11 rounded-xl bg-[#FAF8F5] px-7 text-[13px] font-semibold text-[#2C2420] hover:bg-white shadow-lg transition-all"
                      >
                        {CUSTOMER_OFFERS[offerIndex]?.cta}
                      </Button>
                      <div className="flex gap-1.5">
                        {CUSTOMER_OFFERS.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setOfferIndex(() => i)}
                            className={`h-1.5 rounded-full transition-all ${
                              offerIndex === i ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-72 w-full md:h-auto md:w-96 bg-gradient-to-br from-[#3A302B] to-[#2C2420] flex items-center justify-center">
                    <Sparkles size={80} className="text-[#8A6F5F]/15" />
                  </div>
                </div>
              </section>
            )}

            {/* ─── Shop by Concern ─── */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Categories</p>
                  <h3 className="font-['Playfair_Display'] mt-1 text-2xl font-bold text-[#2C2420]">Shop by Concern</h3>
                </div>
                <button
                  onClick={() => setActiveTab('Products')}
                  className="group flex items-center gap-1 text-[13px] font-medium text-[#8A6F5F] hover:underline underline-offset-4"
                >
                  View all <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: FlaskConical, label: 'Acne Control', desc: 'Clinical protocols' },
                  { icon: Sparkles, label: 'Anti-Aging', desc: 'Regenerative care' },
                  { icon: Star, label: 'Pigmentation', desc: 'Even tone therapy' },
                  { icon: ShieldCheck, label: 'Daily Protection', desc: 'SPF & barrier' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab('Products')}
                    className="group flex flex-col items-center rounded-xl border border-[#E8E2DC] bg-white p-6 text-center transition-all hover:border-[#8A6F5F] hover:shadow-sm"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F0EB] text-[#8A6F5F] transition-colors group-hover:bg-[#8A6F5F] group-hover:text-white">
                      <item.icon size={22} />
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{item.label}</p>
                    <p className="mt-1 text-[12px] text-[#B5A99A]">{item.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* ─── Specialist's Edit ─── */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Curated</p>
                  <h3 className="font-['Playfair_Display'] mt-1 text-2xl font-bold text-[#2C2420]">Specialist's Edit</h3>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { title: 'Vitamin C 20% + HA', price: '₹2,450', tag: 'Bestseller' },
                  { title: 'Retinol Complex 0.5%', price: '₹3,200', tag: 'Expert Pick' },
                  { title: 'Hydrating Cleanser', price: '₹1,250', tag: 'Daily Essential' },
                  { title: 'SPF 50+ Invisible', price: '₹1,850', tag: 'Must Have' }
                ].map((item, i) => (
                  <div key={i} className="group rounded-xl border border-[#E8E2DC] bg-white overflow-hidden transition-all hover:border-[#8A6F5F] hover:shadow-sm">
                    <div className="aspect-square bg-[#F5F0EB] flex items-center justify-center relative">
                      <FlaskConical size={48} className="text-[#8A6F5F]/10" />
                      <span className="absolute top-3 left-3 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A6F5F] border border-[#E8E2DC]">
                        {item.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-[#1A1A1A]">{item.title}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#8A6F5F]">{item.price}</p>
                        <button
                          onClick={() => setActiveTab('Products')}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F0EB] text-[#8A6F5F] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#8A6F5F] hover:text-white"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Trust + FAQ ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-[#E8E2DC] bg-white p-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Why us</p>
                <h3 className="font-['Playfair_Display'] mt-1 text-2xl font-bold text-[#2C2420]">Clinical Standard</h3>
                <div className="mt-8 space-y-6">
                  {[
                    { icon: ShieldCheck, title: 'Medical-Grade Purity', text: 'Research-validated products for safety and efficacy.' },
                    { icon: Stethoscope, title: 'Specialist Access', text: 'Direct consultation with MD-qualified dermatologists.' },
                    { icon: HeartHandshake, title: 'Integrated Care', text: 'Seamless clinic treatment and follow-up plans.' }
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F0EB] text-[#8A6F5F]">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1A1A1A]">{item.title}</h4>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-[#B5A99A]">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#E8E2DC] bg-white p-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Help</p>
                <h3 className="font-['Playfair_Display'] mt-1 text-2xl font-bold text-[#2C2420]">Common Questions</h3>
                <div className="mt-8 space-y-3">
                  {HOME_FAQS.slice(0, 4).map((faq, idx) => (
                    <div key={faq.q} className="rounded-lg border border-[#E8E2DC] overflow-hidden transition-colors hover:border-[#D4C8BC]">
                      <button
                        onClick={() => setOpenFaqIndex((prev) => (prev === idx ? null : idx))}
                        className="flex w-full items-center justify-between p-4 text-left"
                      >
                        <span className="text-[13px] font-medium text-[#1A1A1A]">{faq.q}</span>
                        <ChevronDown size={16} className={`shrink-0 text-[#B5A99A] transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="border-t border-[#E8E2DC] px-4 pb-4 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                          <p className="text-[13px] leading-relaxed text-[#8A6F5F]">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ─── View Routing ─── */}
        {activeTab === 'Services' && <ServiceCatalogView clinicId={clinicId} />}
        {activeTab === 'Products' && <ProductGrid clinicId={clinicId} />}
        {activeTab === 'Wishlists' && <WishlistView />}
        {activeTab === 'Notifications' && <NotificationsView />}
        {activeTab === 'Cart' && <CartView onProceedToCheckout={() => setActiveTab('Checkout')} />}
        {activeTab === 'Checkout' && <OrdersView clinicId={clinicId} showHistory={false} showCheckout />}
        {activeTab === 'Profile' && <ProfileView clinicId={clinicId} onSignOut={handleSignOut} />}
        </div>
      </main>

      {/* ─── Enquiry FAB ─── */}
      <button
        onClick={() => setIsEnquiryOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-lg transition-all hover:bg-[#8A6F5F] hover:scale-105"
      >
        <MessageCircle size={20} />
      </button>

      {/* ─── Minimal Footer ─── */}
      <footer className="border-t border-[#E8E2DC] bg-white">
        <div className="mx-auto max-w-[1120px] px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <img src="/logo.png" alt="The Skin Theory" className="h-8 w-auto" />
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#B5A99A]">
                A premium dermatology destination. Specialist-led, evidence-based, and patient-centric care.
              </p>
              <div className="mt-6 flex gap-3">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <button key={i} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8E2DC] text-[#B5A99A] transition-colors hover:border-[#8A6F5F] hover:text-[#8A6F5F]">
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Location</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#1A1A1A]">
                3rd Floor, Rd No 36,<br />
                above SKODA Showroom,<br />
                Jubilee Hills, Hyderabad - 500033
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A6F5F]">Contact</p>
              <div className="mt-3 space-y-2">
                <p className="text-[13px] text-[#1A1A1A]">040 69293000</p>
                <p className="text-[13px] text-[#1A1A1A]">care@theskintheory.com</p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-[#E8E2DC] pt-6">
            <p className="text-[12px] text-[#B5A99A]">
              © {new Date().getFullYear()} The Skin Theory. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Terms', 'Privacy', 'Compliance'].map((item) => (
                <button key={item} className="text-[12px] text-[#B5A99A] hover:text-[#8A6F5F] transition-colors">{item}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
