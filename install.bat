@echo off
setlocal

REM Run from the root of the project
cd /d "%~dp0"

echo ============================================================
echo   Student Support System - Full Installation
echo ============================================================
echo.

REM 1. Install Server dependencies & generate Prisma client
echo [1/3] Installing Backend Server dependencies ^& generating Prisma Client...
cd server
if not exist ".env" (
    echo Creating server/.env from .env.example ...
    copy ".env.example" ".env" >nul
)
call npm install
if errorlevel 1 goto error
call npx prisma generate
if errorlevel 1 goto error

REM 2. Install Client dependencies
echo.
echo [2/3] Installing Frontend Client dependencies...
cd ../client
call npm install
if errorlevel 1 goto error

REM 3. Initialize and Seed the Database
echo.
echo [3/3] Initializing and Seeding Database...
cd ../server
call node prisma/seed.js
if errorlevel 1 goto error

echo.
echo ============================================================
echo   Installation completed successfully!
echo   To start the application, run: start-dev.bat
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo ============================================================
echo   Installation failed. Please review the errors above.
echo ============================================================
echo.
pause
exit /b 1
