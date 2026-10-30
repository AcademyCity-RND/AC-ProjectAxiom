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

    is_event = (
        case.target.startswith("http://")
        or case.target.startswith("https://")
        or case.platform in ("youtube", "instagram")
    )

    actor = db.query(ActorProfile).filter(ActorProfile.case_id == case_id).first()
    detection = db.query(DetectionResult).filter(DetectionResult.case_id == case_id).first()
    cluster_links = db.query(ClusterLink).filter(ClusterLink.case_id == case_id).all()

    predicted_class = detection.predicted_class if detection else "UNKNOWN"
    confidence = detection.confidence if detection else 0.0

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    seen_nodes = set()
    seen_edges = set()

    # 1. Node Target Sentral
    if is_event:
        host_meta = (case.result_summary or {}).get("host_metadata", {})
        creator = host_meta.get("creator", {})
        creator_name = (
            creator.get("username_or_channel")
            or creator.get("channel_title")
            or creator.get("display_name")
        )
        target_username = creator_name or f"{case.platform.upper()}_TARGET"
        target_label = f"@{creator_name.lstrip('@')}" if creator_name else f"{case.platform.upper()} TARGET"
        target_node_id = f"event_{case_id[:8]}"
        nodes.append({
            "data": {
                "id": target_node_id,
                "label": target_label,
                "type": "target",
                "class_label": predicted_class,
                "category": predicted_class,
                "confidence": confidence,
                "color": "#38bdf8",
                "size": 65
            }
        })
    else:
        target_username = actor.username if actor else case.target
        clean_username = target_username.lstrip("@")
        target_node_id = f"actor_{clean_username}"
        nodes.append({
            "data": {
                "id": target_node_id,
                "label": f"@{clean_username}",
                "type": "target",
                "class_label": predicted_class,
                "category": predicted_class,
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

        src_raw = link.source_actor or ""
        tgt_raw = link.target_actor or ""
        src = src_raw.lstrip("@")
        tgt = tgt_raw.lstrip("@")
        src_id = f"actor_{src}"
        tgt_id = f"actor_{tgt}"

        # Daftarkan node yang terlibat jika belum ada
        for a_name, a_id in [(src, src_id), (tgt, tgt_id)]:
            if a_id and a_id not in seen_nodes and a_name != "unknown" and a_name != "":
                nodes.append({
                    "data": {
                        "id": a_id,
                        "label": f"@{a_name}",
                        "type": "coordinated_account",
                        "class_label": "BUZZER",
                        "category": "BUZZER",
                        "color": "#f59e0b",
                        "size": 40
                    }
                })
                seen_nodes.add(a_id)

        if is_event:
            # Pada mode event: hubungkan antar akun copypasta
            if src_id in seen_nodes and tgt_id in seen_nodes and src_id != tgt_id:
                edge_id = f"edge_{link.id}"
                if edge_id not in seen_edges:
                    edges.append({
                        "data": {
                            "id": edge_id,
                            "source": src_id,
                            "target": tgt_id,
                            "weight": link.similarity_score,
                            "label": f"{int(link.similarity_score * 100)}% Sim",
                            "link_type": link.link_type or "semantic_cib",
                            "evidence": link.evidence_snippet
                        }
                    })
                    seen_edges.add(edge_id)

            # Hubungkan juga ke target sentral event agar graf terikat utuh
            for participant_id in (src_id, tgt_id):
                if participant_id in seen_nodes:
                    raid_edge_id = f"raid_{target_node_id}_{participant_id}"
                    if raid_edge_id not in seen_edges:
                        edges.append({
                            "data": {
                                "id": raid_edge_id,
                                "source": target_node_id,
                                "target": participant_id,
                                "weight": 0.6,
                                "label": "Raid",
                                "link_type": "interaction",
                                "evidence": "Akun penyerang kolom komentar"
                            }
                        })
                        seen_edges.add(raid_edge_id)
        else:
            # Pada mode profil akun tunggal: hubungkan target sentral ke akun terafiliasi
            edge_id = f"edge_{link.id}"
            if edge_id not in seen_edges and tgt_id in seen_nodes:
                edges.append({
                    "data": {
                        "id": edge_id,
                        "source": target_node_id,
                        "target": tgt_id,
                        "weight": link.similarity_score,
                        "label": f"{int(link.similarity_score * 100)}% Sim",
                        "link_type": link.link_type or "semantic_cib",
                        "evidence": link.evidence_snippet
                    }
                })
                seen_edges.add(edge_id)

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
