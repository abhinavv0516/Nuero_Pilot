class LearningAgent:
    def __init__(self):
        self.baseline_hr = 72.0
        self.baseline_blink_rate = 15.0
        self.data_points_count = 0
        
    def learn(self, processed_data):
        """
        Updates user baseline profiles based on incoming telemetry.
        """
        hr = processed_data.get("heart_rate", 72.0)
        blink_rate = processed_data.get("blink_rate", 15.0)
        scenario = processed_data.get("scenario", "normal")
        
        # Only learn from normal state to prevent corrupting baseline with fatigued/stressed parameters
        if scenario == "normal":
            self.data_points_count += 1
            # Running average update (learning rate decreases as we get more points, min 0.01)
            learning_rate = max(0.01, 1.0 / min(100.0, self.data_points_count))
            
            self.baseline_hr = (1 - learning_rate) * self.baseline_hr + learning_rate * hr
            self.baseline_blink_rate = (1 - learning_rate) * self.baseline_blink_rate + learning_rate * blink_rate
            
        return {
            "baseline_heart_rate": float(self.baseline_hr),
            "baseline_blink_rate": float(self.baseline_blink_rate),
            "profile_strength": min(100, int((min(100, self.data_points_count) / 100.0) * 100))
        }
