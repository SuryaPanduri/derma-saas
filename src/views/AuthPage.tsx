import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Mail, UserPlus, Github, Chrome, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-[#ECE3D8] font-['Assistant']">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Left Section: Brand & Storytelling */}
        <div className="relative flex w-full flex-col items-center justify-center border-b border-white/20 bg-[#ECE3D8] p-8 md:min-h-screen md:w-1/2 md:border-b-0 md:border-r">
          {/* Subtle Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.02]">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L21,22C21,22 21,19.67 21,15C21,10 17,8 17,8Z" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-lg text-center">
            <div className="mb-12 flex justify-center">
              <img 
                src="https://theskintheory.com/wp-content/uploads/2023/03/Equally-Sized-Logo-Black.png" 
                alt="The Skin Theory" 
                className="h-16 w-auto md:h-24"
              />
            </div>
            
            <h1 className="font-['Playfair_Display'] mb-6 text-3xl font-bold tracking-tight text-[#191919] md:text-5xl">
              Dermatology & Aesthetics
            </h1>
            
            <div className="h-20 text-xl font-medium text-[#8A6F5F] md:text-2xl">
              <p key={taglineIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                {rotatingTaglines[taglineIndex]}
              </p>
            </div>

            <div className="mt-12 hidden md:block">
              <p className="text-sm tracking-[0.2em] text-[#A69185] uppercase">
                Expert Care • Trusted Science • Radiant Results
              </p>
            </div>

            <button
              onClick={onBack}
              className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-[#8A6F5F] transition-colors hover:text-[#191919]"
            >
              <ArrowLeft size={16} />
              Back to official site
            </button>
          </div>
        </div>

        {/* Right Section: Auth Form */}
        <div className="flex w-full flex-1 items-center justify-center bg-[#F4F1ED] p-6 md:p-12">
          <Card className="w-full max-w-lg overflow-hidden border-none bg-white/40 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-shadow-glass">
            <div className="space-y-8 pt-10 pb-12 px-10">
              <div className="text-center font-['Playfair_Display']">
                <h2 className="text-4xl font-bold text-[#191919]">
                  {authMode === 'signin' ? 'Welcome Back' : 'Join the Theory'}
                </h2>
                <p className="mt-3 text-lg text-[#8A6F5F]">
                  {authMode === 'signin' 
                    ? 'Enter your credentials to access your portal' 
                    : 'Start your personalized skin journey with us'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex rounded-full bg-[#ECE3D8]/50 p-1.5">
                <button
                  onClick={() => onAuthModeChange('signin')}
                  className={`flex-1 rounded-full py-3 text-base font-semibold transition-all ${
                    authMode === 'signin' 
                      ? 'bg-[#8A6F5F] text-white shadow-md' 
                      : 'text-[#8A6F5F] hover:bg-white/30'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onAuthModeChange('signup')}
                  className={`flex-1 rounded-full py-3 text-base font-semibold transition-all ${
                    authMode === 'signup' 
                      ? 'bg-[#8A6F5F] text-white shadow-md' 
                      : 'text-[#8A6F5F] hover:bg-white/30'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 border-[#ECE3D8] bg-white/40 shadow-sm text-lg font-semibold text-[#191919] hover:bg-white hover:border-[#8A6F5F]/30 hover:shadow-md transition-all duration-300">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                    <svg viewBox="0 0 24 24" className="h-full w-full">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  Google
                </Button>
                <Button variant="outline" className="h-20 border-[#ECE3D8] bg-white/40 shadow-sm text-lg font-semibold text-[#191919] hover:bg-white hover:border-[#8A6F5F]/30 hover:shadow-md transition-all duration-300">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-sm text-black">
                    <svg className="h-full w-full" viewBox="0 0 384 512" fill="currentColor">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-89-40.7-80.6-122.6-80.6-122.6zm-40.7-147.2c31.4-37.4 25.7-74.1 24.2-81.4-28.5 2-53.2 18.2-66.2 38.6-12.2 19.3-19.1 44.7-14.4 71.6 30.1 2.3 54.2-13.8 56.4-28.8z"/>
                    </svg>
                  </div>
                  Apple
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#ECE3D8]"></span>
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-transparent px-3 text-[#A69185]">Or continue with email</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-base font-semibold text-[#191919]">Email Address</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A6F5F]/60" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="h-14 border-white/50 bg-white/50 pl-12 text-base focus:ring-[#8A6F5F]"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-base font-semibold text-[#191919]">Password</label>
                  <div className="relative">
                    <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A6F5F]/60" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-14 border-white/50 bg-white/50 pl-12 pr-12 text-base placeholder:text-lg focus:ring-[#8A6F5F]"
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A6F5F]/60 hover:text-[#8A6F5F]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-base font-semibold text-[#191919]">Confirm Password</label>
                    <div className="relative">
                      <UserPlus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A6F5F]/60" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="h-14 border-white/50 bg-white/50 pl-12 pr-12 text-base placeholder:text-lg focus:ring-[#8A6F5F]"
                        value={confirmPassword}
                        onChange={(e) => onConfirmPasswordChange(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A6F5F]/60 hover:text-[#8A6F5F]"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {authError && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 animate-in fade-in zoom-in-95">
                  {authError}
                </div>
              )}
              {authInfo && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600 animate-in fade-in zoom-in-95">
                  {authInfo}
                </div>
              )}

              <Button
                className="w-full !bg-[#8A6F5F] py-8 text-xl font-bold text-white shadow-lg hover:!bg-[#5D4A3E] active:scale-[0.98] transition-all font-['Playfair_Display']"
                onClick={onSubmit}
                disabled={isSubmittingAuth}
              >
                {isSubmittingAuth ? 'Processing...' : authMode === 'signin' ? 'Sign In to Portal' : 'Create My Account'}
                <ArrowRight size={22} className="ml-3" />
              </Button>

              <div className="text-center text-sm text-[#A69185]">
                By continuing, you agree to The Skin Theory's <br />
                <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
