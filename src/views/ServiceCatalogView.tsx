import { useState } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useServices } from '@/hooks';
import type { ServiceDTO } from '@/types';
import { formatMoney } from '@/utils/moneyUtils';
import { BookingModal } from './BookingModal';

export const ServiceCatalogView = ({ clinicId }: { clinicId: string }) => {
  const { data, isLoading, error } = useServices(clinicId);
  const [selectedService, setSelectedService] = useState<ServiceDTO | null>(null);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Unable to load service catalog.';
    return <ErrorState error={{ code: 'SERVICE_LOAD_FAILED', message }} />;
  }

  if (!data.length) {
    return <EmptyState title="No Services Available" subtitle="Clinic administrator has not published service catalog yet." />;
  }

  return (
    <>
      <div className="space-y-10 md:space-y-16">
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#f9fbfb]/58 via-[#f9fbfb]/30 to-transparent" />
          <div className="relative flex min-h-[38vh] items-center bg-[linear-gradient(120deg,#e2e9e9,#d4e4e4,#edf3f3)] px-3 py-6 sm:min-h-[42vh] sm:px-5 sm:py-8 md:min-h-[48vh] md:px-8 md:py-10">
            <div className="max-w-xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0c3a40] [text-shadow:0_1px_1px_rgba(255,255,255,0.35)]">
                Clinical Consultations
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[0.01em] text-[#102f34] [text-shadow:0_1px_2px_rgba(255,255,255,0.3)] sm:text-4xl md:text-6xl">
                Personalized dermatology care built around your skin goals.
              </h2>
              <p className="text-sm leading-relaxed text-[#18444a] [text-shadow:0_1px_2px_rgba(255,255,255,0.25)] sm:text-base md:text-lg">
                Book specialist sessions for acne, pigmentation, anti-aging, laser, and long-term skin health planning.
              </p>
            </div>
          </div>
        </section>

        {bookingMessage ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              bookingMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {bookingMessage.text}
          </div>
        ) : null}

        <section className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">Service Library</p>
            <h3 className="text-2xl font-semibold text-[#1E1E1E] sm:text-3xl">Choose Your Consultation</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:gap-8 xl:grid-cols-3">
            {data.map((service) => (
              <Card
                key={service.id}
                className="rounded-2xl border border-[#e6dfd3] bg-[#FAF8F4] p-6 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="rounded-full bg-[#ece4d8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B6B6B]">
                    {service.category}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">{service.durationMinutes} mins</p>
                </div>
                <h4 className="text-xl font-medium text-[#1E1E1E]">{service.name}</h4>
                <p className="mt-2 min-h-14 text-sm leading-relaxed text-[#6B6B6B]">{service.description}</p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-[#6B6B6B]">Consultation Fee</p>
                  <p className="text-sm font-semibold text-[#4E5D4A]">{formatMoney(service.priceCents)}</p>
                </div>

                <Button
                  className="mt-5 w-full border border-[#4E5D4A] bg-[#4E5D4A] text-[#FAF8F4] transition-all duration-300 ease-in-out hover:opacity-90"
                  onClick={() => setSelectedService(service)}
                >
                  Book Session
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {selectedService ? (
        <BookingModal
          service={selectedService}
          clinicId={clinicId}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={(message) => setBookingMessage({ type: 'success', text: message })}
          onBookingError={(message) => setBookingMessage({ type: 'error', text: `Booking failed: ${message}` })}
        />
      ) : null}
    </>
  );
};
