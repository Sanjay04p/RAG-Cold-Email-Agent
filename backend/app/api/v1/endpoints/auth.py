from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User

router = APIRouter()

# Schema for when a user signs up
class UserCreate(BaseModel):
    email: str
    password: str

@router.post("/signup")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user into the database."""
    
    # 1. Check if email is already taken
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password and save the user
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"status": "success", "message": "User created successfully. You can now log in."}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticates a user and returns a JWT token.
    Note: OAuth2 expects the fields to be named 'username' and 'password'.
    We will have the user pass their email into the 'username' field.
    """
    
    # 1. Find the user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Verify user exists AND password matches
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generate the JWT token passkey
    access_token = create_access_token(data={"sub": user.email})
    
    # This specific dictionary format is required by FastAPI's OAuth2 system
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}