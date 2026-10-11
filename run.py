import subprocess
import sys
import time
import os
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 65)
    print("🏎️  F1 Driver Performance ML Analytics Platform")
    print("=" * 65)
    print("Launching Backend (FastAPI on http://127.0.0.1:8000)...")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=str(ROOT_DIR)
    )

    time.sleep(2)

    print("Launching Frontend (Vite on http://localhost:5173)...")
    frontend_proc = subprocess.Popen(
        ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"],
        cwd=str(FRONTEND_DIR)
    )

    print("\n✅ Systems active:")
    print("   • API Backend:     http://127.0.0.1:8000")
    print("   • Swagger Docs:    http://127.0.0.1:8000/docs")
    print("   • Web Dashboard:   http://localhost:5173")
    print("\nPress Ctrl+C to terminate both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
