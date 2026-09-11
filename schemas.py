"""
CleftGuard AI — Pydantic Schemas.

Defines all clinical, audit, metric, and report data structures.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class RootResponse(BaseModel):
    """Welcome and API metadata response."""
    message: str = Field(..., description="API welcome greeting")
    version: str = Field(..., description="Current service release version")
    service: str = Field(default="CleftGuard AI Clinical Microservice", description="Service identifier")
    docs_url: str = Field(default="/docs", description="Interactive OpenAPI documentation endpoint")


class AnomalyBoundingBox(BaseModel):
    """Coordinates and dimensions of detected alveolar region or anomaly."""
    x: int = Field(..., description="X-coordinate of the upper-left corner of the bounding box")
    y: int = Field(..., description="Y-coordinate of the upper-left corner of the bounding box")
    width: int = Field(..., description="Width of the bounding region in pixels")
    height: int = Field(..., description="Height of the bounding region in pixels")


class AnalyzeResponse(BaseModel):
    """Rich clinical payload returned after dental radiograph analysis."""
    job_id: str = Field(..., description="Unique clinical scan identifier (UUID)")
    status: str = Field(..., description='"SUCCESS" for normal bone graft or "REVIEW" for suspected anomaly')
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model inference confidence score (0.00 - 1.00)")
    bone_density_index: float = Field(..., ge=0.0, le=1.0, description="Normalized alveolar bone density index (0.0 - 1.0)")
    anomaly_bounding_box: AnomalyBoundingBox = Field(..., description="Identified anatomical region of interest or anomaly box")
    recommendation: str = Field(..., description="Clinical triage action recommendation")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp of inference completion")
    heatmap_base64: str = Field(..., description="Base64-encoded JPEG image with JET colormap AI overlay")


class ReportRequest(BaseModel):
    """Payload to generate an official clinical PDF triage report."""
    patient_id: str = Field(..., description="Anonymized patient or medical record ID")
    status: str = Field(..., description='Triage status: "SUCCESS" or "REVIEW"')
    recommendation: str = Field(..., description="Clinical action recommendation")
    confidence_score: Optional[float] = Field(default=None, description="Confidence score between 0.0 and 1.0")
    confidence: Optional[float] = Field(default=None, description="Legacy field for backwards compatibility (0 - 100)")
    bone_density_index: Optional[float] = Field(default=None, description="Alveolar bone density index")
    job_id: Optional[str] = Field(default=None, description="Associated scan job ID")


class AuditLogEntry(BaseModel):
    """Mock HIPAA compliance audit log entry."""
    job_id: str = Field(..., description="Associated scan job ID")
    timestamp: str = Field(..., description="ISO 8601 timestamp of data access / inference")
    file_hash: str = Field(..., description="Cryptographic SHA-256 hash of original radiograph payload")
    status: str = Field(..., description="Analysis outcome (SUCCESS / REVIEW)")
    event_type: str = Field(default="SCAN_INFERENCE", description="Clinical action event type")
    compliance_tag: str = Field(default="HIPAA-Security-Rule-164.312(b)", description="Audit compliance standard reference")


class AuditLogsResponse(BaseModel):
    """Response containing recent HIPAA compliance audit log entries."""
    total_records: int = Field(..., description="Count of retrieved audit log records")
    logs: list[AuditLogEntry] = Field(..., description="List of most recent audit log entries")


class HealthResponse(BaseModel):
    """Microservice health and model readiness status."""
    status: str = Field(default="healthy", description="System operational status")
    model_version: str = Field(default="1.0.4", description="Deployed neural/computer vision model checkpoint version")
    gpu_status: str = Field(default="cpu", description="Torch inference device: mps, cuda, or cpu")
    service: str = Field(default="cleftguard-ai-inference", description="Microservice identifier")


class MetricsResponse(BaseModel):
    """Clinical AI operational metrics and daily triage stats."""
    scans_today: int = Field(..., description="Total dental X-ray scans processed today")
    avg_inference_time_ms: int = Field(..., description="Average GPU inference latency in milliseconds")
    urgent_referrals: int = Field(..., description="Number of scans triaged for urgent clinical review today")
    uptime_seconds: Optional[float] = Field(default=None, description="Service uptime in seconds")
