from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
from app.core.config import settings

# Configure engine arguments based on database dialect
connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Resolve relative SQLite database path against the project root
    # e.g., sqlite:///./salon.db -> sqlite:///C:/Users/.../salon.db
    if db_url.startswith("sqlite:///./") or db_url.startswith("sqlite:////./"):
        prefix_len = len("sqlite:///./") if db_url.startswith("sqlite:///./") else len("sqlite:////./")
        rel_filename = db_url[prefix_len:]
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        backend_dir = project_root / "backend"

        if (project_root / rel_filename).exists():
            abs_db_path = (project_root / rel_filename).resolve()
        elif (backend_dir / rel_filename).exists():
            abs_db_path = (backend_dir / rel_filename).resolve()
        else:
            abs_db_path = (project_root / rel_filename).resolve()

        db_url = f"sqlite:///{abs_db_path.as_posix()}"
    elif db_url == "sqlite:///salon.db":
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        abs_db_path = (project_root / "salon.db").resolve()
        db_url = f"sqlite:///{abs_db_path.as_posix()}"

    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=False
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides an active database session for requests and closes it cleanly."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
