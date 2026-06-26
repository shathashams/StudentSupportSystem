@echo off
setlocal

REM Run everything from this script's folder (the server folder)
cd /d "%~dp0"

echo ============================================================
echo   Student Support System - Server install
echo ============================================================
echo.

REM Make sure a .env file exists (the server requires JWT_SECRET)
if not exist ".env" (
    echo Creating .env from .env.example ...
    copy ".env.example" ".env" >nul
    echo.
)

echo [1/3] Installing npm packages ...
call npm install
if errorlevel 1 goto error

echo.
echo [2/3] Generating Prisma Client ...
call npx prisma generate
if errorlevel 1 goto error

echo.
echo [3/3] Initializing and Seeding Database ...
call node prisma/seed.js
if errorlevel 1 goto error

echo.
echo ============================================================
echo   Install complete!
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo ============================================================
echo   Install FAILED. Please read the messages above.
echo ============================================================
echo.
pause
exit /b 1
