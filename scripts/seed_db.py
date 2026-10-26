import os
import sys
from datetime import datetime, date, time, timedelta

# Add backend directory to sys.path so app modules can be imported
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, Salon, ServiceCategory, Service,
    SalonSchedule, Booking, BookingStatus, Review
)


def seed_database():
    print("[INIT] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Salon).count() > 0:
            print("Database already contains salon records. Skipping duplicate seeding.")
            return

        print("Seeding service categories...")
        cat_hair = ServiceCategory(name="Hair Care & Styling", slug="hair-care", icon="Scissors", display_order=1)
        cat_beard = ServiceCategory(name="Beard & Shaving", slug="beard-shaving", icon="Smile", display_order=2)
        cat_color = ServiceCategory(name="Hair Coloring & Highlights", slug="hair-coloring", icon="Palette", display_order=3)
        cat_treatment = ServiceCategory(name="Hair Treatments & Spa", slug="hair-treatments", icon="Sparkles", display_order=4)
        cat_skin = ServiceCategory(name="Skin Care & Facials", slug="skin-facials", icon="Sun", display_order=5)
        cat_bridal = ServiceCategory(name="Bridal & Event Makeup", slug="bridal-makeup", icon="Heart", display_order=6)
        cat_nails = ServiceCategory(name="Nails & Pedicure", slug="nails-pedicure", icon="CheckCircle", display_order=7)

        db.add_all([cat_hair, cat_beard, cat_color, cat_treatment, cat_skin, cat_bridal, cat_nails])
        db.flush()

        print("Seeding user accounts (Admin, Salon Owners, Customers)...")
        # 1. Admin
        admin = User(
            email="admin@salonplatform.com",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Platform Administrator",
            phone="+91 9820011223",
            role=UserRole.ADMIN.value,
            is_active=True
        )

        # 2. Salon Owners
        owner1 = User(
            email="arjun@enrichsalon.com",
            hashed_password=get_password_hash("Owner@123"),
            full_name="Arjun Mehta",
            phone="+91 9819123456",
            role=UserRole.SALON_OWNER.value,
            is_active=True
        )
        owner2 = User(
            email="priya@lookssalon.com",
            hashed_password=get_password_hash("Owner@123"),
            full_name="Priya Sharma",
            phone="+91 9820234567",
            role=UserRole.SALON_OWNER.value,
            is_active=True
        )
        owner3 = User(
            email="vikram@toniandguy.com",
            hashed_password=get_password_hash("Owner@123"),
            full_name="Vikram Singhania",
            phone="+91 9833345678",
            role=UserRole.SALON_OWNER.value,
            is_active=True
        )
        owner4 = User(
            email="neha@jawedhabib.com",
            hashed_password=get_password_hash("Owner@123"),
            full_name="Neha Kapoor",
            phone="+91 9844456789",
            role=UserRole.SALON_OWNER.value,
            is_active=True
        )

        # 3. Customers
        customer1 = User(
            email="rahul.verma@example.com",
            hashed_password=get_password_hash("Customer@123"),
            full_name="Rahul Verma",
            phone="+91 9769012345",
            role=UserRole.CUSTOMER.value,
            is_active=True
        )
        customer2 = User(
            email="ananya.iyer@example.com",
            hashed_password=get_password_hash("Customer@123"),
            full_name="Ananya Iyer",
            phone="+91 9770123456",
            role=UserRole.CUSTOMER.value,
            is_active=True
        )

        db.add_all([admin, owner1, owner2, owner3, owner4, customer1, customer2])
        db.flush()

        print("Seeding salons across Indian metropolitan hubs...")
        # High quality Unsplash salon imagery
        img_salon1 = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
        img_salon2 = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
        img_salon3 = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
        img_salon4 = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
        img_salon5 = "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
        img_salon6 = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80"

        # Salon 1: Mumbai - Bandra West
        salon1 = Salon(
            owner_id=owner1.id,
            name="Enrich Salon & Luxury Studio",
            description="Premium unisex salon offering bespoke haircuts, advanced hair spa therapies, and expert styling by senior certified artists.",
            address="Shop 4, Hill Road, Near Bandra Station, Bandra West",
            city="Mumbai",
            locality="Bandra West",
            pincode="400050",
            latitude=19.0596,
            longitude=72.8295,
            phone="+91 22 2640 1122",
            email="bandra@enrichsalon.com",
            cover_image=img_salon1,
            gallery_images="[]",
            rating=4.7,
            review_count=38,
            is_active=True
        )

        # Salon 2: Mumbai - Andheri West
        salon2 = Salon(
            owner_id=owner2.id,
            name="Looks Unisex Salon & Grooming Bar",
            description="Modern urban salon specializing in quick premium haircuts, beard grooming, and rejuvenating skin cleanups.",
            address="Plot 12, Oshiwara Link Road, Andheri West",
            city="Mumbai",
            locality="Andheri West",
            pincode="400053",
            latitude=19.1363,
            longitude=72.8277,
            phone="+91 22 2631 3344",
            email="andheri@lookssalon.com",
            cover_image=img_salon2,
            gallery_images="[]",
            rating=4.4,
            review_count=52,
            is_active=True
        )

        # Salon 3: Bengaluru - Indiranagar
        salon3 = Salon(
            owner_id=owner3.id,
            name="Toni & Guy Essentials",
            description="International trendsetting hair studio renowned for precision cutting, runway styling, and balayage highlights.",
            address="100 Feet Road, HAL 2nd Stage, Indiranagar",
            city="Bengaluru",
            locality="Indiranagar",
            pincode="560038",
            latitude=12.9784,
            longitude=77.6408,
            phone="+91 80 4125 5566",
            email="indiranagar@toniandguy.com",
            cover_image=img_salon3,
            gallery_images="[]",
            rating=4.9,
            review_count=84,
            is_active=True
        )

        # Salon 4: Bengaluru - Koramangala
        salon4 = Salon(
            owner_id=owner4.id,
            name="Jawed Habib Hair Studio",
            description="Affordable and reliable haircuts, grooming, and scalp treatments designed for students and working professionals.",
            address="5th Block, Jyoti Nivas College Road, Koramangala",
            city="Bengaluru",
            locality="Koramangala",
            pincode="560095",
            latitude=12.9352,
            longitude=77.6245,
            phone="+91 80 4150 7788",
            email="koramangala@jawedhabib.com",
            cover_image=img_salon4,
            gallery_images="[]",
            rating=4.2,
            review_count=65,
            is_active=True
        )

        # Salon 5: Delhi - Connaught Place
        salon5 = Salon(
            owner_id=owner1.id,
            name="The Royal Scissor Grooming Lounge",
            description="Heritage grooming and modern hair spa located in the heart of central Delhi.",
            address="Block M, Connaught Circus, Connaught Place",
            city="Delhi",
            locality="Connaught Place",
            pincode="110001",
            latitude=28.6315,
            longitude=77.2167,
            phone="+91 11 2341 8899",
            email="cp@royalscissor.com",
            cover_image=img_salon5,
            gallery_images="[]",
            rating=4.8,
            review_count=41,
            is_active=True
        )

        # Salon 6: Pune - Kothrud
        salon6 = Salon(
            owner_id=owner2.id,
            name="Bounce Studio & Aesthetic Care",
            description="Contemporary aesthetic studio offering personalized hair designing, deep organic conditioning, and cleanups.",
            address="Paud Road, Ideal Colony, Kothrud",
            city="Pune",
            locality="Kothrud",
            pincode="411038",
            latitude=18.5074,
            longitude=73.8077,
            phone="+91 20 2543 9900",
            email="kothrud@bouncestudio.com",
            cover_image=img_salon6,
            gallery_images="[]",
            rating=4.6,
            review_count=29,
            is_active=True
        )

        db.add_all([salon1, salon2, salon3, salon4, salon5, salon6])
        db.flush()

        print("Seeding exact service prices for each salon...")
        # Concrete service-specific prices that directly demonstrate the comparison engine
        services = [
            # Salon 1 (Enrich - Bandra)
            Service(salon_id=salon1.id, category_id=cat_hair.id, name="Haircut & Styling", description="Consultation, wash, precision cut, and styling", price=450.0, duration_minutes=40),
            Service(salon_id=salon1.id, category_id=cat_beard.id, name="Beard Trim & Grooming", description="Beard shaping with hot towel finish", price=250.0, duration_minutes=25),
            Service(salon_id=salon1.id, category_id=cat_treatment.id, name="Hair Spa & Deep Conditioning", description="L'Oreal revitalizing scalp and hair treatment", price=950.0, duration_minutes=60),
            Service(salon_id=salon1.id, category_id=cat_color.id, name="Global Hair Colour", description="Ammonia-free global color application", price=1800.0, duration_minutes=90),
            Service(salon_id=salon1.id, category_id=cat_treatment.id, name="Keratin Treatment", description="Frizz-free smoothing treatment", price=3200.0, duration_minutes=120),

            # Salon 2 (Looks - Andheri)
            Service(salon_id=salon2.id, category_id=cat_hair.id, name="Haircut & Styling", description="Senior stylist cut with quick blow-dry", price=300.0, duration_minutes=30),
            Service(salon_id=salon2.id, category_id=cat_beard.id, name="Beard Trim & Grooming", description="Clean razor edge lining and organic beard oil", price=180.0, duration_minutes=20),
            Service(salon_id=salon2.id, category_id=cat_treatment.id, name="Hair Spa & Deep Conditioning", description="Moisture surge therapy for dry hair", price=750.0, duration_minutes=45),
            Service(salon_id=salon2.id, category_id=cat_color.id, name="Global Hair Colour", description="Rich tone pigment infusion", price=2100.0, duration_minutes=90),

            # Salon 3 (Toni & Guy - Indiranagar)
            Service(salon_id=salon3.id, category_id=cat_hair.id, name="Haircut & Styling", description="Master artistic director precision haircut", price=850.0, duration_minutes=45),
            Service(salon_id=salon3.id, category_id=cat_color.id, name="Global Hair Colour", description="Multi-dimensional couture color styling", price=3500.0, duration_minutes=120),
            Service(salon_id=salon3.id, category_id=cat_color.id, name="Balayage Highlights", description="Hand-painted sunkissed balayage strands", price=4200.0, duration_minutes=150),
            Service(salon_id=salon3.id, category_id=cat_treatment.id, name="Hair Spa & Deep Conditioning", description="Kerastase ritual for damaged fiber restoration", price=1600.0, duration_minutes=60),

            # Salon 4 (Jawed Habib - Koramangala)
            Service(salon_id=salon4.id, category_id=cat_hair.id, name="Haircut & Styling", description="Signature Habib scissor cut and styling", price=250.0, duration_minutes=30),
            Service(salon_id=salon4.id, category_id=cat_beard.id, name="Beard Trim & Grooming", description="Classic scissors and trimmer grooming", price=150.0, duration_minutes=20),
            Service(salon_id=salon4.id, category_id=cat_treatment.id, name="Hair Spa & Deep Conditioning", description="Matrix nourishing deep conditioning spa", price=600.0, duration_minutes=45),
            Service(salon_id=salon4.id, category_id=cat_color.id, name="Global Hair Colour", description="Natural black or dark brown global coloring", price=1400.0, duration_minutes=75),

            # Salon 5 (The Royal Scissor - CP)
            Service(salon_id=salon5.id, category_id=cat_hair.id, name="Haircut & Styling", description="Executive haircut with relaxing head massage", price=500.0, duration_minutes=45),
            Service(salon_id=salon5.id, category_id=cat_beard.id, name="Beard Trim & Grooming", description="Hot foam straight-razor shaping", price=300.0, duration_minutes=30),
            Service(salon_id=salon5.id, category_id=cat_treatment.id, name="Hair Spa & Deep Conditioning", description="Herbal scalp rejuvenation therapy", price=1100.0, duration_minutes=60),

            # Salon 6 (Bounce - Kothrud)
            Service(salon_id=salon6.id, category_id=cat_hair.id, name="Haircut & Styling", description="Trend haircut, wash, and blast-dry", price=350.0, duration_minutes=35),
            Service(salon_id=salon6.id, category_id=cat_beard.id, name="Beard Trim & Grooming", description="Beard taper and trimming", price=200.0, duration_minutes=20),
            Service(salon_id=salon6.id, category_id=cat_treatment.id, name="Hair Spa & Deep Conditioning", description="Nutri-oil hair spa treatment", price=800.0, duration_minutes=50),
        ]
        db.add_all(services)
        db.flush()

        print("Seeding weekly operating schedules...")
        salons = [salon1, salon2, salon3, salon4, salon5, salon6]
        for s in salons:
            for day in range(7):
                sched = SalonSchedule(
                    salon_id=s.id,
                    day_of_week=day,
                    open_time=time(9, 30),
                    close_time=time(20, 30),
                    is_closed=(day == 1),  # Tuesday closed for deep sanitation in some salons
                    slot_duration_minutes=30,
                    concurrent_capacity=3
                )
                db.add(sched)
        db.flush()

        print("Seeding verified customer reviews...")
        # Create a sample completed booking for Rahul at Enrich
        b1 = Booking(
            booking_reference="SLN-2026-X9Y2A",
            customer_id=customer1.id,
            salon_id=salon1.id,
            service_id=services[0].id,  # Haircut at Enrich
            booking_date=date.today() - timedelta(days=3),
            start_time=time(11, 0),
            end_time=time(11, 40),
            total_price=450.0,
            status=BookingStatus.COMPLETED.value,
            customer_notes="Looking for a textured taper fade."
        )
        db.add(b1)
        db.flush()

        r1 = Review(
            booking_id=b1.id,
            customer_id=customer1.id,
            salon_id=salon1.id,
            rating=5,
            comment="Fantastic experience at Enrich Bandra! Arjun was very attentive to my preferences and gave a clean textured fade. Very hygienic and punctual."
        )
        db.add(r1)

        # Create another completed booking for Ananya at Looks
        b2 = Booking(
            booking_reference="SLN-2026-K3W7B",
            customer_id=customer2.id,
            salon_id=salon2.id,
            service_id=services[5].id,  # Haircut at Looks
            booking_date=date.today() - timedelta(days=2),
            start_time=time(14, 0),
            end_time=time(14, 30),
            total_price=300.0,
            status=BookingStatus.COMPLETED.value,
            customer_notes="Just neat trimming."
        )
        db.add(b2)
        db.flush()

        r2 = Review(
            booking_id=b2.id,
            customer_id=customer2.id,
            salon_id=salon2.id,
            rating=4,
            comment="Very reasonable ₹300 haircut. Quick service with almost zero waiting time. Recommended if you're in Andheri!"
        )
        db.add(r2)

        # Create an upcoming confirmed appointment for Rahul at Toni & Guy
        b3 = Booking(
            booking_reference="SLN-2026-T8M4Q",
            customer_id=customer1.id,
            salon_id=salon3.id,
            service_id=services[9].id,  # Haircut at Toni & Guy
            booking_date=date.today() + timedelta(days=2),
            start_time=time(16, 0),
            end_time=time(16, 45),
            total_price=850.0,
            status=BookingStatus.CONFIRMED.value,
            customer_notes="Pre-booked appointment."
        )
        db.add(b3)

        db.commit()
        print("[SUCCESS] Database seeding completed successfully!")
        print("Credentials available for testing:")
        print(" - Admin: admin@salonplatform.com / Admin@123")
        print(" - Salon Owner: arjun@enrichsalon.com / Owner@123")
        print(" - Customer: rahul.verma@example.com / Customer@123")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during database seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
