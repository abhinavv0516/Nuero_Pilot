class IntentDetectionAgent:
    def __init__(self):
        self.prev_intent = "Idle"
        
    def detect(self, processed_data, cognitive_metrics):
        """
        Determines current user intent based on input telemetry and cognitive states.
        """
        scenario = processed_data.get("scenario", "normal")
        eeg_class = processed_data.get("eeg_class", "Relaxing")
        keyboard_act = processed_data.get("keyboard_activity", 0.0)
        fatigue = cognitive_metrics.get("fatigue", 15.0)
        attention = cognitive_metrics.get("attention", 80.0)
        
        # Scenario override
        if scenario == "intent":
            return "Study Mode"
        
        # Rule-based intent detection
        if fatigue > 70.0 or (eeg_class == "Relaxing" and processed_data.get("eyes_closed", False)):
            intent = "Rest Needed"
        elif keyboard_act > 45.0 and attention > 70.0:
            intent = "Workflow Active"
        elif eeg_class in ["Real Right", "Real Left", "Real Fists"]:
            intent = f"Execute Command ({eeg_class.replace('Real ', '')})"
        else:
            intent = "Idle"
            
        self.prev_intent = intent
        return intent
