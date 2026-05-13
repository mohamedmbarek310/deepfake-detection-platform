"""
auth.py
-------
Authentication system using JWT tokens.

What this file does:
  1. Register new users
  2. Login existing users
  3. Hash passwords securely
  4. Generate JWT tokens
  5. Verify JWT tokens

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from database import get_db
from models import User

# ─────────────────────────────────────────────────────────────────────────────
# Load environment variables
# ─────────────────────────────────────────────────────────────────────────────
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# ─────────────────────────────────────────────────────────────────────────────
# Setup
# ─────────────────────────────────────────────────────────────────────────────
router       = APIRouter()
pwd_context  = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas (request/response shapes)
# ─────────────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email:    str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type:   str
    username:     str


# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Check if a plain password matches a hashed one."""
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    """Generate a JWT token with expiration."""
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db)
) -> User:
    """
    Validates JWT token and returns the current logged-in user.
    Used as a dependency in protected endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE 1: Register
# POST /api/v1/auth/register
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Checks:
      - Username must not already exist
      - Email must not already exist
      - Password is hashed before storing
    """
    # Check if username already taken
    existing_user = db.query(User).filter(
        User.username == request.username
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Check if email already taken
    existing_email = db.query(User).filter(
        User.email == request.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user with hashed password
    new_user = User(
        username = request.username,
        email    = request.email,
        password = hash_password(request.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message":  "Account created successfully",
        "username": new_user.username,
        "email":    new_user.email
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE 2: Login
# POST /api/v1/auth/login
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with username and password.
    Returns a JWT token on success.
    """
    # Find user by username
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    # Check user exists and password is correct
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    # Generate JWT token
    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type":   "bearer",
        "username":     user.username
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE 3: Get current user info
# GET /api/v1/auth/me
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's information.
    Requires a valid JWT token.
    """
    return {
        "id":         current_user.id,
        "username":   current_user.username,
        "email":      current_user.email,
        "created_at": current_user.created_at
    }