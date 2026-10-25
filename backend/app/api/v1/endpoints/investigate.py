import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, Request
from app.schemas.investigation import InvestigationRequest
from app.schemas.auth import TokenPayload, UserRole
from app.schemas.audit import AuditLogCreate, AuditActionEnum
from app.api.v1.deps import require_roles

logger = logging.getLogger("axiom.audit")
router = APIRouter()


@router.post("/target", summary="Memulai Investigasi Target Kognitif")
def investigate_target(
    payload: InvestigationRequest,
    request: Request,
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
):
    """
    Endpoint terlindungi untuk memulai investigasi terhadap aktor siber kognitif.
    - Wajib membawa header `Authorization: Bearer <token>`.
    - Input tervalidasi secara ketat terhadap karakter terlarang, pola regex platform, dan Anti-SSRF.
    - Mencatat jejak audit (Accounting) atas setiap penarikan data.
    """
    client_ip = request.client.host if request.client else "unknown"

    # Pencatatan Audit Trail (Accounting)
    audit_entry = AuditLogCreate(
        username=current_user.sub or "anonymous",
        role=current_user.role or "unknown",
        action=AuditActionEnum.INVESTIGATE_TARGET,
        target=f"{payload.platform}:{payload.target}",
        ip_address=client_ip,
        details={
            "max_interactions": payload.max_interactions,
            "depth_level": payload.depth_level,
        },
        timestamp=datetime.now(timezone.utc),
        status="ACCEPTED",
    )
    logger.info(f"AUDIT_LOG: {audit_entry.model_dump_json()}")

    return {
        "status": "accepted",
        "message": f"Investigasi untuk target '{payload.target}' pada platform '{payload.platform}' telah dijadwalkan.",
        "case_id": "case_preview_001",
        "operator": current_user.sub,
        "sanitized_target": payload.target,
        "platform": payload.platform,
        "max_interactions": payload.max_interactions,
    }
