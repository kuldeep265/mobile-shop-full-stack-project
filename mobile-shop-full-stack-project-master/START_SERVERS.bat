@echo off
echo ========================================
echo   Starting Fone Factory Servers
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers are starting in new windows
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait for both servers to start, then open:
echo http://localhost:3000 in your browser
echo.
pause

