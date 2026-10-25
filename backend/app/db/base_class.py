from sqlalchemy.orm import DeclarativeBase, declared_attr
import re


class Base(DeclarativeBase):
    """
    Base class untuk semua model SQLAlchemy di Axiom.
    Secara otomatis mengonversi nama kelas CamelCase menjadi snake_case untuk nama tabel.
    """
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Mengubah CamelCase ke snake_case, misal: InvestigationCase -> investigation_cases
        name = re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()
        if not name.endswith("s"):
            name = f"{name}s"
        return name
