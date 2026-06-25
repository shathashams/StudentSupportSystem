@echo off
setlocal

REM Run from this script's folder (the server folder)
cd /d "%~dp0"

echo ============================================================
echo   Opening Prisma Studio (npm run studio)
echo ============================================================
echo.
echo NOTE: The app serves the database, so start the app first
echo       (start-dev.bat). Studio then shows live data - just
echo       refresh after inserting. (If the app is stopped, run
echo       db-serve.bat instead before opening Studio.)
echo.

call npm run studio

echo.
echo Studio stopped.
pause
endlocal
