"""
normalizer.py
-------------
Phase 6: Image Normalization Module

What this file does:
  1. Auto white balance correction
  2. Auto exposure/brightness correction
  3. Gentle noise reduction
  4. Standardizes images before AI detection

Purpose: Help the model focus on REAL fake indicators
         (not on lighting/filter differences)

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import cv2


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: normalize_image
# ─────────────────────────────────────────────────────────────────────────────

def normalize_image(pil_image: Image.Image,
                    apply_white_balance: bool = True,
                    apply_exposure:      bool = True,
                    apply_denoise:       bool = True) -> Image.Image:
    """
    Applies a normalization pipeline to make images more "natural"
    before AI detection.

    Parameters:
        pil_image:            Input PIL Image
        apply_white_balance:  Auto-correct color cast
        apply_exposure:       Auto-correct brightness/contrast
        apply_denoise:        Reduce noise from filters

    Returns:
        Normalized PIL Image (RGB)
    """

    # Make sure we work in RGB mode
    if pil_image.mode != 'RGB':
        pil_image = pil_image.convert('RGB')

    # ── Step 1: Auto white balance ───────────────────────────────────────────
    if apply_white_balance:
        pil_image = auto_white_balance(pil_image)

    # ── Step 2: Auto exposure correction ─────────────────────────────────────
    if apply_exposure:
        pil_image = auto_exposure(pil_image)

    # ── Step 3: Light denoising ──────────────────────────────────────────────
    if apply_denoise:
        pil_image = reduce_noise(pil_image)

    return pil_image


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Auto white balance using "Gray World" algorithm
# ─────────────────────────────────────────────────────────────────────────────

def auto_white_balance(pil_image: Image.Image) -> Image.Image:
    """
    Applies the Gray World algorithm.
    Assumes the average color of a scene should be neutral gray.
    Removes color casts from filters/lighting.
    """
    try:
        img_array = np.array(pil_image).astype(np.float32)

        # Calculate average of each channel
        avg_r = np.mean(img_array[:, :, 0])
        avg_g = np.mean(img_array[:, :, 1])
        avg_b = np.mean(img_array[:, :, 2])

        # The target gray value
        avg_gray = (avg_r + avg_g + avg_b) / 3

        # Skip if image is already balanced (avoids over-correction)
        if avg_gray < 1:
            return pil_image

        # Calculate scaling factors
        scale_r = avg_gray / avg_r if avg_r > 0 else 1.0
        scale_g = avg_gray / avg_g if avg_g > 0 else 1.0
        scale_b = avg_gray / avg_b if avg_b > 0 else 1.0

        # Apply gentle scaling (limit to prevent over-correction)
        scale_r = min(max(scale_r, 0.85), 1.15)
        scale_g = min(max(scale_g, 0.85), 1.15)
        scale_b = min(max(scale_b, 0.85), 1.15)

        img_array[:, :, 0] *= scale_r
        img_array[:, :, 1] *= scale_g
        img_array[:, :, 2] *= scale_b

        # Clip values to valid range
        img_array = np.clip(img_array, 0, 255).astype(np.uint8)

        return Image.fromarray(img_array)

    except Exception as e:
        print(f"  ⚠️  White balance failed: {e}")
        return pil_image


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Auto exposure correction using histogram stretching
# ─────────────────────────────────────────────────────────────────────────────

def auto_exposure(pil_image: Image.Image) -> Image.Image:
    """
    Auto-corrects brightness and contrast using histogram stretching.
    Helps with under/over-exposed images.
    """
    try:
        img_array = np.array(pil_image)

        # Convert to LAB color space (L = lightness)
        img_lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        l_channel, a, b = cv2.split(img_lab)

        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # This is gentle - only enhances local contrast slightly
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_corrected = clahe.apply(l_channel)

        # Merge back together
        img_lab_corrected = cv2.merge([l_corrected, a, b])
        img_corrected = cv2.cvtColor(img_lab_corrected, cv2.COLOR_LAB2RGB)

        return Image.fromarray(img_corrected)

    except Exception as e:
        print(f"  ⚠️  Exposure correction failed: {e}")
        return pil_image


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Gentle noise reduction
# ─────────────────────────────────────────────────────────────────────────────

def reduce_noise(pil_image: Image.Image) -> Image.Image:
    """
    Applies gentle noise reduction.
    Removes artifacts from filters and compression.
    """
    try:
        img_array = np.array(pil_image)

        # Bilateral filter: reduces noise while preserving edges
        # Parameters are tuned to be very gentle
        denoised = cv2.bilateralFilter(
            img_array,
            d=5,           # Diameter of each pixel neighborhood
            sigmaColor=20, # Filter sigma in color space
            sigmaSpace=20  # Filter sigma in coordinate space
        )

        return Image.fromarray(denoised)

    except Exception as e:
        print(f"  ⚠️  Denoising failed: {e}")
        return pil_image


# ─────────────────────────────────────────────────────────────────────────────
# DEBUGGING: Test the normalizer standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    """Quick test if you run this file directly."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python normalizer.py <image_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = input_path.replace('.', '_normalized.')

    print(f"[Test] Loading: {input_path}")
    img = Image.open(input_path)
    print(f"[Test] Original size: {img.size}, mode: {img.mode}")

    print("[Test] Applying normalization...")
    normalized = normalize_image(img)

    normalized.save(output_path)
    print(f"[Test] Saved to: {output_path}")