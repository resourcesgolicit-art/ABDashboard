# AB Institute Backend Server PowerShell Startup Script
# This script fixes PowerShell compatibility issues

Write-Host "=====================================" -ForegroundColor Green
Write-Host " AB Institute Backend Server Startup" -ForegroundColor Green  
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Kill any existing node processes
Write-Host "Stopping any existing node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Change to script directory
$ScriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Set-Location $ScriptDir
Write-Host "Current directory: $PWD" -ForegroundColor Cyan

# Check if server.js exists
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found in current directory!" -ForegroundColor Red
    Write-Host "Please make sure this script is in the Backend folder." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm init -y
    npm install express mongoose cors bcryptjs dotenv
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating default .env file..." -ForegroundColor Yellow
    @"
PORT=3000
MONGODB_URI=mongodb+srv://your-connection-string
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "NOTE: Please update the .env file with your actual MongoDB connection string" -ForegroundColor Yellow
    Write-Host ""
}

# Start the server
Write-Host "Starting AB Institute Backend Server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Test endpoint: http://localhost:3000/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

try {
    node server.js
}
catch {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "Server stopped with error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
}

Read-Host "Press Enter to exit"