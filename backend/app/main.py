import os
import sys
import json
import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add parent directory to path to ensure imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator import orchestrator

app = FastAPI(
    title="NeuroPilot Guardian Backend",
    description="AI Cognitive Safety and Intent Intelligence System Core Engine",
    version="1.0.0"
)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session history (stores last 150 points for trend analysis)
session_history = []
max_history_length = 150

# Track active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Failed to send to socket: {e}")

manager = ConnectionManager()

@app.get("/")
def get_root():
    return {
        "status": "online",
        "system": "NeuroPilot Guardian",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/history")
def get_history():
    """Returns the historical trend data for the charts."""
    return session_history

@app.post("/api/history/clear")
def clear_history():
    """Clears session history."""
    global session_history
    session_history = []
    return {"status": "cleared"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive telemetry package from React frontend
            data = await websocket.receive_text()
            raw_telemetry = json.loads(data)
            
            # Execute BCI/HCI AI Agent pipeline
            result = orchestrator.run_pipeline(raw_telemetry)
            
            # Append to session history (limit size to prevent memory bloat)
            timestamp_str = datetime.now().strftime("%H:%M:%S")
            history_entry = {
                "time": timestamp_str,
                "attention": result["cognitive"]["attention"],
                "fatigue": result["cognitive"]["fatigue"],
                "stress": result["cognitive"]["stress"],
                "cognitive_load": result["cognitive"]["cognitive_load"],
                "failure_probability": result["risk"]["failure_probability"],
                "risk_level": result["risk"]["risk_level"]
            }
            
            session_history.append(history_entry)
            if len(session_history) > max_history_length:
                session_history.pop(0)
                
            # Broadcast the fully processed agent decisions back to the frontend
            await websocket.send_text(json.dumps(result))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        manager.disconnect(websocket)
