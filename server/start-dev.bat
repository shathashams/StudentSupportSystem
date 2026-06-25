@echo off
setlocal

REM Run from this script's folder (the server folder)
cd /d "%~dp0"

echo ============================================================
echo   Starting the server (npm run dev)
echo ============================================================
echo.

call npm run dev

echo.
echo Server stopped.
pause
endlocal
