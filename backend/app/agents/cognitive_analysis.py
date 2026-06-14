class CognitiveAnalysisAgent:
    def __init__(self):
        self.prev_attention = 80.0
        self.prev_fatigue = 15.0
        
    def analyze(self, processed_data):
        """
        Calculates attention, fatigue, stress, and cognitive load.
        """
        scenario = processed_data.get("scenario", "normal")
        
        # 1. Stress Score
        # Mapped from EEG emotion model prediction (NEGATIVE -> High stress, POSITIVE/NEUTRAL -> Low stress)
        # Also scaled with Heart Rate
        hr = processed_data.get("heart_rate", 72.0)
        eeg_class = processed_data.get("eeg_class", "NEUTRAL")
        
        if scenario == "fatigue":
            # In simulated fatigue, stress is moderate-high
            stress_score = 65.0 + (hr - 70.0) * 0.5
        elif eeg_class == "NEGATIVE":
            stress_score = 85.0 + (hr - 70.0) * 0.3
        elif eeg_class == "POSITIVE":
            stress_score = 20.0 + (hr - 70.0) * 0.2
        else:
            stress_score = 35.0 + (hr - 70.0) * 0.2
            
        # Ensure bounds
        stress_score = max(5.0, min(100.0, stress_score))
        
        # 2. Fatigue Score
        # High blink rate or eyes closed increase fatigue. Nodding head down increases fatigue.
        eyes_closed = processed_data.get("eyes_closed", False)
        blink_rate = processed_data.get("blink_rate", 15.0)
        head_pitch = processed_data.get("head_pitch", 0.0)
        
        fatigue_score = 15.0
        if scenario == "fatigue":
            fatigue_score = 82.0
        else:
            # Drowsiness detection rules
            if eyes_closed:
                fatigue_score += 65.0
            elif blink_rate > 30.0:  # High blink rate (drowsy micro-sleeps)
                fatigue_score += 35.0
            elif blink_rate < 6.0:   # Extreme staring / dry eyes
                fatigue_score += 15.0
                
            # Head nodding downward
            if head_pitch < -12.0:
                fatigue_score += 20.0
                
        # Smooth change
        fatigue_score = self.prev_fatigue * 0.7 + fatigue_score * 0.3
        self.prev_fatigue = fatigue_score
        fatigue_score = max(0.0, min(100.0, fatigue_score))
        
        # 3. Attention Score
        # Decreases with eye gaze jitter, looking away (yaw/pitch), or prolonged idle
        gaze_jitter = processed_data.get("gaze_jitter", 0.05)
        head_yaw = processed_data.get("head_yaw", 0.0)
        keyboard_act = processed_data.get("keyboard_activity", 0.0)
        
        attention_score = 90.0
        if scenario == "fatigue":
            attention_score = 28.0
        else:
            # Gaze distraction
            if gaze_jitter > 0.12:
                attention_score -= 15.0
            
            # Looking away (yaw > 15 deg or pitch > 15 deg)
            if abs(head_yaw) > 15.0 or abs(head_pitch) > 15.0:
                attention_score -= 40.0
                
            # Keyboard activity idle (simulate distraction in focus scenario)
            if keyboard_act == 0.0 and scenario == "intent":
                attention_score -= 10.0
                
        attention_score = self.prev_attention * 0.7 + attention_score * 0.3
        self.prev_attention = attention_score
        attention_score = max(0.0, min(100.0, attention_score))
        
        # 4. Cognitive Load
        # Low HRV + High stress + High typing activity = High cognitive load
        hrv = processed_data.get("hrv", 55.0)
        
        cognitive_load = 40.0
        if scenario == "fatigue":
            cognitive_load = 75.0
        else:
            # Lower HRV (standard deviation of heart rate) correlates to stress & cognitive load
            hrv_factor = max(0.0, (65.0 - hrv) * 0.8)
            stress_factor = stress_score * 0.4
            activity_factor = min(30.0, keyboard_act * 0.3)
            
            cognitive_load = hrv_factor + stress_factor + activity_factor
            
        cognitive_load = max(5.0, min(100.0, cognitive_load))
        
        return {
            "attention": float(attention_score),
            "fatigue": float(fatigue_score),
            "stress": float(stress_score),
            "cognitive_load": float(cognitive_load)
        }
