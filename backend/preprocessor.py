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

import cv2                              # OpenCV: reads video files and frames
from PIL import Image                   # PIL: image manipulation (crop, resize)
from facenet_pytorch import MTCNN       # MTCNN: face detection model
import torch                            # PyTorch: needed to configure MTCNN device
import numpy as np                      # NumPy: array operations on image data
from normalizer import normalize_image  # Phase 6: Image normalization for better detection


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
    device=device
)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: extract_faces_from_video
# ─────────────────────────────────────────────────────────────────────────────

def extract_faces_from_video(video_path: str, frame_skip: int = 10):
    """
    Extracts face images from a video file OR processes an image directly.

    Smart logic:
      - If file is an image (1 frame), pass full image to model
      - If file is a video (many frames), crop faces from each frame

    Parameters:
        video_path  (str): Full path to the video or image file
        frame_skip  (int): Analyze every Nth frame for videos

    Returns:
        faces (list of PIL.Image): List of images ready for the AI model
        frame_indices (list of int): Frame numbers
    """

    faces = []
    frame_indices = []

    # ── Step 1: Check if it's an image (not a video) ─────────────────────────
    file_ext = video_path.lower().split('.')[-1]
    image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']

    if file_ext in image_extensions:
        # ── Handle as single image ───────────────────────────────────────────
        print(f"[Preprocessor] Processing as single image: {video_path}")
        try:
            img = Image.open(video_path).convert('RGB')

            # Step 1: Verify a face exists in the image
            print(f"  🔍 Checking for face...")
            boxes, _ = mtcnn.detect(img)

            if boxes is None or len(boxes) == 0:
                print(f"  ❌ No face detected in image")
                return faces, frame_indices  # Return empty → backend will reject

            print(f"  ✅ Face detected!")

            # Step 2: Normalize the image
            print(f"  🔧 Normalizing image...")
            img = normalize_image(img)

            # Step 3: Resize for the model (using full image, not just face)
            img_resized = img.resize((224, 224), Image.LANCZOS)
            faces.append(img_resized)
            frame_indices.append(0)
            print(f"  ✅ Image normalized and resized")
            print(f"[Preprocessor] Done! Returning 1 image.")
            return faces, frame_indices
        except Exception as e:
            print(f"[ERROR] Failed to load image: {e}")
            return faces, frame_indices

    # ── Step 2: Otherwise treat it as a video ────────────────────────────────
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        raise ValueError("Could not open video file. It may be corrupted or in an unsupported format.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Check for empty/invalid videos
    if total_frames <= 0:
        cap.release()
        raise ValueError("Video appears to be empty or corrupted.")

    print(f"[Preprocessor] Video loaded: {total_frames} total frames at {fps:.1f} FPS")
    print(f"[Preprocessor] Analyzing every {frame_skip}th frame...")

    frame_number = 0

    while True:
        success, frame = cap.read()
        if not success:
            break

        if frame_number % frame_skip == 0:
            # Convert BGR → RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)

            try:
                # Detect face bounding box
                boxes, _ = mtcnn.detect(pil_image)

                if boxes is not None and len(boxes) > 0:
                    # Get first detected face box
                    box = boxes[0]
                    x1, y1, x2, y2 = [int(coord) for coord in box]

                    # Add margin around face
                    margin = 20
                    x1 = max(0, x1 - margin)
                    y1 = max(0, y1 - margin)
                    x2 = min(pil_image.width,  x2 + margin)
                    y2 = min(pil_image.height, y2 + margin)

                    # Crop and resize
                    face_pil = pil_image.crop((x1, y1, x2, y2))
                    face_pil = face_pil.resize((224, 224), Image.LANCZOS)

                    # Apply normalization to the face crop
                    face_pil = normalize_image(face_pil)

                    faces.append(face_pil)
                    frame_indices.append(frame_number)
                    print(f"  ✅ Frame {frame_number}: Face detected, normalized and saved")
                else:
                    print(f"  ⚠️  Frame {frame_number}: No face found, skipping")

            except Exception as e:
                print(f"  ❌ Frame {frame_number}: Error: {e}")

        frame_number += 1

    cap.release()

    print(f"\n[Preprocessor] Done! Extracted {len(faces)} face(s) from {frame_number} total frames.")
    return faces, frame_indices