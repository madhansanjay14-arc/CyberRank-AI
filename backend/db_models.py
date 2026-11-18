from sqlalchemy import Column, Integer, String, Float, DateTime, func
from backend.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    # Incident identification
    incident_id = Column(String, primary_key=True, index=True)
    incident_type = Column(String, nullable=False)

    # Incident risk factors
    severity = Column(Integer, nullable=False)
    data_sensitivity = Column(Integer, nullable=False)
    asset_importance = Column(Integer, nullable=False)
    attack_confidence = Column(Integer, nullable=False)
    affected_users = Column(Integer, nullable=False)
    business_impact = Column(Integer, nullable=False)

    # AI scoring
    rule_score = Column(Float, nullable=True)
    ml_prediction = Column(Float, nullable=True)
    final_score = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    priority = Column(String, nullable=True)

    # Incident management
    status = Column(
        String,
        nullable=False,
        default="OPEN",
        server_default="OPEN"
    )

    assigned_to = Column(String, nullable=True)

    investigation_notes = Column(
        String,
        nullable=True
    )

        # Timestamps
    created_at = Column(
        DateTime,
        nullable=False,
        default=func.now()
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        onupdate=func.now()
    )
