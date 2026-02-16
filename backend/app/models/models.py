from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Prospect(Base):
    __tablename__ = "prospects"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    linkedin_url = Column(String)
    company_name = Column(String)
    company_website = Column(String)
    job_title = Column(String)
    
    # Relationship to track emails sent to this prospect
    emails = relationship("EmailLog", back_populates="prospect")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    emails = relationship("EmailLog", back_populates="campaign")

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    prospect_id = Column(Integer, ForeignKey("prospects.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    
    # AI Generated Content
    subject_line = Column(String)
    personalized_opening = Column(Text) # The RAG-generated part
    full_body = Column(Text)
    
    # Analytics for A/B testing
    status = Column(String, default="draft") # draft, sent, opened, replied
    sent_at = Column(DateTime(timezone=True), nullable=True)

    prospect = relationship("Prospect", back_populates="emails")
    campaign = relationship("Campaign", back_populates="emails")