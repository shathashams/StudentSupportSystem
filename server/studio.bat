@echo off
setlocal

REM Run from this script's folder (the server folder)
cd /d "%~dp0"

echo ============================================================
echo   Opening Prisma Studio (npm run studio)
echo ============================================================
echo.
echo NOTE: Start the database server first (run db-serve.bat in
echo       another window) before opening Studio.
echo.

call npm run studio

echo.
echo Studio stopped.
pause
endlocal
