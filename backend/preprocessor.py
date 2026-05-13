"""
preprocessor.py
---------------
Phase 2: Video Preprocessing Pipeline

What this file does:
  1. Opens a video file using OpenCV
  2. Reads one frame every 10 frames (frame sampling)
  3. Sends each frame to MTCNN to detect faces
  4. Crops and resizes each detected face to 224x224 pixels
  5. Returns a list of face images ready for the AI model

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

import cv2                          # OpenCV: reads video files and frames
from PIL import Image               # PIL: image manipulation (crop, resize)
from facenet_pytorch import MTCNN   # MTCNN: face detection model
import torch                        # PyTorch: needed to configure MTCNN device
import numpy as np                  # NumPy: array operations on image data


# ─────────────────────────────────────────────────────────────────────────────
# SETUP: Initialize the face detector once (not inside the function)
# This is more efficient — we don't recreate MTCNN on every video call
# ─────────────────────────────────────────────────────────────────────────────

# Check if a GPU is available. If yes, use it (faster). If not, use CPU.
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"[Preprocessor] Using device: {device}")

# Create the MTCNN face detector
# keep_all=False → only keep the ONE most confident face per frame
# image_size=224 → automatically resize the detected face to 224x224
# margin=20 → add 20px padding around the face (helps the model see context)
mtcnn = MTCNN(
    keep_all=False,
    image_size=224,
    margin=20,
    device=device
)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: extract_faces_from_video
# ─────────────────────────────────────────────────────────────────────────────

def extract_faces_from_video(video_path: str, frame_skip: int = 10):
    """
    Extracts face images from a video file.

    Parameters:
        video_path  (str): Full path to the video file (e.g. "C:/temp/video.mp4")
        frame_skip  (int): Analyze every Nth frame. Default = 10.
                           (So for a 30fps video, we analyze ~3 frames/second)

    Returns:
        faces (list of PIL.Image): List of 224x224 face images
        frame_indices (list of int): Which frame numbers the faces came from
    """

    faces = []          # Will store the cropped face images
    frame_indices = []  # Will store which frame number each face came from

    # ── Step 1: Open the video file ───────────────────────────────────────────
    cap = cv2.VideoCapture(video_path)

    # Check if the video opened successfully
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return faces, frame_indices   # Return empty lists

    # Get basic video info for logging
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    print(f"[Preprocessor] Video loaded: {total_frames} total frames at {fps:.1f} FPS")
    print(f"[Preprocessor] Analyzing every {frame_skip}th frame...")

    # ── Step 2: Loop through every frame in the video ─────────────────────────
    frame_number = 0   # Counter to track which frame we are on

    while True:
        # Read the next frame from the video
        success, frame = cap.read()

        # If there are no more frames, stop the loop
        if not success:
            break

        # ── Step 3: Only process every Nth frame (frame sampling) ─────────────
        if frame_number % frame_skip == 0:

            # OpenCV reads frames in BGR color format, but PIL/MTCNN need RGB
            # So we convert: BGR → RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Convert the NumPy array (OpenCV format) to a PIL Image
            pil_image = Image.fromarray(frame_rgb)

            # ── Step 4: Detect face in this frame using MTCNN ─────────────────
            try:
                # mtcnn() returns the cropped face as a tensor, or None if no face found
                face_tensor = mtcnn(pil_image)

                if face_tensor is not None:
                    # Convert the tensor back to a PIL Image for storage
                    # The tensor values are in range [-1, 1], we convert to [0, 255]
                    face_np = face_tensor.permute(1, 2, 0).numpy()   # (C,H,W) → (H,W,C)
                    face_np = ((face_np + 1) / 2 * 255).clip(0, 255).astype(np.uint8)
                    face_pil = Image.fromarray(face_np)

                    faces.append(face_pil)
                    frame_indices.append(frame_number)
                    print(f"  ✅ Frame {frame_number}: Face detected and saved")
                else:
                    print(f"  ⚠️  Frame {frame_number}: No face found, skipping")

            except Exception as e:
                # If something goes wrong on one frame, skip it and continue
                print(f"  ❌ Frame {frame_number}: Error during face detection: {e}")

        frame_number += 1   # Move to the next frame

    # ── Step 5: Release the video file from memory ────────────────────────────
    cap.release()

    # ── Step 6: Report results ────────────────────────────────────────────────
    print(f"\n[Preprocessor] Done! Extracted {len(faces)} face(s) from {frame_number} total frames.")

    return faces, frame_indices
