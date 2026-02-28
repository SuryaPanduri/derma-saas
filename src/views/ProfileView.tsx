import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { useBookings, useUpdateProfile } from '@/hooks';
import { useAuthStore } from '@/store';
import { formatDateLabel } from '@/utils/dateUtils';
import { MyBookingsView } from './MyBookingsView';
import { OrdersView } from './OrdersView';

type ProfileSection = 'profile' | 'bookings' | 'appointments' | 'orders';

export const ProfileView = ({ clinicId, onSignOut }: { clinicId: string; onSignOut: () => void }) => {
  const user = useAuthStore((state) => state.user);
  const bookingsQuery = useBookings(user?.id ?? '');
  const { mutateAsync, isLoading } = useUpdateProfile();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [section, setSection] = useState<ProfileSection>('profile');
  const [menuOpen, setMenuOpen] = useState(false);

  const upcomingAppointments = useMemo(
    () =>
      [...bookingsQuery.data]
        .filter((item) => item.status === 'scheduled' && new Date(item.dateISO).getTime() >= Date.now())
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [bookingsQuery.data]
  );

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const ageNumber = Number(age);
    const dateOfBirth =
      Number.isFinite(ageNumber) && ageNumber > 0
        ? new Date(new Date().setFullYear(new Date().getFullYear() - ageNumber)).toISOString()
        : new Date(0).toISOString();

    await mutateAsync({
      uid: user.id,
      clinicId,
      fullName,
      phone,
      dateOfBirth,
      gender,
      skinType: '',
      allergies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const menuItems = [
    { key: 'profile' as const, label: 'Profile', icon: UserRound },
    { key: 'bookings' as const, label: 'My Bookings', icon: CalendarCheck2 },
    { key: 'appointments' as const, label: 'Appointments', icon: CalendarDays },
    { key: 'orders' as const, label: 'Orders', icon: ShoppingBag }
  ];

  const sectionMeta: Record<ProfileSection, { title: string; subtitle: string }> = {
    profile: {
      title: 'My Profile',
      subtitle: 'Manage your account and personal details.'
    },
    bookings: {
      title: 'My Bookings',
      subtitle: 'Track your bookings and scheduled sessions.'
    },
    appointments: {
      title: 'Appointments',
      subtitle: 'Review upcoming appointments and consultation notes.'
    },
    orders: {
      title: 'Orders',
      subtitle: 'View order history and delivery progress.'
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-[#d5e4e7] bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7f83]">Patient Account</p>
        <h2 className="mt-1 text-2xl font-bold text-[#12353a] sm:text-3xl">Account Settings</h2>

        <div className="mt-4 rounded-2xl border border-[#d5e4e7] bg-[#f7f9fa] p-3 sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center justify-between rounded-xl border border-[#d5e4e7] bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-[#12353a]">The Skin Theory</p>
                  <p className="text-xs text-[#4f666b]">{user?.email ?? 'Guest'}</p>
                </div>
                <button
                  onClick={() => setMenuOpen((value) => !value)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#d5e4e7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#12353a] lg:hidden"
                >
                  Sections
                  <ChevronDown size={14} className={`transition ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <Card className={`${menuOpen ? 'block' : 'hidden'} border-[#d5e4e7] bg-white p-3 lg:block`}>
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setSection(item.key);
                        setMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                        section === item.key
                          ? 'bg-[#0f4a52] text-white'
                          : 'bg-[#f7f9fa] text-[#4f666b] hover:bg-[#e7eef0] hover:text-[#12353a]'
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </Card>
            </aside>

            <section className="rounded-2xl border border-[#d5e4e7] bg-white p-4 sm:p-5">
              <div className="mb-4 border-b border-[#e5edef] pb-3">
                <h3 className="text-xl font-bold text-[#12353a]">{sectionMeta[section].title}</h3>
                <p className="mt-1 text-sm text-[#4f666b]">{sectionMeta[section].subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d5e4e7] bg-[#f7f9fa] px-2.5 py-1 text-xs font-semibold text-[#4f666b]">
                    <Mail size={12} />
                    {user?.email ?? 'No email'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d5e4e7] bg-[#f7f9fa] px-2.5 py-1 text-xs font-semibold capitalize text-[#4f666b]">
                    <BadgeCheck size={12} />
                    {user?.role ?? 'customer'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d5e4e7] bg-[#f7f9fa] px-2.5 py-1 text-xs font-semibold text-[#4f666b]">
                    <Sparkles size={12} />
                    Skin portal active
                  </span>
                </div>
              </div>

              {section === 'profile' ? (
            <Card className="border-[#d5e4e7] bg-white p-4 sm:p-6">
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p>Email: {user?.email ?? '-'}</p>
                <p className="mt-1 capitalize">Role: {user?.role ?? '-'}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="pl-9" />
                </div>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="pl-9" />
                </div>
                <div className="relative md:col-span-2">
                  <MapPin size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="pl-9" />
                </div>
                <div className="relative">
                  <CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <Input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    type="number"
                    min={0}
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Users size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender" className="pl-9" />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button onClick={handleSave} disabled={isLoading || !user} className="w-full sm:w-auto">
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button variant="outline" onClick={onSignOut} disabled={!user} className="w-full sm:w-auto">
                  Sign out
                </Button>
              </div>
            </Card>
          ) : null}

              {section === 'bookings' ? <MyBookingsView /> : null}

              {section === 'appointments' ? (
            <div className="space-y-4">
              <Card className="border-[#d5e4e7] bg-white p-4 sm:p-5">
                <h3 className="text-lg font-bold text-[#12353a]">Upcoming Appointments</h3>
                <p className="text-sm text-[#4f666b]">All scheduled appointments with complete details.</p>
              </Card>
              {!upcomingAppointments.length ? (
                <EmptyState title="No Upcoming Appointments" subtitle="Booked future appointments will appear here." />
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((item) => (
                    <Card key={item.id} className="border-[#d5e4e7] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#12353a]">{item.serviceName}</p>
                        <span className="rounded-full border border-[#d5e4e7] bg-[#f7f9fa] px-2 py-0.5 text-xs font-semibold text-[#4f666b]">
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-[#4f666b] sm:grid-cols-2">
                        <p className="inline-flex items-center gap-1"><CalendarDays size={12} /> {formatDateLabel(item.dateISO)}</p>
                        <p className="inline-flex items-center gap-1"><CalendarDays size={12} /> {item.timeSlot}</p>
                        <p className="inline-flex items-center gap-1 sm:col-span-2"><ClipboardList size={12} /> Notes: {item.notes || 'No notes'}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : null}

              {section === 'orders' ? <OrdersView clinicId={clinicId} showCheckout={false} /> : null}
            </section>
          </div>
        </div>
      </Card>
    </div>
  );
};
