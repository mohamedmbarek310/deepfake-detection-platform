"""
test_detector.py
----------------
Run this script to verify that detector.py is working correctly.

How to run:
  1. Make sure your venv is activated: venv\Scripts\activate
  2. Run: python test_detector.py
"""

import sys
import os

# Add backend folder to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from preprocessor import extract_faces_from_video
from detector import analyze_faces

# ─────────────────────────────────────────────────────────────────────────────
VIDEO_PATH = r"C:\Users\moham\test_video.mp4"
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 60)
print("  DETECTOR TEST")
print("=" * 60)

# Check video exists
if not os.path.exists(VIDEO_PATH):
    print(f"\n❌ ERROR: Video not found at: {VIDEO_PATH}")
    sys.exit(1)

# Step 1: Extract faces
print("\nStep 1: Extracting faces from video...")
faces, frame_indices = extract_faces_from_video(VIDEO_PATH, frame_skip=10)
print(f"Extracted {len(faces)} faces")

# Step 2: Run detection
print("\nStep 2: Running deepfake detection...")
result = analyze_faces(faces, frame_indices)

# Step 3: Show final result
print("\n" + "=" * 60)
print("  FINAL RESULT")
print("=" * 60)
print(f"  Verdict          : {result['verdict']}")
print(f"  Risk Score       : {result['risk_score']}/100")
print(f"  Risk Level       : {result['risk_level']}")
print(f"  Confidence       : {result['confidence']}%")
print(f"  Fake Frames      : {result['fake_frames']}/{result['total_frames']}")
print(f"  Real Frames      : {result['real_frames']}/{result['total_frames']}")
print(f"  Suspicious Frames: {result['suspicious_frames']}")
print(f"\n  Explanation:")
print(f"  {result['explanation']}")
print("=" * 60)

if result['verdict'] != 'ERROR':
    print("\n✅ SUCCESS! Detector is working correctly.")
    print("   You can now move to Phase 4.")
else:
    print("\n❌ ERROR: Something went wrong.")