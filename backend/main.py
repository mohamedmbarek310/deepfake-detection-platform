"""
main.py
-------
Main FastAPI application entry point.

What this file does:
  1. Creates the FastAPI app
  2. Connects all routes
  3. Creates database tables on startup
  4. Handles file uploads
  5. Runs the detection pipeline
  6. Returns results to frontend

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import shutil
import uuid
import os
import sys
import json
from datetime import datetime

# Add backend folder to path
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, get_db, Base
from models import User, Scan
from auth import router as auth_router, get_current_user
from preprocessor import extract_faces_from_video
from detector import analyze_faces

# ─────────────────────────────────────────────────────────────────────────────
# Create folders if they don't exist
# ─────────────────────────────────────────────────────────────────────────────
os.makedirs("temp",    exist_ok=True)
os.makedirs("results", exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Create all database tables
# ─────────────────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────────────────────────────────────
# Create FastAPI app
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Deepfake Detection Platform",
    description="AI-Powered Deepfake Detection & Digital Forensics Platform",
    version="1.0.0"
)

# ─────────────────────────────────────────────────────────────────────────────
# CORS Middleware
# Allows the React frontend to talk to this API
# ─────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Serve static files (heatmap images)
# ─────────────────────────────────────────────────────────────────────────────
app.mount("/results", StaticFiles(directory="results"), name="results")

# ─────────────────────────────────────────────────────────────────────────────
# Include auth routes
# ─────────────────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Health check
# GET /health
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    """Check if the API is running."""
    return {
        "status":    "running",
        "message":   "Deepfake Detection API is online",
        "timestamp": datetime.utcnow().isoformat()
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Analyze media
# POST /api/v1/analyze
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/v1/analyze", tags=["Detection"])
async def analyze(
    file:         UploadFile = File(...),
    db:           Session    = Depends(get_db),
    current_user: User       = Depends(get_current_user)
):
    """
    Main detection endpoint.

    Steps:
      1. Receive uploaded video/image
      2. Save to temp folder
      3. Extract faces (preprocessor)
      4. Run deepfake detection (detector)
      5. Save result to database
      6. Return full result
    """

    # ── Step 1: Validate file type ────────────────────────────────────────────
    allowed_types = ["video/mp4", "video/avi", "video/mov",
                     "image/jpeg", "image/png", "image/gif"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported: {file.content_type}"
        )

    # ── Step 2: Save file to temp folder ──────────────────────────────────────
    file_id   = str(uuid.uuid4())
    extension = file.filename.split(".")[-1]
    temp_path = f"temp/{file_id}.{extension}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"[API] File saved: {temp_path}")

    try:
        # ── Step 3: Extract faces ─────────────────────────────────────────────
        print("[API] Extracting faces...")
        faces, frame_indices = extract_faces_from_video(
            temp_path,
            frame_skip=10
        )

        if not faces:
            raise HTTPException(
                status_code=422,
                detail="No faces detected in the uploaded media."
            )

        # ── Step 4: Run detection ─────────────────────────────────────────────
        print("[API] Running detection...")
        result = analyze_faces(faces, frame_indices)

        # ── Step 5: Save to database ──────────────────────────────────────────
        scan = Scan(
            user_id      = current_user.id,
            filename     = file.filename,
            file_type    = extension,
            verdict      = result['verdict'],
            risk_score   = result['risk_score'],
            risk_level   = result['risk_level'],
            confidence   = result['confidence'],
            fake_frames  = result['fake_frames'],
            real_frames  = result['real_frames'],
            total_frames = result['total_frames'],
            explanation  = result['explanation'],
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        print(f"[API] Scan saved to database with ID: {scan.id}")

        # ── Step 6: Return result ─────────────────────────────────────────────
        return {
            "scan_id":          scan.id,
            "verdict":          result['verdict'],
            "risk_score":       result['risk_score'],
            "risk_level":       result['risk_level'],
            "risk_color":       result['risk_color'],
            "confidence":       result['confidence'],
            "fake_frames":      result['fake_frames'],
            "real_frames":      result['real_frames'],
            "total_frames":     result['total_frames'],
            "suspicious_frames": result['suspicious_frames'],
            "explanation":      result['explanation'],
            "filename":         file.filename,
            "created_at":       scan.created_at.isoformat()
        }

    finally:
        # Always clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"[API] Temp file cleaned up: {temp_path}")


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Get scan history
# GET /api/v1/history
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/v1/history", tags=["History"])
def get_history(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    """Returns all scans for the current user."""
    scans = db.query(Scan).filter(
        Scan.user_id == current_user.id
    ).order_by(Scan.created_at.desc()).all()

    return [
        {
            "scan_id":     s.id,
            "filename":    s.filename,
            "verdict":     s.verdict,
            "risk_score":  s.risk_score,
            "risk_level":  s.risk_level,
            "confidence":  s.confidence,
            "created_at":  s.created_at.isoformat()
        }
        for s in scans
    ]


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Get user statistics
# GET /api/v1/stats
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/v1/stats", tags=["Statistics"])
def get_stats(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    """Returns statistics for the current user's dashboard."""
    scans = db.query(Scan).filter(
        Scan.user_id == current_user.id
    ).all()

    total_scans = len(scans)
    fake_scans  = sum(1 for s in scans if s.verdict == "FAKE")
    real_scans  = sum(1 for s in scans if s.verdict == "REAL")
    avg_risk    = sum(s.risk_score for s in scans) / total_scans if total_scans > 0 else 0

    return {
        "total_scans": total_scans,
        "fake_scans":  fake_scans,
        "real_scans":  real_scans,
        "avg_risk":    round(avg_risk, 1),
        "username":    current_user.username
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Get single scan result
# GET /api/v1/report/{scan_id}
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/v1/report/{scan_id}", tags=["History"])
def get_report(
    scan_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    """Returns full details of a single scan."""
    scan = db.query(Scan).filter(
        Scan.id      == scan_id,
        Scan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "scan_id":     scan.id,
        "filename":    scan.filename,
        "verdict":     scan.verdict,
        "risk_score":  scan.risk_score,
        "risk_level":  scan.risk_level,
        "confidence":  scan.confidence,
        "fake_frames": scan.fake_frames,
        "real_frames": scan.real_frames,
        "total_frames": scan.total_frames,
        "explanation": scan.explanation,
        "created_at":  scan.created_at.isoformat()
    }