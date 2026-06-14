import React from 'react';
import { Play, Shield, Sliders, AlertOctagon, BrainCircuit } from 'lucide-react';

export default function ScenarioConsole({ 
  activeScenario, 
  onScenarioChange, 
  overrides, 
  onOverrideChange 
}) {
  const scenarios = [
    {
      id: 'normal',
      name: 'Scenario 1: Normal State',
      icon: Shield,
      color: 'text-cyber-neonGreen border-cyber-neonGreen/30 bg-cyber-neonGreen/5',
      description: 'Simulates a focused operator. Attention is high, fatigue is low, and risk is low.'
    },
    {
      id: 'fatigue',
      name: 'Scenario 2: Drowsiness & Risk',
      icon: AlertOctagon,
      color: 'text-cyber-neonRed border-cyber-neonRed/30 bg-cyber-neonRed/5',
      description: 'Simulates operator nodding off. Eyes close, blink rates drop, and risk alerts trigger.'
    },
    {
      id: 'intent',
      name: 'Scenario 3: Intent & Focus',
      icon: BrainCircuit,
      color: 'text-cyber-accent border-cyber-accent/30 bg-cyber-accent/5',
      description: 'Triggers Study Mode. System automatically locks down notifications and opens study assets.'
    }
  ];

  const bciIntents = ['Relaxing', 'Real Left', 'Real Right', 'Real Feet', 'Real Fists'];

  return (
    <div className="cyber-panel p-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 border-b border-cyber-border pb-2 mb-3">
          <Play className="w-5 h-5 text-cyber-accent animate-pulse" />
          <h3 className="font-cyber text-sm tracking-wider text-cyber-text">DEMO CONTROL CONSOLE</h3>
        </div>

        {/* Scenario Selection Buttons */}
        <div className="flex flex-col gap-2.5">
          {scenarios.map((scen) => {
            const Icon = scen.icon;
            const isActive = activeScenario === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => onScenarioChange(scen.id)}
                className={`w-full text-left p-3 border rounded transition-all duration-200 ${
                  isActive 
                    ? `${scen.color} border-opacity-100 scale-[1.01] shadow-[0_0_10px_rgba(0,240,255,0.15)]` 
                    : 'border-cyber-border hover:border-cyber-accent/50 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="font-cyber text-xs font-semibold text-cyber-text">{scen.name}</span>
                </div>
                <p className="text-[10px] text-cyber-textMuted leading-relaxed">{scen.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Telemetry Override Sliders */}
      <div className="mt-4 border-t border-cyber-border/40 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sliders className="w-3.5 h-3.5 text-cyber-accent" />
          <span className="font-cyber text-[10px] tracking-wider text-cyber-text">MANUAL TELEMETRY OVERRIDES</span>
        </div>

        <div className="flex flex-col gap-2.5 text-[10px]">
          {/* Heart Rate Slider */}
          <div>
            <div className="flex justify-between text-cyber-textMuted mb-0.5">
              <span>Heart Rate:</span>
              <span className="font-cyber text-cyber-accent">{overrides.heartRate} BPM</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="130" 
              value={overrides.heartRate}
              onChange={(e) => onOverrideChange('heartRate', parseInt(e.target.value))}
              className="w-full accent-cyber-accent h-1 bg-cyber-border rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Keypress Activity Slider */}
          <div>
            <div className="flex justify-between text-cyber-textMuted mb-0.5">
              <span>Keyboard Activity:</span>
              <span className="font-cyber text-cyber-accent">{overrides.keyboardActivity} CPM</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="150" 
              value={overrides.keyboardActivity}
              onChange={(e) => onOverrideChange('keyboardActivity', parseInt(e.target.value))}
              className="w-full accent-cyber-accent h-1 bg-cyber-border rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* BCI Wave Class Selector */}
          <div>
            <div className="text-cyber-textMuted mb-1">Select BCI Movement Intent:</div>
            <div className="grid grid-cols-3 gap-1">
              {bciIntents.map((intent) => (
                <button
                  key={intent}
                  onClick={() => onOverrideChange('eegClass', intent)}
                  className={`py-1 text-[8px] rounded border font-semibold truncate ${
                    overrides.eegClass === intent
                      ? 'bg-cyber-accentDim text-cyber-accent border-cyber-accent'
                      : 'border-cyber-border hover:border-cyber-accent/40 text-cyber-textMuted'
                  }`}
                >
                  {intent.replace('Real ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
