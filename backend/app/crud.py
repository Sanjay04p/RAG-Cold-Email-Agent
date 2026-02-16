from sqlalchemy.orm import Session
from app.models import models
from app.schemas import prospect as prospect_schema

def get_prospect_by_email(db: Session, email: str):
    return db.query(models.Prospect).filter(models.Prospect.email == email).first()

def create_prospect(db: Session, prospect: prospect_schema.ProspectCreate):
    db_prospect = models.Prospect(
        first_name=prospect.first_name,
        last_name=prospect.last_name,
        email=prospect.email,
        linkedin_url=prospect.linkedin_url,
        company_name=prospect.company_name,
        company_website=prospect.company_website,
        job_title=prospect.job_title
    )
    db.add(db_prospect)
    db.commit()
    db.refresh(db_prospect)
    return db_prospect

def get_prospects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Prospect).offset(skip).limit(limit).all()

def get_prospect(db: Session, prospect_id: int):
    return db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()

def create_email_log(db: Session, prospect_id: int, personalized_opening: str, full_body: str = ""):
    db_email = models.EmailLog(
        prospect_id=prospect_id,
        personalized_opening=personalized_opening,
        full_body=full_body,
        status="draft" 
    )
    db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email