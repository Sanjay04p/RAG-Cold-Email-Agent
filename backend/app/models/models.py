from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # NEW: Store the user's personal SMTP credentials
    smtp_email = Column(String, nullable=True)
    smtp_password = Column(String, nullable=True) # Their Google App Password

    prospects = relationship("Prospect", back_populates="owner")

class Prospect(Base):
    __tablename__ = "prospects"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    company_name = Column(String)
    company_website = Column(String)
    
    # Links Prospect to the User who created it
    owner_id = Column(Integer, ForeignKey("users.id")) 
    
    # THE MISSING LINES: Re-establishing the connections
    owner = relationship("User", back_populates="prospects")
    emails = relationship("EmailLog", back_populates="prospect")

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    prospect_id = Column(Integer, ForeignKey("prospects.id"))
    personalized_opening = Column(String)
    full_body = Column(String)
    status = Column(String, default="draft")
    
    # Links EmailLog back to the Prospect
    prospect = relationship("Prospect", back_populates="emails")