'use client';

interface DemoBannerProps {
  onToggleSimulator?: () => void;
  simulatorActive?: boolean;
}

export default function DemoBanner({ onToggleSimulator, simulatorActive = false }: DemoBannerProps) {
  return (
    <div className="demo-banner text-white py-2 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
          DEMO MODE
        </span>
        <span className="hidden sm:inline">
          This is a demo with simulated data. All features are fully functional.
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {onToggleSimulator && (
          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              simulatorActive
                ? 'bg-green-500/30 text-green-200'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${simulatorActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            {simulatorActive ? 'Live Orders ON' : 'Live Orders OFF'}
          </button>
        )}
        
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-white/70 hover:text-white text-xs underline underline-offset-2"
        >
          Reset Demo
        </button>
      </div>
    </div>
  );
}
