import React, { useEffect, useState } from 'react';
import { AlertCircle, ShieldAlert, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function AlertBanner({ riskMetrics, interventionMetrics, intent }) {
  const [showNotification, setShowNotification] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 min pomodoro
  const [timerActive, setTimerActive] = useState(false);

  const riskLevel = riskMetrics?.risk_level || 'Safe';
  const actionCode = interventionMetrics?.action_code || 'NONE';
  const message = interventionMetrics?.message || '';

  // Handle pomodoro timer for Study Mode
  useEffect(() => {
    if (intent === 'Study Mode') {
      setTimerActive(true);
    } else {
      setTimerActive(false);
      setSecondsLeft(1500);
    }
  }, [intent]);

  useEffect(() => {
    let interval = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  // Trigger audio beeps for critical warnings (using web audio API)
  useEffect(() => {
    if (riskLevel === 'Critical' && actionCode === 'TRIGGER_AUDIBLE_ALARM') {
      // Play a cyberpunk warning beep using browser synth
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const playBeep = (time) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, time); // A5 note
          gain.gain.setValueAtTime(0.1, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(time);
          osc.stop(time + 0.35);
        };
        
        const now = audioCtx.currentTime;
        playBeep(now);
        playBeep(now + 0.4);
      } catch (e) {
        console.log("Audio API not allowed yet.");
      }
    }
  }, [riskLevel, actionCode, message]); // Trigger when warning updates

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Render study resources block
  if (intent === 'Study Mode') {
    return (
      <div className="cyber-panel p-4 bg-cyber-accent/5 border-cyber-accent animate-pulse-fast shadow-[0_0_15px_rgba(0,240,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-accent/15 rounded-full border border-cyber-accent/30 text-cyber-accent">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-cyber text-sm font-bold text-cyber-accent">PRODUCTIVITY MODE ACTIVE</h3>
            <p className="text-xs text-cyber-textMuted mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Productivity timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-cyber-border rounded font-cyber text-xs">
            <Clock className="w-3.5 h-3.5 text-cyber-accent" />
            <span className="text-cyber-accent">{formatTime(secondsLeft)}</span>
          </div>

          <a 
            href="https://github.com/abhinavv0516/Nuero_Pilot" 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-1.5 bg-cyber-accent hover:bg-cyber-accent/80 text-cyber-bg font-cyber text-[10px] font-bold rounded shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
          >
            OPEN DOCUMENTATION
          </a>
        </div>
      </div>
    );
  }

  // Render normal/warning alerts
  if (riskLevel === 'Safe') {
    return (
      <div className="cyber-panel p-4 bg-cyber-neonGreen/5 border-cyber-neonGreen/30 flex items-center gap-3">
        <div className="p-2 bg-cyber-neonGreen/10 rounded-full border border-cyber-neonGreen/30 text-cyber-neonGreen">
          <Sparkles className="w-5 h-5 text-glow-green" />
        </div>
        <div>
          <h3 className="font-cyber text-xs font-bold text-cyber-neonGreen">SYSTEM NOMINAL</h3>
          <p className="text-[10px] text-cyber-textMuted mt-0.5">{message}</p>
        </div>
      </div>
    );
  }

  const isCritical = riskLevel === 'Critical';
  const alertColor = isCritical ? 'text-cyber-neonRed border-cyber-neonRed/60 bg-cyber-neonRed/10 animate-pulse' : 'text-cyber-neonYellow border-cyber-neonYellow/50 bg-cyber-neonYellow/5';
  const Icon = isCritical ? ShieldAlert : AlertCircle;

  return (
    <div className={`cyber-panel p-4 border ${alertColor} flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full border border-current text-current">
          <Icon className={`w-5 h-5 ${isCritical ? 'text-glow-red' : 'text-glow-yellow'}`} />
        </div>
        <div>
          <h3 className="font-cyber text-xs font-bold uppercase tracking-wider">
            {isCritical ? 'CRITICAL RISK INTERVENTION REQUIRED' : 'WARNING STATE DETECTED'}
          </h3>
          <p className="text-[10px] text-cyber-text font-medium mt-0.5">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[9px] font-cyber">
        <span className={`px-2 py-0.5 border border-current rounded-full uppercase ${isCritical ? 'text-cyber-neonRed bg-cyber-neonRed/10' : 'text-cyber-neonYellow bg-cyber-neonYellow/10'}`}>
          {actionCode}
        </span>
      </div>
    </div>
  );
}
