import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MetricsChart({ historyData }) {
  // Format data for display
  const data = historyData.length > 0 
    ? historyData 
    : Array.from({ length: 20 }, (_, i) => ({
        time: `--:--`,
        attention: 80,
        fatigue: 15,
        stress: 20,
        cognitive_load: 30
      }));

  return (
    <div className="cyber-panel p-4 h-full flex flex-col justify-between min-h-[260px]">
      <div className="flex justify-between items-center border-b border-cyber-border pb-2 mb-3">
        <h3 className="font-cyber text-xs tracking-widest text-cyber-text">REAL-TIME COGNITIVE HISTORICAL TRENDS</h3>
        <div className="flex gap-3 text-[9px] font-cyber text-cyber-textMuted">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-[#00F0FF]" />
            <span>ATTENTION</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-[#F59E0B]" />
            <span>FATIGUE</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-[#A78BFA]" />
            <span>STRESS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-[#10B981]" />
            <span>LOAD</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#4B5563" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis 
              stroke="#4B5563" 
              fontSize={8} 
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0B0F19', 
                borderColor: '#1F2937',
                borderRadius: '6px',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '10px',
                color: '#F3F4F6'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="attention" 
              stroke="#00F0FF" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorAtt)" 
              dot={false}
            />
            <Area 
              type="monotone" 
              dataKey="fatigue" 
              stroke="#F59E0B" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorFat)" 
              dot={false}
            />
            <Area 
              type="monotone" 
              dataKey="stress" 
              stroke="#A78BFA" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorStress)" 
              dot={false}
            />
            <Area 
              type="monotone" 
              dataKey="cognitive_load" 
              stroke="#10B981" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorLoad)" 
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
