@echo off
echo ==============================================================
echo Starting AI-Powered Salon Platform Backend (FastAPI on Port 8000)
echo ==============================================================
set PYTHONPATH=backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
