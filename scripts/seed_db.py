import os
import sys

# Add backend directory to sys.path so app modules can be imported
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.core.database import Base, engine, SessionLocal
from app.core.seeder import seed_database


def main():
    print("[INIT] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seeded = seed_database(db=db)
        if seeded:
            print("[SUCCESS] Database seeding completed successfully!")
            print("Credentials available for testing:")
            print(" - Admin: admin@salonplatform.com / Admin@123")
            print(" - Salon Owner: arjun@enrichsalon.com / Owner@123")
            print(" - Customer: rahul.verma@example.com / Customer@123")
        else:
            print("[INFO] Database already contains records. No changes made.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
