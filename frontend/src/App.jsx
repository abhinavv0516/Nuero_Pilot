import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Terminal, Database, Server, RefreshCw } from 'lucide-react';
import VisionOverlay from './components/VisionOverlay';
import ScenarioConsole from './components/ScenarioConsole';
import StatusGauge from './components/StatusGauge';
import MetricsChart from './components/MetricsChart';
import AlertBanner from './components/AlertBanner';

export default function App() {
  const [activeScenario, setActiveScenario] = useState('normal');
  const [overrides, setOverrides] = useState({
    heartRate: 72,
    keyboardActivity: 0,
    eegClass: 'Relaxing'
  });
  
  const [systemState, setSystemState] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  
  const wsRef = useRef(null);
  const liveKeypressRef = useRef(0);
  
  // Track actual keypresses to calculate live keystrokes-per-minute
  useEffect(() => {
    const handleKeyDown = () => {
      liveKeypressRef.current += 1;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live keypress frequency (CPM) and reset counter every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const liveCPM = liveKeypressRef.current * 15; // Extrapolate to clicks/min
      liveKeypressRef.current = 0;
      
      // Merge live keypresses into the overrides
      setOverrides(prev => ({
        ...prev,
        keyboardActivity: Math.max(prev.keyboardActivity, liveCPM)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Establish WebSocket connection to backend
  useEffect(() => {
    const connectWS = () => {
      const socket = new WebSocket('ws://127.0.0.1:8000/ws');
      
      socket.onopen = () => {
        console.log("WebSocket connected.");
        setWsConnected(true);
      };
      
      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        setSystemState(payload);
        
        // Fetch updated history
        fetchHistory();
        
        // Format agent reasoning logs
        generateAgentLogs(payload);
      };
      
      socket.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting in 3s...");
        setWsConnected(false);
        setTimeout(connectWS, 3000);
      };
      
      wsRef.current = socket;
    };

    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Fetch session history from REST API
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) {
      console.log("Error fetching history:", e);
    }
  };

  // Triggered when webcam sends new telemetry
  const handleTelemetryUpdate = (telemetry) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Send unified packet of webcam data + manual overrides
    const packet = {
      blink_rate: telemetry.blinkRate,
      eyes_closed: telemetry.eyesClosed,
      eye_gaze: {
        x: telemetry.gazeX,
        y: telemetry.gazeY,
        jitter: telemetry.gazeJitter
      },
      head_pose: {
        pitch: telemetry.headPitch,
        yaw: telemetry.headYaw,
        roll: telemetry.headRoll
      },
      keyboard_activity: overrides.keyboardActivity,
      heart_rate: overrides.heartRate,
      eeg_class: overrides.eegClass,
      scenario: activeScenario
    };

    wsRef.current.send(json.stringify(packet));

    // Slowly decay keyboard activity override towards 0 if no user keys
    setOverrides(prev => {
      if (prev.keyboardActivity > 0) {
        return { ...prev, keyboardActivity: Math.max(0, Math.floor(prev.keyboardActivity * 0.9)) };
      }
      return prev;
    });
  };

  const handleScenarioChange = (scenarioId) => {
    setActiveScenario(scenarioId);
    
    // Automatically set matching overrides to showcase the demo best
    if (scenarioId === 'fatigue') {
      setOverrides(prev => ({ ...prev, heartRate: 88, eegClass: 'Relaxing' }));
    } else if (scenarioId === 'intent') {
      setOverrides(prev => ({ ...prev, heartRate: 68, keyboardActivity: 75, eegClass: 'Real Right' }));
    } else {
      setOverrides(prev => ({ ...prev, heartRate: 72, keyboardActivity: 0, eegClass: 'Relaxing' }));
    }

    // Clear history on scenario switch to start fresh trends
    fetch('http://127.0.0.1:8000/api/history/clear', { method: 'POST' })
      .then(() => setHistoryData([]))
      .catch(e => console.log(e));
  };

  const handleOverrideChange = (field, value) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };

  const generateAgentLogs = (state) => {
    const time = new Date().toLocaleTimeString();
    const logs = [];

    if (state.telemetry) {
      logs.push(`[${time}] [1/6 Signal Agent] Raw heart rate (${Math.round(state.telemetry.heart_rate)} BPM) and eye aspect ratio normalized.`);
    }
    if (state.cognitive) {
      logs.push(`[${time}] [2/6 Cog Agent] Attention: ${Math.round(state.cognitive.attention)}% | Fatigue: ${Math.round(state.cognitive.fatigue)}% | Stress: ${Math.round(state.cognitive.stress)}%.`);
    }
    if (state.intent) {
      logs.push(`[${time}] [3/6 Intent Agent] Detected intent: ${state.intent.toUpperCase()}.`);
    }
    if (state.risk) {
      logs.push(`[${time}] [4/6 Risk Agent] Failure index is ${Math.round(state.risk.failure_probability)}%. Risk rating is ${state.risk.risk_level.toUpperCase()}.`);
    }
    if (state.intervention) {
      logs.push(`[${time}] [5/6 Intervention Agent] Recommendation: "${state.intervention.message}"`);
    }
    if (state.learning) {
      logs.push(`[${time}] [6/6 Learning Agent] Learned resting HR baseline: ${Math.round(state.learning.baseline_heart_rate)} BPM (Profile: ${state.learning.profile_strength}%).`);
    }

    setAgentLogs(prev => [...logs, ...prev].slice(0, 18));
  };

  // Determine top level status colors
  const getRiskColor = (level) => {
    if (level === 'Critical') return 'text-cyber-neonRed border-cyber-neonRed/30 bg-cyber-neonRed/5 shadow-[inset_0_0_15px_rgba(239,68,68,0.15)]';
    if (level === 'Warning') return 'text-cyber-neonYellow border-cyber-neonYellow/30 bg-cyber-neonYellow/5 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]';
    return 'text-cyber-neonGreen border-cyber-neonGreen/30 bg-cyber-neonGreen/5 shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]';
  };

  const riskLevel = systemState?.risk?.risk_level || 'Safe';
  const failureProbability = systemState?.risk?.failure_probability || 8.0;

  return (
    <div className="min-h-screen bg-cyber-bg bg-grid-pattern pb-8">
      {/* HUD HEADER */}
      <header className="border-b border-cyber-border bg-cyber-panelHeader/90 backdrop-blur-md px-6 py-4 flex items-center justify-between relative">
        {/* Glow scanline effect */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-accent to-transparent opacity-70 animate-pulse" />
        
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-cyber-accent animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-widest text-cyber-text flex items-center gap-2">
              NEUROPILOT <span className="text-cyber-accent">GUARDIAN</span>
            </h1>
            <p className="text-[10px] text-cyber-textMuted tracking-wider font-cyber mt-0.5">BCI/HCI COGNITIVE SAFETY ENGINE</p>
          </div>
        </div>

        {/* SYSTEM STATUS STATS */}
        <div className="flex items-center gap-6 text-[10px] font-cyber">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyber-textMuted" />
            <span className="text-cyber-textMuted">CORE ENGINE:</span>
            <span className={wsConnected ? 'text-cyber-neonGreen' : 'text-cyber-neonRed'}>
              {wsConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyber-textMuted" />
            <span className="text-cyber-textMuted">BCI MODE:</span>
            <span className="text-cyber-accent">{overrides.eegClass.replace('Real ', '').toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="max-w-7xl mx-auto px-4 mt-6 flex flex-col gap-6">
        
        {/* UPPER NOTIFICATION BANNER */}
        <AlertBanner 
          riskMetrics={systemState?.risk}
          interventionMetrics={systemState?.intervention}
          intent={systemState?.intent}
        />

        {/* STATUS GAUGES & RISK MODULE */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusGauge 
            label="Attention Index" 
            value={systemState?.cognitive?.attention ?? 90} 
            type="attention"
          />
          <StatusGauge 
            label="Fatigue Index" 
            value={systemState?.cognitive?.fatigue ?? 12} 
            type="fatigue"
          />
          <StatusGauge 
            label="Stress Level" 
            value={systemState?.cognitive?.stress ?? 24} 
            type="stress"
          />
          <StatusGauge 
            label="Cognitive Load" 
            value={systemState?.cognitive?.cognitive_load ?? 30} 
            type="load"
          />
          
          {/* Main Safety Risk Module */}
          <div className={`cyber-panel p-3 flex flex-col items-center justify-center border transition-all duration-300 ${getRiskColor(riskLevel)}`}>
            <span className="font-cyber text-[10px] tracking-widest text-cyber-textMuted mb-1.5">SAFETY STATUS</span>
            <span className="font-cyber text-lg font-black tracking-widest uppercase mb-1">
              {riskLevel}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-cyber text-cyber-textMuted">
              <Activity className="w-3.5 h-3.5" />
              <span>Crash Prob: {Math.round(failureProbability)}%</span>
            </div>
          </div>
        </div>

        {/* MIDDLE TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Layer Column (Left, size 1) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <VisionOverlay 
              onTelemetryUpdate={handleTelemetryUpdate} 
              activeScenario={activeScenario}
            />
            <ScenarioConsole 
              activeScenario={activeScenario} 
              onScenarioChange={handleScenarioChange}
              overrides={overrides}
              onOverrideChange={handleOverrideChange}
            />
          </div>

          {/* Analysis & Logging Column (Right, size 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Chart Area */}
            <MetricsChart historyData={historyData} />
            
            {/* Agent Console */}
            <div className="cyber-panel p-4 flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center gap-2 border-b border-cyber-border pb-2 mb-3">
                <Terminal className="w-4 h-4 text-cyber-accent" />
                <h3 className="font-cyber text-xs tracking-widest text-cyber-text">AI AGENT EXECUTION TRACE</h3>
              </div>

              <div className="flex-1 bg-black/50 border border-cyber-border/40 rounded p-3 font-mono text-[10px] text-cyber-accent overflow-y-auto leading-relaxed h-[180px]">
                {agentLogs.length > 0 ? (
                  agentLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`py-0.5 border-l-2 pl-2 mb-1 border-cyber-accent/30 ${
                        log.includes('Intervention') ? 'text-cyber-neonYellow' : 
                        log.includes('Risk Agent') && log.includes('CRITICAL') ? 'text-cyber-neonRed font-bold animate-pulse' :
                        log.includes('Signal') ? 'text-cyber-textMuted' : 'text-cyber-accent'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-cyber-textMuted text-center mt-8 animate-pulse">
                    &gt; WAITING FOR SENSOR DATA STREAM...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
