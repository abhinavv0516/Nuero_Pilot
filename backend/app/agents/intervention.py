class InterventionAgent:
    def evaluate(self, cognitive_metrics, risk_metrics, intent):
        """
        Formulates safety interventions or workflow adjustments.
        """
        risk_level = risk_metrics.get("risk_level", "Safe")
        fatigue = cognitive_metrics.get("fatigue", 15.0)
        attention = cognitive_metrics.get("attention", 80.0)
        stress = cognitive_metrics.get("stress", 25.0)
        
        action_code = "NONE"
        message = "Cognitive parameters within safe operational limits."
        
        # 1. Study Mode / Focus Session intent
        if intent == "Study Mode":
            action_code = "OPEN_STUDY_RESOURCES"
            message = "Focus mode activated. Opened learning resources and initialized productivity timer."
            
        # 2. Critical Risk Interventions
        elif risk_level == "Critical":
            if fatigue > 70.0:
                action_code = "TRIGGER_AUDIBLE_ALARM"
                message = "CRITICAL FATIGUE WARNING: Drowsiness detected. Please stand up or take a break immediately!"
            elif attention < 35.0:
                action_code = "TRIGGER_HUD_WARNING"
                message = "CRITICAL DISTRACTION: Gaze completely off screen. Return attention to operation!"
            else:
                action_code = "SUPERVISOR_ALERT"
                message = "CRITICAL OVERLOAD: High cognitive crash probability. Dispatching backup operator."
                
        # 3. Warning Risk Interventions
        elif risk_level == "Warning":
            if fatigue > 45.0:
                action_code = "BREAK_RECOMMENDATION"
                message = "WARNING: Cognitive fatigue rising. A brief stretching break is recommended."
            elif attention < 65.0:
                action_code = "FOCUS_ALERT"
                message = "ALERT: Operator gaze drifting. Avoid distraction."
            elif stress > 75.0:
                action_code = "REST_SUGGESTION"
                message = "HIGH STRESS: Deep breathing exercises suggested to maintain stability."
                
        return {
            "action_code": action_code,
            "message": message
        }
