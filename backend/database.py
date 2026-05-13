"""
database.py
-----------
Database connection setup using SQLAlchemy.

What this file does:
  1. Reads database credentials from .env file
  2. Creates a connection to PostgreSQL
  3. Provides a session factory for database operations
  4. Creates all tables automatically on startup

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# ─────────────────────────────────────────────────────────────────────────────
# Load environment variables from .env file
# ─────────────────────────────────────────────────────────────────────────────
load_dotenv()

# Get database URL from .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# ─────────────────────────────────────────────────────────────────────────────
# Create the database engine
# This is the main connection to PostgreSQL
# ─────────────────────────────────────────────────────────────────────────────
engine = create_engine(DATABASE_URL)

# ─────────────────────────────────────────────────────────────────────────────
# Create a session factory
# Each request gets its own session (database connection)
# ─────────────────────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ─────────────────────────────────────────────────────────────────────────────
# Base class for all database models
# All our tables will inherit from this
# ─────────────────────────────────────────────────────────────────────────────
Base = declarative_base()

# ─────────────────────────────────────────────────────────────────────────────
# Dependency: get database session
# Used by FastAPI endpoints to get a database connection
# ─────────────────────────────────────────────────────────────────────────────
def get_db():
    """
    Creates a database session for each request.
    Automatically closes the session when request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()