import os
import csv
import joblib
import numpy as np

class ModelLoader:
    def __init__(self):
        self.model_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(self.model_dir, "emotion_model_keras.h5")
        self.scaler_path = os.path.join(self.model_dir, "scaler.pkl")
        self.encoder_path = os.path.join(self.model_dir, "label_encoder.pkl")
        
        self.model = None
        self.scaler = None
        self.encoder = None
        self.is_fallback = False
        
        # Samples cache for simulation
        self.samples = {
            "POSITIVE": [],
            "NEUTRAL": [],
            "NEGATIVE": []
        }
        
    def load_models(self):
        """Lazy load models, falling back to a 1-NN heuristic if TensorFlow is unavailable."""
        if self.model is None and not self.is_fallback:
            try:
                print("Checking for TensorFlow to load the Keras model...")
                import tensorflow as tf
                if os.path.exists(self.model_path):
                    self.model = tf.keras.models.load_model(self.model_path)
                    self.scaler = joblib.load(self.scaler_path)
                    self.encoder = joblib.load(self.encoder_path)
                    print("TensorFlow model and preprocessors loaded successfully.")
                else:
                    raise FileNotFoundError(f"Model file not found at {self.model_path}")
            except (ImportError, ModuleNotFoundError, Exception) as e:
                print(f"Warning: TensorFlow unavailable or model load failed ({e}). Using 1-NN fallback classifier.")
                self.is_fallback = True
                
            self._load_sample_data()
            
    def _load_sample_data(self):
        """Loads representative rows from emotions.csv using built-in csv reader."""
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(self.model_dir)))
            csv_path = os.path.join(base_dir, "research", "emotionMODEL", "emotions.csv")
            
            if os.path.exists(csv_path):
                print(f"Loading sample EEG rows from {csv_path} using built-in CSV reader...")
                with open(csv_path, mode='r') as f:
                    reader = csv.reader(f)
                    header = next(reader)
                    # The label is the last column
                    label_col_idx = header.index("label") if "label" in header else -1
                    if label_col_idx == -1:
                        label_col_idx = len(header) - 1
                    
                    counts = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0}
                    for row in reader:
                        if not row:
                            continue
                        label = row[label_col_idx]
                        if label in counts and counts[label] < 10:
                            # Exclude label column and convert to float
                            features = [float(row[i]) for i in range(len(row)) if i != label_col_idx]
                            self.samples[label].append(features)
                            counts[label] += 1
                            
                        # Break once we have enough representative samples
                        if all(c >= 10 for c in counts.values()):
                            break
                print("Simulation samples cached successfully.")
            else:
                print(f"Warning: emotions.csv not found at {csv_path}. Using fallback generators.")
        except Exception as e:
            print(f"Error caching simulation samples: {e}")
            
    def predict_emotion(self, features_list):
        """
        Predicts emotion from EEG features using Keras or 1-NN fallback.
        """
        self.load_models()
        features = np.array(features_list).reshape(1, -1)
        
        if not self.is_fallback:
            try:
                features_scaled = self.scaler.transform(features)
                prediction_probs = self.model.predict(features_scaled, verbose=0)
                
                class_idx = np.argmax(prediction_probs[0])
                label = self.encoder.inverse_transform([class_idx])[0]
                return label, prediction_probs[0].tolist()
            except Exception as e:
                print(f"Prediction failed, falling back to 1-NN: {e}")
                self.is_fallback = True
                
        # 1-NN Distance Classifier Fallback
        best_label = "NEUTRAL"
        min_dist = float('inf')
        
        for label, samples in self.samples.items():
            for s in samples:
                if len(s) == len(features_list):
                    dist = np.sum((np.array(s) - features_list) ** 2)
                    if dist < min_dist:
                        min_dist = dist
                        best_label = label
                        
        # Define realistic probability distributions
        if best_label == "NEGATIVE":
            probs = [0.88, 0.08, 0.04]
        elif best_label == "POSITIVE":
            probs = [0.03, 0.12, 0.85]
        else:
            probs = [0.09, 0.82, 0.09]
            
        return best_label, probs

    def get_sample_eeg(self, state="NEUTRAL"):
        """Returns a cached sample row for the requested state."""
        self.load_models()
        state_key = state.upper()
        if state_key not in self.samples or len(self.samples[state_key]) == 0:
            # Fallback to random features if not loaded (2548 inputs)
            return np.random.rand(2548).tolist()
        
        # Pick a random sample from the cached rows
        idx = np.random.randint(0, len(self.samples[state_key]))
        return self.samples[state_key][idx]

# Singleton instance
model_loader = ModelLoader()
