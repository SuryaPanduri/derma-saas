import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Mail, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type AuthMode = 'signin' | 'signup';

interface AuthPageProps {
  authMode: AuthMode;
  email: string;
  password: string;
  confirmPassword: string;
  authError: string;
  authInfo: string;
  isSubmittingAuth: boolean;
  onAuthModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const AuthPage = ({
  authMode,
  email,
  password,
  confirmPassword,
  authError,
  authInfo,
  isSubmittingAuth,
  onAuthModeChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onBack,
  onSubmit
}: AuthPageProps) => {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const rotatingTaglines = useMemo(
    () => [
      'Experience Science-Backed Skincare',
      'Your Journey to Radiant Health Starts Here',
      'Personalized Dermatology for Your Unique Skin',
      'Advanced Aesthetics, Trusted Expertise',
      'Revealing Your Best Skin with The Skin Theory'
    ],
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTaglineIndex((current) => (current + 1) % rotatingTaglines.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [rotatingTaglines]);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5]">
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ═══ Left Panel — Brand Story (Golden Ratio: 61.8%) ═══ */}
        <div className="relative hidden lg:flex" style={{ flexBasis: '61.8%' }}>
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            {/* Soft cream-to-blush gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0EE] via-[#F2ECEB] to-[#F0E0DE]" />

            {/* Subtle ambient warmth */}
            <div className="absolute -left-32 top-1/4 h-[600px] w-[600px] rounded-full bg-white/40 blur-[180px]" />
            <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#EEDCDA]/30 blur-[140px]" />
            <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-[#F5EEED]/40 blur-[120px]" />

            {/* Back to site — top right */}
            <button
              onClick={onBack}
              className="absolute right-6 top-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-[12px] font-semibold text-[#2C2420]/50 backdrop-blur-sm border border-[#2C2420]/8 transition-all hover:bg-white/40 hover:text-[#2C2420]/70"
            >
              <ArrowLeft size={12} />
              Back to Home
            </button>

            <div className="relative z-10 mx-auto max-w-lg px-16 text-center">
              {/* Logo */}
              <div className="mb-14">
                <img 
                  src="/logo.png" 
                  alt="The Skin Theory" 
                  className="mx-auto h-16 w-auto opacity-80"
                />
              </div>
              
              <h1 className="font-['Playfair_Display'] text-6xl font-bold tracking-tight text-[#2C2420]/80 leading-[1.1]">
                Dermatology <br /><span className="italic">&amp; Aesthetics</span>
              </h1>
              
              {/* Rotating tagline */}
              <div className="mt-8 h-16">
                <p key={taglineIndex} className="text-xl text-[#2C2420]/35 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {rotatingTaglines[taglineIndex]}
                </p>
              </div>

              {/* Trust badges */}
              <div className="mt-14 flex flex-wrap justify-center gap-2.5">
                {['MD Dermatology', 'Clinical Aesthetics', '10+ Years'].map((badge) => (
                  <span key={badge} className="rounded-full border border-[#2C2420]/8 bg-white/30 px-5 py-2 text-[12px] font-semibold tracking-widest text-[#2C2420]/45 uppercase backdrop-blur-sm">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Right Panel — Auth Form ═══ */}
        <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <img src="/logo.png" alt="The Skin Theory" className="mx-auto h-10 w-auto" />
          </div>

          <div className="w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-10 text-center">
              <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C2420]">
                {authMode === 'signin' ? 'Welcome Back' : 'Join Us'}
              </h2>
              <p className="mt-2 text-[14px] text-[#B5A99A]">
                {authMode === 'signin' 
                  ? 'Sign in to access your skincare portal' 
                  : 'Create an account to begin your journey'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="mb-8 flex rounded-xl bg-[#F0EBE6] p-1">
              <button
                onClick={() => onAuthModeChange('signin')}
                className={`flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                  authMode === 'signin' 
                    ? 'bg-white text-[#2C2420] shadow-sm' 
                    : 'text-[#B5A99A] hover:text-[#8A6F5F]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onAuthModeChange('signup')}
                className={`flex-1 rounded-lg py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                  authMode === 'signup' 
                    ? 'bg-white text-[#2C2420] shadow-sm' 
                    : 'text-[#B5A99A] hover:text-[#8A6F5F]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Social Logins */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-[#E8E2DC] bg-white text-[13px] font-semibold text-[#2C2420] transition-all hover:border-[#D4C8BC] hover:shadow-sm active:scale-[0.97]">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-[#E8E2DC] bg-white text-[13px] font-semibold text-[#2C2420] transition-all hover:border-[#D4C8BC] hover:shadow-sm active:scale-[0.97]">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 17 20" fill="currentColor">
                  <path d="M13.34 3.54c.78-.95 1.31-2.27 1.17-3.54-1.13.04-2.5.76-3.31 1.7-.73.84-1.37 2.19-1.2 3.48 1.26.1 2.54-.65 3.34-1.64zM16.94 14.81c-.44 1.06-.66 1.53-1.23 2.47-.8 1.32-1.93 2.96-3.33 2.98-1.24.02-1.56-.81-3.24-.8-1.68.01-2.03.83-3.27.81-1.4-.03-2.47-1.49-3.27-2.81C.78 14.46.2 11.06 1.52 8.76c.93-1.63 2.39-2.59 3.73-2.59 1.39 0 2.26.82 3.41.82 1.11 0 1.79-.82 3.39-.82 1.19 0 2.48.65 3.41 1.78-2.99 1.64-2.51 5.92.48 6.86z" />
                </svg>
                Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E2DC]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FAF8F5] px-4 text-[11px] font-medium uppercase tracking-widest text-[#C4B8AA]">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-[#8A6F5F]">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4B8AA]" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-[#E8E2DC] bg-white pl-10 text-[14px] text-[#2C2420] placeholder:text-[#C4B8AA] focus:border-[#8A6F5F] focus:ring-1 focus:ring-[#8A6F5F]/20"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-[#8A6F5F]">Password</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4B8AA]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-[#E8E2DC] bg-white pl-10 pr-11 text-[14px] text-[#2C2420] placeholder:text-lg placeholder:tracking-widest focus:border-[#8A6F5F] focus:ring-1 focus:ring-[#8A6F5F]/20"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4B8AA] transition-colors hover:text-[#8A6F5F]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-[#8A6F5F]">Confirm Password</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4B8AA]" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-[#E8E2DC] bg-white pl-10 pr-11 text-[14px] text-[#2C2420] placeholder:text-lg placeholder:tracking-widest focus:border-[#8A6F5F] focus:ring-1 focus:ring-[#8A6F5F]/20"
                      value={confirmPassword}
                      onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4B8AA] transition-colors hover:text-[#8A6F5F]"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error / Info Messages */}
            {authError && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600 animate-in fade-in zoom-in-95">
                {authError}
              </div>
            )}
            {authInfo && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[13px] text-emerald-600 animate-in fade-in zoom-in-95">
                {authInfo}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={onSubmit}
              disabled={isSubmittingAuth}
              className={`
                mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold text-white
                transition-all duration-300 active:scale-[0.97]
                ${isSubmittingAuth
                  ? 'bg-[#B5A99A] cursor-not-allowed'
                  : 'bg-[#2C2420] hover:bg-[#8A6F5F] shadow-lg shadow-[#2C2420]/15 hover:shadow-[#8A6F5F]/25'
                }
              `}
            >
              {isSubmittingAuth ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              {!isSubmittingAuth && <ArrowRight size={16} />}
            </button>

            {/* Legal */}
            <p className="mt-6 text-center text-[11px] leading-relaxed text-[#C4B8AA]">
              By continuing, you agree to The Skin Theory's{' '}
              <span className="text-[#8A6F5F] cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-[#8A6F5F] cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            {/* Back link (mobile) */}
            <button
              onClick={onBack}
              className="mt-8 flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-[#B5A99A] transition-colors hover:text-[#8A6F5F] lg:hidden"
            >
              <ArrowLeft size={14} />
              Back to site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
