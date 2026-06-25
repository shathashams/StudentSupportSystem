@echo off
REM Install client dependencies
cd /d "%~dp0"
echo Installing client dependencies...
echo.
call npm install
echo.
echo Done. Press any key to close.
pause >nul
