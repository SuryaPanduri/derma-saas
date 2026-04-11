import React from 'react';
import { Home, Stethoscope, ShoppingBag, ShoppingCart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, cartCount }) => {
  const tabs = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Services', label: 'Treat', icon: Stethoscope },
    { id: 'Products', label: 'Shop', icon: ShoppingBag },
    { id: 'Cart', label: 'Cart', icon: ShoppingCart },
    { id: 'Profile', label: 'You', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Soft top edge fade */}
      <div className="pointer-events-none h-6 bg-gradient-to-t from-white/80 to-transparent" />

      <div className="bg-white/90 backdrop-blur-2xl border-t border-[#E8E2DC]/40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-3 pt-2 pb-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center gap-[3px] py-1 min-w-[52px]
                  transition-all duration-300 ease-out
                  active:scale-[0.85] active:opacity-70
                `}
              >
                {/* Icon container with animated pill background */}
                <div className={`
                  relative flex items-center justify-center rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${isActive
                    ? 'h-8 w-14 bg-[#8A6F5F] text-white shadow-[0_4px_16px_-2px_rgba(138,111,95,0.4)]'
                    : 'h-8 w-8 bg-transparent text-[#C4B8AA]'
                  }
                `}>
                  <Icon
                    size={isActive ? 17 : 20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="transition-all duration-300"
                  />
                </div>

                {/* Label */}
                <span className={`
                  text-[10px] font-semibold leading-none transition-all duration-300
                  ${isActive ? 'text-[#8A6F5F] translate-y-0 opacity-100' : 'text-[#C4B8AA] translate-y-0.5 opacity-60'}
                `}>
                  {tab.label}
                </span>

                {/* Cart badge */}
                {tab.id === 'Cart' && cartCount > 0 && (
                  <span className={`
                    absolute flex items-center justify-center rounded-full font-bold text-white ring-[2.5px] ring-white
                    transition-all duration-300
                    ${isActive
                      ? 'h-[15px] min-w-[15px] px-[3px] text-[8px] bg-[#2C2420] -top-0.5 right-0'
                      : 'h-[16px] min-w-[16px] px-1 text-[9px] bg-[#8A6F5F] -top-0.5 right-0.5'
                    }
                  `}>
                    {cartCount}
                  </span>
                )}

                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 h-[3px] w-[3px] rounded-full bg-[#8A6F5F] animate-in fade-in zoom-in duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
