'use client';

import type { BottleneckAlert } from '@/types';
import { getStationName, getStationIcon } from '@/lib/formatting';

interface BottleneckAlertProps {
  alert: BottleneckAlert;
  onApply?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

export default function BottleneckAlertBanner({ alert, onApply, onDismiss }: BottleneckAlertProps) {
  const isCritical = alert.severity === 'critical';
  
  return (
    <div className={`
      p-4 rounded-lg border-2 flex items-start gap-4
      ${isCritical 
        ? 'bg-red-600/20 border-red-600 animate-urgent-pulse' 
        : 'bg-amber-600/20 border-amber-600'
      }
    `}>
      <div className="text-3xl">
        {isCritical ? '🚨' : '⚠️'}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
            {getStationIcon(alert.station)} {alert.message}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
            🤖 AI Detected
          </span>
        </div>
        
        <p className="text-sm text-neutral-300 mb-2">{alert.suggestion}</p>
        
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>Backlog: {alert.metrics.backlog}</span>
          <span>Avg Time: {alert.metrics.avgTime}min</span>
          <span>Late Rate: {alert.metrics.lateRate}%</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {onApply && (
          <button
            onClick={() => onApply(alert.id)}
            className="btn-kds btn-primary text-xs"
          >
            Apply
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="btn-kds btn-ghost text-xs"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
