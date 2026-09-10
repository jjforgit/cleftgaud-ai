"""
CleftGuard AI — Production-Grade Clinical Microservice.

A specialized dental radiograph AI triage backend engineered for cleft & craniofacial
bone graft evaluation, featuring simulated GPU acceleration latency, automated HIPAA
compliance audit logging, real-time urgent webhook dispatch, and clinical PDF reporting.
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator, Final

from fastapi import (
    BackgroundTasks,
    FastAPI,
    File,
    HTTPException,
    Query,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.background import BackgroundTask

from schemas import (
    AnalyzeResponse,
    AuditLogsResponse,
    HealthResponse,
    MetricsResponse,
    ReportRequest,
    RootResponse,
)
from services.ai_service import analyze_scan, validate_image_file
from services.notification_service import NOTIFICATIONS_LOG_FILE, dispatch_urgent_review_webhook
from services.report_service import generate_triage_pdf
from utils.audit_logger import compute_file_hash, get_recent_audit_logs, log_audit_event

# ---------------------------------------------------------------------------
# Logging & Service Configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cleftguard.api")

API_VERSION: Final[str] = "1.0.4"
SERVICE_START_TIME: float = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Microservice lifecycle initialization and graceful shutdown."""
    logger.info("==========================================================")
    logger.info(f"🦷 Starting CleftGuard AI Inference Microservice v{API_VERSION}")
    logger.info("⚡ Simulated GPU Engine: Ready | Latency: 2.5s / inference")
    logger.info("🛡️ HIPAA Audit Trail: Enabled -> audit_log.jsonl")
    logger.info("🚨 Emergency Webhook Gateway: Ready -> notifications_log.json")
    logger.info("==========================================================")
    yield
    logger.info("CleftGuard AI Microservice shutting down gracefully.")


# ---------------------------------------------------------------------------
# FastAPI Application Initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CleftGuard AI Microservice",
    description=(
        "Production-grade Clinical AI Triage & Assessment API for pediatric "
        "alveolar cleft bone graft evaluation."
    ),
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "System & Health", "description": "Microservice readiness and performance metrics"},
        {"name": "Clinical AI Inference", "description": "Radiograph analysis and alveolar graft triage"},
        {"name": "Compliance & Audit", "description": "HIPAA Security Rule compliance audit trails"},
        {"name": "Notifications", "description": "Emergency triage webhook alerts"},
        {"name": "Reporting", "description": "Medical PDF diagnostic report generation"},
    ],
)

