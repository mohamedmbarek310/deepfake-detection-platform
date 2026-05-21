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
import secrets
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
from forensics import extract_metadata
from report import generate_pdf_report
from fastapi.responses import FileResponse
import json
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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
    ALLOWED_EXTENSIONS = {
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',   # images
        'mp4', 'avi', 'mov', 'mkv', 'webm',           # videos
    }

    if not file.filename or '.' not in file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file. Please upload a file with a proper extension."
        )

    extension = file.filename.split('.')[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '.{extension}' is not supported. Please upload an image (jpg, png, gif, webp) or video (mp4, mov, avi)."
        )

    # ── Step 2: Save file to temp folder ──────────────────────────────────────
    MAX_FILE_SIZE = 100 * 1024 * 1024   # 100 MB

    file_id   = str(uuid.uuid4())
    temp_path = f"temp/{file_id}.{extension}"

    # Read file content with size check
    file_content = await file.read()
    file_size    = len(file_content)

    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum size is 100 MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    # Save to disk
    with open(temp_path, "wb") as buffer:
        buffer.write(file_content)

    print(f"[API] File saved: {temp_path} ({file_size / 1024:.1f} KB)")
    try:
        # ── Step 3: Extract faces ─────────────────────────────────────────────
        print("[API] Extracting faces...")

        try:
            faces, frame_indices = extract_faces_from_video(temp_path)
        except Exception as e:
            print(f"[ERROR] Failed to process file: {e}")
            raise HTTPException(
                status_code=400,
                detail="Could not read this file. It may be corrupted or in an unsupported format."
            )

        if not faces:
            raise HTTPException(
                status_code=400,
                detail="No face detected in the uploaded file. Please upload a photo or video that contains at least one clearly visible face."
            )

        # ── Step 4: Run detection ─────────────────────────────────────────────
        print("[API] Running detection...")

        try:
            result = analyze_faces(faces, frame_indices)
        except Exception as e:
            print(f"[ERROR] Detection failed: {e}")
            raise HTTPException(
                status_code=500,
                detail="Detection failed. The file may be corrupted. Please try a different file."
            )
        # ── Step 4b: Extract forensics metadata ───────────────────────────────
        print("[API] Extracting forensics metadata...")
        metadata = extract_metadata(temp_path)

        # Use the original filename instead of the temp UUID name
        if 'file_info' in metadata:
            metadata['file_info']['filename'] = file.filename
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
            metadata_json = json.dumps(metadata),
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
            "created_at":       scan.created_at.isoformat(),
            "metadata":         metadata,
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
            "scan_id":      s.id,
            "filename":     s.filename,
            "verdict":      s.verdict,
            "risk_score":   s.risk_score,
            "risk_level":   s.risk_level,
            "confidence":   s.confidence,
            "fake_frames":  s.fake_frames,
            "real_frames":  s.real_frames,
            "total_frames": s.total_frames,
            "created_at":   s.created_at.isoformat()
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
# Endpoint: Download PDF Report
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/v1/report/{scan_id}/pdf", tags=["History"])
def download_pdf_report(
    scan_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    """Generates and downloads a PDF report for the scan."""

    # Fetch scan from DB
    scan = db.query(Scan).filter(
        Scan.id      == scan_id,
        Scan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Parse metadata
    metadata = {}
    if scan.metadata_json:
        try:
            metadata = json.loads(scan.metadata_json)
        except Exception:
            metadata = {}

    # Build scan_data dict
    scan_data = {
        'scan_id':      scan.id,
        'filename':     scan.filename,
        'file_type':    scan.file_type,
        'verdict':      scan.verdict,
        'risk_score':   scan.risk_score,
        'risk_level':   scan.risk_level,
        'confidence':   scan.confidence,
        'fake_frames':  scan.fake_frames,
        'real_frames':  scan.real_frames,
        'total_frames': scan.total_frames,
        'explanation':  scan.explanation,
        'metadata':     metadata,
        'created_at':   scan.created_at.isoformat(),
    }

    # Create reports folder if it doesn't exist
    reports_dir = os.path.join(os.path.dirname(__file__), '..', 'reports')
    os.makedirs(reports_dir, exist_ok=True)

    # Generate PDF
    safe_filename = scan.filename.replace(' ', '_').replace('/', '_')
    pdf_filename = f"DeepGuard_Report_{scan_id}_{safe_filename}.pdf"
    pdf_path = os.path.join(reports_dir, pdf_filename)

    generate_pdf_report(scan_data, pdf_path)

    # Return as downloadable file
    return FileResponse(
        path=pdf_path,
        media_type='application/pdf',
        filename=pdf_filename,
    )


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

    # Parse metadata JSON if it exists
    metadata = {}
    if scan.metadata_json:
        try:
            metadata = json.loads(scan.metadata_json)
        except Exception:
            metadata = {}

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
        "metadata":    metadata,
        "created_at":  scan.created_at.isoformat()
    }
# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Generate share link for a scan
# POST /api/v1/scans/{scan_id}/share
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/v1/scans/{scan_id}/share", tags=["Share"])
def create_share_link(
    scan_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    """Generates a unique shareable token for a scan."""

    # Find the scan (only if owned by current user)
    scan = db.query(Scan).filter(
        Scan.id      == scan_id,
        Scan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Generate unique token if doesn't exist
    if not scan.share_token:
        scan.share_token = secrets.token_urlsafe(16)
        db.commit()
        db.refresh(scan)

    return {
        "share_token": scan.share_token,
        "share_url":   f"http://localhost:5173/share/{scan.share_token}"
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE: Public scan view via share token
# GET /api/v1/share/{token}
# NO AUTHENTICATION REQUIRED — public endpoint
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/v1/share/{token}", tags=["Share"])
def view_shared_scan(token: str, db: Session = Depends(get_db)):
    """Returns scan data using share token (public access)."""

    scan = db.query(Scan).filter(Scan.share_token == token).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Share link not found or expired")

    # Parse metadata
    metadata = {}
    if scan.metadata_json:
        try:
            metadata = json.loads(scan.metadata_json)
        except Exception:
            metadata = {}

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
        "metadata":    metadata,
        "created_at":  scan.created_at.isoformat(),
    }