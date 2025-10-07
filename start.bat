@echo off
echo Starting Mentor Application

REM Start backend server
echo Starting FastAPI backend on http://localhost:8000
start "Backend Server" cmd /k "cd backend && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting Next.js frontend on http://localhost:3000
start "Frontend Server" cmd /k "cd frontend && pnpm run dev"

echo.
echo Both servers are starting up...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop both servers
pause >nul

REM Kill both processes
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
