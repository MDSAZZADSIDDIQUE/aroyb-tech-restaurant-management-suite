import { SpiceLevel } from '@/types';

interface SpiceIndicatorProps {
  level: SpiceLevel;
}

export default function SpiceIndicator({ level }: SpiceIndicatorProps) {
  if (level === 0) return null;

  const spiceLabels = ['', 'Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme'];
  
  return (
    <span 
      className="inline-flex items-center gap-0.5 text-xs"
      title={spiceLabels[level]}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span 
          key={i} 
          className={`${i < level ? 'text-red-500' : 'text-neutral-300'}`}
        >
          🌶️
        </span>
      ))}
    </span>
  );
}
