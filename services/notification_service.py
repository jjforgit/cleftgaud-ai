"""
CleftGuard AI — Webhook Notification Service.

Simulates automated urgent clinical notifications (WhatsApp / SMS / Hospital Pager Webhook)
when dental radiograph analysis triggers a "REVIEW" triage status.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from schemas import AnomalyBoundingBox

logger = logging.getLogger("cleftguard.notifications")

NOTIFICATIONS_LOG_FILE: Path = Path("notifications_log.json")


def dispatch_urgent_review_webhook(
    job_id: str,
    status: str,
    confidence_score: float,
    bone_density_index: float,
    anomaly_bounding_box: AnomalyBoundingBox | dict[str, int],
    timestamp: str | None = None,
    recipient_role: str = "Pediatric Craniofacial Surgical On-Call",
    channel: str = "WhatsApp-Clinician-Direct & SMS-Triage-Gateway",
) -> dict[str, Any]:
    """
    Simulate dispatching an urgent clinical alert webhook for scans requiring review.
    
    Triggered asynchronously in the background so inference latency is not blocked.
    """
    ts = timestamp or datetime.now(timezone.utc).isoformat()
    
    if isinstance(anomaly_bounding_box, AnomalyBoundingBox):
        bbox_dict = anomaly_bounding_box.model_dump()
    else:
        bbox_dict = anomaly_bounding_box

    payload = {
        "event": "URGENT_TRIAGE_ALERT",
        "job_id": job_id,
        "timestamp": ts,
        "triage_status": status,
        "clinical_urgency": "HIGH",
        "bone_density_index": bone_density_index,
        "confidence_score": confidence_score,
        "anomaly_region": bbox_dict,
        "dispatch_channel": channel,
        "recipient": recipient_role,
        "message": (
            f"🚨 URGENT CLINICAL ALERT: CleftGuard AI detected potential alveolar bone graft "
            f"resorption on Scan ID #{job_id}. Bone Density Index: {bone_density_index:.4f} "
            f"(Confidence: {confidence_score*100:.1f}%). Secondary surgical review recommended."
        ),
    }

    # High-impact console output for hackathon demonstrations
    border = "=" * 78
    formatted_json = json.dumps(payload, indent=2)
    print(f"\n\033[91m\033[1m{border}")
    print(f"🚨 [URGENT WEBHOOK DISPATCHED] -> {channel}")
    print(f"To: {recipient_role} | Scan ID: {job_id}")
    print(border)
    print(f"\033[93m{formatted_json}\033[0m")
    print(f"\033[91m\033[1m{border}\033[0m\n")

    # Persist to notifications_log.json
    try:
        notifications: list[dict[str, Any]] = []
        if NOTIFICATIONS_LOG_FILE.exists():
            try:
                with open(NOTIFICATIONS_LOG_FILE, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        notifications = json.loads(content)
            except Exception:
                notifications = []

        notifications.append(payload)

        with open(NOTIFICATIONS_LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(notifications, f, indent=2)
            
        logger.info(f"[WEBHOOK] Logged urgent notification for scan {job_id} to {NOTIFICATIONS_LOG_FILE}")
    except Exception as exc:
        logger.error(f"[WEBHOOK ERROR] Failed to record notification to file: {exc}")

    return payload
