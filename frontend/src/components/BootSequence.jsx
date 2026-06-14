import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';

const BOOT_LINES = [
  { text: '> INITIALIZING NEUROPILOT GUARDIAN v1.0...', delay: 200 },
  { text: '> Loading BCI/HCI Cognitive Safety Engine...', delay: 400 },
  { text: '> Signal Processing Agent............... [OK]', delay: 600 },
  { text: '> Cognitive Analysis Agent.............. [OK]', delay: 800 },
  { text: '> Intent Detection Agent............... [OK]', delay: 1000 },
  { text: '> Risk Prediction Agent................ [OK]', delay: 1200 },
  { text: '> Intervention Agent................... [OK]', delay: 1400 },
  { text: '> Learning Agent....................... [OK]', delay: 1600 },
  { text: '> MediaPipe FaceMesh Calibrating....... [OK]', delay: 1900 },
  { text: '> EEG Model Weights Loaded............. [OK]', delay: 2200 },
  { text: '> WebSocket Telemetry Link............. [READY]', delay: 2500 },
  { text: '> ALL SYSTEMS NOMINAL. LAUNCHING DASHBOARD...', delay: 2900 },
];

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line.text]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
      }, line.delay);
    });

    // Fade out and complete
    setTimeout(() => setFadeOut(true), 3400);
    setTimeout(() => onComplete(), 4000);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-cyber-bg flex flex-col items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Pulsing brain logo */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-cyber-accent/20 rounded-full blur-3xl animate-pulse" style={{ width: 120, height: 120, left: -20, top: -20 }} />
        <BrainCircuit className="w-20 h-20 text-cyber-accent animate-pulse relative z-10" />
      </div>

      <h1 className="font-cyber text-2xl font-bold tracking-[0.3em] text-cyber-text mb-1">
        NEURO<span className="text-cyber-accent">PILOT</span>
      </h1>
      <p className="font-cyber text-xs text-cyber-textMuted tracking-widest mb-8">GUARDIAN SYSTEM</p>

      {/* Terminal output */}
      <div className="w-full max-w-lg bg-black/60 border border-cyber-border rounded-lg p-4 font-mono text-[11px] text-cyber-accent h-64 overflow-hidden mb-6">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className={`py-0.5 ${
              line.includes('[OK]') ? 'text-cyber-neonGreen' :
              line.includes('[READY]') ? 'text-cyber-neonYellow' :
              line.includes('LAUNCHING') ? 'text-cyber-accent font-bold animate-pulse' :
              'text-cyber-accent'
            }`}
          >
            {line}
          </div>
        ))}
        <span className="inline-block w-2 h-4 bg-cyber-accent animate-pulse ml-1" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-[9px] font-cyber text-cyber-textMuted mb-1">
          <span>SYSTEM INITIALIZATION</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-cyber-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyber-accent to-cyber-neonGreen rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}
          />
        </div>
      </div>
    </div>
  );
}
