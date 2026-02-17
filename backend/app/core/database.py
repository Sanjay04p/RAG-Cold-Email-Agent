from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 1. Create the Database Engine

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# 2. Create the SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class
Base = declarative_base()

# 4. Dependency Injection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()