import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, AlertTriangle, Eye, VideoOff } from 'lucide-react';

export default function VisionOverlay({ onTelemetryUpdate, activeScenario }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [blinkCount, setBlinkCount] = useState(0);
  const [localMetrics, setLocalMetrics] = useState({
    blinkRate: 14,
    eyesClosed: false,
    gazeX: 0.5,
    gazeY: 0.5,
    gazeJitter: 0.03,
    headPitch: 0,
    headYaw: 0,
    headRoll: 0
  });

  const blinkHistoryRef = useRef([]);
  const gazeHistoryRef = useRef([]);
  const eyeClosedRef = useRef(false);
  const closedSinceRef = useRef(0);

  // Fallback simulator loop if camera is inactive
  useEffect(() => {
    if (cameraActive) return;

    const interval = setInterval(() => {
      let simulated = {
        blinkRate: 14,
        eyesClosed: false,
        gazeX: 0.5,
        gazeY: 0.5,
        gazeJitter: 0.02,
        headPitch: 0,
        headYaw: 0,
        headRoll: 0
      };

      if (activeScenario === 'fatigue') {
        // High fatigue: low attention, high gaze jitter, nodding head down, blinking slowly or eyes closed
        const time = Date.now();
        const eyesClosed = (time % 8000) > 5500; // Close eyes for 2.5s every 8s
        
        simulated = {
          blinkRate: eyesClosed ? 4 : 26,
          eyesClosed: eyesClosed,
          gazeX: 0.5 + Math.sin(time / 500) * 0.15,
          gazeY: 0.6 + Math.cos(time / 700) * 0.1,
          gazeJitter: 0.18,
          headPitch: -14.5 + Math.sin(time / 1000) * 3, // Nodding off
          headYaw: Math.sin(time / 2000) * 8,
          headRoll: Math.cos(time / 1500) * 5
        };
      } else if (activeScenario === 'intent') {
        // Study mode: high focus, minimal head movements, gaze fixed on screen center
        const time = Date.now();
        simulated = {
          blinkRate: 11,
          eyesClosed: false,
          gazeX: 0.5 + Math.sin(time / 5000) * 0.03,
          gazeY: 0.55 + Math.cos(time / 6000) * 0.02,
          gazeJitter: 0.015,
          headPitch: 2.0 + Math.sin(time / 3000) * 0.5,
          headYaw: 1.0 + Math.cos(time / 4000) * 0.5,
          headRoll: 0.0
        };
      } else {
        // Normal state
        const time = Date.now();
        simulated = {
          blinkRate: 15 + Math.sin(time / 10000) * 3,
          eyesClosed: false,
          gazeX: 0.5 + Math.sin(time / 2000) * 0.08,
          gazeY: 0.5 + Math.cos(time / 2500) * 0.06,
          gazeJitter: 0.035,
          headPitch: Math.sin(time / 5000) * 3,
          headYaw: Math.cos(time / 6000) * 4,
          headRoll: Math.sin(time / 4000) * 2
        };
      }

      setLocalMetrics(simulated);
      onTelemetryUpdate(simulated);
    }, 500);

    return () => clearInterval(interval);
  }, [cameraActive, activeScenario, onTelemetryUpdate]);

  // MediaPipe FaceMesh Initialization
  useEffect(() => {
    if (!window.FaceMesh || !window.Camera) {
      setErrorMsg("MediaPipe library not loaded. Running in simulation mode.");
      return;
    }

    let activeCamera = null;
    let activeFaceMesh = null;

    const initMediaPipe = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const faceMesh = new window.FaceMesh.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onFaceResults);
        activeFaceMesh = faceMesh;

        if (videoRef.current) {
          const camera = new window.Camera.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current) {
                await faceMesh.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          camera.start();
          activeCamera = camera;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access denied or failed:", err);
        setHasCamera(false);
        setErrorMsg("Webcam access denied. Operating in Simulated Telemetry mode.");
      }
    };

    initMediaPipe();

    return () => {
      if (activeCamera) activeCamera.stop();
      if (activeFaceMesh) activeFaceMesh.close();
    };
  }, []);

  const onFaceResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    canvasCtx.clearRect(0, 0, width, height);

    // Draw video frame onto canvas as background
    canvasCtx.drawImage(results.image, 0, 0, width, height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Draw Face Mesh wireframe in glowing cyan
      canvasCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      canvasCtx.lineWidth = 1;
      
      // Draw a subset of face connections to look futuristic
      const keyConnections = [
        [33, 133], [362, 263], [70, 71], [300, 301], // Eyes
        [10, 152], [234, 454], // Center lines
        [61, 291], [0, 17], // Mouth
      ];
      
      keyConnections.forEach(([i, j]) => {
        const pt1 = landmarks[i];
        const pt2 = landmarks[j];
        canvasCtx.beginPath();
        canvasCtx.moveTo(pt1.x * width, pt1.y * height);
        canvasCtx.lineTo(pt2.x * width, pt2.y * height);
        canvasCtx.stroke();
      });

      // Highlight pupils in bright green
      const leftPupil = landmarks[468]; // Left eye pupil landmark
      const rightPupil = landmarks[473]; // Right eye pupil landmark
      
      if (leftPupil && rightPupil) {
        canvasCtx.fillStyle = '#10B981';
        canvasCtx.beginPath();
        canvasCtx.arc(leftPupil.x * width, leftPupil.y * height, 3, 0, 2 * Math.PI);
        canvasCtx.arc(rightPupil.x * width, rightPupil.y * height, 3, 0, 2 * Math.PI);
        canvasCtx.fill();
      }

      // --- CALCULATIONS ---

      // 1. Blink & Drowsiness detection (EAR)
      // Left eye landmarks: Top 159, Bottom 145, Left 33, Right 133
      const p159 = landmarks[159];
      const p145 = landmarks[145];
      const p33 = landmarks[33];
      const p133 = landmarks[133];
      
      const leftEAR = Math.abs(p159.y - p145.y) / Math.abs(p33.x - p133.x);
      
      // Right eye landmarks: Top 386, Bottom 374, Left 362, Right 263
      const p386 = landmarks[386];
      const p374 = landmarks[374];
      const p362 = landmarks[362];
      const p263 = landmarks[263];
      
      const rightEAR = Math.abs(p386.y - p374.y) / Math.abs(p362.x - p263.x);
      const ear = (leftEAR + rightEAR) / 2.0;

      // Closed eye check (EAR threshold ~0.16)
      const eyesClosed = ear < 0.16;
      const now = Date.now();
      
      if (eyesClosed) {
        if (!eyeClosedRef.current) {
          eyeClosedRef.current = true;
          closedSinceRef.current = now;
        }
      } else {
        if (eyeClosedRef.current) {
          // Closed eye ended
          const duration = now - closedSinceRef.current;
          if (duration > 80 && duration < 800) {
            // It was a valid blink (not a long micro-sleep)
            setBlinkCount(prev => prev + 1);
            blinkHistoryRef.current.push(now);
          }
          eyeClosedRef.current = false;
        }
      }

      // Filter blink history to compute blinks per minute (rolling 30 seconds window)
      blinkHistoryRef.current = blinkHistoryRef.current.filter(t => now - t < 30000);
      const blinkRate = blinkHistoryRef.current.length * 2; // scale to blinks/min

      // 2. Gaze Tracking & Jitter
      // We estimate gaze position based on iris position relative to eyelids
      const gazeX = (leftPupil.x + rightPupil.x) / 2.0;
      const gazeY = (leftPupil.y + rightPupil.y) / 2.0;
      
      gazeHistoryRef.current.push({ x: gazeX, y: gazeY, time: now });
      gazeHistoryRef.current = gazeHistoryRef.current.filter(g => now - g.time < 5000);
      
      // Calculate variance (jitter)
      let gazeJitter = 0.02;
      if (gazeHistoryRef.current.length > 3) {
        const meanX = gazeHistoryRef.current.reduce((acc, g) => acc + g.x, 0) / gazeHistoryRef.current.length;
        const meanY = gazeHistoryRef.current.reduce((acc, g) => acc + g.y, 0) / gazeHistoryRef.current.length;
        const varX = gazeHistoryRef.current.reduce((acc, g) => acc + Math.pow(g.x - meanX, 2), 0) / gazeHistoryRef.current.length;
        const varY = gazeHistoryRef.current.reduce((acc, g) => acc + Math.pow(g.y - meanY, 2), 0) / gazeHistoryRef.current.length;
        gazeJitter = Math.sqrt(varX + varY) * 10.0; // amplify for dashboard visibility
      }

      // 3. Head Pose Estimation (Pitch, Yaw, Roll)
      // Pitch: vertical ratio of nose (landmark 1) to forehead (10) and chin (152)
      const forehead = landmarks[10];
      const chin = landmarks[152];
      const noseTip = landmarks[1];
      const noseRatio = (noseTip.y - forehead.y) / (chin.y - forehead.y);
      const headPitch = (noseRatio - 0.6) * -90.0; // scale to degree approx

      // Yaw: horizontal ratio of nose to left cheeks (234) and right cheeks (454)
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];
      const noseXRatio = (noseTip.x - leftCheek.x) / (rightCheek.x - leftCheek.x);
      const headYaw = (noseXRatio - 0.5) * 120.0; // scale to degree approx

      // Roll: rotation of eye centers
      const headRoll = Math.atan2(rightPupil.y - leftPupil.y, rightPupil.x - leftPupil.x) * (180.0 / Math.PI);

      const metrics = {
        blinkRate: Math.max(2, Math.min(50, blinkRate === 0 ? 12 : blinkRate)),
        eyesClosed: eyesClosed,
        gazeX: parseFloat(gazeX.toFixed(3)),
        gazeY: parseFloat(gazeY.toFixed(3)),
        gazeJitter: parseFloat(gazeJitter.toFixed(3)),
        headPitch: parseFloat(headPitch.toFixed(1)),
        headYaw: parseFloat(headYaw.toFixed(1)),
        headRoll: parseFloat(headRoll.toFixed(1))
      };

      setLocalMetrics(metrics);
      onTelemetryUpdate(metrics);
    }
  };

  return (
    <div className="cyber-panel p-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-cyber-border pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Eye className={`w-5 h-5 ${cameraActive ? 'text-cyber-accent animate-pulse' : 'text-cyber-textMuted'}`} />
          <h3 className="font-cyber text-sm tracking-wider text-cyber-text">CAMERA TELEMETRY</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
          cameraActive 
            ? 'bg-cyber-accentDim text-cyber-accent border-cyber-accent/30' 
            : 'bg-yellow-500/10 text-cyber-neonYellow border-cyber-neonYellow/30'
        }`}>
          {cameraActive ? 'LIVE WEBCAM' : 'SIMULATION MODE'}
        </span>
      </div>

      <div className="relative flex-1 bg-black/60 rounded border border-cyber-border overflow-hidden min-h-[160px] flex items-center justify-center">
        {/* Hidden Video element for processing */}
        <video 
          ref={videoRef} 
          style={{ display: 'none' }} 
          width="640" 
          height="480" 
          playsInline 
          muted 
        />
        
        {/* Visible canvas displaying processed landmarks */}
        <canvas 
          ref={canvasRef} 
          width="320" 
          height="240" 
          className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive && 'hidden'}`}
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <VideoOff className="w-12 h-12 text-cyber-textMuted mb-2" />
            <p className="text-xs text-cyber-textMuted max-w-[200px]">
              {errorMsg || "Initializing MediaPipe components..."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-cyber border-t border-cyber-border/40 pt-2 text-cyber-textMuted">
        <div className="flex justify-between">
          <span>Eyes Closed:</span>
          <span className={localMetrics.eyesClosed ? 'text-cyber-neonRed font-bold' : 'text-cyber-neonGreen'}>
            {localMetrics.eyesClosed ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Blink Rate:</span>
          <span className="text-cyber-accent font-semibold">{localMetrics.blinkRate} /min</span>
        </div>
        <div className="flex justify-between">
          <span>Head Pitch:</span>
          <span className={Math.abs(localMetrics.headPitch) > 12 ? 'text-cyber-neonYellow' : 'text-cyber-text'}>
            {localMetrics.headPitch}°
          </span>
        </div>
        <div className="flex justify-between">
          <span>Head Yaw:</span>
          <span className={Math.abs(localMetrics.headYaw) > 15 ? 'text-cyber-neonYellow' : 'text-cyber-text'}>
            {localMetrics.headYaw}°
          </span>
        </div>
      </div>
    </div>
  );
}
