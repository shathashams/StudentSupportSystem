@echo off
setlocal

REM Run from this script's folder (the server folder)
cd /d "%~dp0"

echo ============================================================
echo   Starting the database server (npm run db:serve)
echo ============================================================
echo.
echo NOTE: Stop "npm run dev" first - only one process can open
echo       the database at a time. Keep this window open while
echo       you use Prisma Studio, then close it when done.
echo.

call npm run db:serve

echo.
echo Database server stopped.
pause
endlocal
