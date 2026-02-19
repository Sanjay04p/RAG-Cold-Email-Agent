from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User

# ==========================================
# 1. PASSWORD & TOKEN GENERATION (Bcrypt)
# ==========================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if the typed password matches the encrypted one in the DB."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    """Encrypts a plain text password using standard bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8') 

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates the JWT passkey for the user."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # Sign the token using your secret key
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


# ==========================================
# 2. THE BOUNCER (Dependency Injection)
# ==========================================

# Tells FastAPI where the login route is, enabling the Swagger UI "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Intercepts the request, reads the JWT token, and returns the current User object.
    If the token is invalid or missing, it blocks the request.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token using our secret key
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    # Find the user in the database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user