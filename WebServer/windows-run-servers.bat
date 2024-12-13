@echo off
setlocal enabledelayedexpansion

:: Check for Python 3.11
python311 --version >nul 2>&1
if errorlevel 1 (
    echo Python 3.11 is not installed or not in PATH. Please install Python 3.11.
    pause
    exit /b 1
)

:: Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH. Please install Node.js.
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python311 -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate

:: Install required packages
python311 -m pip install flask pymysql requests

:: Start Flask API server
start cmd /k "cd /d "%cd%" && venv\Scripts\activate && python311 api.py"

:: Start Next.js dev server
start cmd /k "cd /d "%cd%\understat-app" && npm run dev"

pause