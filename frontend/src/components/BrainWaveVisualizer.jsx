import React, { useRef, useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';

const WAVE_CONFIG = [
  { name: 'Delta', freq: 2, color: '#8B5CF6', range: '0.5–4 Hz', desc: 'Deep Sleep' },
  { name: 'Theta', freq: 5, color: '#06B6D4', range: '4–8 Hz', desc: 'Meditation' },
  { name: 'Alpha', freq: 10, color: '#10B981', range: '8–13 Hz', desc: 'Relaxed Focus' },
  { name: 'Beta',  freq: 22, color: '#F59E0B', range: '13–30 Hz', desc: 'Active Thinking' },
  { name: 'Gamma', freq: 40, color: '#EF4444', range: '30–100 Hz', desc: 'Peak Awareness' },
];

export default function BrainWaveVisualizer({ scenario = 'normal', cognitiveState = {} }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  // Dynamically compute amplitude multipliers based on cognitive state & scenario
  const getAmplitudes = () => {
    const attention = cognitiveState?.attention ?? 80;
    const fatigue = cognitiveState?.fatigue ?? 15;
    const stress = cognitiveState?.stress ?? 25;

    if (scenario === 'fatigue') {
      // Drowsy: high delta/theta, low beta/gamma
      return [1.8, 1.5, 0.6, 0.3, 0.15];
    } else if (scenario === 'intent') {
      // Focused: high alpha/beta, moderate gamma
      return [0.3, 0.5, 1.6, 1.4, 0.9];
    } else {
      // Normal: balanced
      const attFactor = attention / 100;
      return [
        0.6 + (1 - attFactor) * 0.8,
        0.7 + fatigue / 200,
        1.0 + attFactor * 0.5,
        0.8 + stress / 200,
        0.4 + stress / 300
      ];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const W = rect.width;
    const H = rect.height;
    const laneHeight = H / WAVE_CONFIG.length;

    const draw = () => {
      timeRef.current += 0.016; // ~60fps
      const t = timeRef.current;
      const amps = getAmplitudes();

      ctx.clearRect(0, 0, W, H);

      WAVE_CONFIG.forEach((wave, i) => {
        const y0 = laneHeight * i + laneHeight / 2;
        const amp = amps[i] * (laneHeight * 0.32);

        // Draw lane separator
        ctx.strokeStyle = 'rgba(31, 41, 55, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, laneHeight * (i + 1));
        ctx.lineTo(W, laneHeight * (i + 1));
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw wave label
        ctx.fillStyle = wave.color;
        ctx.font = '9px Orbitron, sans-serif';
        ctx.globalAlpha = 0.7;
        ctx.fillText(wave.name.toUpperCase(), 4, laneHeight * i + 12);
        ctx.globalAlpha = 1.0;

        // Draw main waveform
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 6;

        for (let x = 0; x < W; x++) {
          const phase = (x / W) * Math.PI * 2 * (wave.freq / 4) - t * wave.freq * 0.5;
          // Add harmonics for realistic EEG appearance
          const noise = Math.sin(phase * 3.7 + t * 2.1) * amp * 0.08;
          const drift = Math.sin(t * 0.3 + i) * amp * 0.1;
          const y = y0 + Math.sin(phase) * amp + noise + drift;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw glow trail (faded duplicate)
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 4;
        for (let x = 0; x < W; x++) {
          const phase = (x / W) * Math.PI * 2 * (wave.freq / 4) - t * wave.freq * 0.5;
          const noise = Math.sin(phase * 3.7 + t * 2.1) * amp * 0.08;
          const drift = Math.sin(t * 0.3 + i) * amp * 0.1;
          const y = y0 + Math.sin(phase) * amp + noise + drift;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [scenario, cognitiveState]);

  return (
    <div className="cyber-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-cyber-border pb-2 mb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyber-accent animate-pulse" />
          <h3 className="font-cyber text-xs tracking-widest text-cyber-text">LIVE EEG BRAINWAVE OSCILLOSCOPE</h3>
        </div>
        <div className="flex gap-2">
          {WAVE_CONFIG.map((w) => (
            <div key={w.name} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: w.color }} />
              <span className="text-[8px] font-cyber text-cyber-textMuted">{w.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 relative bg-black/40 rounded border border-cyber-border/30 overflow-hidden min-h-[180px]">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
