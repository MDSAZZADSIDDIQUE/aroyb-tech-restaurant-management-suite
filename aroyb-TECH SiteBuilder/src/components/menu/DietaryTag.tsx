import { DietaryTag as DietaryTagType } from '@/types';

interface DietaryTagProps {
  tag: DietaryTagType;
  size?: 'sm' | 'md';
}

const tagInfo: Record<DietaryTagType, { label: string; shortLabel: string; color: string; icon: string }> = {
  vegetarian: { 
    label: 'Vegetarian', 
    shortLabel: 'V', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '🥬'
  },
  vegan: { 
    label: 'Vegan', 
    shortLabel: 'VG', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '🌱'
  },
  halal: { 
    label: 'Halal', 
    shortLabel: 'H', 
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: '✓'
  },
  'gluten-free-option': { 
    label: 'Gluten-Free Option', 
    shortLabel: 'GF', 
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '🌾'
  },
  'dairy-free': { 
    label: 'Dairy-Free', 
    shortLabel: 'DF', 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '🥛'
  },
  'nut-free': { 
    label: 'Nut-Free', 
    shortLabel: 'NF', 
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: '🥜'
  },
  spicy: { 
    label: 'Spicy', 
    shortLabel: '🌶️', 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '🌶️'
  },
  mild: { 
    label: 'Mild', 
    shortLabel: 'M', 
    color: 'bg-sky-100 text-sky-800 border-sky-300',
    icon: '❄️'
  },
};

export default function DietaryTag({ tag, size = 'sm' }: DietaryTagProps) {
  const info = tagInfo[tag];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${info.color} ${sizeClasses[size]}`}
      title={info.label}
    >
      <span className="text-[10px]">{info.icon}</span>
      <span>{info.shortLabel}</span>
    </span>
  );
}
