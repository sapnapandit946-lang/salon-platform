# GlamGuide: AI-Powered Salon Decision & Booking Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.38-red.svg?logo=python)](https://www.sqlalchemy.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Pytest](https://img.shields.io/badge/Pytest-11%20Passed-brightgreen.svg?logo=pytest)](https://docs.pytest.org)

> A full-stack web application designed for an Indian audience that helps customers discover salons, compare **exact service prices side-by-side**, evaluate real-time appointment availability, test virtual hairstyles with AI, and book verified salon appointments.

---

## 🌟 The Core Engineering Problem Solved

Traditional directory and aggregator websites typically display generic cards with ambiguous marketing claims like *"Haircuts starting from ₹99"*, leading to price shock and decision fatigue.

**GlamGuide re-engineers this experience around the exact service:**
1. **Exact-Service Pricing Isolation:** When you search for a *Haircut*, our system extracts and compares the exact haircut price at each salon. A salon offering an expensive ₹2,500 keratin treatment is never disqualified or misrepresented when its haircut price fits the customer's ₹350 budget.
2. **Transparent Decision-Support Ranking:** Rule-based composite scoring formula factoring in Budget Fit (35%), Travel Distance via Haversine calculation (25%), Bayesian-Weighted Verified Ratings (25%), and Live Slot Availability (15%).
3. **Double-Booking Prevention:** Operating schedules, slot intervals, service duration, and concurrent chair capacity are dynamically computed to eliminate appointment conflicts.
4. **AI Virtual Hairstyle & Color Preview:** Ethical, consent-gated image transformation engine allowing customers to visualize fades, balayage, or bangs on their portraits before scheduling.
5. **Salon Owner Business Portal:** Dedicated business dashboard for salon owners to manage services, update exact prices, configure weekly schedules, and oversee customer appointments.

---

## 🏗️ Technology Stack

- **Frontend:** React 19, JavaScript, Vite, React Router 7, Plain CSS Design Tokens, Lucide Icons.
- **Backend:** Python 3.14 / 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Pytest.
- **Security & Auth:** Salted Bcrypt password hashing, JWT (HS256) bearer tokens, Role-Based Access Control (RBAC).
- **Database:** PostgreSQL (with Docker Compose configuration) and SQLite (instant zero-blocker development mode).
- **AI Integration:** Service abstraction supporting Gemini Generative AI and Pillow development simulation mode.

---

## 📁 Repository Structure

```
salon-platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST API routers (auth, salons, compare, bookings, reviews, owner, ai_preview)
│   │   ├── core/           # Configuration, database engine, security (JWT, Bcrypt), dependencies
│   │   ├── models/         # SQLAlchemy relational database models
│   │   ├── schemas/        # Pydantic v2 request/response validation schemas
│   │   ├── services/       # Core business logic (comparison, booking slots, salon search, AI preview)
│   │   ├── utils/          # Geographic utilities (Haversine distance calculation)
│   │   └── main.py         # FastAPI application entry point
│   ├── tests/              # 11 automated Pytest unit and integration tests
│   ├── requirements.txt    # Pinned backend dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Footer, SalonCard, FloatingCompareBar, AuthModal)
│   │   ├── context/        # React Context (AuthContext, ComparisonContext)
│   │   ├── pages/          # Full pages (Landing, Discovery, Compare, Detail, AIPreview, Bookings, OwnerDashboard)
│   │   ├── services/       # API fetch client layer
│   │   ├── index.css       # Design system tokens and styles
│   │   ├── App.jsx         # Routes definition
│   │   └── main.jsx        # React root mounting
│   ├── package.json
│   └── vite.config.js      # Vite configuration with API proxy
├── docs/
│   ├── architecture.md     # System architecture, formulas, and RBAC matrix
│   ├── database-design.md  # Relational schema, ER diagram, and table specs
│   ├── api-documentation.md# REST API documentation
│   ├── testing-guide.md    # Automated test suite and manual verification checklist
│   └── setup-guide.md      # Detailed installation and deployment instructions
├── scripts/
│   └── seed_db.py          # Database seeder with realistic Indian salon data
├── docker-compose.yml      # PostgreSQL 16 Alpine container configuration
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```powershell
# Open terminal in project root
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# Seed realistic database records (Salons in Mumbai, Bengaluru, Delhi, Pune)
$env:PYTHONPATH="backend"
.\.venv\Scripts\python.exe scripts/seed_db.py

# Launch FastAPI development server
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup
```powershell
# Open a second terminal
cd frontend
npm install
npm run dev
```
Application interface will be live at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests

```powershell
$env:PYTHONPATH="backend"
.\.venv\Scripts\pytest backend/tests -v
```
All 11 test suites verify authentication, comparison logic, scheduling concurrency, and AI safety checks.

---

## 🔑 Demo Credentials for Testing & Interviews

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Customer** | `rahul.verma@example.com` | `Customer@123` | Search, compare salons side-by-side, book slots, cancel appointments, submit verified reviews. |
| **Salon Owner** | `arjun@enrichsalon.com` | `Owner@123` | Access Owner Portal, manage exact service prices, update operating hours, confirm/complete client appointments. |
| **Admin** | `admin@salonplatform.com` | `Admin@123` | Platform oversight. |

*(Demo autofill chips are provided directly in the login dialog for zero-friction demonstrations).*

---

## 🎯 Interview Talking Points

1. **Why Plain CSS with Design Tokens over Heavy UI Frameworks?**
   Demonstrates foundational mastery of web styling, CSS flexbox/grid layout systems, responsive mobile viewports, and custom glassmorphism without bundle bloat.
2. **How is Overbooking Prevented?**
   The `BookingService` generates discrete time steps over the salon's daily schedule, counts active bookings that overlap with $[\text{start}, \text{start} + \text{duration}]$, and compares against the salon's `concurrent_capacity` before confirming.
3. **What is Bayesian Rating Smoothing?**
   Rather than sorting by raw average rating (which causes a salon with 1 review of 5.0 to outrank a salon with 200 reviews of 4.9), we compute a weighted posterior incorporating an uninformative regional prior.
4. **How Does the AI Transformation Service Scale?**
   Built using the **Service Object Pattern** (`AIPreviewService`), validating MIME headers, Pillow byte streams, and file size constraints before invoking external generative providers or local development simulators.
