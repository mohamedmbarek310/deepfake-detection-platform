"""
test_preprocessor.py
--------------------
Run this script to verify that preprocessor.py is working correctly.

How to run:
  1. Make sure your venv is activated: venv\Scripts\activate
  2. Run: python test_preprocessor.py
"""

import sys
import os

# Add the backend folder to Python's path so we can import from it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from preprocessor import extract_faces_from_video

# ─────────────────────────────────────────────────────────────────────────────
# CHANGE THIS to the path of any .mp4 video on your computer
# It can be any short video with a person's face in it
# ─────────────────────────────────────────────────────────────────────────────
VIDEO_PATH = r"C:\Users\moham\test_video.mp4"   # <-- CHANGE THIS

# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("  PREPROCESSOR TEST")
print("=" * 60)

# Check if the video file exists
if not os.path.exists(VIDEO_PATH):
    print(f"\n❌ ERROR: Video file not found at: {VIDEO_PATH}")
    print("   Please update VIDEO_PATH in this test script to point to a real video file.")
    sys.exit(1)

print(f"\nTesting with video: {VIDEO_PATH}\n")

# Run the extraction
faces, frame_indices = extract_faces_from_video(VIDEO_PATH, frame_skip=10)

# Show the results
print("\n" + "=" * 60)
print("  RESULTS")
print("=" * 60)
print(f"  Total faces extracted : {len(faces)}")
print(f"  From frame numbers    : {frame_indices}")

if len(faces) > 0:
    first_face = faces[0]
    print(f"  First face size       : {first_face.size}  (should be 224x224)")
    print(f"  First face mode       : {first_face.mode}  (should be RGB)")
    print("\n✅ SUCCESS! Preprocessor is working correctly.")
    print("   You can now move to Phase 3.")
else:
    print("\n⚠️  No faces were extracted.")
    print("   Possible reasons:")
    print("   1. The video has no human faces in it")
    print("   2. The faces are too small or blurry")
    print("   3. Try a different video with a clear, well-lit face")
