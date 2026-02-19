from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.schemas import prospect as prospect_schema
from app import crud
from app.models import models

router = APIRouter()


from app.core.security import get_current_user 
from app.models.models import User

router = APIRouter()

# ... (Keep your ProspectCreate and ProspectUpdate schemas here) ...
class ProspectCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    company_name: str
    company_website: str


@router.post("/")
def create_prospect(
    prospect: ProspectCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- THE BOUNCER
):
    """Creates a new prospect linked specifically to the logged-in user."""
    
    # Check if this specific user already added this email
    existing = db.query(models.Prospect).filter(
        models.Prospect.email == prospect.email,
        models.Prospect.owner_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You already added a prospect with this email.")

    # Save the new prospect and stamp it with the user's ID
    new_prospect = models.Prospect(
        **prospect.dict(),
        owner_id=current_user.id 
    )
    db.add(new_prospect)
    db.commit()
    db.refresh(new_prospect)
    return new_prospect

@router.get("/")
def get_prospects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- THE BOUNCER
):
    """Fetches ONLY the prospects owned by the logged-in user."""
    
    # The magical Multi-Tenancy filter!
    prospects = db.query(models.Prospect).filter(
        models.Prospect.owner_id == current_user.id
    ).all()
    
    return prospects


@router.post("/", response_model=prospect_schema.Prospect)
def create_prospect(prospect: prospect_schema.ProspectCreate, db: Session = Depends(get_db)):
    db_prospect = crud.get_prospect_by_email(db, email=prospect.email)
    if db_prospect:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_prospect(db=db, prospect=prospect)

@router.get("/", response_model=List[prospect_schema.Prospect])
def read_prospects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prospects = crud.get_prospects(db, skip=skip, limit=limit)
    return prospects






# ... your existing GET and POST routes ...

@router.delete("/{prospect_id}")
def delete_prospect(prospect_id: int, db: Session = Depends(get_db)):
    """Deletes a prospect and their associated email logs."""
    
    # 1. Find the prospect
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")

    # 2. Delete their email history first (to prevent orphaned data)
    db.query(models.EmailLog).filter(models.EmailLog.prospect_id == prospect_id).delete()

    # 3. Delete the prospect
    db.delete(prospect)
    db.commit()
    
    return {"status": "success", "message": "Prospect deleted"}



# 1. Create a schema to validate the incoming edited data
class ProspectUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    company_name: str
    company_website: str

# 2. Add the PUT endpoint
@router.put("/{prospect_id}")
def update_prospect(prospect_id: int, prospect_data: ProspectUpdate, db: Session = Depends(get_db)):
    """Updates an existing prospect's details."""
    
    # Find the prospect
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")

    # Overwrite the old data with the new data
    prospect.first_name = prospect_data.first_name
    prospect.last_name = prospect_data.last_name
    prospect.email = prospect_data.email
    prospect.company_name = prospect_data.company_name
    prospect.company_website = prospect_data.company_website

    # Save to database
    db.commit()
    db.refresh(prospect)
    
    return prospect