'use client';

import { RiskLevel } from '@/types';
import { riskConfig } from '@/lib/formatting';

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function RiskBadge({ level, showLabel = false, size = 'sm' }: RiskBadgeProps) {
  const config = riskConfig[level];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  const glowClass = level === 'high' ? 'risk-high' : level === 'medium' ? 'risk-medium' : '';
  
  return (
    <span 
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]} ${glowClass}`}
      title={config.label}
    >
      {level === 'high' && '🚨'}
      {level === 'medium' && '⚠️'}
      {showLabel ? config.label : level.toUpperCase()}
    </span>
  );
}
