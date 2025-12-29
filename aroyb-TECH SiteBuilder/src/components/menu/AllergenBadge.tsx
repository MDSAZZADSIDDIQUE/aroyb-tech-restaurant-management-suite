import { AllergenType } from '@/types';

interface AllergenBadgeProps {
  allergen: AllergenType;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const allergenInfo: Record<AllergenType, { icon: string; label: string; color: string }> = {
  gluten: { icon: '🌾', label: 'Gluten', color: 'bg-amber-100 text-amber-800' },
  dairy: { icon: '🥛', label: 'Dairy', color: 'bg-blue-100 text-blue-800' },
  eggs: { icon: '🥚', label: 'Eggs', color: 'bg-yellow-100 text-yellow-800' },
  fish: { icon: '🐟', label: 'Fish', color: 'bg-cyan-100 text-cyan-800' },
  shellfish: { icon: '🦐', label: 'Shellfish', color: 'bg-pink-100 text-pink-800' },
  nuts: { icon: '🥜', label: 'Tree Nuts', color: 'bg-orange-100 text-orange-800' },
  peanuts: { icon: '🥜', label: 'Peanuts', color: 'bg-orange-100 text-orange-800' },
  soya: { icon: '🫘', label: 'Soya', color: 'bg-green-100 text-green-800' },
  celery: { icon: '🥬', label: 'Celery', color: 'bg-lime-100 text-lime-800' },
  mustard: { icon: '🟡', label: 'Mustard', color: 'bg-yellow-100 text-yellow-800' },
  sesame: { icon: '⚪', label: 'Sesame', color: 'bg-stone-100 text-stone-800' },
  sulphites: { icon: '🧪', label: 'Sulphites', color: 'bg-purple-100 text-purple-800' },
  lupin: { icon: '🌸', label: 'Lupin', color: 'bg-violet-100 text-violet-800' },
  molluscs: { icon: '🦪', label: 'Molluscs', color: 'bg-slate-100 text-slate-800' },
};

export default function AllergenBadge({ allergen, size = 'sm', showLabel = false }: AllergenBadgeProps) {
  const info = allergenInfo[allergen];
  
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
  };

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${info.color} text-xs font-medium`}>
        <span>{info.icon}</span>
        <span>{info.label}</span>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full ${info.color} ${sizeClasses[size]}`}
      title={info.label}
    >
      {info.icon}
    </span>
  );
}
