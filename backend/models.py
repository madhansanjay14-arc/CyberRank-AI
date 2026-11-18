from pydantic import BaseModel, Field


class IncidentInput(BaseModel):
    """Validated input describing one security incident."""

    title: str = Field(min_length=1, description="Short incident name")
    description: str = Field(min_length=1, description="What the alert detected")
    severity: int = Field(ge=1, le=5, description="Severity from 1 (low) to 5 (critical)")
    data_sensitivity: int = Field(ge=1, le=5, description="Sensitivity from 1 (public) to 5 (highly sensitive)")
    asset_importance: int = Field(ge=1, le=5, description="Importance from 1 (low) to 5 (critical)")
    attack_confidence: int = Field(ge=1, le=5, description="Confidence from 1 (low) to 5 (high)")
    affected_users: int = Field(ge=0, description="Number of users affected")
    business_impact: int = Field(ge=1, le=5, description="Impact from 1 (low) to 5 (critical)")
