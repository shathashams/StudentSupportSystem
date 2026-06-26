@echo off
setlocal

REM Run from the root of the project
cd /d "%~dp0"

echo ============================================================
echo   Student Support System - Quick Launcher
echo ============================================================
echo.
echo Launching local development environment...
echo.

REM Terminal 1: Start Backend Server
echo 1. Launching Backend Server (Express API ^& PGlite)...
start "StudentSupportSystem - Backend Server" cmd /k "cd server && npm run dev"

REM Terminal 2: Start Frontend Client
echo 2. Launching Frontend Client (React/Vite Dev Server)...
start "StudentSupportSystem - Frontend Client" cmd /k "cd client && npm run dev"

REM Terminal 3: Open Prisma Studio (Optional)
echo 3. Launching Prisma Studio (Database Viewer)...
start "StudentSupportSystem - Prisma Studio" cmd /k "cd server && npm run studio"

echo.
echo ============================================================
echo   All terminals started!
echo   - Backend Server running on http://localhost:5000
echo   - Frontend Client running on http://localhost:5173
echo   - Prisma Studio running on http://localhost:5555
echo ============================================================
echo.
pause
