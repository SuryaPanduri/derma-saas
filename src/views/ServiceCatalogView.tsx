import { useState, useMemo } from 'react';
import { Clock, Stethoscope, Bell, Heart } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useServices } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import type { ServiceDTO } from '@/types';
import { formatMoney } from '@/utils/moneyUtils';
import { BookingModal } from './BookingModal';

export const ServiceCatalogView = ({ 
  clinicId,
  onNavigate,
  wishlistCount = 0,
  notificationsCount = 0
}: { 
  clinicId: string;
  onNavigate?: (tab: string) => void;
  wishlistCount?: number;
  notificationsCount?: number;
}) => {
  const { data, isLoading, error } = useServices(clinicId);
  const [selectedService, setSelectedService] = useState<ServiceDTO | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const toast = useToast();

  const categories = useMemo(() => {
    if (!data) return ['All'];
    return ['All', ...new Set(data.map(s => s.category))];
  }, [data]);

  const filteredServices = useMemo(() => {
    if (!data) return [];
    if (activeCategory === 'All') return data;
    return data.filter(s => s.category === activeCategory);
  }, [data, activeCategory]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="flex gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-9 w-24 rounded-lg" />)}</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState error={{ code: 'SERVICE_LOAD_FAILED', message: 'Unable to load services.' }} />;
  if (!data?.length) return <EmptyState title="No Services" subtitle="Catalog coming soon." />;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Category Filters */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white border border-[#E8E2DC] text-[#8A6F5F] hover:border-[#8A6F5F]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service: ServiceDTO) => (
          <div
            key={service.id}
            className="group rounded-xl border border-[#E8E2DC] bg-white p-6 transition-all hover:border-[#8A6F5F] hover:shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="rounded-md bg-[#F5F0EB] px-2 py-0.5 text-[11px] font-medium text-[#8A6F5F]">
                {service.category}
              </span>
              <div className="flex items-center gap-1 text-[12px] text-[#B5A99A]">
                <Clock size={12} /> {service.durationMinutes} min
              </div>
            </div>

            <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#2C2420] mb-2 group-hover:text-[#8A6F5F] transition-colors">
              {service.name}
            </h4>
            <p className="text-[13px] leading-relaxed text-[#B5A99A] line-clamp-2 mb-6">
              {service.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[#E8E2DC]">
              <span className="text-xl font-bold text-[#2C2420]">{formatMoney(service.priceCents)}</span>
              <Button
                className="h-9 rounded-lg bg-[#1A1A1A] px-5 text-[13px] font-medium text-white hover:bg-[#8A6F5F] transition-colors"
                onClick={() => setSelectedService(service)}
              >
                Book
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <BookingModal
          service={selectedService}
          clinicId={clinicId}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={(msg) => toast.success(msg)}
          onBookingError={(msg) => toast.error(`Booking failed: ${msg}`)}
        />
      )}
    </div>
  );
};
