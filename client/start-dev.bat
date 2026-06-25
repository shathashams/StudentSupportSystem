@echo off
REM Start the client dev server (Vite)
cd /d "%~dp0"
echo Starting client dev server (npm run dev)...
echo Press Ctrl+C to stop.
echo.
call npm run dev
echo.
echo Dev server stopped. Press any key to close.
pause >nul
