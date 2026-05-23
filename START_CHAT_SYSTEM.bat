@echo off
REM ============================================================================
REM STAYEASY SOCKET.IO CHAT SYSTEM - STARTUP SCRIPT
REM ============================================================================
REM
REM This script starts all three required servers for the chat system:
REM 1. Socket.IO Server (Node.js)
REM 2. Django Backend
REM 3. React Frontend
REM
REM Run this script to launch the entire system
REM ============================================================================

echo.
echo ============================================================================
echo  STAYEASY REAL-TIME CHAT SYSTEM - STARTUP
echo ============================================================================
echo.
echo Starting services...
echo.
echo IMPORTANT: This script opens 3 new terminal windows.
echo Keep all 3 windows open while developing.
echo.
echo ============================================================================
echo.

REM Get current directory
set SCRIPT_DIR=%~dp0

REM Open Terminal 1: Socket.IO Server
echo [1/3] Starting Socket.IO Server...
start "Socket.IO Server" cmd /k "cd /d %SCRIPT_DIR%socket-server && npm start"
timeout /t 2 /nobreak

REM Open Terminal 2: Django Backend
echo [2/3] Starting Django Backend...
start "Django Backend" cmd /k "cd /d %SCRIPT_DIR%Backend\myProject && python manage.py runserver"
timeout /t 2 /nobreak

REM Open Terminal 3: React Frontend
echo [3/3] Starting React Frontend...
start "React Frontend" cmd /k "cd /d %SCRIPT_DIR%Frontend && npm run dev"
timeout /t 2 /nobreak

echo.
echo ============================================================================
echo  ✅ All services starting...
echo ============================================================================
echo.
echo Socket.IO Server:
echo   URL: http://localhost:3001
echo   Status: Check terminal window
echo.
echo Django Backend:
echo   URL: http://127.0.0.1:8000
echo   Admin: http://127.0.0.1:8000/admin
echo   Status: Check terminal window
echo.
echo React Frontend:
echo   URL: http://localhost:5174
echo   Status: Check terminal window
echo.
echo Expected startup time: 10-15 seconds
echo.
echo NEXT STEPS:
echo 1. Wait for all servers to start (check the 3 terminal windows)
echo 2. Open http://localhost:5174 in your browser
echo 3. Login with your credentials
echo 4. Navigate to a property detail page
echo 5. Click "Chat with Owner" button
echo 6. Test the real-time chat
echo.
echo ============================================================================
echo.
pause
