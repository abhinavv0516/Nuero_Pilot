import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Terminal, Database, Server, BrainCircuit, Cpu, Wifi, Heart, Zap } from 'lucide-react';
import NeuralBackground from './components/NeuralBackground';
import BootSequence from './components/BootSequence';
import VisionOverlay from './components/VisionOverlay';
import ScenarioConsole from './components/ScenarioConsole';
import StatusGauge from './components/StatusGauge';
import MetricsChart from './components/MetricsChart';
import AlertBanner from './components/AlertBanner';
import BrainWaveVisualizer from './components/BrainWaveVisualizer';

export default function App() {
  const [booted, setBooted] = useState(false);
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
  const [uptime, setUptime] = useState(0);

  const wsRef = useRef(null);
  const liveKeypressRef = useRef(0);
  const latestOverridesRef = useRef(overrides);
  const latestScenarioRef = useRef(activeScenario);

  // Keep refs in sync
  useEffect(() => { latestOverridesRef.current = overrides; }, [overrides]);
  useEffect(() => { latestScenarioRef.current = activeScenario; }, [activeScenario]);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  // Track actual keypresses
  useEffect(() => {
    const handleKeyDown = () => { liveKeypressRef.current += 1; };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live keypress frequency and reset counter every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const liveCPM = liveKeypressRef.current * 15;
      liveKeypressRef.current = 0;
      if (liveCPM > 0) {
        setOverrides(prev => ({
          ...prev,
          keyboardActivity: Math.max(prev.keyboardActivity, liveCPM)
        }));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Establish WebSocket connection to backend
  useEffect(() => {
    if (!booted) return;

    const connectWS = () => {
      try {
        const socket = new WebSocket('ws://127.0.0.1:8000/ws');

        socket.onopen = () => {
          console.log("WebSocket connected.");
          setWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            setSystemState(payload);
            fetchHistory();
            generateAgentLogs(payload);
          } catch (e) {
            console.error("Failed to parse message:", e);
          }
        };

        socket.onclose = () => {
          console.log("WebSocket disconnected. Reconnecting in 3s...");
          setWsConnected(false);
          setTimeout(connectWS, 3000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };

        wsRef.current = socket;
      } catch (e) {
        console.error("WebSocket connection error:", e);
        setTimeout(connectWS, 3000);
      }
    };

    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [booted]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) { /* backend offline */ }
  };

  const handleTelemetryUpdate = useCallback((telemetry) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const ov = latestOverridesRef.current;
    const sc = latestScenarioRef.current;

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
      keyboard_activity: ov.keyboardActivity,
      heart_rate: ov.heartRate,
      eeg_class: ov.eegClass,
      scenario: sc
    };

    wsRef.current.send(JSON.stringify(packet));

    // Decay keyboard activity slowly
    setOverrides(prev => {
      if (prev.keyboardActivity > 0) {
        return { ...prev, keyboardActivity: Math.max(0, Math.floor(prev.keyboardActivity * 0.9)) };
      }
      return prev;
    });
  }, []);

  const handleScenarioChange = (scenarioId) => {
    setActiveScenario(scenarioId);

    if (scenarioId === 'fatigue') {
      setOverrides(prev => ({ ...prev, heartRate: 88, eegClass: 'Relaxing' }));
    } else if (scenarioId === 'intent') {
      setOverrides(prev => ({ ...prev, heartRate: 68, keyboardActivity: 75, eegClass: 'Real Right' }));
    } else {
      setOverrides(prev => ({ ...prev, heartRate: 72, keyboardActivity: 0, eegClass: 'Relaxing' }));
    }

    fetch('http://127.0.0.1:8000/api/history/clear', { method: 'POST' })
      .then(() => setHistoryData([]))
      .catch(() => {});
  };

  const handleOverrideChange = (field, value) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };

  const generateAgentLogs = (state) => {
    const time = new Date().toLocaleTimeString();
    const logs = [];

    if (state.telemetry) {
      logs.push(`[${time}] [1/6 Signal Agent] HR: ${Math.round(state.telemetry.heart_rate)} BPM | Blink: ${Math.round(state.telemetry.blink_rate)}/min | Gaze Jitter: ${state.telemetry.gaze_jitter?.toFixed(3)}`);
    }
    if (state.cognitive) {
      logs.push(`[${time}] [2/6 Cognitive Agent] ATT: ${Math.round(state.cognitive.attention)}% | FAT: ${Math.round(state.cognitive.fatigue)}% | STR: ${Math.round(state.cognitive.stress)}% | LOAD: ${Math.round(state.cognitive.cognitive_load)}%`);
    }
    if (state.intent) {
      logs.push(`[${time}] [3/6 Intent Agent] Detected: ${state.intent.toUpperCase()}`);
    }
    if (state.risk) {
      logs.push(`[${time}] [4/6 Risk Agent] Failure Prob: ${Math.round(state.risk.failure_probability)}% | Level: ${state.risk.risk_level.toUpperCase()}`);
    }
    if (state.intervention) {
      logs.push(`[${time}] [5/6 Intervention] ${state.intervention.action_code}: "${state.intervention.message}"`);
    }
    if (state.learning) {
      logs.push(`[${time}] [6/6 Learning Agent] Baseline HR: ${Math.round(state.learning.baseline_heart_rate)} BPM | Profile: ${state.learning.profile_strength}%`);
    }

    setAgentLogs(prev => [...logs, ...prev].slice(0, 24));
  };

  const getRiskColor = (level) => {
    if (level === 'Critical') return 'text-cyber-neonRed border-cyber-neonRed/30 bg-cyber-neonRed/5';
    if (level === 'Warning') return 'text-cyber-neonYellow border-cyber-neonYellow/30 bg-cyber-neonYellow/5';
    return 'text-cyber-neonGreen border-cyber-neonGreen/30 bg-cyber-neonGreen/5';
  };

  const riskLevel = systemState?.risk?.risk_level || 'Safe';
  const failureProbability = systemState?.risk?.failure_probability || 8.0;

  // Boot Sequence
  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="min-h-screen bg-cyber-bg bg-grid-pattern relative">
      {/* Animated Neural Background */}
      <NeuralBackground />

      {/* HUD HEADER */}
      <header className="relative z-10 border-b border-cyber-border bg-cyber-panelHeader/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-accent to-transparent opacity-70 animate-pulse" />

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-cyber-accent/10 rounded-full blur-lg animate-pulse" />
            <BrainCircuit className="w-8 h-8 text-cyber-accent relative z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-[0.2em] text-cyber-text font-cyber">
              NEUROPILOT <span className="text-cyber-accent">GUARDIAN</span>
            </h1>
            <p className="text-[9px] text-cyber-textMuted tracking-[0.15em] font-cyber">AI-POWERED BCI/HCI COGNITIVE SAFETY ENGINE</p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-[9px] font-cyber">
          <div className="flex items-center gap-1.5">
            <Wifi className={`w-3.5 h-3.5 ${wsConnected ? 'text-cyber-neonGreen' : 'text-cyber-neonRed animate-pulse'}`} />
            <span className="text-cyber-textMuted">CORE:</span>
            <span className={wsConnected ? 'text-cyber-neonGreen' : 'text-cyber-neonRed'}>{wsConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyber-textMuted" />
            <span className="text-cyber-textMuted">BCI:</span>
            <span className="text-cyber-accent">{overrides.eegClass.replace('Real ', '').toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-cyber-neonRed" />
            <span className="text-cyber-textMuted">HR:</span>
            <span className="text-cyber-text">{overrides.heartRate} BPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyber-neonYellow" />
            <span className="text-cyber-textMuted">UPTIME:</span>
            <span className="text-cyber-text">{formatUptime(uptime)}</span>
          </div>
        </div>
      </header>

      {/* DASHBOARD */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-4 mt-5 flex flex-col gap-5 pb-10">

        {/* ALERT BANNER */}
        <AlertBanner
          riskMetrics={systemState?.risk}
          interventionMetrics={systemState?.intervention}
          intent={systemState?.intent}
        />

        {/* STATUS GAUGES ROW */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatusGauge label="Attention" value={systemState?.cognitive?.attention ?? 90} type="attention" />
          <StatusGauge label="Fatigue" value={systemState?.cognitive?.fatigue ?? 12} type="fatigue" />
          <StatusGauge label="Stress" value={systemState?.cognitive?.stress ?? 24} type="stress" />
          <StatusGauge label="Cognitive Load" value={systemState?.cognitive?.cognitive_load ?? 30} type="load" />

          {/* Safety Status Module */}
          <div className={`cyber-panel p-3 flex flex-col items-center justify-center border transition-all duration-500 ${getRiskColor(riskLevel)}`}>
            <span className="font-cyber text-[9px] tracking-widest text-cyber-textMuted mb-1">SAFETY</span>
            <span className={`font-cyber text-xl font-black tracking-widest uppercase ${
              riskLevel === 'Critical' ? 'animate-pulse text-glow-red' :
              riskLevel === 'Warning' ? 'text-glow-yellow' : 'text-glow-green'
            }`}>
              {riskLevel}
            </span>
            <div className="flex items-center gap-1 text-[8px] font-cyber text-cyber-textMuted mt-1">
              <Activity className="w-3 h-3" />
              <span>Crash: {Math.round(failureProbability)}%</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID: LEFT COLUMN (Inputs) + RIGHT COLUMN (Visualizations) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <VisionOverlay onTelemetryUpdate={handleTelemetryUpdate} activeScenario={activeScenario} />
            <ScenarioConsole
              activeScenario={activeScenario}
              onScenarioChange={handleScenarioChange}
              overrides={overrides}
              onOverrideChange={handleOverrideChange}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* EEG Brainwave Oscilloscope */}
            <BrainWaveVisualizer scenario={activeScenario} cognitiveState={systemState?.cognitive} />

            {/* Metrics History Chart */}
            <MetricsChart historyData={historyData} />

            {/* Agent Reasoning Console */}
            <div className="cyber-panel p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-cyber-border pb-2 mb-3">
                <Terminal className="w-4 h-4 text-cyber-accent" />
                <h3 className="font-cyber text-[10px] tracking-widest text-cyber-text">AI AGENT EXECUTION TRACE</h3>
                <span className="ml-auto text-[8px] font-cyber text-cyber-textMuted px-2 py-0.5 border border-cyber-border rounded-full">
                  {agentLogs.length} ENTRIES
                </span>
              </div>

              <div className="bg-black/50 border border-cyber-border/40 rounded p-3 font-mono text-[10px] overflow-y-auto leading-relaxed h-[200px]">
                {agentLogs.length > 0 ? (
                  agentLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`py-0.5 border-l-2 pl-2 mb-0.5 ${
                        log.includes('Intervention') ? 'border-cyber-neonYellow/50 text-cyber-neonYellow' :
                        log.includes('Risk Agent') && log.includes('CRITICAL') ? 'border-cyber-neonRed/50 text-cyber-neonRed font-bold animate-pulse' :
                        log.includes('Signal') ? 'border-cyber-border text-cyber-textMuted' :
                        log.includes('Learning') ? 'border-purple-500/30 text-purple-400' :
                        'border-cyber-accent/30 text-cyber-accent'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-cyber-textMuted text-center mt-12 animate-pulse font-cyber">
                    &gt; AWAITING SENSOR DATA STREAM...
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
