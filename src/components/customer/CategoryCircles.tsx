import React from 'react';
import { Sparkles, FlaskConical, Stethoscope, Zap, Gift } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: 'laser', name: 'Laser', icon: Zap, color: '#0d9488' },
  { id: 'peels', name: 'Peels', icon: Sparkles, color: '#0891b2' },
  { id: 'products', name: 'Glow', icon: FlaskConical, color: '#0f766e' },
  { id: 'consult', name: 'Expert', icon: Stethoscope, color: '#134e4a' },
  { id: 'offers', name: 'Offers', icon: Gift, color: '#0f172a' },
];

interface CategoryCirclesProps {
  onCategoryClick: (cat: string) => void;
}

export const CategoryCircles: React.FC<CategoryCirclesProps> = ({ onCategoryClick }) => {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto bg-white/50 px-4 py-6 backdrop-blur">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryClick(cat.id)}
          className="flex flex-col items-center gap-2 transition-transform duration-300 active:scale-95"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dce8ea] bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
            style={{ color: cat.color }}
          >
            <cat.icon size={28} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#134e4a]">
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
};
