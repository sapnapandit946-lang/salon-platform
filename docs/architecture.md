# System Architecture & Technical Specification

## Project: AI-Powered Salon Decision & Booking Platform (GlamGuide)

### 1. Architectural Philosophy
The GlamGuide platform is designed around the core engineering principle of **Exact-Service Decision Support**. Unlike legacy listing directories that display ambiguous "Prices starting from ₹99" or generic salon cards, GlamGuide binds customer searches, pricing filters, distance calculations, and appointment slots strictly to the **exact requested service**.

### 2. Layered Architecture

```
+--------------------------------------------------------------------+
|                         CLIENT LAYER                               |
|   React (Vite) + Plain CSS Design Tokens + React Router + Context  |
+--------------------------------------------------------------------+
                                  |
                                  | HTTP / JSON (REST API)
                                  v
+--------------------------------------------------------------------+
|                        API ROUTING LAYER                           |
|       FastAPI Router (v1): Auth, Salons, Services, Compare,         |
|                 Bookings, Reviews, Owner, AI-Preview               |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                      SECURITY & RBAC LAYER                         |
|   JWT (HS256) Bearer Authentication + RoleChecker Middleware       |
|    Roles: GUEST, CUSTOMER, SALON_OWNER, PLATFORM_ADMIN             |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                      BUSINESS SERVICES LAYER                       |
|   - ComparisonService: Multi-factor weighted decision scoring      |
|   - BookingService: Real-time capacity & slot computation          |
|   - SalonService: Exact-service relational queries & geo filters   |
|   - AIPreviewService: Image validation & generative transformation |
|   - AuthService: Salted Bcrypt hashing & credential validation     |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                    DATA PERSISTENCE LAYER                          |
|      SQLAlchemy 2.0 ORM + Alembic Migrations + Connection Pool     |
|       PostgreSQL (Production/Docker) | SQLite (Local Dev Mode)     |
+--------------------------------------------------------------------+
```

---

### 3. Decision-Support Ranking Engine

The comparison engine calculates a multi-factor score (0 to 100) using transparent, documented weights:

$$\text{Composite Score} = 0.35 \times \text{Budget Score} + 0.25 \times \text{Distance Score} + 0.25 \times \text{Rating Score} + 0.15 \times \text{Availability Score}$$

#### A. Budget Match Score (35% Weight)
- Evaluated strictly against the **exact requested service** (e.g. Haircut price, not Hair Spa).
- If $\text{Price} \le \text{Max Budget}$:
  $$\text{Score} = 70.0 + \left(\frac{\text{Budget} - \text{Price}}{\text{Budget}}\right) \times 30.0$$
- If $\text{Price} > \text{Max Budget}$:
  $$\text{Score} = \max\left(0, 50.0 - \left(\frac{\text{Price} - \text{Budget}}{\text{Budget}}\right) \times 50.0\right)$$

#### B. Distance Proximity Score (25% Weight)
- Calculated using the spherical **Haversine formula** between customer coordinates and salon coordinates:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- Proximity score scales linearly from $100$ at $0\text{ km}$ to $0$ at $20\text{ km}$.
- If geolocation is not provided, defaults to a neutral $70.0$.

#### C. Rating Score with Bayesian Smoothing (25% Weight)
To prevent newly created salons with a single 5-star review from outranking established salons with hundreds of high ratings, ratings are smoothed against a regional prior ($m = 3.8$, weight $C = 5$):
$$\text{Smoothed Rating} = \frac{R \cdot v + m \cdot C}{v + C}$$
Where $R$ is the salon's average rating and $v$ is the review volume.

#### D. Availability Score (15% Weight)
- $100.0$: Salon is open on the requested date and the chosen appointment time slot is free.
- $40.0$: Salon is open on the requested date, but the specific slot is full (alternate slots exist).
- $0.0$: Salon is closed on the selected day of the week.

---

### 4. Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Guest | Customer | Salon Owner | Platform Admin |
| :--- | :---: | :---: | :---: | :---: |
| Search & Browse Salons | Read | Read | Read | Read |
| Service Comparison Matrix | Read | Read | Read | Read |
| AI Hairstyle Preview | Use (w/ consent) | Use (w/ consent) | Use (w/ consent) | Use (w/ consent) |
| Book Appointment | No | Create / View Own | No | Manage All |
| Cancel Appointment | No | Cancel Own | Cancel Own Salon | Cancel Any |
| Submit Verified Review | No | Review Own Completed | No | Manage Reviews |
| Salon Dashboard & Stats | No | No | Access Own Salon | Full Access |
| Manage Services & Pricing | No | No | Manage Own Salon | Full Access |
| Manage Operating Hours | No | No | Manage Own Salon | Full Access |
