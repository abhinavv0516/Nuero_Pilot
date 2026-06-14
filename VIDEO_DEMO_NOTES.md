# 🎬 NeuroPilot Guardian — Video Demo Script & Reference Notes

> **For**: Demo video recording  
> **Project**: NeuroPilot Guardian — AI-Powered BCI/HCI Cognitive Safety Platform  
> **Repo**: https://github.com/abhinavv0516/Nuero_Pilot  
> **Duration Target**: 3–5 minutes

---

## 🔧 SETUP BEFORE RECORDING

### Step 1: Clone the repo
```bash
git clone https://github.com/abhinavv0516/Nuero_Pilot.git
cd Nuero_Pilot
```

### Step 2: Start the Backend (Terminal 1)
```bash
cd backend
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install fastapi uvicorn websockets numpy scikit-learn joblib
python run.py
```
You should see: `Uvicorn running on http://127.0.0.1:8000`

### Step 3: Start the Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
You should see: `VITE ready... Local: http://localhost:5173/`

### Step 4: Open the browser
- Go to **http://localhost:5173**
- Allow camera permissions if prompted (optional — works without camera too)
- You'll see a **futuristic boot sequence** animation loading each AI agent

---

## 🎥 VIDEO SCRIPT — SCENE BY SCENE

---

### SCENE 1: THE HOOK (0:00 – 0:20)
**What to show**: The boot sequence animation loading on screen

**Narration script**:
> "What if AI could predict when a pilot is about to lose focus... or when a surgeon is too fatigued to operate safely? This is NeuroPilot Guardian — an AI-powered cognitive safety system that monitors your brain state in real-time and intervenes before accidents happen."

**Tips**: Record the boot sequence from the very start. The terminal-style text loading each agent one-by-one looks cinematic.

---

### SCENE 2: DASHBOARD OVERVIEW (0:20 – 1:00)
**What to show**: Pan across the full dashboard slowly

**Point out these elements** (hover mouse over each):
1. **Neural network animated background** — the floating connected particles
2. **Header bar** — Shows system status (CORE: ONLINE), BCI mode, heart rate, uptime
3. **4 Circular Gauges** — Attention, Fatigue, Stress, Cognitive Load (all green = safe)
4. **Safety Status box** — Currently shows "Safe" in green
5. **Camera Telemetry panel** — Shows live webcam feed with face mesh overlay OR "Simulation Mode"
6. **Demo Control Console** — 3 scenario buttons + manual sliders
7. **EEG Brainwave Oscilloscope** — 5 live animated waveforms (Delta, Theta, Alpha, Beta, Gamma)
8. **Historical Trends Chart** — Real-time line graph of all cognitive metrics
9. **AI Agent Execution Trace** — Terminal showing step-by-step reasoning of all 6 agents

**Narration script**:
> "The dashboard monitors 4 key cognitive metrics — Attention, Fatigue, Stress, and Cognitive Load — all computed in real-time by a pipeline of 6 AI agents. Inputs come from webcam eye tracking, EEG brainwave analysis, heart rate monitoring, and keyboard activity."

---

### SCENE 3: DEMO SCENARIO 1 — NORMAL STATE (1:00 – 1:30)
**What to do**: Click the **"Scenario 1: Normal State"** button in the Demo Control Console

**What happens on screen**:
- All gauges stay GREEN
- Attention is ~85-90%
- Fatigue is ~10-15%
- Risk shows **SAFE**
- Alert banner says **"SYSTEM NOMINAL"**
- EEG oscilloscope shows balanced Alpha waves (green line dominant)
- Agent trace logs show normal readings

**Narration script**:
> "In Scenario 1, the operator is alert and focused. The system confirms all cognitive parameters are within safe limits. Notice the balanced brainwave pattern — Alpha waves are dominant, indicating relaxed focus."

---

### SCENE 4: DEMO SCENARIO 2 — FATIGUE & DROWSINESS (1:30 – 2:30)
**What to do**: Click the **"Scenario 2: Drowsiness & Risk"** button

**⚡ THIS IS THE MOST IMPRESSIVE PART — SHOW IT SLOWLY**

**What happens on screen**:
- Attention gauge **drops to ~25-30%** and turns RED
- Fatigue gauge **spikes to ~80%** and turns RED
- Stress gauge rises to WARNING yellow
- Safety Status flashes **"CRITICAL"** with a pulsing red glow
- Alert banner turns RED with message: **"CRITICAL FATIGUE WARNING: Drowsiness detected. Please stand up or take a break immediately!"**
- A **warning beep sound** plays from the browser
- EEG oscilloscope shifts — Delta and Theta waves (sleep waves) become dominant
- The historical chart shows the dramatic transition from green to red zones
- Agent trace shows Risk Agent flagging **"CRITICAL"** and Intervention Agent dispatching alarms

**Narration script**:
> "Now watch what happens when the operator starts showing signs of drowsiness. The system detects elevated fatigue through eye closure patterns and head nodding. The EEG shifts from alpha to delta-theta dominance — classic drowsiness markers. Within seconds, the Risk Prediction Agent flags a CRITICAL state, and the Intervention Agent triggers an audible alarm and recommends an immediate break. In a real railway or aviation scenario, this alert would be dispatched to the control room supervisor."

