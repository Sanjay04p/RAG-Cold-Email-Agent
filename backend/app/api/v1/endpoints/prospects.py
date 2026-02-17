from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas import prospect as prospect_schema
from app import crud

router = APIRouter()

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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import models

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