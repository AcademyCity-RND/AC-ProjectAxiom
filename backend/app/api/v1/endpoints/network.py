import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink
from app.schemas.auth import TokenPayload, UserRole
from app.api.v1.deps import require_roles

logger = logging.getLogger("axiom.network")
router = APIRouter()


@router.get("/graph/{case_id}", summary="Mengambil Graf Jejaring Aktor (Format Cytoscape.js)")
def get_network_graph(
    case_id: str,
    min_confidence: float = 0.5,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
) -> Dict[str, Any]:
    """
    Menghasilkan graf jejaring interaksi aktor dan klaster CIB dalam format Cytoscape.js.
    Format output:
    {
        "case_id": "...",
        "target": "...",
        "total_nodes": N,
        "total_edges": M,
        "elements": {
            "nodes": [ { "data": { "id": "...", "label": "...", ... } } ],
            "edges": [ { "data": { "id": "...", "source": "...", "target": "...", "weight": ... } } ]
        }
    }
    """
    case = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kasus investigasi dengan ID '{case_id}' tidak ditemukan."
        )

    actor = db.query(ActorProfile).filter(ActorProfile.case_id == case_id).first()
    detection = db.query(DetectionResult).filter(DetectionResult.case_id == case_id).first()
    cluster_links = db.query(ClusterLink).filter(ClusterLink.case_id == case_id).all()

    target_username = actor.username if actor else case.target
    predicted_class = detection.predicted_class if detection else "UNKNOWN"
    confidence = detection.confidence if detection else 0.0

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    seen_nodes = set()

    # 1. Node Target Sentral
    target_node_id = f"actor_{target_username}"
    nodes.append({
        "data": {
            "id": target_node_id,
            "label": f"@{target_username}",
            "type": "target",
            "class_label": predicted_class,
            "confidence": confidence,
            "color": "#ef4444" if predicted_class in ("BOT", "BUZZER") else "#10b981",
            "size": 60
        }
    })
    seen_nodes.add(target_node_id)

    # 2. Node & Edges Klaster CIB
    for link in cluster_links:
        if link.similarity_score < min_confidence:
            continue

        partner = link.target_actor
        partner_id = f"actor_{partner}"

        if partner_id not in seen_nodes:
            nodes.append({
                "data": {
                    "id": partner_id,
                    "label": f"@{partner}",
                    "type": "coordinated_account",
                    "class_label": "BUZZER",
                    "color": "#f59e0b",
                    "size": 40
                }
            })
            seen_nodes.add(partner_id)

        edge_id = f"edge_{link.id}"
        edges.append({
            "data": {
                "id": edge_id,
                "source": target_node_id,
                "target": partner_id,
                "weight": link.similarity_score,
                "label": f"{int(link.similarity_score * 100)}% Sim",
                "link_type": link.link_type,
                "evidence": link.evidence_snippet
            }
        })

    return {
        "case_id": case_id,
        "target": target_username,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "elements": {
            "nodes": nodes,
            "edges": edges
        }
    }
