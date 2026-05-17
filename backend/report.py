"""
report.py
---------
Phase 6: PDF Report Generation Module

What this file does:
  - Generates professional PDF forensics reports
  - Contains all scan details, verdict, forensics
  - Uses ReportLab library

Author: Mohamed Mbarek - Deepfake Detection Platform PFE
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image as RLImage
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from datetime import datetime
import json
import os


# ─────────────────────────────────────────────────────────────────────────────
# Brand colors
# ─────────────────────────────────────────────────────────────────────────────
BRAND_BLUE   = colors.HexColor('#3B82F6')
BRAND_PURPLE = colors.HexColor('#A855F7')
DARK_BG      = colors.HexColor('#0F172A')
LIGHT_GRAY   = colors.HexColor('#F1F5F9')
RED_ALERT    = colors.HexColor('#EF4444')
GREEN_OK     = colors.HexColor('#22C55E')
YELLOW_WARN  = colors.HexColor('#EAB308')
ORANGE_WARN  = colors.HexColor('#F97316')


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: generate_pdf_report
# ─────────────────────────────────────────────────────────────────────────────

def generate_pdf_report(scan_data: dict, output_path: str) -> str:
    """
    Generates a professional PDF forensics report.

    Parameters:
        scan_data:   Dict with all scan info from database
        output_path: Where to save the PDF

    Returns:
        Path to the generated PDF file
    """

    # Create PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
        title=f"DeepGuard Report - {scan_data.get('filename', 'Unknown')}",
        author="DeepGuard AI"
    )

    # Build content
    story = []
    styles = build_styles()

    # ── Section 1: Header ────────────────────────────────────────────────────
    story.extend(build_header(scan_data, styles))

    # ── Section 2: Verdict Card ──────────────────────────────────────────────
    story.extend(build_verdict_section(scan_data, styles))

    # ── Section 3: Scan Information ──────────────────────────────────────────
    story.extend(build_scan_info(scan_data, styles))

    # ── Section 4: Frame Analysis ────────────────────────────────────────────
    story.extend(build_frame_analysis(scan_data, styles))

    # ── Section 5: AI Explanation ────────────────────────────────────────────
    story.extend(build_ai_explanation(scan_data, styles))

    # ── Section 6: Digital Forensics ─────────────────────────────────────────
    story.extend(build_forensics_section(scan_data, styles))

    # ── Section 7: Footer ────────────────────────────────────────────────────
    story.extend(build_footer(styles))

    # Build the PDF
    doc.build(story)
    print(f"[Report] PDF generated: {output_path}")
    return output_path


# ─────────────────────────────────────────────────────────────────────────────
# Build paragraph styles
# ─────────────────────────────────────────────────────────────────────────────

def build_styles():
    """Creates custom paragraph styles for the report."""
    base_styles = getSampleStyleSheet()
    styles = {}

    styles['title'] = ParagraphStyle(
        name='Title',
        parent=base_styles['Title'],
        fontSize=28,
        textColor=BRAND_BLUE,
        spaceAfter=22,
        spaceBefore=0,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
    )
    styles['subtitle'] = ParagraphStyle(
        name='Subtitle',
        parent=base_styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=20,
        fontName='Helvetica',
    )
    styles['heading'] = ParagraphStyle(
        name='Heading',
        parent=base_styles['Heading2'],
        fontSize=14,
        textColor=DARK_BG,
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold',
    )
    styles['body'] = ParagraphStyle(
        name='Body',
        parent=base_styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8,
        leading=14,
    )
    styles['small'] = ParagraphStyle(
        name='Small',
        parent=base_styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#64748B'),
    )
    styles['verdict_label'] = ParagraphStyle(
        name='VerdictLabel',
        parent=base_styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        alignment=TA_CENTER,
    )
    styles['verdict_value'] = ParagraphStyle(
        name='VerdictValue',
        parent=base_styles['Normal'],
        fontSize=28,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
    )

    return styles


# ─────────────────────────────────────────────────────────────────────────────
# Header Section
# ─────────────────────────────────────────────────────────────────────────────

def build_header(scan_data, styles):
    elements = []

    # Title
    elements.append(Paragraph("DeepGuard AI", styles['title']))
    elements.append(Paragraph(
        "Digital Forensics & Deepfake Detection Report",
        styles['subtitle']
    ))

    # Horizontal line
    line_table = Table([['']], colWidths=[170*mm], rowHeights=[2])
    line_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BRAND_BLUE),
    ]))
    elements.append(line_table)
    elements.append(Spacer(1, 15))

    return elements


# ─────────────────────────────────────────────────────────────────────────────
# Verdict Section
# ─────────────────────────────────────────────────────────────────────────────

def build_verdict_section(scan_data, styles):
    elements = []

    elements.append(Paragraph("DETECTION VERDICT", styles['heading']))

    # Color based on verdict
    risk_score = scan_data.get('risk_score', 0)
    if risk_score <= 20:
        verdict_color = GREEN_OK
        verdict_label = 'AUTHENTIC'
    elif risk_score <= 50:
        verdict_color = YELLOW_WARN
        verdict_label = 'SUSPICIOUS'
    elif risk_score <= 80:
        verdict_color = ORANGE_WARN
        verdict_label = 'LIKELY FAKE'
    else:
        verdict_color = RED_ALERT
        verdict_label = 'HIGHLY FAKE'

    # Big verdict box
    verdict_data = [
        ['VERDICT', 'RISK SCORE', 'CONFIDENCE'],
        [
            verdict_label,
            f"{risk_score} / 100",
            f"{scan_data.get('confidence', 0)}%"
        ]
    ]

    verdict_table = Table(verdict_data, colWidths=[60*mm, 50*mm, 50*mm])
    verdict_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0,0), (-1,0), LIGHT_GRAY),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.HexColor('#64748B')),
        ('FONTSIZE',   (0,0), (-1,0), 9),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN',      (0,0), (-1,0), 'CENTER'),
        ('VALIGN',     (0,0), (-1,0), 'MIDDLE'),
        ('PADDING',    (0,0), (-1,0), 8),
        # Value row
        ('BACKGROUND', (0,1), (-1,1), colors.white),
        ('TEXTCOLOR',  (0,1), (0,1), verdict_color),
        ('TEXTCOLOR',  (1,1), (-1,1), DARK_BG),
        ('FONTSIZE',   (0,1), (-1,1), 14),
        ('FONTNAME',   (0,1), (-1,1), 'Helvetica-Bold'),
        ('ALIGN',      (0,1), (-1,1), 'CENTER'),
        ('VALIGN',     (0,1), (-1,1), 'MIDDLE'),
        ('TOPPADDING',    (0,1), (-1,1), 18),
        ('BOTTOMPADDING', (0,1), (-1,1), 18),
        ('LEFTPADDING',   (0,1), (-1,1), 5),
        ('RIGHTPADDING',  (0,1), (-1,1), 5),
        # Border
        ('BOX',         (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('LINEBELOW',  (0,0), (-1,0), 1, colors.HexColor('#E2E8F0')),
    ]))

    elements.append(verdict_table)
    elements.append(Spacer(1, 15))
    return elements


# ─────────────────────────────────────────────────────────────────────────────
# Scan Information Section
# ─────────────────────────────────────────────────────────────────────────────

def build_scan_info(scan_data, styles):
    elements = []

    elements.append(Paragraph("SCAN INFORMATION", styles['heading']))

    data = [
        ['Scan ID',     str(scan_data.get('scan_id', 'N/A'))],
        ['Filename',    scan_data.get('filename', 'Unknown')],
        ['File Type',   scan_data.get('file_type', 'N/A').upper()],
        ['Date',        format_date(scan_data.get('created_at'))],
        ['Risk Level',  scan_data.get('risk_level', 'N/A')],
    ]

    table = Table(data, colWidths=[45*mm, 125*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND',  (0,0), (0,-1), LIGHT_GRAY),
        ('TEXTCOLOR',   (0,0), (0,-1), colors.HexColor('#475569')),
        ('FONTNAME',    (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE',    (0,0), (-1,-1), 10),
        ('PADDING',     (0,0), (-1,-1), 8),
        ('GRID',        (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN',      (0,0), (-1,-1), 'MIDDLE'),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 15))
    return elements


# ─────────────────────────────────────────────────────────────────────────────
# Frame Analysis Section
# ─────────────────────────────────────────────────────────────────────────────

def build_frame_analysis(scan_data, styles):
    elements = []

    elements.append(Paragraph("FRAME ANALYSIS", styles['heading']))

    total = scan_data.get('total_frames', 0)
    fake  = scan_data.get('fake_frames', 0)
    real  = scan_data.get('real_frames', 0)

    fake_pct = (fake / total * 100) if total > 0 else 0
    real_pct = (real / total * 100) if total > 0 else 0

    data = [
        ['Metric',          'Count',  'Percentage'],
        ['Total Frames',    str(total),  '100%'],
        ['Fake Frames',     str(fake),  f"{fake_pct:.1f}%"],
        ['Real Frames',     str(real),  f"{real_pct:.1f}%"],
    ]

    table = Table(data, colWidths=[60*mm, 55*mm, 55*mm])
    table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0,0), (-1,0), BRAND_BLUE),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,0), 10),
        ('ALIGN',      (0,0), (-1,-1), 'CENTER'),
        ('PADDING',    (0,0), (-1,-1), 8),
        # Body
        ('FONTSIZE',   (0,1), (-1,-1), 10),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('TEXTCOLOR',  (1,2), (1,2), RED_ALERT),  # Fake count red
        ('TEXTCOLOR',  (1,3), (1,3), GREEN_OK),   # Real count green
        ('FONTNAME',   (1,2), (1,3), 'Helvetica-Bold'),
        ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 15))
    return elements


# ─────────────────────────────────────────────────────────────────────────────
# AI Explanation Section
# ─────────────────────────────────────────────────────────────────────────────

def build_ai_explanation(scan_data, styles):
    elements = []

    elements.append(Paragraph("AI ANALYSIS", styles['heading']))

    explanation = scan_data.get('explanation', 'No explanation available.')
    elements.append(Paragraph(explanation, styles['body']))
    elements.append(Spacer(1, 15))
    return elements


# ─────────────────────────────────────────────────────────────────────────────
# Digital Forensics Section
# ─────────────────────────────────────────────────────────────────────────────

def build_forensics_section(scan_data, styles):
    elements = []

    metadata = scan_data.get('metadata', {})
    if not metadata:
        return elements

    elements.append(Paragraph("DIGITAL FORENSICS", styles['heading']))

    # Suspicious flags
    flags = metadata.get('suspicious_flags', [])
    if flags:
        for flag in flags:
            severity = flag.get('severity', 'low')
            color    = RED_ALERT if severity == 'high' else \
                       ORANGE_WARN if severity == 'medium' else YELLOW_WARN

            flag_table = Table(
                [[f"[{severity.upper()}] {flag.get('type', '')}: {flag.get('message', '')}"]],
                colWidths=[170*mm]
            )
            flag_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
                ('TEXTCOLOR',  (0,0), (-1,-1), color),
                ('FONTSIZE',   (0,0), (-1,-1), 9),
                ('FONTNAME',   (0,0), (-1,-1), 'Helvetica-Bold'),
                ('PADDING',    (0,0), (-1,-1), 8),
                ('LEFTPADDING',(0,0), (-1,-1), 12),
                ('BOX',        (0,0), (-1,-1), 1, color),
            ]))
            elements.append(flag_table)
            elements.append(Spacer(1, 5))

    # File information
    file_info = metadata.get('file_info', {})
    if file_info:
        elements.append(Spacer(1, 8))
        elements.append(Paragraph(
            "<b>File Information:</b>",
            styles['body']
        ))

        info_data = []
        for key in ['filename', 'size_readable', 'dimensions', 'format']:
            if key in file_info:
                label = key.replace('_', ' ').title()
                info_data.append([label, str(file_info[key])])

        if info_data:
            info_table = Table(info_data, colWidths=[45*mm, 125*mm])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,-1), LIGHT_GRAY),
                ('FONTSIZE',   (0,0), (-1,-1), 9),
                ('PADDING',    (0,0), (-1,-1), 6),
                ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
            ]))
            elements.append(info_table)

    # EXIF metadata
    exif = metadata.get('exif_data', {})
    if exif and len(exif) > 0:
        elements.append(Spacer(1, 8))
        elements.append(Paragraph(
            "<b>EXIF Metadata:</b>",
            styles['body']
        ))

        exif_data = [[k, str(v)[:60]] for k, v in list(exif.items())[:15]]

        if exif_data:
            exif_table = Table(exif_data, colWidths=[45*mm, 125*mm])
            exif_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,-1), LIGHT_GRAY),
                ('FONTSIZE',   (0,0), (-1,-1), 8),
                ('PADDING',    (0,0), (-1,-1), 5),
                ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
            ]))
            elements.append(exif_table)

    elements.append(Spacer(1, 15))
    return elements


# ─────────────────────────────────────────────────────────────────────────────
# Footer Section
# ─────────────────────────────────────────────────────────────────────────────

def build_footer(styles):
    elements = []
    elements.append(Spacer(1, 20))

    # Horizontal line
    line_table = Table([['']], colWidths=[170*mm], rowHeights=[1])
    line_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#E2E8F0')),
    ]))
    elements.append(line_table)
    elements.append(Spacer(1, 10))

    footer_text = (
        f"Report generated by DeepGuard AI on "
        f"{datetime.now().strftime('%B %d, %Y at %H:%M:%S')}<br/>"
        f"<i>This is an automated analysis report. Results should be reviewed by qualified personnel.</i>"
    )
    elements.append(Paragraph(footer_text, styles['small']))

    return elements


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Format date string
# ─────────────────────────────────────────────────────────────────────────────

def format_date(date_str):
    if not date_str:
        return 'N/A'
    try:
        dt = datetime.fromisoformat(date_str)
        return dt.strftime('%B %d, %Y at %H:%M:%S')
    except Exception:
        return str(date_str)