class RiskPredictionAgent:
    def predict(self, cognitive_metrics):
        """
        Predicts the operator risk level and failure probabilities.
        """
        attention = cognitive_metrics.get("attention", 80.0)
        fatigue = cognitive_metrics.get("fatigue", 15.0)
        stress = cognitive_metrics.get("stress", 25.0)
        cog_load = cognitive_metrics.get("cognitive_load", 30.0)
        
        # 1. Loss of Focus Probability
        loss_of_focus = 100.0 - attention
        loss_of_focus = max(0.0, min(100.0, loss_of_focus))
        
        # 2. Cognitive Failure Probability
        # Weighted combination: 45% Fatigue, 25% Attention Deficit, 15% Stress, 15% Cognitive Load
        failure_prob = (fatigue * 0.45) + ((100.0 - attention) * 0.25) + (stress * 0.15) + (cog_load * 0.15)
        failure_prob = max(0.0, min(100.0, failure_prob))
        
        # 3. Risk Level Classification (Safe, Warning, Critical)
        if failure_prob >= 68.0 or fatigue >= 75.0 or attention < 35.0:
            risk_level = "Critical"
        elif failure_prob >= 30.0 or fatigue >= 45.0 or attention < 65.0:
            risk_level = "Warning"
        else:
            risk_level = "Safe"
            
        return {
            "failure_probability": float(failure_prob),
            "loss_of_focus_probability": float(loss_of_focus),
            "risk_level": risk_level
        }
