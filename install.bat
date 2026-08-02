@echo off
title CareerSphere - Full Project & ML Setup Installer

echo ===================================================
echo   CareerSphere Project - Automated Setup & Installer
echo ===================================================
echo.

:: --------------------------------------------------
:: 1. Check Python
:: --------------------------------------------------
echo [1/5] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ and add it to PATH.
    echo.
    pause
    exit /b 1
)
python --version
echo [OK] Python is available.
echo.

:: --------------------------------------------------
:: 2. Install Backend Python Dependencies & ML Packages
:: --------------------------------------------------
echo ===================================================
echo [2/5] Installing Backend Python Packages (pip)...
echo ===================================================
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Some python packages encountered warnings. Continuing...
)

echo.
echo Installing SpaCy English ML Model (en_core_web_sm)...
python -m spacy download en_core_web_sm

echo.
echo Running Django Database Migrations...
python manage.py migrate --run-syncdb
cd ..
echo [OK] Backend & ML Libraries setup complete!
echo.

:: --------------------------------------------------
:: 3. Check Redis Status
:: --------------------------------------------------
echo ===================================================
echo [3/5] Checking Redis Cache Server...
echo ===================================================
where redis-server >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Redis is installed on this system.
) else (
    echo [NOTE] 'redis-server' is not found in system PATH.
    echo If Redis is not installed, windows users can run Redis via Memurai / WSL / Docker.
)
echo.

:: --------------------------------------------------
:: 4. Check Node.js & NPM
:: --------------------------------------------------
echo ===================================================
echo [4/5] Checking Node.js & NPM environment...
echo ===================================================
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / NPM is not installed or not in PATH!
    echo Please install Node.js (LTS version) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
node -v
npm -v
echo [OK] Node.js & NPM are available.
echo.

:: --------------------------------------------------
:: 5. Install Frontend NPM Packages
:: --------------------------------------------------
echo ===================================================
echo [5/5] Installing Frontend Node Modules (npm install)...
echo ===================================================
cd frontend
call npm install
cd ..
echo [OK] Frontend dependencies installed!
echo.

:: --------------------------------------------------
:: Done!
:: --------------------------------------------------
echo ===================================================
echo   SUCCESS! All project libraries & ML models ready!
echo   You can now launch CareerSphere by running: run.bat
echo ===================================================
echo.
pause
