import { useEffect, useMemo, useState } from 'react';
import { services } from '@/api/repositories/serviceProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
import { CustomerMobileView } from '@/views/CustomerMobileView';
import { CustomerDesktopView } from '@/views/CustomerDesktopView';
import { LandingPage } from '@/views/LandingPage';
import { ToastProvider } from '@/contexts/ToastContext';
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

const CUSTOMER_OFFERS = [
  { title: 'Summer Skin Reset', subtitle: 'Flat 20% off on laser and peel consultations this week.', cta: 'Explore Services' },
  { title: 'Hydration Recovery Kit', subtitle: 'Buy 2 skincare products and get 15% instant discount.', cta: 'Shop Products' },
  { title: 'First Visit Offer', subtitle: 'Up to Rs 500 off on your first dermatologist appointment.', cta: 'Book Now' },
  { title: 'Glow Month Campaign', subtitle: 'Combo bundles on services + products with limited stock.', cta: 'Grab Offer' },
  { title: 'Acne Action Package', subtitle: 'Book acne consult + routine starter and save 18% today.', cta: 'View Services' },
  { title: 'Weekend Checkout Deal', subtitle: 'Extra 10% off on orders above Rs 1999 this weekend.', cta: 'Shop Now' }
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
  const [offerIndex, setOfferIndex] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
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
    <ToastProvider>
      <DashboardLayout hideHeader fullBleed>
        {!user && route !== 'auth' ? (
          <LandingPage 
            onOpenAuth={openAuthPage} 
            onOpenEnquiry={() => setIsEnquiryOpen(true)} 
          />
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
            (() => {
              const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
              const isPwaDomain = hostname.includes('skin-theory-demo-pwa');
              const isWebsiteDomain = hostname.includes('derma-clinic-mvp');
              
              // Force App View on PWA link, Force Desktop View on Website link
              const isMobile = isPwaDomain || (!isWebsiteDomain && typeof window !== 'undefined' && window.innerWidth < 1024);
              
              const commonProps = {
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
                clinicId: CLINIC_ID,
                handleSignOut,
                setIsEnquiryOpen
              };

              return isMobile ? (
                <CustomerMobileView {...commonProps} />
              ) : (
                <CustomerDesktopView
                  {...commonProps}
                  ordersCount={ordersCount}
                  bookingsCount={bookingsCount}
                  HOME_FAQS={HOME_FAQS}
                  openFaqIndex={openFaqIndex}
                  setOpenFaqIndex={setOpenFaqIndex}
                />
              );
            })()
          )
        ) : null}
        {isEnquiryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md overflow-hidden border-none bg-white/90 shadow-2xl backdrop-blur-xl transition-all animate-in zoom-in-95 duration-300">
              <div className="bg-[#8A6F5F] px-6 py-8 text-center text-white">
                <h3 className="font-['Playfair_Display'] text-2xl font-bold">Share Your Theory</h3>
                <p className="mt-2 text-sm text-white/80">Connect with our dermatology specialists.</p>
              </div>
              <div className="space-y-4 p-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8A6F5F]">Full Name</label>
                  <Input
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-12 border-[#D4C8BC]/40 bg-[#FAF8F4]/50 focus:ring-[#8A6F5F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8A6F5F]">Email Address</label>
                  <Input
                    type="email"
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-12 border-[#D4C8BC]/40 bg-[#FAF8F4]/50 focus:ring-[#8A6F5F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8A6F5F]">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="flex h-12 w-14 items-center justify-center rounded-xl border border-[#D4C8BC]/40 bg-[#FAF8F4]/50 text-sm font-bold text-[#8A6F5F]">
                      +91
                    </div>
                    <Input
                      value={enquiryMobile}
                      onChange={(e) => setEnquiryMobile(e.target.value)}
                      placeholder="10 digit number"
                      className="h-12 flex-1 border-[#D4C8BC]/40 bg-[#FAF8F4]/50 focus:ring-[#8A6F5F]"
                    />
                  </div>
                </div>
                {enquiryMessage && (
                  <div className={`rounded-lg p-3 text-xs font-bold ${
                    enquiryMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {enquiryMessage}
                  </div>
                )}
                <div className="mt-4 flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 border-[#D4C8BC]/40 text-[#8A6F5F] hover:bg-[#FAF8F4]" onClick={() => setIsEnquiryOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-[2] bg-[#8A6F5F] text-white hover:bg-[#5D4A3E]" onClick={handleSubmitEnquiry}>
                    Submit Enquiry
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ToastProvider>
  );
}
