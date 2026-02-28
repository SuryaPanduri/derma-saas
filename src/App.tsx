import { useEffect, useMemo, useState } from 'react';
import { services } from '@/api/repositories/serviceProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBookings, useCreateEnquiry, useOrders } from '@/hooks';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { AdminDashboard } from '@/views/AdminDashboard';
import { AuthPage } from '@/views/AuthPage';
import { CartView } from '@/views/CartView';
import { OrdersView } from '@/views/OrdersView';
import { ProductGrid } from '@/views/ProductGrid';
import { ProfileView } from '@/views/ProfileView';
import { ServiceCatalogView } from '@/views/ServiceCatalogView';
import { WishlistView } from '@/views/WishlistView';
import { NotificationsView } from '@/views/NotificationsView';
import {
  Baby,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FlaskConical,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  ScanFace,
  Search,
  ShoppingCart,
  Heart,
  Star,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  User
} from 'lucide-react';

const CLINIC_ID = 'clinic-001';

type AuthMode = 'signin' | 'signup';

const DOC_REVIEWS = [
  {
    name: 'Aaradhya S.',
    role: 'Google Review',
    text: 'Doctor made me feel at ease and explained every step clearly. My skin improved within weeks and the follow-up care was excellent.'
  },
  {
    name: 'Rahul V.',
    role: 'Google Review',
    text: 'Very professional consultation and treatment planning. The clinic staff was friendly and the process was smooth from start to finish.'
  },
  {
    name: 'Sneha P.',
    role: 'Google Review',
    text: 'I came in for acne and pigmentation concerns. The personalized plan really worked and I finally feel confident in my skin.'
  },
  {
    name: 'Kiran M.',
    role: 'Google Review',
    text: 'Clear diagnosis, practical routine, and visible results. Highly recommended for anyone looking for specialist dermatology care.'
  }
];

const CUSTOMER_OFFERS = [
  { title: 'Summer Skin Reset', subtitle: 'Flat 20% off on laser and peel consultations this week.', cta: 'Explore Services' },
  { title: 'Hydration Recovery Kit', subtitle: 'Buy 2 skincare products and get 15% instant discount.', cta: 'Shop Products' },
  { title: 'First Visit Offer', subtitle: 'Up to Rs 500 off on your first dermatologist appointment.', cta: 'Book Now' },
  { title: 'Glow Month Campaign', subtitle: 'Combo bundles on services + products with limited stock.', cta: 'Grab Offer' },
  { title: 'Acne Action Package', subtitle: 'Book acne consult + routine starter and save 18% today.', cta: 'View Services' },
  { title: 'Weekend Checkout Deal', subtitle: 'Extra 10% off on orders above Rs 1999 this weekend.', cta: 'Shop Now' }
];

const LANDING_TREATMENTS = [
  {
    title: 'Acne & Pigmentation Program',
    duration: '45 min consultation',
    description: 'Clinical diagnosis and custom routines for acne scars, pigmentation, and texture correction.'
  },
  {
    title: 'Laser Hair Reduction',
    duration: '30-60 min session',
    description: 'Safe, protocol-led laser sessions for long-term hair reduction with dermatologist supervision.'
  },
  {
    title: 'Anti-Aging Skin Review',
    duration: '40 min consultation',
    description: 'Targeted planning for fine lines, elasticity, hydration, and preventive skin rejuvenation.'
  },
  {
    title: 'Pediatric Dermatology Care',
    duration: '30 min consultation',
    description: 'Specialized skin care for children with sensitive, eczema-prone, or allergy-prone skin.'
  }
];

const LANDING_PRODUCTS = [
  {
    name: 'Barrier Repair Serum',
    sku: 'BRS-120',
    price: 'Rs 1,499',
    description: 'Ceramide-rich daily serum for hydration and barrier support.'
  },
  {
    name: 'Daily UV Defense SPF 50',
    sku: 'SPF-230',
    price: 'Rs 1,299',
    description: 'Broad-spectrum sunscreen formulated for Indian skin tones.'
  },
  {
    name: 'Clarifying Cleanser',
    sku: 'CLC-310',
    price: 'Rs 899',
    description: 'Gentle cleansing gel for acne-prone and combination skin.'
  },
  {
    name: 'Overnight Renewal Cream',
    sku: 'ONR-440',
    price: 'Rs 1,799',
    description: 'Night cream with active renewal complex for smoother skin.'
  }
];

const HOME_FAQS = [
  {
    q: 'How do I book a consultation?',
    a: 'Open Services, choose a treatment, and confirm your preferred date and slot.'
  },
  {
    q: 'Can I order products after consultation?',
    a: 'Yes, recommended products can be added from Products and placed through checkout.'
  },
  {
    q: 'How do I track my appointments and orders?',
    a: 'Use your profile and orders sections to view booking and purchase activity.'
  },
  {
    q: 'Will I get follow-up support?',
    a: 'Yes, follow-ups are planned as part of your treatment journey whenever required.'
  }
];

