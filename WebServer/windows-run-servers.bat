@echo off
setlocal enabledelayedexpansion
::NOT TESTED 
:: Check for Python 3.11
python311 --version >nul 2>&1
if errorlevel 1 (
    echo Python 3.11 is not installed or not in PATH. Please install Python 3.11.
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

:: Open two terminal windows and run servers
start cmd /k "cd /d "%cd%" && venv\Scripts\activate && python311 api.py"
start cmd /k "cd /d "%cd%" && venv\Scripts\activate && python311 server.py"

pause
