import { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  ChevronRight,
  Mail,
  Phone,
  ShoppingBag,
  UserRound,
  LogOut,
  Activity,
  Bell,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { useBookings, useUpdateProfile } from '@/hooks';
import { useAuthStore } from '@/store';
import { useToast } from '@/contexts/ToastContext';
import { MyBookingsView } from './MyBookingsView';
import { OrdersView } from './OrdersView';

type ProfileSection = 'menu' | 'profile_edit' | 'bookings' | 'orders';

export const ProfileView = ({ 
  clinicId, 
  onSignOut,
  initialSection = 'menu'
}: { 
  clinicId: string; 
  onSignOut: () => void;
  initialSection?: ProfileSection;
}) => {
  const user = useAuthStore((state) => state.user);
  const bookingsQuery = useBookings(user?.id ?? '');
  const { mutateAsync, isLoading } = useUpdateProfile();
  const toast = useToast();
  
  const [activeSection, setActiveSection] = useState<ProfileSection>(initialSection);
  const [fullName, setFullName] = useState((user as any)?.fullName || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');

  const upcomingCount = useMemo(
    () => [...bookingsQuery.data].filter((b) => b.status === 'scheduled' && new Date(b.dateISO).getTime() >= Date.now()).length,
    [bookingsQuery.data]
  );

  const handleSave = async () => {
    if (!user) return;
    await mutateAsync({
      uid: user.id, clinicId, fullName, phone,
      dateOfBirth: '', gender: '', skinType: '', allergies: [],
      createdAt: user.createdAt, updatedAt: new Date().toISOString()
    });
    toast.success("Profile updated");
    setActiveSection('menu');
  };

  // ─── Edit Profile ───
  if (activeSection === 'profile_edit') {
    return (
      <div className="mx-auto max-w-lg animate-in fade-in duration-300">
        <button
          onClick={() => setActiveSection('menu')}
          className="mb-6 flex items-center gap-1 text-[13px] font-medium text-[#8A6F5F] hover:underline"
        >
          <ChevronRight className="rotate-180" size={14} /> Back
        </button>
        <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C2420]">Edit Profile</h2>
        <p className="mt-1 text-[13px] text-[#B5A99A]">Update your personal information.</p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="block text-[12px] font-medium text-[#8A6F5F] mb-1.5">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 rounded-lg border-[#E8E2DC]" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A6F5F] mb-1.5">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 rounded-lg border-[#E8E2DC]" placeholder="Phone number" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="h-10 rounded-lg bg-[#1A1A1A] px-6 text-[13px] font-medium text-white hover:bg-[#8A6F5F]">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="ghost" onClick={() => setActiveSection('menu')} className="text-[13px] text-[#B5A99A]">Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Sub-views ───
  if (activeSection === 'bookings' || activeSection === 'orders') {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C2420]">
            {activeSection === 'bookings' ? 'My Appointments' : 'Order History'}
          </h2>
          <button onClick={() => setActiveSection('menu')} className="flex items-center gap-1 text-[13px] font-medium text-[#8A6F5F] hover:underline">
            <ChevronRight className="rotate-180" size={14} /> Back
          </button>
        </div>
        {activeSection === 'bookings' ? <MyBookingsView /> : <OrdersView clinicId={clinicId} showCheckout={false} />}
      </div>
    );
  }

  // ─── Main Dashboard ───
  return (
    <div className="animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5F0EB] text-lg font-bold text-[#8A6F5F]">
          {(user as any)?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{(user as any)?.fullName || user?.email?.split('@')[0] || 'User'}</h2>
          <div className="mt-0.5 flex items-center gap-4 text-[12px] text-[#B5A99A]">
            {user?.email && <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>}
            {(user as any)?.phone && <span className="flex items-center gap-1"><Phone size={12} /> {(user as any).phone}</span>}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setActiveSection('profile_edit')}
          className="h-9 rounded-lg border-[#E8E2DC] px-4 text-[13px] font-medium text-[#8A6F5F] hover:border-[#8A6F5F]"
        >
          Edit Profile
        </Button>
      </div>

      {/* Navigation List */}
      <div className="space-y-2">
        {[
          { id: 'bookings' as ProfileSection, icon: CalendarCheck2, label: 'My Appointments', desc: `${upcomingCount} upcoming`, color: 'text-[#8A6F5F]' },
          { id: 'orders' as ProfileSection, icon: ShoppingBag, label: 'Order History', desc: 'Track deliveries', color: 'text-[#8A6F5F]' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className="flex w-full items-center gap-4 rounded-xl border border-[#E8E2DC] bg-white p-4 text-left transition-colors hover:border-[#8A6F5F] hover:bg-[#FAFAF8]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F0EB] text-[#8A6F5F]">
              <item.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A]">{item.label}</p>
              <p className="text-[12px] text-[#B5A99A]">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#D4C8BC]" />
          </button>
        ))}

        <div className="pt-4">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-4 rounded-xl border border-red-100 bg-red-50/50 p-4 text-left transition-colors hover:bg-red-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <LogOut size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Sign Out</p>
              <p className="text-[12px] text-red-400">End your session securely</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
