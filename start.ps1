# Mentor Application Startup Script (PowerShell)
Write-Host "Starting Mentor Application" -ForegroundColor Green

# Function to cleanup background processes on exit
function Cleanup {
    Write-Host "Stopping servers" -ForegroundColor Yellow
    if ($backendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
    if ($frontendJob) {
        Stop-Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job $frontendJob -ErrorAction SilentlyContinue
    }
    exit 0
}

# Set trap to cleanup on script exit
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# Start backend server
Write-Host "Starting FastAPI backend on http://localhost:8000" -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "backend"
    python main.py
}

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting Next.js frontend on http://localhost:3000" -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "frontend"
    pnpm run dev
}

Write-Host "Both servers are starting up..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Wait for both processes
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if jobs are still running
        if ($backendJob.State -ne "Running" -and $backendJob.State -ne "NotStarted") {
            Write-Host "Backend job stopped with state: $($backendJob.State)" -ForegroundColor Red
            Receive-Job $backendJob
            break
        }
        if ($frontendJob.State -ne "Running" -and $frontendJob.State -ne "NotStarted") {
            Write-Host "Frontend job stopped with state: $($frontendJob.State)" -ForegroundColor Red
            Receive-Job $frontendJob
            break
        }
    }
} catch {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Cleanup
}