const mapAuthError = (error: unknown, fallback: string): string => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
    return 'Invalid email or password.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'No account found for this email.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please sign in.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please try again later.';
  }

  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : fallback;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [offerIndex, setOfferIndex] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [landingTab, setLandingTab] = useState<'Home' | 'Treatments' | 'Products' | 'About'>('Home');
  const [landingSearch, setLandingSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryMobile, setEnquiryMobile] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [notificationsClearedBeforeISO, setNotificationsClearedBeforeISO] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const userOrdersQuery = useOrders(user?.id ?? '');
  const userBookingsQuery = useBookings(user?.id ?? '');
  const createEnquiry = useCreateEnquiry();
  const [route, setRoute] = useState<'landing' | 'auth'>(() =>
    typeof window !== 'undefined' && window.location.pathname === '/auth' ? 'auth' : 'landing'
  );

  const isAdmin = user?.role === 'admin';
  const ordersCount = userOrdersQuery.data.length;
  const bookingsCount = userBookingsQuery.data.length;
  const notificationsStorageKey = useMemo(() => `notifications_cleared_before_${user?.id ?? 'guest'}`, [user?.id]);
  const notificationsCount = useMemo(() => {
    const clearedBeforeMs = notificationsClearedBeforeISO ? new Date(notificationsClearedBeforeISO).getTime() : 0;
    const orderNotifications = userOrdersQuery.data.filter((order) => {
      const createdAtMs = new Date(order.createdAt).getTime();
      if (!Number.isFinite(createdAtMs)) {
        return false;
      }
      return !clearedBeforeMs || createdAtMs > clearedBeforeMs;
    }).length;
    const bookingNotifications = userBookingsQuery.data.filter((booking) => {
      const createdAtMs = new Date(booking.createdAt).getTime();
      if (!Number.isFinite(createdAtMs)) {
        return false;
      }
      return !clearedBeforeMs || createdAtMs > clearedBeforeMs;
    }).length;
    return orderNotifications + bookingNotifications;
  }, [notificationsClearedBeforeISO, userBookingsQuery.data, userOrdersQuery.data]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setNotificationsClearedBeforeISO(window.localStorage.getItem(notificationsStorageKey));
  }, [notificationsStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== notificationsStorageKey) {
        return;
      }
      setNotificationsClearedBeforeISO(event.newValue);
    };
    const onClearedUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ storageKey?: string; clearedBeforeISO?: string }>;
      if (customEvent.detail?.storageKey !== notificationsStorageKey) {
        return;
      }
      setNotificationsClearedBeforeISO(customEvent.detail?.clearedBeforeISO ?? null);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('notifications-cleared-updated', onClearedUpdated as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('notifications-cleared-updated', onClearedUpdated as EventListener);
    };
  }, [notificationsStorageKey]);

  useEffect(() => {
    const load = async () => {
      await services.authService.signOut();
      setUser(null);
    };

    void load();
  }, [setUser]);

  useEffect(() => {
    if (isAdmin && activeTab !== 'Admin') {
      setActiveTab('Admin');
      return;
    }

    if (!isAdmin && activeTab === 'Admin') {
      setActiveTab('Home');
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname === '/auth' ? 'auth' : 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (user) {
      return;
    }
    const timer = window.setInterval(() => {
      setReviewIndex((current) => (current + 1) % DOC_REVIEWS.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (!user || isAdmin) {
      return;
    }
    const timer = window.setInterval(() => {
      setOfferIndex((current) => (current + 1) % CUSTOMER_OFFERS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [user, isAdmin]);

  const refreshRole = async () => {
    const refreshed = await services.authService.getCurrentUser();
    if (refreshed && user && refreshed.id !== user.id) {
      setAuthError('Detected account change from another tab/session. Please sign in again.');
      await services.authService.signOut();
      setUser(null);
      return;
    }

    if (refreshed) {
      setUser(refreshed);
    }
  };

  const resetAuthMessages = () => {
    setAuthError('');
    setAuthInfo('');
  };

  const openAuthPage = () => {
    setAuthMode('signin');
    resetAuthMessages();
    setRoute('auth');
    window.history.pushState({}, '', '/auth');
  };

  const goToLanding = () => {
    setRoute('landing');
    window.history.pushState({}, '', '/');
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required.');
      return;
    }

    try {
      setIsSubmittingAuth(true);
      resetAuthMessages();
      const signedIn = await services.authService.signIn(email.trim(), password);
      setUser(signedIn);
      goToLanding();
      await refreshRole();
    } catch (error) {
      setAuthError(mapAuthError(error, 'Failed to sign in.'));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Password and confirm password must match.');
      return;
    }

    try {
      setIsSubmittingAuth(true);
      resetAuthMessages();
      const created = await services.authService.signUp(email.trim(), password, 'customer');
      setUser(created);
      goToLanding();
      await refreshRole();
      setAuthInfo('Account created with customer role. Admin role must be granted separately.');
    } catch (error) {
      setAuthError(mapAuthError(error, 'Failed to sign up.'));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await services.authService.signOut();
    setUser(null);
    setAuthMode('signin');
    goToLanding();
    setPassword('');
    setConfirmPassword('');
    resetAuthMessages();
  };

  const handleSubmitEnquiry = async () => {
    if (!user) {
      setEnquiryMessage('Please sign in to submit an enquiry.');
      return;
    }
    const fullName = enquiryName.trim();
    const emailValue = enquiryEmail.trim();
    const digits = enquiryMobile.replace(/\D/g, '');
    if (!fullName || !emailValue || digits.length !== 10) {
      setEnquiryMessage('Please enter name, valid email, and 10-digit mobile number.');
      return;
    }

    try {
      await createEnquiry.mutateAsync({
        clinicId: CLINIC_ID,
        fullName,
        email: emailValue,
        mobile: `+91${digits}`
      });
      setEnquiryMessage('Enquiry submitted successfully.');
      setEnquiryName('');
      setEnquiryEmail('');
      setEnquiryMobile('');
      window.setTimeout(() => {
        setIsEnquiryOpen(false);
        setEnquiryMessage('');
      }, 1000);
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed to submit enquiry.';
      setEnquiryMessage(message);
    }
  };

  return (
    <DashboardLayout hideHeader={!user} fullBleed>
      {!user && route !== 'auth' ? (
        <div className="w-full">
          <section className="bg-[#0e3034]">
            <div className="w-full bg-[#245f65]">
              <div className="space-y-2">
                <div className="rounded-none bg-[#f3f5f6]">
                  <div className="bg-[#0f4a52] px-4 py-2 text-center text-sm font-semibold text-[#dbe8ea] md:text-base">
                    Feel Confident in Your Skin! Personalized Dermatology Care in Hyderabad.
                  </div>
                  <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-5">
                    <h3 className="text-2xl font-bold text-[#12353a] sm:text-3xl md:text-4xl">The Skin Theory</h3>
                    <div className="hidden items-center gap-3 text-lg text-[#4d6165] md:flex">
                      {(['Home', 'Treatments', 'Products', 'About'] as const).map((item) => (
                        <button
                          key={item}
                          onClick={() => setLandingTab(item)}
                          className={`rounded-full px-4 py-2 font-bold transition-all duration-300 ${
                            landingTab === item
                              ? 'bg-[#0f4a52] text-white shadow-sm'
                              : 'text-[#385257] hover:bg-[#dce8ea] hover:text-[#0f4a52] hover:shadow-sm'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="order-3 w-full md:order-none md:flex md:flex-1 md:items-center md:justify-end md:gap-3 md:max-w-xl">
                      <div className="relative w-full">
                        <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#6b7f83]" />
                        <input
                          value={landingSearch}
                          onChange={(e) => setLandingSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') return;
                            const q = landingSearch.trim().toLowerCase();
                            if (q.includes('treat')) setLandingTab('Treatments');
                            else if (q.includes('product')) setLandingTab('Products');
                            else if (q.includes('about') || q.includes('contact')) setLandingTab('About');
                            else setLandingTab('Home');
                          }}
                          placeholder="Search treatments, products, about..."
                          className="h-10 w-full rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] pl-9 pr-3 text-sm text-[#12353a] outline-none focus:border-[#0f4a52]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[#12353a]">
                      <button
                        aria-label="Open cart"
                        className="rounded-full p-2 transition-all duration-300 hover:bg-[#dce8ea] hover:text-[#0f4a52]"
                        onClick={openAuthPage}
                      >
                        <ShoppingCart size={20} />
                      </button>
                      <button
                        onClick={openAuthPage}
                        aria-label="Open sign in and sign up"
                        className="rounded-full p-2 transition-all duration-300 hover:bg-[#dce8ea] hover:text-[#0f4a52]"
                      >
                        <User size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="border-b border-slate-200 bg-white/95 px-3 py-2 md:hidden">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {(['Home', 'Treatments', 'Products', 'About'] as const).map((item) => (
                        <button
                          key={`m-${item}`}
                          onClick={() => setLandingTab(item)}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                            landingTab === item ? 'bg-[#0f4a52] text-white' : 'bg-[#eef4f5] text-[#385257]'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {landingTab === 'Home' ? (
                    <>
                      <div className="p-4 sm:p-8 md:p-12">
                        <div className="relative overflow-hidden rounded-[40px]">
                          <img
                            src="/hero-skin-clinic.svg"
                            alt="Dermatology clinic visual"
                            className="hero-image-motion h-[320px] w-full object-cover blur-[1.5px] sm:h-[420px] md:h-[540px]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#2b4f53]/78 to-[#2b4f53]/38" />
                          <div className="hero-overlay-motion absolute -left-10 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                          <div className="absolute inset-0 backdrop-blur-[1px]" />
                          <div className="absolute inset-0 flex items-center">
                            <div className="mx-auto max-w-xl px-6 text-center text-white md:px-10">
                              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-7xl">Feel Confident in Your Skin!</h2>
                              <p className="mt-4 text-sm leading-relaxed text-slate-100 sm:text-base md:mt-6 md:text-lg">
                                Experience personalized dermatology care at our state-of-the-art Hyderabad clinic.
                              </p>
                              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row sm:gap-3 md:mt-8">
                                <Button
                                  className="rounded-full bg-[#0f4a52] px-6 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0a3a41] hover:shadow-lg"
                                  onClick={openAuthPage}
                                >
                                  Book Appointment
                                </Button>
                                <Button
                                  className="rounded-full bg-[#0f4a52] px-6 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0a3a41] hover:shadow-lg"
                                  onClick={() => setLandingTab('Treatments')}
                                >
                                  Treatments
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#0f454e] px-4 py-7 text-white sm:px-5 sm:py-8">
                        <h3 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">Comprehensive Skin & Aesthetic Expertise</h3>
                        <div className="mt-7 grid gap-6 text-center sm:grid-cols-2 md:grid-cols-4">
                          {[
                            { icon: Stethoscope, title: 'Adult Dermatology' },
                            { icon: Baby, title: 'Pediatric Dermatology' },
                            { icon: Sparkles, title: 'Aesthetics & Fillers' },
                            { icon: ScanFace, title: 'Laser & Hair Care' }
                          ].map((item) => (
                            <div key={item.title} className="flex flex-col items-center justify-start gap-2 text-center">
                              <item.icon className="text-white" size={24} />
                              <p className="max-w-[180px] text-sm font-semibold leading-snug">{item.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-8 text-center sm:px-6 md:px-12 md:py-12">
                        <h3 className="text-3xl font-bold leading-tight text-[#12353a] sm:text-4xl md:text-6xl">
                          State-of-the-art skin technology
                        </h3>
                        <p className="mx-auto mt-4 max-w-4xl text-sm leading-relaxed text-[#50666b] sm:text-base md:mt-5 md:text-lg">
                          Our skincare specialists use advanced equipment to create personalized treatment plans including laser hair removal,
                          microdermabrasion, skin rejuvenation, and more.
                        </p>
                        <Button className="mt-6 rounded-full bg-[#0f4a52] px-7 text-white hover:bg-[#0a3a41]">Learn More</Button>
                      </div>

                      <div className="space-y-5 overflow-hidden rounded-none bg-[#f3f5f6] p-2 sm:p-3 md:p-5">
                        <div className="grid gap-4 rounded-xl bg-white p-3 sm:p-4 md:grid-cols-[1fr_1.2fr]">
                          <div className="rounded-xl border border-slate-200 bg-[#f7f8f9] p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <h4 className="text-2xl font-bold text-[#12353a]">Reviews</h4>
                                <p className="text-sm text-[#566d72]">4.9 based on 117 reviews</p>
                                <a
                                  href="https://maps.google.com"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#d5e4e7] bg-white px-2.5 py-1 text-xs font-semibold text-[#0f4a52] transition hover:bg-[#e7eef0]"
                                >
                                  <Star size={12} />
                                  Google Maps Reviews
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setReviewIndex((current) => (current - 1 + DOC_REVIEWS.length) % DOC_REVIEWS.length)}
                                  className="rounded-full bg-white p-2 text-[#12353a] transition hover:bg-slate-100"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <button
                                  onClick={() => setReviewIndex((current) => (current + 1) % DOC_REVIEWS.length)}
                                  className="rounded-full bg-white p-2 text-[#12353a] transition hover:bg-slate-100"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                              <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{
                                  width: `${DOC_REVIEWS.length * 100}%`,
                                  transform: `translateX(-${reviewIndex * (100 / DOC_REVIEWS.length)}%)`
                                }}
                              >
                                {DOC_REVIEWS.map((review) => (
                                  <div
                                    key={`${review.name}-${review.role}`}
                                    className="shrink-0 p-4"
                                    style={{ width: `${100 / DOC_REVIEWS.length}%` }}
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-[#12353a]">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                          <Star key={`${review.name}-star-${index}`} size={14} className="fill-current" />
                                        ))}
                                      </div>
                                      <Quote size={16} className="text-[#6f8488]" />
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#566d72]">{review.text}</p>
                                    <p className="mt-3 text-sm font-semibold text-[#12353a]">{review.name}</p>
                                    <p className="text-xs text-[#6f8488]">{review.role}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                            <div>
                              <h3 className="text-3xl font-bold text-[#12353a] md:text-5xl">Meet Our Doc</h3>
                              <p className="mt-2 text-sm leading-relaxed text-[#4f666b] sm:text-base md:mt-3 md:text-lg">
                                “We believe beauty begins within you and we aim to help you feel beautiful, look beautiful, and be beautiful.”
                              </p>
                              <p className="mt-2 text-sm font-semibold text-[#12353a] sm:text-base md:mt-3 md:text-lg">Dr. Guruvani Ravu, MD Dermatology</p>
                              <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d5e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f4a52] sm:text-sm">
                                <Stethoscope size={15} />
                                Lead Dermatologist
                              </span>
                            </div>
                            <div className="mx-auto w-36 overflow-hidden rounded-xl bg-[#e8e3db] sm:w-44 md:w-56">
                              <img src="/Dr.-Guruvani-Ravu-min.webp" alt="Dr. Guruvani Ravu" className="h-full w-full object-cover" />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <h4 className="text-center text-2xl font-bold text-[#12353a] sm:text-3xl md:text-5xl">Follow the Freshness</h4>
                          <p className="mt-1 text-center text-xs text-[#566d72]">Skincare like it should be: simple, effective, bespoke.</p>
                          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                              <div key={idx} className="h-[180px] rounded-xl bg-[linear-gradient(130deg,#b5bcc3,#d2d6dc)] md:h-[196px] lg:h-[212px]" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {landingTab === 'Treatments' ? (
                    <div className="p-4 sm:p-6 md:p-12">
                      <div className="mb-6 rounded-3xl bg-[linear-gradient(120deg,#edf3f4,#dde9eb,#f2f6f7)] p-6 md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7f83]">Treatments</p>
                        <h2 className="mt-2 text-4xl font-bold text-[#12353a] md:text-5xl">Specialist Dermatology Programs</h2>
                        <p className="mt-3 max-w-3xl text-base text-[#4f666b]">
                          Personalized skin treatments designed by our specialists, built on diagnosis, safety protocols, and follow-up plans.
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {LANDING_TREATMENTS.map((item) => (
                          <div key={item.title} className="rounded-2xl border border-[#d5e4e7] bg-white p-5">
                            <div className="flex items-center gap-2 text-[#0f4a52]">
                              <Stethoscope size={16} />
                              <p className="text-xs font-semibold uppercase tracking-[0.14em]">{item.duration}</p>
                            </div>
                            <h3 className="mt-2 text-2xl font-bold text-[#12353a]">{item.title}</h3>
                            <p className="mt-2 text-sm text-[#4f666b]">{item.description}</p>
                            <Button className="mt-4 bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={openAuthPage}>
                              Book Treatment
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {landingTab === 'Products' ? (
                    <div className="p-4 sm:p-6 md:p-12">
                      <div className="mb-6 rounded-3xl bg-[linear-gradient(120deg,#f1eadf,#ede2d3,#f7f1e8)] p-6 md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7f83]">Products</p>
                        <h2 className="mt-2 text-4xl font-bold text-[#12353a] md:text-5xl">Dermatology Product Essentials</h2>
                        <p className="mt-3 max-w-3xl text-base text-[#4f666b]">
                          Curated skincare formulations aligned to clinic protocols for cleansing, barrier support, sun care, and long-term maintenance.
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {LANDING_PRODUCTS.map((item) => (
                          <div key={item.sku} className="rounded-2xl border border-[#e6dfd3] bg-[#FAF8F4] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">{item.sku}</p>
                            <h3 className="mt-2 text-2xl font-bold text-[#1E1E1E]">{item.name}</h3>
                            <p className="mt-2 text-sm text-[#6B6B6B]">{item.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                              <p className="text-lg font-bold text-[#4E5D4A]">{item.price}</p>
                              <Button className="bg-[#4E5D4A] text-white hover:bg-[#3d4a39]" onClick={openAuthPage}>
                                View Product
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {landingTab === 'About' ? (
                    <div className="p-4 sm:p-6 md:p-12">
                      <div className="rounded-3xl border border-[#d5e4e7] bg-white p-6 md:p-8">
                        <h2 className="text-4xl font-bold text-[#12353a] md:text-5xl">About The Skin Theory</h2>
                        <p className="mt-4 text-base leading-relaxed text-[#4f666b]">
                          We deliver evidence-led dermatology, aesthetics, and preventive skin care through specialist consultations and personalized plans.
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div className="rounded-xl bg-[#f7f9fa] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7f83]">Contact</p>
                            <p className="mt-2 text-sm text-[#12353a]">040 69293000 / +91 9888742222</p>
                            <p className="text-sm text-[#12353a]">info@theskintheory.com</p>
                          </div>
                          <div className="rounded-xl bg-[#f7f9fa] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7f83]">Clinic Address</p>
                            <p className="mt-2 text-sm text-[#12353a]">
                              3rd Floor, Rd No 36, above SKODA Showroom, Jubilee Hills, Hyderabad - 500033
                            </p>
                          </div>
                        </div>
                        <Button className="mt-6 bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={openAuthPage}>
                          Continue to Portal
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="bg-[#0f454e] px-4 py-7 text-[#dbe8ea] sm:px-6 md:px-10">
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <h4 className="text-3xl font-semibold text-white">Skin Theory</h4>
                    <p className="mt-2 text-sm">Skincare like it should be: simple, effective, bespoke.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Main Page</p>
                    <p className="mt-2 text-sm">Home</p>
                    <p className="text-sm">Treatments</p>
                    <p className="text-sm">About</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Contact</p>
                    <p className="mt-2 flex items-center gap-2 text-sm">
                      <Phone size={14} /> 040 69293000
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Phone size={14} /> +91 9888742222
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Mail size={14} /> info@theskintheory.com
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <p className="mt-2 flex items-start gap-2 text-sm">
                      <MapPin size={14} className="mt-0.5" />
                      3rd Floor, Rd No 36, above SKODA Showroom, Jubilee Hills, Hyderabad - 500033
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {!user && route === 'auth' ? (
        <AuthPage
          authMode={authMode}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          authError={authError}
          authInfo={authInfo}
          isSubmittingAuth={isSubmittingAuth}
          onAuthModeChange={setAuthMode}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onBack={goToLanding}
          onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}
        />
      ) : null}

      {user ? (
        isAdmin ? (
          <div className="min-h-[calc(100vh-118px)] px-6 pb-8 md:px-10">
            <AdminDashboard clinicId={CLINIC_ID} onSignOut={handleSignOut} />
          </div>
        ) : (
          <div className="flex min-h-[calc(100vh-118px)] flex-col px-3 sm:px-6 md:px-10">
            <nav className="sticky top-2 z-20 rounded-2xl border border-[#d5e4e7] bg-white/95 p-3 shadow-sm backdrop-blur md:top-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <h2 className="mr-1 shrink-0 text-lg font-bold text-[#12353a] sm:mr-2 sm:text-xl md:text-2xl">The Skin Theory</h2>
                  {['Home', 'Services', 'Products'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                        activeTab === tab ? 'bg-[#0f4a52] text-white' : 'text-[#12353a] hover:bg-[#e7eef0]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex flex-1 items-center gap-2 lg:max-w-2xl">
                  <div className="relative w-full">
                    <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#6b7f83]" />
                    <input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        const q = customerSearch.trim().toLowerCase();
                        if (q.includes('service')) setActiveTab('Services');
                        else if (q.includes('product')) setActiveTab('Products');
                        else if (q.includes('wish')) setActiveTab('Wishlists');
                        else if (q.includes('notify') || q.includes('alert')) setActiveTab('Notifications');
                        else if (q.includes('booking') || q.includes('appointment')) setActiveTab('Profile');
                        else if (q.includes('profile')) setActiveTab('Profile');
                        else if (q.includes('checkout')) setActiveTab('Checkout');
                        else if (q.includes('order') || q.includes('cart')) setActiveTab('Cart');
                        else setActiveTab('Home');
                      }}
                      placeholder="Search services, products, profile..."
                      className="h-10 w-full rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] pl-9 pr-3 text-sm text-[#12353a] outline-none focus:border-[#0f4a52]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setActiveTab('Notifications')}
                    className="relative rounded-full p-2 text-[#4f666b] transition hover:bg-[#e7eef0] hover:text-[#0f4a52]"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {notificationsCount > 0 ? (
                      <span className="absolute -right-1 -top-1 rounded-full bg-[#0f4a52] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {notificationsCount}
                      </span>
                    ) : null}
                  </button>
                  <button
                    onClick={() => setActiveTab('Wishlists')}
                    className="rounded-full p-2 text-[#4f666b] transition hover:bg-[#e7eef0] hover:text-[#0f4a52]"
                    title="Wishlist"
                    aria-label="Wishlist"
                  >
                    <div className="relative">
                      <Heart size={20} />
                      {wishlistCount > 0 ? (
                        <span className="absolute -right-2 -top-2 rounded-full bg-[#0f4a52] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {wishlistCount}
                        </span>
                      ) : null}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('Cart')}
                    className="relative rounded-full p-2 text-[#4f666b] transition hover:bg-[#e7eef0] hover:text-[#0f4a52]"
                    title="Cart"
                    aria-label="Cart"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 ? (
                      <span className="absolute -right-1 -top-1 rounded-full bg-[#0f4a52] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    ) : null}
                  </button>
                  <button
                    onClick={() => setActiveTab('Profile')}
                    className="relative rounded-full p-2 text-[#4f666b] transition hover:bg-[#e7eef0] hover:text-[#0f4a52]"
                    title="Profile"
                    aria-label="Profile"
                  >
                    <User size={20} />
                    {Math.max(cartCount, ordersCount, bookingsCount) > 0 ? (
                      <span className="absolute -right-1 -top-1 rounded-full bg-[#0f4a52] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {Math.max(cartCount, ordersCount, bookingsCount)}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            </nav>

            <div className="mt-6">
            {['Home', 'Services', 'Products'].includes(activeTab) ? (
            <section className="mb-4 border border-[#d5e4e7] bg-[linear-gradient(120deg,#f7e5c9,#f4d9b6,#f8e9cf)] px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-[#cc5b1e] md:text-4xl">Get 25% Off</p>
                  <p className="text-xl font-bold text-[#3f3b35] md:text-3xl">Up To Rs 500 Off*</p>
                </div>
                <div className="rounded-xl border border-[#ead7b7] bg-white px-4 py-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7f83]">Coupon Code</p>
                  <p className="text-2xl font-extrabold tracking-wide text-[#12353a] md:text-3xl">SKINTHEORY25</p>
                  <p className="mt-1 text-xs text-[#6b7f83]">On your first order | T&C apply</p>
                </div>
                <p className="text-4xl font-black text-[#e58f34] md:text-6xl">%</p>
              </div>
            </section>
            ) : null}

            {['Home', 'Services', 'Products'].includes(activeTab) ? (
            <section className="relative overflow-hidden rounded-2xl border border-[#d5e4e7] bg-white">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ width: `${CUSTOMER_OFFERS.length * 100}%`, transform: `translateX(-${offerIndex * (100 / CUSTOMER_OFFERS.length)}%)` }}
              >
                {CUSTOMER_OFFERS.map((offer) => (
                  <div key={offer.title} className="w-full shrink-0 bg-[linear-gradient(115deg,#f3f5f6,#e6efef,#f5f7f8)] p-5 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7f83]">Special Offer</p>
                    <h3 className="mt-1 text-2xl font-bold text-[#12353a] md:text-3xl">{offer.title}</h3>
                    <p className="mt-1 text-sm text-[#4f666b] md:text-base">{offer.subtitle}</p>
                    <Button
                      className="mt-3 bg-[#0f4a52] text-white hover:bg-[#0a3a41]"
                      onClick={() => {
                        if (offer.cta.toLowerCase().includes('product') || offer.cta.toLowerCase().includes('shop')) setActiveTab('Products');
                        else setActiveTab('Services');
                      }}
                    >
                      {offer.cta}
                    </Button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setOfferIndex((current) => (current - 1 + CUSTOMER_OFFERS.length) % CUSTOMER_OFFERS.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2 text-[#12353a] shadow transition hover:bg-[#e7eef0]"
                aria-label="Previous offer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setOfferIndex((current) => (current + 1) % CUSTOMER_OFFERS.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2 text-[#12353a] shadow transition hover:bg-[#e7eef0]"
                aria-label="Next offer"
              >
                <ChevronRight size={18} />
              </button>
              <div className="flex justify-center gap-2 pb-3">
                {Array.from({ length: CUSTOMER_OFFERS.length }).map((_, idx) => (
                  <button
                    key={`offer-dot-${idx}`}
                    onClick={() => setOfferIndex(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition ${offerIndex === idx ? 'bg-[#0f4a52]' : 'bg-[#c8d6d9]'}`}
                    aria-label={`Go to offer ${idx + 1}`}
                  />
                ))}
              </div>
            </section>
            ) : null}
            </div>

            <div className="mt-4 flex-1 space-y-4 pb-6 sm:mt-6 md:pb-28">
              {activeTab === 'Home' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#d5e4e7] bg-white p-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7f83]">Services</p>
                      <h3 className="mt-1 text-2xl font-bold text-[#12353a]">Book Expert Dermatology Sessions</h3>
                      <p className="mt-2 text-sm text-[#4f666b]">Consultations, procedure planning, and specialist follow-ups.</p>
                      <Button className="mt-4 bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={() => setActiveTab('Services')}>
                        View Services
                      </Button>
                    </div>
                    <div className="rounded-2xl border border-[#d5e4e7] bg-white p-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7f83]">Products</p>
                      <h3 className="mt-1 text-2xl font-bold text-[#12353a]">Shop Clinical Skincare Essentials</h3>
                      <p className="mt-2 text-sm text-[#4f666b]">Browse skin routines and order with secure checkout.</p>
                      <Button className="mt-4 bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={() => setActiveTab('Products')}>
                        View Products
                      </Button>
                    </div>
                  </div>

                  <section className="rounded-2xl border border-[#d5e4e7] bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7f83]">Why Choose Us</p>
                    <h3 className="mt-1 text-2xl font-bold text-[#12353a]">Care that combines precision and comfort</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {[
                        {
                          icon: ShieldCheck,
                          title: 'Board-Certified Dermatologists',
                          text: 'Specialist-led diagnosis and treatment plans tailored to your skin.'
                        },
                        {
                          icon: FlaskConical,
                          title: 'Advanced Clinical Technology',
                          text: 'Modern devices and protocol-driven workflows for safer outcomes.'
                        },
                        {
                          icon: HeartHandshake,
                          title: 'End-to-End Skin Journey',
                          text: 'From consultation to follow-up, everything in one connected portal.'
                        }
                      ].map((item) => (
                        <div key={item.title} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-4">
                          <div className="flex items-center gap-2">
                            <item.icon size={16} className="text-[#0f4a52]" />
                            <h4 className="text-sm font-semibold text-[#12353a]">{item.title}</h4>
                          </div>
                          <p className="mt-2 text-sm text-[#4f666b]">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#d5e4e7] bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7f83]">FAQ</p>
                    <h3 className="mt-1 text-2xl font-bold text-[#12353a]">Frequently Asked Questions</h3>
                    <div className="mt-4 space-y-3">
                      {HOME_FAQS.map((faq, idx) => (
                        <div key={faq.q} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-4">
                          <button
                            onClick={() => setOpenFaqIndex((current) => (current === idx ? null : idx))}
                            className="flex w-full items-center justify-between gap-4 text-left"
                          >
                            <span className="text-sm font-semibold text-[#12353a]">{faq.q}</span>
                            <ChevronDown
                              size={18}
                              className={`shrink-0 text-[#4f666b] transition-transform duration-300 ${
                                openFaqIndex === idx ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {openFaqIndex === idx ? <p className="mt-2 text-sm text-[#4f666b]">{faq.a}</p> : null}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}
              {activeTab === 'Services' ? <ServiceCatalogView clinicId={CLINIC_ID} /> : null}
              {activeTab === 'Products' ? <ProductGrid clinicId={CLINIC_ID} /> : null}
              {activeTab === 'Wishlists' ? (
                <section className="rounded-2xl border border-[#cfe4e6] bg-[#f7f9fa] p-4 sm:p-5">
                  <div className="rounded-2xl border border-[#cfe4e6] bg-white p-4 sm:p-5">
                    <WishlistView />
                  </div>
                </section>
              ) : null}
              {activeTab === 'Notifications' ? (
                <section className="rounded-2xl border border-[#cfe4e6] bg-[#f7f9fa] p-4 sm:p-5">
                  <div className="rounded-2xl border border-[#cfe4e6] bg-white p-4 sm:p-5">
                    <NotificationsView />
                  </div>
                </section>
              ) : null}
              {activeTab === 'Cart' ? (
                <section className="rounded-2xl border border-[#cfe4e6] bg-[#f7f9fa] p-4 sm:p-5">
                  <div className="rounded-2xl border border-[#cfe4e6] bg-white p-4 sm:p-5">
                    <CartView onProceedToCheckout={() => setActiveTab('Checkout')} />
                  </div>
                </section>
              ) : null}
              {activeTab === 'Checkout' ? <OrdersView clinicId={CLINIC_ID} showTracking={false} showCheckout /> : null}
              {activeTab === 'Profile' ? <ProfileView clinicId={CLINIC_ID} onSignOut={handleSignOut} /> : null}
            </div>

            <button
              onClick={() => {
                setIsEnquiryOpen(true);
                setEnquiryMessage('');
              }}
              className="enquiry-glow fixed bottom-24 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0f4a52] text-white shadow-lg transition hover:bg-[#0a3a41] sm:bottom-28 sm:right-6 sm:h-14 sm:w-14 md:right-10"
              title="Quick enquiry"
              aria-label="Open enquiry form"
            >
              <MessageCircle size={24} />
            </button>

            {isEnquiryOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                <div className="w-full max-w-md rounded-2xl border border-[#d5e4e7] bg-white p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#12353a]">Quick Enquiry</h3>
                    <button
                      onClick={() => setIsEnquiryOpen(false)}
                      className="rounded-full px-2 py-1 text-sm text-[#4f666b] hover:bg-[#f1f4f5]"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Input
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      placeholder="Name"
                    />
                    <div className="flex items-center rounded-xl border border-[#cfe0e3] bg-white">
                      <span className="px-3 text-sm font-semibold text-[#4f666b]">+91</span>
                      <input
                        value={enquiryMobile}
                        onChange={(e) => setEnquiryMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Mobile number"
                        className="h-10 w-full rounded-r-xl border-0 px-2 text-sm outline-none"
                      />
                    </div>
                    <Input
                      type="email"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </div>

                  {enquiryMessage ? <p className="mt-3 text-sm text-[#0f4a52]">{enquiryMessage}</p> : null}

                  <Button
                    className="mt-4 w-full bg-[#0f4a52] text-white hover:bg-[#0a3a41]"
                    onClick={handleSubmitEnquiry}
                    disabled={createEnquiry.isLoading}
                  >
                    {createEnquiry.isLoading ? 'Submitting...' : 'Submit Enquiry'}
                  </Button>
                </div>
              </div>
            ) : null}

            <footer className="mt-6 border-t border-[#245f65] bg-[linear-gradient(120deg,#0f454e,#1c646e,#0f4a52)] px-4 py-3 shadow-lg sm:px-6 sm:py-4 md:fixed md:bottom-0 md:left-0 md:right-0 md:z-40 md:px-10 md:py-5">
              <div className="grid gap-4 text-xs text-[#dbe8ea] sm:text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#cce2e5]">Clinic Address</p>
                  <p className="mt-2 text-[#f1f7f8]">
                    The Skin Theory, 3rd Floor, Rd No 36, above SKODA Showroom,
                    <br />
                    Jubilee Hills, Hyderabad - 500033
                  </p>
                  </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#cce2e5]">Contact Us</p>
                  <p className="mt-2 text-[#f1f7f8]">Phone: 040 69293000 / +91 9888742222</p>
                  <p className="text-[#f1f7f8]">Email: info@theskintheory.com</p>
                </div>
                <div className="md:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#cce2e5]">Copyright</p>
                  <p className="mt-2 text-[#f1f7f8]">Copyright © {new Date().getFullYear()} The Skin Theory.</p>
                  <p className="text-[#f1f7f8]">All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        )
      ) : null}
    </DashboardLayout>
  );
}
