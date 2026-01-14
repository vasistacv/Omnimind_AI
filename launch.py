import subprocess
import os
import sys
import time
import threading

def stream_output(process, prefix):
    for line in iter(process.stdout.readline, b''):
        print(f"[{prefix}] {line.decode().strip()}")

def main():
    print("Initializing Project OmniMind Protocol...")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ui_dir = os.path.join(base_dir, "ui")
    venv_python = os.path.join(base_dir, "ai_sys", "Scripts", "python.exe")
    
    # Verify environment
    if not os.path.exists(venv_python):
        print("Error: AI Environment (ai_sys) not found. Please run setup first.")
        return

    # 1. Start Backend (The Cortex)
    print(">> Awakening Cortex...")
    backend_cmd = [
        venv_python, "-m", 
        "uvicorn", "ai_core.api:app", 
        "--host", "127.0.0.1", 
        "--port", "8000",
        "--reload"
    ]
    backend = subprocess.Popen(backend_cmd, cwd=base_dir)

    # 2. Start Frontend (The Face)
    print(">> Projecting Interface...")
    frontend_cmd = ["npm.cmd", "run", "dev"]
    frontend = subprocess.Popen(frontend_cmd, cwd=ui_dir, shell=True)

    print("\n" + "="*50)
    print(" O M N I M I N D   O N L I N E")
    print(" Backend: http://127.0.0.1:8000")
    print(" Interface: http://localhost:3000")
    print("="*50 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nInitiating Shutdown Sequence...")
        backend.terminate()
        frontend.terminate() # Shell=True makes this tricky, but good enough for now
        print("System Offline.")

if __name__ == "__main__":
    main()
