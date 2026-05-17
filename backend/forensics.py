"""
forensics.py
------------
Phase 6: EXIF Metadata Forensics Module

What this file does:
  1. Extracts EXIF metadata from images
  2. Analyzes metadata for suspicious indicators
  3. Detects software used (Photoshop, AI generators, etc.)
  4. Returns user-friendly forensics report

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

import os
from PIL import Image
from PIL.ExifTags import TAGS
import exifread
from datetime import datetime


# ─────────────────────────────────────────────────────────────────────────────
# List of known photo editing & AI software (to flag as suspicious)
# ─────────────────────────────────────────────────────────────────────────────
SUSPICIOUS_SOFTWARE = [
    'photoshop', 'lightroom', 'gimp', 'pixelmator',
    'midjourney', 'dall-e', 'stable diffusion', 'dalle',
    'firefly', 'stable-diffusion', 'sdxl',
    'faceapp', 'reface', 'deepswap', 'remini',
    'topaz', 'canva',
]

# Common AI generator signatures often found in metadata
AI_GENERATORS = [
    'midjourney', 'dall-e', 'dalle', 'stable diffusion',
    'firefly', 'stable-diffusion', 'sdxl',
]


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: extract_metadata
# ─────────────────────────────────────────────────────────────────────────────

def extract_metadata(file_path: str) -> dict:
    """
    Extracts all available metadata from an image or video file.

    Parameters:
        file_path (str): Path to the file

    Returns:
        dict: Comprehensive metadata report
    """

    # ── Step 1: Get basic file info ──────────────────────────────────────────
    file_info = get_file_info(file_path)

    # Check if it's an image (only images have EXIF data)
    file_ext = file_path.lower().split('.')[-1]
    image_extensions = ['jpg', 'jpeg', 'png', 'tiff', 'tif']

    if file_ext not in image_extensions:
        # For videos return only basic file info
        return {
            'file_info':        file_info,
            'exif_data':        {},
            'suspicious_flags': [],
            'warnings':         ['EXIF analysis is only available for images'],
            'is_ai_generated':  False,
            'is_edited':        False,
        }

    # ── Step 2: Extract EXIF data ────────────────────────────────────────────
    exif_data = read_exif(file_path)

    # ── Step 3: Analyze for suspicious indicators ────────────────────────────
    analysis = analyze_metadata(exif_data, file_info)

    return {
        'file_info':         file_info,
        'exif_data':         exif_data,
        'suspicious_flags':  analysis['flags'],
        'warnings':          analysis['warnings'],
        'is_ai_generated':   analysis['is_ai_generated'],
        'is_edited':         analysis['is_edited'],
    }


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Get basic file information
# ─────────────────────────────────────────────────────────────────────────────

def get_file_info(file_path: str) -> dict:
    """Returns basic file information."""
    info = {}

    try:
        stat = os.stat(file_path)
        info['filename']      = os.path.basename(file_path)
        info['size_bytes']    = stat.st_size
        info['size_readable'] = format_size(stat.st_size)
        info['created_at']    = datetime.fromtimestamp(stat.st_ctime).isoformat()
        info['modified_at']   = datetime.fromtimestamp(stat.st_mtime).isoformat()

        # Try to get image dimensions
        try:
            img = Image.open(file_path)
            info['dimensions'] = f"{img.width} x {img.height}"
            info['width']      = img.width
            info['height']     = img.height
            info['format']     = img.format
            info['mode']       = img.mode
        except Exception:
            pass

    except Exception as e:
        info['error'] = f"Could not read file info: {str(e)}"

    return info


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Read EXIF data from image
# ─────────────────────────────────────────────────────────────────────────────

def read_exif(file_path: str) -> dict:
    """Extracts EXIF data from image using PIL — clean readable output only."""
    exif_dict = {}

    # List of EXIF tags we want to show (the useful ones)
    USEFUL_TAGS = {
        'Make', 'Model', 'Software', 'DateTime', 'DateTimeOriginal',
        'DateTimeDigitized', 'ExifVersion', 'ImageWidth', 'ImageLength',
        'ImageDescription', 'Artist', 'Copyright', 'Orientation',
        'XResolution', 'YResolution', 'ResolutionUnit', 'FNumber',
        'ExposureTime', 'ISOSpeedRatings', 'FocalLength', 'Flash',
        'WhiteBalance', 'ExposureMode', 'MeteringMode', 'LensModel',
        'LensMake', 'BodySerialNumber', 'GPSInfo', 'ColorSpace',
        'PixelXDimension', 'PixelYDimension', 'SceneType',
        'CustomRendered', 'ExposureProgram', 'ApertureValue',
        'ShutterSpeedValue', 'BrightnessValue',
    }

    try:
        img  = Image.open(file_path)
        exif = img._getexif()

        if exif:
            for tag_id, value in exif.items():
                tag = TAGS.get(tag_id, str(tag_id))

                # Only keep useful, readable tags
                if tag not in USEFUL_TAGS:
                    continue

                # Convert bytes safely
                if isinstance(value, bytes):
                    try:
                        # Try to decode as UTF-8
                        decoded = value.decode('utf-8', errors='ignore').strip('\x00').strip()
                        # If empty or contains too many non-printable chars, skip it
                        if not decoded or len(decoded) < 1:
                            continue
                        value = decoded
                    except Exception:
                        continue

                # Handle GPSInfo specially (it's a dict)
                if tag == 'GPSInfo':
                    value = f"{len(value)} location fields detected" if value else "None"

                # Skip if value is empty or too long
                value_str = str(value).strip()
                if not value_str or len(value_str) > 100:
                    continue

                # Skip values that are mostly non-printable characters
                printable_chars = sum(1 for c in value_str if c.isprintable())
                if printable_chars < len(value_str) * 0.7:
                    continue

                exif_dict[tag] = value_str

    except Exception as e:
        exif_dict['error'] = f"Could not read EXIF: {str(e)}"

    return exif_dict


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Analyze metadata for suspicious indicators
# ─────────────────────────────────────────────────────────────────────────────

def analyze_metadata(exif_data: dict, file_info: dict) -> dict:
    """
    Analyzes metadata and returns suspicious findings.

    Returns dict with:
      - flags:           List of suspicious findings
      - warnings:        List of warning messages
      - is_ai_generated: Boolean
      - is_edited:       Boolean
    """
    flags    = []
    warnings = []
    is_ai_generated = False
    is_edited       = False

    # Get key EXIF fields (case-insensitive check)
    exif_lower = {k.lower(): str(v).lower() for k, v in exif_data.items()}

    # ── Check 1: Software used ───────────────────────────────────────────────
    software_value = exif_lower.get('software', '')

    if software_value:
        for editor in SUSPICIOUS_SOFTWARE:
            if editor in software_value:
                if editor in AI_GENERATORS:
                    is_ai_generated = True
                    flags.append({
                        'type':     'AI_GENERATED',
                        'severity': 'high',
                        'message':  f'Image generated by AI tool: {software_value}',
                    })
                else:
                    is_edited = True
                    flags.append({
                        'type':     'EDITED',
                        'severity': 'medium',
                        'message':  f'Image edited with: {software_value}',
                    })
                break

    # ── Check 2: Missing camera information ──────────────────────────────────
    has_camera = any(k.lower() in ['make', 'model'] for k in exif_data.keys())
    if not has_camera and exif_data and 'error' not in exif_data:
        warnings.append('No camera information found in metadata')

    # ── Check 3: No EXIF data at all ─────────────────────────────────────────
    if not exif_data or len(exif_data) == 0 or 'error' in exif_data:
        warnings.append('Image has no EXIF metadata (may have been stripped or AI-generated)')
        if not is_ai_generated:
            flags.append({
                'type':     'NO_METADATA',
                'severity': 'medium',
                'message':  'No EXIF data present — possibly AI-generated or sanitized',
            })

    # ── Check 4: Modification date after creation ────────────────────────────
    if 'created_at' in file_info and 'modified_at' in file_info:
        try:
            created  = datetime.fromisoformat(file_info['created_at'])
            modified = datetime.fromisoformat(file_info['modified_at'])
            time_diff = (modified - created).total_seconds()
            if time_diff > 60:  # more than 1 minute difference
                is_edited = True
                flags.append({
                    'type':     'TIMESTAMP_MISMATCH',
                    'severity': 'low',
                    'message':  'File was modified after creation',
                })
        except Exception:
            pass

    # ── Check 5: GPS data present ────────────────────────────────────────────
    gps_keys = [k for k in exif_data.keys() if 'gps' in k.lower()]
    if gps_keys:
        warnings.append(f'GPS location data found ({len(gps_keys)} fields)')

    return {
        'flags':           flags,
        'warnings':        warnings,
        'is_ai_generated': is_ai_generated,
        'is_edited':       is_edited,
    }


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Format file size to readable string
# ─────────────────────────────────────────────────────────────────────────────

def format_size(bytes_size: int) -> str:
    """Convert bytes to human-readable size."""
    if bytes_size < 1024:
        return f"{bytes_size} B"
    if bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.1f} KB"
    if bytes_size < 1024 * 1024 * 1024:
        return f"{bytes_size / (1024 * 1024):.1f} MB"
    return f"{bytes_size / (1024 * 1024 * 1024):.1f} GB"