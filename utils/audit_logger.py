"""
CleftGuard AI — Mock HIPAA Compliance Audit Logger.

Logs every radiograph access and inference event to an append-only JSONL audit log
for compliance auditing (HIPAA Security Rule 45 CFR § 164.312(b)).
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from schemas import AuditLogEntry

logger = logging.getLogger("cleftguard.audit")

AUDIT_LOG_FILE: Path = Path("audit_log.jsonl")


def compute_file_hash(raw_bytes: bytes) -> str:
    """Compute cryptographic SHA-256 hash of the uploaded radiograph bytes."""
    return hashlib.sha256(raw_bytes).hexdigest()


def log_audit_event(
    job_id: str,
    file_hash: str,
    status: str,
    event_type: str = "SCAN_INFERENCE",
    compliance_tag: str = "HIPAA-Security-Rule-164.312(b)",
) -> AuditLogEntry:
    """
    Append a structured audit log entry to audit_log.jsonl.
    
    Ensures an immutable audit trail of clinical AI access and results.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    entry = AuditLogEntry(
        job_id=job_id,
        timestamp=now_iso,
        file_hash=file_hash,
        status=status,
        event_type=event_type,
        compliance_tag=compliance_tag,
    )

    try:
        with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry.model_dump()) + "\n")
        logger.info(f"[HIPAA-AUDIT] Recorded access log for scan {job_id} | Hash: {file_hash[:12]}...")
    except Exception as exc:
        logger.error(f"[HIPAA-AUDIT ERROR] Failed to write audit log entry: {exc}")

    return entry


def get_recent_audit_logs(limit: int = 5) -> list[AuditLogEntry]:
    """
    Retrieve the most recent N audit log records from the JSONL audit file.
    
    Returns the newest records first.
    """
    if not AUDIT_LOG_FILE.exists():
        return []

    entries: list[AuditLogEntry] = []
    try:
        with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f if line.strip()]
            
        # Extract the last `limit` lines and reverse them for newest-first display
        for line in reversed(lines[-limit:]):
            try:
                data = json.loads(line)
                entries.append(AuditLogEntry(**data))
            except Exception as e:
                logger.warning(f"Skipping malformed audit log line: {e}")
    except Exception as exc:
        logger.error(f"[HIPAA-AUDIT ERROR] Failed to read audit logs: {exc}")

    return entries
