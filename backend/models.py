"""
models.py
---------
Database table definitions using SQLAlchemy.

Tables we create:
  1. users    → Stores user accounts
  2. scans    → Stores detection results

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


# ─────────────────────────────────────────────────────────────────────────────
# TABLE 1: users
# Stores all registered user accounts
# ─────────────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(50), unique=True, index=True, nullable=False)
    email      = Column(String(100), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active  = Column(Boolean, default=True)

    # Relationship: one user has many scans
    scans = relationship("Scan", back_populates="user")


# ─────────────────────────────────────────────────────────────────────────────
# TABLE 2: scans
# Stores all detection results
# ─────────────────────────────────────────────────────────────────────────────
class Scan(Base):
    __tablename__ = "scans"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename         = Column(String(255), nullable=False)
    file_type        = Column(String(20), nullable=False)   # video, image, gif
    verdict          = Column(String(20), nullable=False)   # REAL, FAKE, SUSPICIOUS
    risk_score       = Column(Integer, nullable=False)      # 0-100
    risk_level       = Column(String(20), nullable=False)   # AUTHENTIC, LIKELY_FAKE etc
    confidence       = Column(Float, nullable=False)        # percentage
    fake_frames      = Column(Integer, default=0)
    real_frames      = Column(Integer, default=0)
    total_frames     = Column(Integer, default=0)
    explanation      = Column(Text, nullable=True)
    heatmap_path     = Column(String(255), nullable=True)
    metadata_json    = Column(Text, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    # Relationship: each scan belongs to one user
    user = relationship("User", back_populates="scans")