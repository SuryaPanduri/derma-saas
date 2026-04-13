import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote, 
  Stethoscope, 
  Sparkles, 
  ScanFace, 
  Baby, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingCart, 
  User, 
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LandingPageProps {
  onOpenAuth: () => void;
  onOpenEnquiry: () => void;
}

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

const TREATMENTS = [
  {
    id: 'acne',
    title: 'Acne & Scars',
    description: 'Clinical-grade solutions for acne management and scar revision using advanced protocols.',
    icon: Sparkles
  },
  {
    id: 'laser',
    title: 'Laser Therapy',
    description: 'Precision laser treatments for hair reduction, pigmentation, and skin rejuvenation.',
    icon: ScanFace
  },
  {
    id: 'pediatric',
    title: 'Pediatric Care',
    description: 'Specialized dermatology for children, focusing on eczema and sensitive skin conditions.',
    icon: Baby
  },
  {
    id: 'anti-aging',
    title: 'Age Mastery',
    description: 'Evidence-based aesthetic procedures including fillers and regenerative skin therapies.',
    icon: Stethoscope
  }
];

export const LandingPage = ({ onOpenAuth, onOpenEnquiry }: LandingPageProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % DOC_REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF6F5] font-['Assistant'] text-[#191919] selection:bg-[#8A6F5F] selection:text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? 'bg-white/80 py-3 shadow-sm backdrop-blur-xl' : 'bg-transparent py-6'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="The Skin Theory" className="h-9 w-auto" />
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {['Services', 'Products', 'Expertise', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#191919]/60 transition-colors hover:text-[#8A6F5F]"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenAuth} className="p-2 text-[#191919] hover:text-[#8A6F5F]">
              <ShoppingCart size={22} />
            </button>
            <Button 
              onClick={onOpenAuth}
              className="hidden rounded-full bg-[#8A6F5F] px-7 py-2.5 text-[13px] font-bold tracking-wide text-white shadow-md shadow-[#8A6F5F]/20 transition-all hover:bg-[#2C2420] hover:shadow-lg hover:scale-105 active:scale-95 md:block"
            >
              Sign In
            </Button>
            <button onClick={onOpenAuth} className="p-2 text-[#191919] hover:text-[#8A6F5F] md:hidden">
              <User size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF6F5] via-[#F4CAC6]/20 to-[#FFF6F5] pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-skin-clinic.svg" 
            className="h-full w-full object-cover opacity-20 blur-[1px]" 
            alt="Clinic Interior" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFF6F5]/50 to-[#FFF6F5]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 flex justify-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="rounded-full border border-[#D0A4A3]/30 bg-[#F4CAC6]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8A6F5F]">
              Scientific Dermatology • Clinical Aesthetics
            </span>
          </div>
          
          <h2 className="mb-8 font-['Playfair_Display'] text-5xl font-bold leading-[1.1] text-[#191919] sm:text-7xl md:text-8xl opacity-0 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Revealing the <br /> 
            <i className="italic">True Science</i> of Skin.
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#191919]/70 md:text-xl opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            Experience evidence-led treatments curated by dermatology specialists. 
            From clinical diagnostics to advanced aesthetic procedures, your journey to 
            radiant health starts with expert care.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row opacity-0 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <Button 
              onClick={onOpenAuth}
              className="h-14 rounded-full bg-[#8A6F5F] px-10 text-lg font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              Book Your Consultation
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <button className="h-14 rounded-full px-8 text-lg font-bold text-[#8A6F5F] hover:bg-[#8A6F5F]/5">
              Explore Our Story
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 hidden xl:block opacity-0 animate-in fade-in duration-1000 delay-1000">
          <div className="flex items-center gap-4 rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-md border border-[#F4CAC6]/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8A6F5F] text-white">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Expert Care</p>
              <p className="text-xs opacity-60">MD Lead Specialists</p>
            </div>
          </div>
        </div>

        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 xl:block opacity-0 animate-in fade-in duration-1000 delay-1200">
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-[#8A6F5F]/30" />
            ))}
            <div className="h-4 w-4 rounded-full bg-[#8A6F5F]" />
            {[5, 6].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-[#8A6F5F]/30" />
            ))}
          </div>
        </div>
      </section>

      {/* Expertise / Specialties Section */}
      <section id="expertise" className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 grid grid-cols-1 items-end gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-['Playfair_Display'] text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Specialized Care for <br /> Every Skin Need.
              </h3>
            </div>
            <div className="pb-2">
              <p className="text-lg text-[#191919]/60">
                Our clinic integrates medical science with aesthetic excellence, 
                offering a comprehensive range of treatments designed to deliver 
                measurable, long-term results.
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TREATMENTS.map((t, i) => (
              <div 
                key={t.id} 
                className="group relative overflow-hidden rounded-[32px] bg-[#F4CAC6]/15 p-8 transition-all hover:bg-[#F4CAC6]/30"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#8A6F5F] shadow-sm transition-transform group-hover:scale-110">
                  <t.icon size={28} />
                </div>
                <h4 className="mb-3 text-xl font-bold">{t.title}</h4>
                <p className="text-sm leading-relaxed opacity-70">{t.description}</p>
                <div className="mt-8">
                  <button className="flex items-center text-xs font-bold uppercase tracking-widest text-[#8A6F5F]">
                    Learn More <ArrowRight className="ml-2" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Spotlight */}
      <section id="about" className="overflow-hidden bg-gradient-to-br from-[#FFF6F5] to-[#F4CAC6]/30 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="relative w-full max-w-md lg:w-1/2">
              <div className="relative z-10 overflow-hidden rounded-[40px] shadow-2xl group cursor-pointer">
                <img 
                  src="/Dr.-Guruvani-Ravu-min.webp" 
                  alt="Dr. Guruvani Ravu" 
                  className="w-full transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2420]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="absolute -bottom-10 -right-10 -z-0 h-64 w-64 rounded-full bg-[#8A6F5F]/10 blur-3xl" />
              <div className="absolute -left-10 -top-10 -z-0 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
            </div>

            <div className="lg:w-1/2">
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#8A6F5F]">
                Clinical Leadership
              </span>
              <h3 className="mb-8 font-['Playfair_Display'] text-4xl font-bold leading-tight md:text-5xl lg:text-7xl">
                Meet Dr. Guruvani Ravu
              </h3>
              <p className="mb-6 text-xl italic text-[#191919]/60">
                "We believe beauty begins within you and we aim to help you feel beautiful, look beautiful, and be beautiful."
              </p>
              <div className="mb-10 space-y-6 text-lg text-[#191919]/70">
                <p>
                  As an MD in Dermatology and an expert in Clinical Aesthetics, Dr. Ravu 
                  leads The Skin Theory with a commitment to evidence-based care. 
                  Her approach combines medical precision with a deep understanding of 
                  skin health and aesthetic harmony.
                </p>
                <div className="flex flex-wrap gap-4">
                  {['MD Dermatology', 'Aesthetic Specialist', '10+ Years Experience'].map((spec) => (
                    <div key={spec} className="rounded-full border border-[#D0A4A3]/20 bg-white/60 px-4 py-2 text-sm font-semibold text-[#8A6F5F]">
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={onOpenEnquiry} className="h-14 rounded-full bg-[#8A6F5F] px-10 text-lg font-bold text-white shadow-lg">
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-16">
            <h3 className="font-['Playfair_Display'] text-4xl font-bold md:text-5xl">
              Trusted by Hundreds.
            </h3>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="mb-8 flex justify-center text-[#8A6F5F]">
              <Quote size={48} className="opacity-20" />
            </div>
            
            <div className="min-h-[200px] px-10">
              <p className="mb-8 text-2xl font-medium leading-relaxed italic text-[#191919]/80 md:text-3xl">
                {DOC_REVIEWS[reviewIndex].text}
              </p>
              <div>
                <p className="text-xl font-bold">{DOC_REVIEWS[reviewIndex].name}</p>
                <p className="text-sm uppercase tracking-widest text-[#8A6F5F]">{DOC_REVIEWS[reviewIndex].role}</p>
              </div>
            </div>

            <div className="mt-12 flex justify-center gap-4">
              {DOC_REVIEWS.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`h-2 transition-all ${
                    reviewIndex === i ? 'w-8 bg-[#8A6F5F]' : 'w-2 bg-[#8A6F5F]/20'
                  } rounded-full`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <footer id="contact" className="bg-[#191919] pt-24 pb-12 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-8 font-['Playfair_Display'] text-4xl font-bold md:text-6xl">
                Ready to Start Your <br /> Skin Journey?
              </h2>
              <p className="mb-10 text-xl text-white/50">
                Join The Skin Theory community and gain access to personalized 
                dermatology plans, clinical products, and expert consultations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={onOpenAuth} className="h-16 rounded-full bg-[#8A6F5F] px-12 text-xl font-bold">
                  Get Started Now
                </Button>
                <button onClick={onOpenEnquiry} className="h-16 rounded-full border border-white/20 px-8 text-lg font-bold hover:bg-white/5">
                  Send an Enquiry
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-widest text-[#8A6F5F]">Contact Us</p>
                <div className="space-y-4 text-white/70">
                  <a href="tel:04069293000" className="flex items-center gap-3 hover:text-white">
                    <Phone size={18} /> 040 69293000
                  </a>
                  <a href="mailto:info@theskintheory.com" className="flex items-center gap-3 hover:text-white">
                    <Mail size={18} /> info@theskintheory.com
                  </a>
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-widest text-[#8A6F5F]">Visit Clinic</p>
                <address className="not-italic text-white/70">
                  3rd Floor, Rd No 36, <br />
                  Above SKODA Showroom, <br />
                  Jubilee Hills, Hyderabad
                </address>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between border-t border-white/10 pt-12 text-sm text-white/30 md:flex-row">
            <p>© {new Date().getFullYear()} The Skin Theory. All Rights Reserved.</p>
            <div className="mt-4 flex gap-8 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