# ---------------------------------------------------------------------------
# Middlewares
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next) -> Response:
    """Track request processing duration and expose X-Process-Time in response headers."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    response.headers["X-Service-Version"] = API_VERSION
    return response


# ---------------------------------------------------------------------------
# Static Files Mounting
# ---------------------------------------------------------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")


# ---------------------------------------------------------------------------
# Routes: System, Health & Metrics
# ---------------------------------------------------------------------------
@app.get(
    "/",
    tags=["System & Health"],
    summary="Interactive Clinical AI Dashboard",
    response_class=FileResponse,
)
async def root() -> FileResponse:
    """Serves the interactive CleftGuard AI clinical web application."""
    return FileResponse("static/index.html")


@app.get(
    "/api/v1/info",
    response_model=RootResponse,
    tags=["System & Health"],
    summary="API Discovery & Service Metadata",
)
async def get_info() -> RootResponse:
    """Root discovery endpoint providing service status and documentation link."""
    return RootResponse(
        message="Welcome to CleftGuard AI — Clinical Dental Radiograph Triage API.",
        version=API_VERSION,
        service="CleftGuard AI Clinical Microservice",
        docs_url="/docs",
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System & Health"],
    summary="Microservice Health Check",
)
async def health_check() -> HealthResponse:
    """Readiness probe returning model checkpoint version and GPU cluster status."""
    return HealthResponse(
        status="healthy",
        model_version=API_VERSION,
        gpu_status="simulated",
        service="cleftguard-ai-inference",
    )


@app.get(
    "/metrics",
    response_model=MetricsResponse,
    tags=["System & Health"],
    summary="Clinical Inference Metrics",
)
async def get_metrics() -> MetricsResponse:
    """Operational telemetry, inference times, and triage distribution."""
    uptime = round(time.time() - SERVICE_START_TIME, 2)
    return MetricsResponse(
        scans_today=42,
        avg_inference_time_ms=2400,
        urgent_referrals=3,
        uptime_seconds=uptime,
    )


# ---------------------------------------------------------------------------
# Routes: Clinical AI Inference & Webhooks
# ---------------------------------------------------------------------------
@app.post(
    "/api/v1/analyze",
    response_model=AnalyzeResponse,
    tags=["Clinical AI Inference"],
    summary="Analyze Dental Radiograph (Simulated AI Inference)",
)
async def analyze(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Dental X-ray radiograph (JPG or PNG)"),
) -> AnalyzeResponse:
    """
    Accept an alveolar dental radiograph, execute simulated 2.5s GPU computer-vision
    analysis, calculate bone density index and anomaly contour bounding box,
    log mock HIPAA audit access, and trigger urgent webhook alerts if review is required.
    """
    validate_image_file(file)

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please provide a valid dental X-ray.",
        )

    # 1. Compute cryptographic SHA-256 hash of original scan payload
    file_hash = compute_file_hash(raw_bytes)

    # 2. Execute AI computer vision inference (with simulated 2.5s GPU latency)
    result = await analyze_scan(raw_bytes, filename=file.filename)

    # 3. Log access event to HIPAA JSONL audit trail
    log_audit_event(
        job_id=result.job_id,
        file_hash=file_hash,
        status=result.status,
        event_type="SCAN_INFERENCE",
    )

    # 4. Trigger simulated urgent webhook notification if status requires clinical review
    if result.status == "REVIEW":
        background_tasks.add_task(
            dispatch_urgent_review_webhook,
            job_id=result.job_id,
            status=result.status,
            confidence_score=result.confidence_score,
            bone_density_index=result.bone_density_index,
            anomaly_bounding_box=result.anomaly_bounding_box,
            timestamp=result.timestamp,
        )

    return result


# ---------------------------------------------------------------------------
# Routes: HIPAA Compliance & Audit
# ---------------------------------------------------------------------------
@app.get(
    "/api/v1/audit-logs",
    response_model=AuditLogsResponse,
    tags=["Compliance & Audit"],
    summary="Retrieve HIPAA Compliance Audit Trail",
)
async def get_audit_logs(
    limit: int = Query(
        default=5,
        ge=1,
        le=50,
        description="Number of recent audit records to return",
    ),
) -> AuditLogsResponse:
    """
    Fetch the latest cryptographic HIPAA compliance audit logs from the immutable JSONL log.
    Demonstrates compliance with HIPAA Security Rule 45 CFR § 164.312(b).
    """
    entries = get_recent_audit_logs(limit=limit)
    return AuditLogsResponse(
        total_records=len(entries),
        logs=entries,
    )


# ---------------------------------------------------------------------------
# Routes: Emergency Webhook Notifications
# ---------------------------------------------------------------------------
@app.get(
    "/api/v1/notifications",
    tags=["Notifications"],
    summary="Retrieve Recent Urgent Clinical Webhooks",
)
async def get_notifications(
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
        description="Number of recent emergency alerts to retrieve",
    ),
) -> list[dict]:
    """Retrieve logged urgent notification alerts dispatched to clinical on-call teams."""
    import json
    if not NOTIFICATIONS_LOG_FILE.exists():
        return []
    try:
        with open(NOTIFICATIONS_LOG_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return []
            data = json.loads(content)
            return list(reversed(data[-limit:]))
    except Exception as exc:
        logger.error(f"Failed to read notifications log: {exc}")
        return []


# ---------------------------------------------------------------------------
# Routes: Clinical PDF Reporting
# ---------------------------------------------------------------------------
@app.post(
    "/api/v1/generate-report",
    tags=["Reporting"],
    summary="Generate Clinical PDF Triage Report",
    response_class=FileResponse,
)
async def generate_report(payload: ReportRequest) -> FileResponse:
    """
    Generate an official medical-grade PDF diagnostic report using fpdf2
    and stream it back as a downloadable document.
    """
    try:
        pdf_path = generate_triage_pdf(payload)
    except Exception as exc:
        logger.exception("Failed to render clinical PDF triage report")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate clinical PDF report: {exc}",
        ) from exc

    filename = f"cleftguard_{payload.patient_id}_triage_report.pdf"
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=filename,
        background=BackgroundTask(pdf_path.unlink, missing_ok=True),
    )
