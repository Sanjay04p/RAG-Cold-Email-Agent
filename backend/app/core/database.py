from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 1. Create the Database Engine
# "check_same_thread": False is needed ONLY for SQLite. Remove it if using PostgreSQL.
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# 2. Create the SessionLocal class
# Each instance of this class will be a database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class
# All your models (Prospect, Campaign) will inherit from this.
Base = declarative_base()

# 4. Dependency Injection
# This function ensures we open a connection for a request and CLOSE it after.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()