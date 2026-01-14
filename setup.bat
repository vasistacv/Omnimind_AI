@echo off
echo ========================================
echo   OMNIMIND ADVANCED AI - SETUP
echo ========================================
echo.

echo [1/4] Creating Python virtual environment...
python -m venv ai_sys
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call ai_sys\Scripts\activate.bat

echo [3/4] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [4/4] Installing Node.js dependencies...
cd ui
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Get a FREE Gemini API key from:
echo    https://makersuite.google.com/app/apikey
echo.
echo 2. Copy .env.example to .env:
echo    copy .env.example .env
echo.
echo 3. Edit .env and add your API key
echo.
echo 4. Run the system:
echo    launch.bat
echo.
echo ========================================
pause
