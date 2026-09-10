"""
CleftGuard AI — Computer Vision & Clinical AI Inference Service.

Handles radiograph decoding, simulated deep-learning GPU inference latency,
alveolar bone density index computation, OpenCV contour anomaly localization,
and JET colormap heatmap generation.
"""

from __future__ import annotations

import asyncio
import base64
import random
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Final

import cv2
import numpy as np
from fastapi import HTTPException, UploadFile, status

from schemas import AnalyzeResponse, AnomalyBoundingBox

ALLOWED_IMAGE_EXTENSIONS: Final[set[str]] = {".jpg", ".jpeg", ".png"}
ALLOWED_IMAGE_CONTENT_TYPES: Final[set[str]] = {
    "image/jpeg",
    "image/jpg",
    "image/png",
}
ROI_BRIGHTNESS_THRESHOLD: Final[float] = 110.0
SIMULATED_GPU_LATENCY_SECONDS: Final[float] = 2.5


def validate_image_file(file: UploadFile) -> None:
    """Validate upload extension and MIME content type."""
    suffix = Path(file.filename or "").suffix.lower()
    content_type = (file.content_type or "").lower()
    
    is_valid_ext = suffix in ALLOWED_IMAGE_EXTENSIONS
    is_valid_mime = content_type in ALLOWED_IMAGE_CONTENT_TYPES
    
    if not (is_valid_ext or is_valid_mime):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Please upload a standard dental radiograph in JPG or PNG format.",
        )


def _decode_image(raw_bytes: bytes) -> np.ndarray:
    """Decode raw bytes into a BGR OpenCV numpy image."""
    buffer = np.frombuffer(raw_bytes, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to decode image. Ensure the file is an uncorrupted JPG or PNG.",
        )
    return image


def _extract_roi(gray: np.ndarray) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    """
    Extract the alveolar cleft / bone graft Region of Interest (ROI).
    
    Approximates the alveolar ridge in the center-horizontal, lower-third zone.
    Returns the cropped ROI and the bounding rect tuple (x, y, w, h).
    """
    height, width = gray.shape[:2]
    x0 = width // 3
    x1 = (2 * width) // 3
    y0 = (2 * height) // 3
    y1 = height
    
    roi = gray[y0:y1, x0:x1]
    if roi.size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image resolution too small to extract clinical region of interest.",
        )
    return roi, (x0, y0, x1 - x0, y1 - y0)


def _detect_contours_and_bounding_box(
    gray: np.ndarray,
    roi_coords: tuple[int, int, int, int],
) -> tuple[np.ndarray, AnomalyBoundingBox]:
    """
    Detect structural contours using Canny edge filters and calculate the
    primary anomaly / graft assessment bounding box.
    """
    x0, y0, w0, h0 = roi_coords
    edges = cv2.Canny(gray, threshold1=50, threshold2=150)
    
    # Isolate edges in ROI for anomaly localization
    roi_edges = edges[y0:y0 + h0, x0:x0 + w0]
    contours, _ = cv2.findContours(roi_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Find the most significant structural contour in the graft zone
        largest_contour = max(contours, key=cv2.contourArea)
        cx, cy, cw, ch = cv2.boundingRect(largest_contour)
        # Offset coordinates back to full image frame
        bbox = AnomalyBoundingBox(
            x=int(x0 + cx),
            y=int(y0 + cy),
            width=int(cw),
            height=int(ch),
        )
    else:
        # Fallback to standard ROI bounding box
        bbox = AnomalyBoundingBox(
            x=int(x0),
            y=int(y0),
            width=int(w0),
            height=int(h0),
        )
        
    return edges, bbox


def _build_heatmap_overlay(
    bgr: np.ndarray,
    gray: np.ndarray,
    edges: np.ndarray,
    bbox: AnomalyBoundingBox,
    status_code: str,
) -> np.ndarray:
    """
    Generate an AI gradient heatmap: Canny edges → contour mask → heavy Gaussian
    glow → JET colormap → blended over the original radiograph with clinical HUD overlay.
    """
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    mask = np.zeros(gray.shape, dtype=np.uint8)
    cv2.drawContours(mask, contours, contourIdx=-1, color=255, thickness=2)
    
    # Heavy blur so contour lines read as a glowing heat field
    blurred = cv2.GaussianBlur(mask, ksize=(51, 51), sigmaX=0)
    heatmap = cv2.applyColorMap(blurred, cv2.COLORMAP_JET)
    
    # Alpha blend radiograph with colormap
    blended = cv2.addWeighted(bgr, alpha=0.55, src2=heatmap, beta=0.45, gamma=0)
    
    # Add subtle clinical HUD target box around anomaly/graft region
    box_color = (0, 70, 255) if status_code == "REVIEW" else (0, 200, 70)  # Red/Orange or Green
    cv2.rectangle(
        blended,
        (bbox.x, bbox.y),
        (bbox.x + bbox.width, bbox.y + bbox.height),
        color=box_color,
        thickness=2,
        lineType=cv2.LINE_AA,
    )
    
    return blended


def _encode_jpeg_base64(image: np.ndarray) -> str:
    """Encode an OpenCV BGR image into a clean base64-encoded JPEG string."""
    ok, buffer = cv2.imencode(".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to encode generated clinical heatmap.",
        )
    return base64.b64encode(buffer.tobytes()).decode("ascii")


async def analyze_scan(raw_bytes: bytes, filename: str | None = None) -> AnalyzeResponse:
    """
    Execute end-to-end simulated AI analysis on a dental X-ray.
    
    - Simulates 2.5s GPU inference delay for real-world medical AI feel.
    - Decodes image and segments alveolar bone graft zone.
    - Computes bone density index and detects contour bounding box.
    - Generates base64 JET colormap heatmap overlay.
    """
    # 1. Simulate real GPU inference latency
    await asyncio.sleep(SIMULATED_GPU_LATENCY_SECONDS)
    
    # 2. Decode and process radiograph
    bgr = _decode_image(raw_bytes)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    
    # 3. Extract alveolar graft ROI & compute bone density index
    roi, roi_coords = _extract_roi(gray)
    mean_intensity = float(np.mean(roi))
    bone_density_index = round(mean_intensity / 255.0, 4)
    
    # 4. Clinical classification decision
    is_healthy = mean_intensity > ROI_BRIGHTNESS_THRESHOLD
    result_status = "SUCCESS" if is_healthy else "REVIEW"
    
    if is_healthy:
        recommendation = "Normal Alveolar Bone Healing — Graft Structure Stable"
        confidence_score = round(random.uniform(0.88, 0.96), 2)
    else:
        recommendation = "Suspected Bone Resorption / Defect — Secondary Clinical Evaluation Recommended"
        confidence_score = round(random.uniform(0.85, 0.94), 2)
    
    # 5. Extract contours and anomaly bounding box
    edges, bounding_box = _detect_contours_and_bounding_box(gray, roi_coords)
    
    # 6. Render AI heatmap with clinical overlay
    heatmap = _build_heatmap_overlay(bgr, gray, edges, bounding_box, result_status)
    heatmap_b64 = _encode_jpeg_base64(heatmap)
    
    # 7. Generate unique scan identifier and ISO timestamp
    job_id = f"cg-scan-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.now(timezone.utc).isoformat()
    
    return AnalyzeResponse(
        job_id=job_id,
        status=result_status,
        confidence_score=confidence_score,
        bone_density_index=bone_density_index,
        anomaly_bounding_box=bounding_box,
        recommendation=recommendation,
        timestamp=timestamp,
        heatmap_base64=heatmap_b64,
    )
