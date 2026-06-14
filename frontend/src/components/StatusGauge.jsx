import React from 'react';

export default function StatusGauge({ label, value, type = 'attention' }) {
  // Determine color coding based on metric type and value
  const getColors = (val) => {
    if (type === 'attention') {
      if (val > 65) return { stroke: '#10B981', text: 'text-cyber-neonGreen', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
      if (val > 35) return { stroke: '#F59E0B', text: 'text-cyber-neonYellow', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' };
      return { stroke: '#EF4444', text: 'text-cyber-neonRed', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' };
    }
    
    // For Fatigue, Stress, Cognitive Load (higher is worse)
    if (val < 35) return { stroke: '#10B981', text: 'text-cyber-neonGreen', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
    if (val < 68) return { stroke: '#F59E0B', text: 'text-cyber-neonYellow', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' };
    return { stroke: '#EF4444', text: 'text-cyber-neonRed', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' };
  };

  const { stroke, text, glow } = getColors(value);
  const roundedValue = Math.round(value);

  // SVG parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="cyber-panel p-3 flex flex-col items-center justify-center relative group hover:border-cyber-accent/30 transition-all duration-300">
      <span className="font-cyber text-[10px] tracking-widest text-cyber-textMuted mb-2 text-center truncate w-full">
        {label.toUpperCase()}
      </span>
      
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Track circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-cyber-border fill-none"
            strokeWidth="3.5"
          />
          {/* Animated value circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="fill-none transition-all duration-500 ease-out"
            stroke={stroke}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${stroke})`
            }}
          />
        </svg>
        
        {/* Central percentage text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-cyber text-lg font-bold tracking-tighter ${text}`}>
            {roundedValue}%
          </span>
        </div>
      </div>
    </div>
  );
}
