# GlamGuide Full-Stack PowerShell Launcher
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "       Launching GlamGuide Full-Stack Platform" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList '/k', 'set PYTHONPATH=backend && .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload'

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList '/k', 'cd frontend && npm run dev'

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " Both servers launched in separate windows!" -ForegroundColor Green
Write-Host "   - Web Interface: http://localhost:5173" -ForegroundColor Yellow
Write-Host "   - API Docs:      http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Cyan

