from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 1. Fetch the URL from .env. If it doesn't exist, fall back to local SQLite for safety!
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cold_email.db")

# Fix an old cloud provider quirk: SQLAlchemy requires "postgresql://" but some hosts give "postgres://"
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 2. SQLite needs a special threading rule, but Postgres DOES NOT.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    print("💽 Running on Local SQLite Database")
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    print("☁️ Running on Cloud PostgreSQL Database")

# 3. Standard setup
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()