@echo off
title GlamGuide Full-Stack Launcher
echo ==============================================================
echo       Launching GlamGuide Full-Stack Platform
echo ==============================================================
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "GlamGuide Backend (Port 8000)" cmd /k "set PYTHONPATH=backend && .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "GlamGuide Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo ==============================================================
echo Application running:
echo   - Web Interface: http://localhost:5173
echo   - Backend Docs:  http://127.0.0.1:8000/docs
echo ==============================================================

