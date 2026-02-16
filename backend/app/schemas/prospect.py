from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional

class ProspectBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    linkedin_url: Optional[str] = None
    company_name: str
    company_website: Optional[str] = None
    job_title: Optional[str] = None

class ProspectCreate(ProspectBase):
    pass

class Prospect(ProspectBase):
    id: int

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy models