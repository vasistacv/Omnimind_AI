@echo off
echo ========================================
echo   OMNIMIND ADVANCED AI - STARTING
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file:
    echo 1. Copy .env.example to .env
    echo 2. Add your Gemini API key
    echo.
    echo Get FREE API key from:
    echo https://makersuite.google.com/app/apikey
    echo.
    pause
    exit /b 1
)

echo [1/2] Starting Backend API...
start "OmniMind Backend" cmd /k "ai_sys\Scripts\activate.bat && cd ai_core && python api.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend UI...
start "OmniMind Frontend" cmd /k "cd ui && npm run dev"

echo.
echo ========================================
echo   OMNIMIND IS STARTING!
echo ========================================
echo.
echo Backend API: http://127.0.0.1:8000
echo Frontend UI: http://localhost:3000
echo.
echo Two windows will open:
echo 1. Backend (Python API)
echo 2. Frontend (Next.js UI)
echo.
echo Wait a few seconds, then open:
echo http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
