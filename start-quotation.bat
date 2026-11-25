@echo off
setlocal
set "ROOT=%~dp0"

echo Starting Quotation Backend...
start "Quotation Backend" cmd /k "cd /d "%ROOT%Quatation-Backend" && npm run dev"

echo Starting Quotation Frontend...
start "Quotation Frontend" cmd /k "cd /d "%ROOT%Quatation-Frontend" && npm run dev"

echo Waiting for servers to start...
timeout /t 6 /nobreak >nul

start "" "http://localhost:5173"
endlocal
