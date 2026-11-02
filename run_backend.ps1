# Launcher for AI-Powered Salon Platform Backend
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " Starting FastAPI Backend on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host " Database: SQLite (salon.db) / Port 8000" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "backend"
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
