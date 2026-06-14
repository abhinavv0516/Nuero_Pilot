import uvicorn
import os
import sys

# Add parent directory to path to ensure app is findable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting NeuroPilot Guardian Core Engine...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
