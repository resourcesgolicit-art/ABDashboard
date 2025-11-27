@echo off
REM Reliable Server Startup Script for AB Institute Backend
REM This script will permanently fix startup issues

echo =====================================
echo  AB Institute Backend Server Startup
echo =====================================
echo.

REM Kill any existing node processes to prevent conflicts
echo Killing any existing node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Set the correct directory
cd /d "%~dp0"
echo Current directory: %cd%

REM Check if we're in the Backend directory
if not exist "server.js" (
    echo ERROR: server.js not found in current directory!
    echo Please make sure this script is in the Backend folder.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Installing dependencies...
    npm init -y
    npm install express mongoose cors bcryptjs dotenv
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Creating default .env file...
    echo PORT=3000 > .env
    echo MONGODB_URI=mongodb+srv://your-connection-string >> .env
    echo NOTE: Please update the .env file with your actual MongoDB connection string
    echo.
)

REM Start the server
echo Starting AB Institute Backend Server...
echo Server will be available at: http://localhost:3000
echo Test endpoint: http://localhost:3000/test
echo.
echo Press Ctrl+C to stop the server
echo =====================================
echo.

node server.js

REM If server stops, show error message
echo.
echo =====================================
echo Server stopped. Check for errors above.
echo =====================================
pause