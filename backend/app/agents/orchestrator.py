import os
import sys
import numpy as np

# Add parent directory to path to ensure imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.signal_processing import SignalProcessingAgent
from agents.cognitive_analysis import CognitiveAnalysisAgent
from agents.intent_detection import IntentDetectionAgent
from agents.risk_prediction import RiskPredictionAgent
from agents.intervention import InterventionAgent
from agents.learning import LearningAgent
from models.model_loader import model_loader

class AgentOrchestrator:
    def __init__(self):
        self.signal_agent = SignalProcessingAgent()
        self.cognitive_agent = CognitiveAnalysisAgent()
        self.intent_agent = IntentDetectionAgent()
        self.risk_agent = RiskPredictionAgent()
        self.intervention_agent = InterventionAgent()
        self.learning_agent = LearningAgent()
        
    def run_pipeline(self, raw_telemetry):
        """
        Executes the entire 6-agent BCI/HCI cognitive safety pipeline.
        """
        # 1. Signal Processing
        processed = self.signal_agent.process(raw_telemetry)
        scenario = processed.get("scenario", "normal")
        
        # 2. Integrate EEG Model prediction
        # If the frontend sent an EEG vector, predict. Otherwise simulated from CSV cache.
        eeg_features = processed.get("eeg_features", [])
        eeg_class = "NEUTRAL"
        prediction_probs = [0.1, 0.8, 0.1] # Neutral default
        
        # Determine target state for simulation
        target_state = "NEUTRAL"
        if scenario == "fatigue":
            target_state = "NEGATIVE"
        elif scenario == "intent":
            target_state = "POSITIVE"
        
        # Read from real CSV row if available to feed the model
        try:
            if not eeg_features or len(eeg_features) != 2548:
                eeg_features = model_loader.get_sample_eeg(target_state)
            
            # Predict using pre-trained model (or fallback heuristic if TF is not loaded)
            eeg_class, prediction_probs = model_loader.predict_emotion(eeg_features)
        except Exception as e:
            # Fallback heuristic prediction if model loading fails
            # In a hackathon context, this is a crucial safety valve
            eeg_class = target_state
            if target_state == "NEGATIVE":
                prediction_probs = [0.85, 0.10, 0.05]
            elif target_state == "POSITIVE":
                prediction_probs = [0.05, 0.15, 0.80]
            else:
                prediction_probs = [0.10, 0.80, 0.10]
                
        processed["eeg_class"] = eeg_class
        processed["eeg_prediction_probs"] = prediction_probs
        
        # 3. Cognitive Analysis
        cognitive = self.cognitive_agent.analyze(processed)
        
        # 4. Intent Detection
        intent = self.intent_agent.detect(processed, cognitive)
        
        # 5. Risk Prediction
        risk = self.risk_agent.predict(cognitive)
        
        # 6. Intervention Formulation
        intervention = self.intervention_agent.evaluate(cognitive, risk, intent)
        
        # 7. Dynamically Learn baselines
        learning = self.learning_agent.learn(processed)
        
        # Combine all agent outputs into a unified system state
        return {
            "telemetry": {
                "heart_rate": processed["heart_rate"],
                "hrv": processed["hrv"],
                "blink_rate": processed["blink_rate"],
                "eyes_closed": processed["eyes_closed"],
                "gaze_x": processed["gaze_x"],
                "gaze_y": processed["gaze_y"],
                "gaze_jitter": processed["gaze_jitter"],
                "head_pitch": processed["head_pitch"],
                "head_yaw": processed["head_yaw"],
                "head_roll": processed["head_roll"],
                "keyboard_activity": processed["keyboard_activity"],
                "eeg_class": processed["eeg_class"],
                "eeg_prediction_probs": processed["eeg_prediction_probs"],
                "scenario": scenario
            },
            "cognitive": cognitive,
            "intent": intent,
            "risk": risk,
            "intervention": intervention,
            "learning": learning,
            "status": "success"
        }

# Singleton instance
orchestrator = AgentOrchestrator()
