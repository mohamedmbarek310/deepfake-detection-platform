"""
detector.py
-----------
Phase 3: Deepfake Detection Pipeline

What this file does:
  1. Takes a list of face images (from preprocessor.py)
  2. Runs the dima806 ViT model on each face
  3. Calculates a risk score (0-100)
  4. Identifies the most suspicious frames
  5. Generates a human-readable explanation
  6. Returns a complete detection result

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

from transformers import pipeline
from PIL import Image
import numpy as np

# ─────────────────────────────────────────────────────────────────────────────
# SETUP: Load the deepfake detection model once
# Loading takes ~2 seconds, so we do it once at startup
# ─────────────────────────────────────────────────────────────────────────────

print("[Detector] Loading deepfake detection model...")
detector_model = pipeline(
    "image-classification",
    model="dima806/deepfake_vs_real_image_detection"
)
print("[Detector] Model loaded successfully!")


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Calculate risk score from frame results
# ─────────────────────────────────────────────────────────────────────────────

def calculate_risk_score(frame_results: list) -> int:
    """
    Converts frame-level predictions into a single risk score (0-100).

    Logic:
      - Each frame has a fake probability (0.0 to 1.0)
      - We average all fake probabilities
      - Multiply by 100 to get a 0-100 score

    Parameters:
        frame_results (list): List of dicts with 'fake_prob' for each frame

    Returns:
        int: Risk score between 0 and 100
    """
    if not frame_results:
        return 0

    # Extract fake probability from each frame
    fake_probs = [r['fake_prob'] for r in frame_results]

    # Calculate weighted score
    # Frames with higher fake probability have more influence
    avg_fake_prob = np.mean(fake_probs)
    max_fake_prob = np.max(fake_probs)

    # Combine average and max for a more sensitive score
    # 70% weight on average, 30% weight on worst frame
    risk = (avg_fake_prob * 0.7 + max_fake_prob * 0.3) * 100

    return int(round(risk))


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Get risk level label from score
# ─────────────────────────────────────────────────────────────────────────────

def get_risk_level(risk_score: int) -> dict:
    """
    Converts a numeric risk score into a human-readable risk level.

    Risk levels:
      0  - 20  → AUTHENTIC   (Green)
      21 - 50  → SUSPICIOUS  (Yellow)
      51 - 80  → LIKELY FAKE (Orange)
      81 - 100 → HIGHLY FAKE (Red)

    Parameters:
        risk_score (int): Score between 0 and 100

    Returns:
        dict: Contains 'level', 'label', 'color'
    """
    if risk_score <= 20:
        return {
            'level': 'AUTHENTIC',
            'label': 'Authentic',
            'color': 'green',
            'verdict': 'REAL'
        }
    elif risk_score <= 50:
        return {
            'level': 'SUSPICIOUS',
            'label': 'Suspicious',
            'color': 'yellow',
            'verdict': 'SUSPICIOUS'
        }
    elif risk_score <= 80:
        return {
            'level': 'LIKELY_FAKE',
            'label': 'Likely Fake',
            'color': 'orange',
            'verdict': 'FAKE'
        }
    else:
        return {
            'level': 'HIGHLY_FAKE',
            'label': 'Highly Fake',
            'color': 'red',
            'verdict': 'FAKE'
        }


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Generate human-readable explanation text
# ─────────────────────────────────────────────────────────────────────────────

def generate_explanation(
    risk_score: int,
    risk_info: dict,
    fake_count: int,
    real_count: int,
    total_count: int,
    confidence: float
) -> str:
    """
    Generates a human-readable explanation of the detection result.

    Example output:
      "This video was flagged as HIGHLY FAKE with 94.3% confidence.
       Our AI detected facial manipulation artifacts in 48 out of 52
       analyzed frames. The risk score is 87/100."

    Parameters:
        risk_score  (int):   Risk score 0-100
        risk_info   (dict):  Risk level info from get_risk_level()
        fake_count  (int):   Number of frames detected as fake
        real_count  (int):   Number of frames detected as real
        total_count (int):   Total frames analyzed
        confidence  (float): Average confidence percentage

    Returns:
        str: Human-readable explanation
    """
    verdict = risk_info['verdict']
    level   = risk_info['label']

    if verdict == 'REAL':
        explanation = (
            f"This media appears to be AUTHENTIC with {confidence:.1f}% confidence. "
            f"Our AI analyzed {total_count} frames and found genuine facial features "
            f"in {real_count} out of {total_count} frames. "
            f"The authenticity score is {100 - risk_score}/100."
        )
    elif risk_info['level'] == 'SUSPICIOUS':
        explanation = (
            f"This media is flagged as SUSPICIOUS with {confidence:.1f}% confidence. "
            f"Our AI detected potential anomalies in {fake_count} out of {total_count} "
            f"analyzed frames. Further investigation is recommended. "
            f"The risk score is {risk_score}/100."
        )
    else:
        explanation = (
            f"This media was flagged as {level.upper()} with {confidence:.1f}% confidence. "
            f"Our AI detected facial manipulation artifacts in {fake_count} out of "
            f"{total_count} analyzed frames. "
            f"The risk score is {risk_score}/100."
        )

    return explanation


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: analyze_faces
# ─────────────────────────────────────────────────────────────────────────────

def analyze_faces(faces: list, frame_indices: list) -> dict:
    """
    Runs deepfake detection on a list of face images.

    Parameters:
        faces         (list): List of PIL.Image face crops (224x224)
        frame_indices (list): Frame numbers corresponding to each face

    Returns:
        dict: Complete detection result containing:
              - verdict        : "REAL", "FAKE", or "SUSPICIOUS"
              - risk_score     : 0-100
              - risk_level     : "AUTHENTIC", "SUSPICIOUS", etc.
              - confidence     : Average confidence percentage
              - fake_frames    : Count of fake-detected frames
              - real_frames    : Count of real-detected frames
              - total_frames   : Total frames analyzed
              - frame_results  : Per-frame detailed results
              - suspicious_frames: Top 5 most suspicious frame indices
              - explanation    : Human-readable explanation text
    """

    if not faces:
        return {
            'verdict': 'ERROR',
            'risk_score': 0,
            'risk_level': 'UNKNOWN',
            'confidence': 0.0,
            'fake_frames': 0,
            'real_frames': 0,
            'total_frames': 0,
            'frame_results': [],
            'suspicious_frames': [],
            'explanation': 'No faces were detected in this media.'
        }

    print(f"\n[Detector] Analyzing {len(faces)} face frames...")

    # ── Step 1: Run model on each face ────────────────────────────────────────
    frame_results = []

    for i, face_image in enumerate(faces):
        # Run the model on this face
        predictions = detector_model(face_image)

        # Extract real and fake probabilities from predictions
        fake_prob = 0.0
        real_prob = 0.0

        for pred in predictions:
            label = pred['label'].lower()
            score = pred['score']
            if 'fake' in label:
                fake_prob = score
            elif 'real' in label:
                real_prob = score

        # Store result for this frame
        frame_result = {
            'frame_index': frame_indices[i],
            'fake_prob': fake_prob,
            'real_prob': real_prob,
            'prediction': 'FAKE' if fake_prob > real_prob else 'REAL'
        }
        frame_results.append(frame_result)

        print(
            f"  Frame {frame_indices[i]:4d}: "
            f"Fake={fake_prob*100:6.2f}%  "
            f"Real={real_prob*100:6.2f}%  "
            f"→ {frame_result['prediction']}"
        )

    # ── Step 2: Calculate overall statistics ──────────────────────────────────
    fake_count  = sum(1 for r in frame_results if r['prediction'] == 'FAKE')
    real_count  = sum(1 for r in frame_results if r['prediction'] == 'REAL')
    total_count = len(frame_results)

    # ── Step 3: Calculate risk score ──────────────────────────────────────────
    risk_score = calculate_risk_score(frame_results)
    risk_score = int(risk_score)
    risk_info  = get_risk_level(risk_score)

    # ── Step 4: Calculate average confidence ──────────────────────────────────
    if risk_info['verdict'] == 'REAL':
        avg_confidence = np.mean([r['real_prob'] for r in frame_results]) * 100
    else:
        avg_confidence = np.mean([r['fake_prob'] for r in frame_results]) * 100

    # ── Step 5: Find most suspicious frames (top 5 highest fake probability) ──
    sorted_frames = sorted(
        frame_results,
        key=lambda x: x['fake_prob'],
        reverse=True
    )
    suspicious_frames = [r['frame_index'] for r in sorted_frames[:5]]

    # ── Step 6: Generate explanation text ─────────────────────────────────────
    explanation = generate_explanation(
        risk_score, risk_info,
        fake_count, real_count,
        total_count, avg_confidence
    )

    # ── Step 7: Build and return final result ─────────────────────────────────
    result = {
        'verdict':           risk_info['verdict'],
        'risk_score':        risk_score,
        'risk_level':        risk_info['level'],
        'risk_color':        risk_info['color'],
        'confidence':        float(round(avg_confidence, 2)),
        'fake_frames':       fake_count,
        'real_frames':       real_count,
        'total_frames':      total_count,
        'frame_results':     frame_results,
        'suspicious_frames': suspicious_frames,
        'explanation':       explanation
    }

    print(f"\n[Detector] ── RESULT ──────────────────────────────")
    print(f"[Detector] Verdict    : {result['verdict']}")
    print(f"[Detector] Risk Score : {result['risk_score']}/100")
    print(f"[Detector] Risk Level : {result['risk_level']}")
    print(f"[Detector] Confidence : {result['confidence']}%")
    print(f"[Detector] Fake Frames: {result['fake_frames']}/{result['total_frames']}")
    print(f"[Detector] Explanation: {result['explanation']}")
    print(f"[Detector] ────────────────────────────────────────")

    return result