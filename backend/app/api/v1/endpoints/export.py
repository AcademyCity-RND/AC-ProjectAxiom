import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import TokenPayload, UserRole
from app.models.case import InvestigationCase
from app.api.v1.deps import require_roles
from app.services.report_exporter import (
    build_case_dossier_data,
    render_html_dossier,
    generate_csv_ledger,
    get_dual_tier_ledger,
    generate_master_dataset_csv,
)
from app.services.audit_logger import log_activity

logger = logging.getLogger("axiom.export")
router = APIRouter()


@router.get("/report/{case_id}", summary="Mengekspor Berkas Dossier Forensik Resmi (HTML/PDF/CSV)")
def export_case_report(
    case_id: str,
    format: str = Query("html", description="Format berkas: html, pdf, atau csv"),
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
):
    """
    Menghasilkan berkas laporan intelijen forensik resmi:
    - `format=html` atau `pdf`: Berkas dossier Jinja2 lengkap siap cetak (@media print A4) dengan kop militer PUSSIBERAD dan hash SHA-256.
    - `format=csv`: Berkas spreadsheet RFC 4180 berisi 100% data lengkap seluruh komentator (Dual-Tier Part B).
    """
    # Isolasi kasus: operator hanya dapat mengekspor kasus miliknya sendiri, admin dapat mengekspor semua
    case_check = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
    if not case_check or (current_user.role != UserRole.ADMIN.value and case_check.created_by != current_user.sub):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kasus investigasi dengan ID '{case_id}' tidak ditemukan."
        )

    try:
        dossier_data = build_case_dossier_data(case_id, db)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Gagal menyusun data dossier untuk kasus '{case_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menyusun data laporan forensik."
        )

    fmt = format.lower().strip()

    if fmt in ("html", "pdf"):
        try:
            html_output = render_html_dossier(dossier_data)
            evidence_hash = dossier_data.get("cryptographic_hash", "")
            target_account = dossier_data.get("case", {}).get("target", "unknown")

            # Catat jejak audit pratinjau HTML atau unduh PDF resmi secara presisi
            audit_action = "DOWNLOAD_DOSSIER_PDF" if fmt == "pdf" else "VIEW_DOSSIER_HTML"
            log_activity(
                db=db,
                username=current_user.sub or "anonymous",
                role=current_user.role or "user",
                action=audit_action,
                target=f"case:{case_id}",
                details={
                    "case_id": case_id,
                    "target_account": target_account,
                    "format": fmt,
                    "evidence_sha256": evidence_hash,
                    "document_code": f"DOSSIER-{case_id[:8]}",
                },
                status="SUCCESS",
            )

            return Response(
                content=html_output,
                media_type="text/html",
                headers={
                    "Content-Disposition": f"inline; filename=dossier_{case_id}.html",
                    "X-Evidence-SHA256": evidence_hash
                }
            )
        except Exception as e:
            logger.error(f"Gagal merender template HTML dossier '{case_id}': {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Gagal merender template laporan: {e}"
            )

    elif fmt == "csv":
        try:
            csv_output = generate_csv_ledger(dossier_data)
            evidence_hash = dossier_data.get("cryptographic_hash", "")
            target_account = dossier_data.get("case", {}).get("target", "unknown")

            # Catat jejak audit pengunduhan CSV ledger
            log_activity(
                db=db,
                username=current_user.sub or "anonymous",
                role=current_user.role or "user",
                action="DOWNLOAD_LEDGER_CSV",
                target=f"case:{case_id}",
                details={
                    "case_id": case_id,
                    "target_account": target_account,
                    "format": "csv",
                    "evidence_sha256": evidence_hash,
                    "document_code": f"LEDGER-{case_id[:8]}",
                },
                status="SUCCESS",
            )

            return Response(
                content=csv_output,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=axiom_ledger_{case_id}.csv",
                    "X-Evidence-SHA256": evidence_hash
                }
            )
        except Exception as e:
            logger.error(f"Gagal menghasilkan CSV ledger '{case_id}': {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Gagal menghasilkan berkas CSV: {e}"
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format '{format}' tidak didukung. Pilihan format yang tersedia: html, pdf, csv."
        )


@router.get("/ledger/{case_id}", summary="Mengambil Full Dual-Tier Audit Ledger (JSON)")
def get_case_audit_ledger(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
):
    """
    Mengambil data JSON terstruktur untuk tabel interaktif Frontend:
    - Tier 1: Top 10 Core Attackers (Akun penyerang inti)
    - Tier 2: Full Comprehensive Commenter Audit Ledger (100% komentator)
    - Hash Integritas Kriptografis SHA-256
    """
    # Isolasi ledger: operator hanya dapat mengakses ledger kasus miliknya sendiri, admin dapat mengakses semua
    case_check = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
    if not case_check or (current_user.role != UserRole.ADMIN.value and case_check.created_by != current_user.sub):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kasus investigasi dengan ID '{case_id}' tidak ditemukan."
        )

    try:
        return get_dual_tier_ledger(case_id, db)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Gagal mengambil ledger kasus '{case_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal mengambil data audit ledger kasus."
        )


@router.get("/master-dataset", summary="Mengekspor Master Dataset Retraining ML (21-Fitur Kanonikal + Label)")
def export_master_dataset(
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.ADMIN]))
):
    """
    Mengekspor akumulasi seluruh kasus dan profil aktor yang telah diekstraksi ke format CSV
    dengan 21-fitur kanonikal untuk retraining model XGBoost.
    Khusus untuk Administrator (Role: Admin).
    """
    try:
        csv_content = generate_master_dataset_csv(db)
        now_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"axiom_retraining_master_dataset_{now_str}.csv"

        log_activity(
            db=db,
            username=current_user.sub or "anonymous",
            role=current_user.role or "admin",
            action="EXPORT_MASTER_DATASET",
            target="system:master_dataset",
            details={"filename": filename},
            status="SUCCESS",
        )

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Axiom-Export-Type": "Master-ML-Dataset"
            }
        )
    except Exception as e:
        logger.error(f"Gagal mengekspor master dataset: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menghasilkan master dataset: {e}"
        )
