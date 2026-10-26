# Setup & Deployment Guide

This guide details how to configure, run, and develop the **AI-Powered Salon Decision & Booking Platform** locally.

---

## Prerequisites
- **Python**: 3.11+ (Python 3.14 verified)
- **Node.js**: v18+ (Node.js v24.20 verified)
- **npm**: 9+
- **Docker & Docker Compose** (Optional, for PostgreSQL container)

---

## 1. Quick Local Start (Zero-Blocker SQLite Mode)

### A. Backend Setup
1. Open PowerShell / Terminal in the project root:
   ```powershell
   cd "c:\Users\SAGAR PANDIT\Documents\salon-platform"
   ```

2. Create and activate virtual environment (if not already created):
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:
   ```powershell
   .\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
   ```

4. Verify or initialize `backend/.env`:
   ```ini
   ENVIRONMENT=development
   SECRET_KEY=salon_development_secret_key_8923471098273419082374
   DATABASE_URL=sqlite:///./salon.db
   AI_PROVIDER=mock
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
   ```

5. Seed initial Indian salon records, users, services, and schedules:
   ```powershell
   $env:PYTHONPATH="backend"
   .\.venv\Scripts\python.exe scripts/seed_db.py
   ```

6. Start FastAPI server:
   ```powershell
   $env:PYTHONPATH="backend"
   .\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Docs will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### B. Frontend Setup
1. Open a new terminal in `frontend`:
   ```powershell
   cd "c:\Users\SAGAR PANDIT\Documents\salon-platform\frontend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start Vite dev server:
   ```powershell
   npm run dev
   ```
   - Web application opens at: [http://localhost:5173](http://localhost:5173)

---

## 2. PostgreSQL Setup (Production-Oriented)

### Using Docker Compose
If Docker is installed on your system:
1. Start PostgreSQL 16 container:
   ```powershell
   docker compose up -d
   ```
2. Update `DATABASE_URL` in `backend/.env`:
   ```ini
   DATABASE_URL=postgresql://salon_user:salon_secure_password_123@localhost:5432/salon_platform_db
   ```
3. Run the database seeding script to populate PostgreSQL:
   ```powershell
   $env:PYTHONPATH="backend"
   .\.venv\Scripts\python.exe scripts/seed_db.py
   ```

---

## 3. Demo Credentials for Placement & Interview Demos

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `rahul.verma@example.com` | `Customer@123` | Can discover salons, compare services, book slots, view history, leave reviews. |
| **Salon Owner** | `arjun@enrichsalon.com` | `Owner@123` | Owns "Enrich Salon" (Mumbai). Can manage services, pricing, operating hours, client bookings. |
| **Platform Admin** | `admin@salonplatform.com` | `Admin@123` | Administrative oversight. |
