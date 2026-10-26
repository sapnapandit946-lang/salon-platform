# Testing Guide & Quality Assurance Report

## Automated Test Suite: Pytest

The project includes unit and integration tests covering the full critical path of the platform.

### Running Backend Tests

Ensure your virtual environment is active, then execute:

```powershell
# Set backend directory on PYTHONPATH
$env:PYTHONPATH="backend"

# Run all test suites with verbose output
.\.venv\Scripts\pytest backend/tests -v
```

---

### Test Suites Overview

| Test Module | Coverage Area | Key Verification Scenarios |
| :--- | :--- | :--- |
| `test_auth.py` | Authentication & Security | - User registration with hashed bcrypt password<br>- Duplicate email detection<br>- Credential validation with JWT generation<br>- Incorrect password rejection<br>- Profile retrieval via Bearer token |
| `test_comparison.py` | Central Decision Engine | - Haversine distance accuracy between Indian coordinates<br>- Service-specific pricing isolation (ensures Haircut budget filters haircut price and NOT unrelated hair spa price)<br>- Multi-factor transparent scoring breakdown |
| `test_booking.py` | Appointment Engine | - Real-time slot calculation based on schedule<br>- Appointment scheduling for future dates<br>- Double booking prevention when concurrent capacity is reached (409 Conflict)<br>- Customer appointment cancellation |
| `test_ai_preview.py` | AI Style Transformation | - Styles and hair-color endpoint response<br>- Image upload validation (format, size limits)<br>- Explicit user consent requirement (400 if false)<br>- Simulated transformation rendering & image output |

---

### Manual Test Verification Checklist

1. **Exact-Service Pricing Comparison:**
   - Go to `/compare`.
   - Select "Haircut & Styling", City "Mumbai", Budget "₹350".
   - Notice both *Looks Unisex Salon* (Haircut ₹300) and *Enrich Salon* (Haircut ₹450) are compared against their **exact haircut price**. The fact that Enrich offers a ₹1,800 hair spa does not disqualify its haircut from the comparison!

2. **Real-time Slot Booking:**
   - Go to `/salons/1` (Enrich Salon).
   - Select "Haircut & Styling" and tomorrow's date.
   - Available time slots are rendered dynamically.
   - Choose a slot, enter special requests, and click "Confirm Appointment".
   - Notice unique reference code (e.g. `SLN-2026-XXXXX`) generated.

3. **Role-Based Salon Owner Dashboard:**
   - Sign in as Salon Owner: `arjun@enrichsalon.com` / `Owner@123`.
   - Go to `/owner/dashboard`.
   - View newly scheduled customer appointment.
   - Click "Mark Completed" to finish appointment.
   - Add a new service with exact price in ₹ and duration.

4. **AI Virtual Hairstyle Preview:**
   - Go to `/ai-preview`.
   - Upload any front-facing portrait.
   - Select "Textured Crop Fade" and "Burgundy Wine".
   - Attempt to click "Generate" without checking consent: notice the validation prevents processing.
   - Check the consent box and generate: view the side-by-side Before/After preview.
