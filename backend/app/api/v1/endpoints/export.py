import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import TokenPayload, UserRole
from app.api.v1.deps import require_roles
from app.services.report_exporter import (
    build_case_dossier_data,
    render_html_dossier,
    generate_csv_ledger,
    get_dual_tier_ledger,
)

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
            return Response(
                content=html_output,
                media_type="text/html",
                headers={
                    "Content-Disposition": f"inline; filename=dossier_{case_id}.html",
                    "X-Evidence-SHA256": dossier_data.get("cryptographic_hash", "")
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
            return Response(
                content=csv_output,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=axiom_ledger_{case_id}.csv",
                    "X-Evidence-SHA256": dossier_data.get("cryptographic_hash", "")
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