**Pro tip**: After clicking Scenario 2, slowly move the **Heart Rate slider** up to 95+ BPM to show how stress compounds with fatigue. The gauges will react in real-time.

---

### SCENE 5: DEMO SCENARIO 3 — INTENT DETECTION (2:30 – 3:15)
**What to do**: Click the **"Scenario 3: Intent & Focus"** button

**What happens on screen**:
- Alert banner changes to a **glowing cyan "PRODUCTIVITY MODE ACTIVE"** banner
- A **25-minute Pomodoro timer** starts counting down
- An **"OPEN DOCUMENTATION"** button appears
- All gauges return to green/safe
- EEG oscilloscope shows strong Alpha and Beta waves (focused attention)
- Agent trace shows Intent Agent detecting **"STUDY MODE"**

**Narration script**:
> "In the third scenario, the system detects that the user intends to enter a focused study or work session. The Intent Detection Agent recognizes the pattern and automatically activates Productivity Mode — starting a Pomodoro timer and surfacing relevant study resources. The system adapts to support the operator rather than just monitoring them."

---

### SCENE 6: THE 6 AI AGENTS EXPLAINED (3:15 – 3:50)
**What to show**: Scroll down to the **AI Agent Execution Trace** terminal and hover over it

**Narration script**:
> "Under the hood, every data packet flows through 6 specialized AI agents:
> 1. The Signal Processing Agent cleans and normalizes raw sensor data.
> 2. The Cognitive Analysis Agent calculates attention, fatigue, stress, and cognitive load scores.
> 3. The Intent Detection Agent identifies what the user is trying to do.
> 4. The Risk Prediction Agent computes the probability of cognitive failure.
> 5. The Intervention Agent decides what action to take — from gentle reminders to emergency alarms.
> 6. The Learning Agent builds a personalized baseline profile over time, making the system smarter with every session."

---

### SCENE 7: HARDWARE DESIGN (3:50 – 4:15)
**What to show**: Open the file `hardware/HARDWARE_DESIGN.md` in the repo and show the PCB render image

**Narration script**:
> "For the advanced version, we've designed a custom ESP32-based wearable sensor shield. It integrates a MAX30102 heart rate sensor, an MPU6050 IMU for head tracking, and a NeuroSky TGAM module for real-time single-channel EEG. The board communicates with the backend over WiFi, making it fully wireless and portable."

---

### SCENE 8: CLOSING / IMPACT (4:15 – 4:40)
**What to show**: Go back to the dashboard with Scenario 1 (Normal/Safe state)

**Narration script**:
> "NeuroPilot Guardian isn't about controlling devices with thoughts — it's about understanding the human mind to prevent catastrophic mistakes. From train drivers to surgeons, from factory workers to students — this platform can save lives by predicting cognitive failure before it happens. Thank you."

---

## 📋 KEY TALKING POINTS TO MEMORIZE

If judges or audience ask questions, here are the key facts:

| Question | Answer |
|----------|--------|
| What inputs does it use? | Webcam (eye tracking, blink rate, head pose), EEG (simulated + real model), Heart Rate, Keyboard activity |
| What AI model is used? | A pre-trained Keras neural network on the MUSE EEG emotions dataset (2548 features, 98% accuracy classifying POSITIVE/NEUTRAL/NEGATIVE states) |
| What are the 6 agents? | Signal Processing → Cognitive Analysis → Intent Detection → Risk Prediction → Intervention → Learning |
| How does fatigue detection work? | Eye Aspect Ratio (EAR) for blink/drowsiness detection, head pitch for nodding off, gaze jitter for distraction |
| What is the tech stack? | React + Tailwind + Recharts (Frontend), FastAPI + WebSockets (Backend), MediaPipe FaceMesh (Computer Vision), TensorFlow/Keras (ML), ESP32 (Hardware) |
| Can it work with real EEG? | Yes — the backend accepts raw EEG feature vectors. Plug in a NeuroSky MindWave or Muse headband and stream data via the ESP32 firmware |
| What industries is this for? | Railways, Aviation, Healthcare (surgeons), Industrial control, Education, Accessibility |
| What makes it different from other BCI projects? | We don't control devices with thoughts — we PREDICT cognitive failure and INTERVENE autonomously |

---

## 🎨 RECORDING TIPS

1. **Use dark mode browser** — the dashboard looks best on a dark browser theme
2. **Full screen the browser** — press F11 to maximize the visual impact
3. **Record in 1080p or higher** — the neon glow effects and animations look stunning at high res
4. **Use a calm, confident voiceover** — this is a safety system, not a toy
5. **Show the boot sequence** — it's the most cinematic part, don't skip it
6. **Hover over elements slowly** — give viewers time to read the gauges and alerts
7. **When switching to Scenario 2**, pause for a beat to let the RED transition sink in — it's dramatic
8. **Show the Agent Trace scrolling** — it proves the multi-agent pipeline is real, not just a UI mockup
9. **Keep the webcam overlay visible** — even in Simulation Mode, it shows professionalism

---

## 🔗 LINKS TO REFERENCE

- **GitHub Repo**: https://github.com/abhinavv0516/Nuero_Pilot
- **Backend API Docs**: http://127.0.0.1:8000/docs (Swagger UI — auto-generated by FastAPI)
- **Frontend**: http://localhost:5173
