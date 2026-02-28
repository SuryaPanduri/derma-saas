import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  const [arrowPulse, setArrowPulse] = useState(false);

  const rotatingTaglines = useMemo(
    () =>
      authMode === 'signin'
        ? ['Secure access to your treatment journey', 'Track consultations with clarity', 'Your skin records, always in sync']
        : ['Personalized care starts here', 'Build your skin profile in minutes', 'Start your guided dermatology journey'],
    [authMode]
  );

  useEffect(() => {
    setTaglineIndex(0);
  }, [authMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTaglineIndex((current) => (current + 1) % rotatingTaglines.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [rotatingTaglines]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setArrowPulse((current) => !current);
    }, 700);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#0e3034]">
      <div className="grid min-h-screen w-full grid-cols-1 md:h-screen md:grid-cols-2">
        <div className="relative min-h-[38vh] overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#2d6a73_0%,#1b4f56_45%,#0f3238_100%)] p-6 text-white md:h-full md:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(8,36,40,0.28),rgba(6,26,30,0.72))]" />
        <div className="relative z-10 h-full">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold tracking-tight md:text-3xl">The Skin Theory</p>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-200 transition hover:text-white sm:text-sm"
            >
              <ArrowLeft size={16} />
              Back to landing
            </button>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-7xl">
              {authMode === 'signin' ? 'Welcome back to your skin portal' : "Let's start your skin journey with us"}
            </h2>
            <p className="mt-4 min-h-[3rem] text-lg font-medium leading-relaxed tracking-wide text-[#d9ecef] transition-all duration-500 sm:text-xl md:mt-6 md:min-h-[4rem] md:text-3xl">
              {rotatingTaglines[taglineIndex]}
            </p>
            <div className="mt-4 hidden items-center justify-center md:mt-6 md:flex">
              <div className="flex items-center text-[#d9ecef]">
                <ArrowRight
                  size={30}
                  className={`transition-all duration-500 ${arrowPulse ? 'translate-x-0 opacity-40' : 'translate-x-1 opacity-20'}`}
                />
                <ArrowRight
                  size={38}
                  className={`-ml-2 transition-all duration-500 ${arrowPulse ? 'translate-x-1 opacity-70' : 'translate-x-3 opacity-50'}`}
                />
                <ArrowRight
                  size={46}
                  className={`-ml-2 transition-all duration-500 ${arrowPulse ? 'translate-x-3 opacity-100' : 'translate-x-6 opacity-80'}`}
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

        <div className="flex h-full items-start justify-center bg-[#f3f5f6] p-4 sm:p-6 md:items-center md:p-10">
          <Card className="w-full max-w-xl border-[#d8e4e6] bg-[#f3f5f6] p-5 shadow-none sm:p-6 md:p-8">
          <h3 className="text-center text-3xl font-bold text-[#12353a] sm:text-4xl md:text-6xl">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="mt-2 text-center text-sm text-[#586f74] sm:text-base">
            {authMode === 'signin'
              ? 'Sign in to continue to your clinic workspace.'
              : 'Sign up to continue with customer access by default.'}
          </p>

          <div className="mt-6 rounded-full border border-[#c9d7da] bg-white p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onAuthModeChange('signin')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  authMode === 'signin' ? 'bg-[#0f4a52] text-white' : 'text-[#5b7075] hover:bg-[#e7eef0]'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => onAuthModeChange('signup')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  authMode === 'signup' ? 'bg-[#0f4a52] text-white' : 'text-[#5b7075] hover:bg-[#e7eef0]'
                }`}
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12353a]">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="h-12 rounded-xl border-[#c9d7da] bg-white pl-10 text-base"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12353a]">Password</label>
              <div className="relative">
                <KeyRound size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="h-12 rounded-xl border-[#c9d7da] bg-white pl-10 text-base"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                />
              </div>
            </div>

            {authMode === 'signup' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#12353a]">Confirm password</label>
                <div className="relative">
                  <UserPlus size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    className="h-12 rounded-xl border-[#c9d7da] bg-white pl-10 text-base"
                    value={confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {authError ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{authError}</p> : null}
          {authInfo ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{authInfo}</p> : null}

          <Button
            className="mt-6 h-11 w-full gap-2 rounded-full bg-[#0f4a52] text-sm text-white hover:bg-[#0a3a41] sm:h-12 sm:text-base"
            onClick={onSubmit}
            disabled={isSubmittingAuth}
          >
            {isSubmittingAuth ? 'Please wait...' : authMode === 'signin' ? 'Sign in to Dashboard' : 'Create account'}
            <ArrowRight size={16} />
          </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
