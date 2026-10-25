# Import all the models, so that Base has them before being imported by Alembic
from app.db.base_class import Base # noqa
from app.models.user import User # noqa
from app.models.audit import AuditLog # noqa
from app.models.case import InvestigationCase # noqa
from app.models.actor import ActorProfile # noqa
from app.models.activity import ActivityLog # noqa
from app.models.detection import DetectionResult # noqa
from app.models.cluster import ClusterLink # noqa
from app.models.watchlist import Watchlist # noqa
