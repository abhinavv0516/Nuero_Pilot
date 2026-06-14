import numpy as np

class SignalProcessingAgent:
    def __init__(self):
        # Cache for historical values to compute running averages
        self.history_size = 10
        self.heart_rate_history = []
        self.blink_rate_history = []
        self.gaze_jitter_history = []
        
    def process(self, raw_data):
        """
        Cleans and normalizes incoming telemetry data.
        """
        processed = {}
        
        # 1. Heart Rate smoothing
        raw_hr = raw_data.get("heart_rate", 72.0)
        self.heart_rate_history.append(raw_hr)
        if len(self.heart_rate_history) > self.history_size:
            self.heart_rate_history.pop(0)
        processed["heart_rate"] = float(np.mean(self.heart_rate_history))
        
        # Calculate Heart Rate Variability (HRV) simulation based on HR standard dev
        if len(self.heart_rate_history) > 2:
            processed["hrv"] = float(np.std(self.heart_rate_history) * 10.0 + 40.0) # standard HRV range
        else:
            processed["hrv"] = 55.0
            
        # 2. Blink Rate smoothing
        raw_br = raw_data.get("blink_rate", 15.0)
        self.blink_rate_history.append(raw_br)
        if len(self.blink_rate_history) > self.history_size:
            self.blink_rate_history.pop(0)
        processed["blink_rate"] = float(np.mean(self.blink_rate_history))
        processed["eyes_closed"] = raw_data.get("eyes_closed", False)
        
        # 3. Gaze coordinates and Jitter
        gaze = raw_data.get("eye_gaze", {"x": 0.5, "y": 0.5, "jitter": 0.05})
        raw_jitter = gaze.get("jitter", 0.05)
        self.gaze_jitter_history.append(raw_jitter)
        if len(self.gaze_jitter_history) > self.history_size:
            self.gaze_jitter_history.pop(0)
        processed["gaze_x"] = gaze.get("x", 0.5)
        processed["gaze_y"] = gaze.get("y", 0.5)
        processed["gaze_jitter"] = float(np.mean(self.gaze_jitter_history))
        
        # 4. Head Pose angles
        head = raw_data.get("head_pose", {"pitch": 0.0, "yaw": 0.0, "roll": 0.0})
        processed["head_pitch"] = head.get("pitch", 0.0)
        processed["head_yaw"] = head.get("yaw", 0.0)
        processed["head_roll"] = head.get("roll", 0.0)
        
        # 5. Keyboard/Mouse Activity
        processed["keyboard_activity"] = raw_data.get("keyboard_activity", 0.0)
        
        # 6. Pass through EEG features and scenario parameters
        processed["eeg_features"] = raw_data.get("eeg_features", [])
        processed["scenario"] = raw_data.get("scenario", "normal")
        processed["eeg_class"] = raw_data.get("eeg_class", "Relaxing")
        
        return processed
