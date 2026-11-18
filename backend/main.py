from backend.database import engine, Base, SessionLocal
from backend.db_models import Incident
from datetime import date, timedelta
from sqlalchemy import func

# ==========================================
# IMPORTS
# ==========================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

from backend.database import engine, Base, SessionLocal
from backend import db_models
from backend.db_models import Incident

from ml.hybrid import calculate_hybrid_score

from backend.scoring import (
    calculate_risk_details,
    generate_risk_explanation,
    get_recommendations,
)


# ==========================================
# DATABASE INITIALIZATION
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="CyberRank AI",
    description="Intelligent Cyber Incident Prioritization Engine",
    version="1.2.0"
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# INCIDENT INPUT MODEL
# ==========================================

class IncidentInput(BaseModel):

    incident_id: str = Field(min_length=1)
    incident_type: str = Field(min_length=1)

    severity: int = Field(ge=1, le=5)
    data_sensitivity: int = Field(ge=1, le=5)
    asset_importance: int = Field(ge=1, le=5)
    attack_confidence: int = Field(ge=1, le=5)

    affected_users: int = Field(ge=0)

    business_impact: int = Field(ge=1, le=5)

class IncidentStatusUpdate(BaseModel):
    status: str


class IncidentAssignment(BaseModel):
    assigned_to: str


class InvestigationNoteUpdate(BaseModel):
    notes: str


# ==========================================
# DATABASE HELPER
# ==========================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def incident_to_dict(incident):

    return {
        "incident_id": incident.incident_id,
        "incident_type": incident.incident_type,

        "severity": incident.severity,
        "data_sensitivity": incident.data_sensitivity,
        "asset_importance": incident.asset_importance,
        "attack_confidence": incident.attack_confidence,
        "affected_users": incident.affected_users,
        "business_impact": incident.business_impact,

        "rule_score": incident.rule_score,
        "ml_prediction": incident.ml_prediction,
        "final_score": incident.final_score,
        "risk_score": incident.risk_score,

        "priority": incident.priority,

                "status": incident.status,
        "assigned_to": incident.assigned_to,
        "investigation_notes": incident.investigation_notes,
        "created_at": incident.created_at.isoformat() if incident.created_at else None,
        "updated_at": incident.updated_at.isoformat() if incident.updated_at else None,
    }


# ==========================================
# INCIDENT PROCESSING
# ==========================================

def process_incident(incident):

    data = incident.model_dump()

    result = calculate_hybrid_score(data)

    data.update(result)

    data["risk_score"] = data["final_score"]

    return data


# ==========================================
# INCIDENT RANKING
# ==========================================

def rank_incidents(incident_list):

    return sorted(
        incident_list,
        key=lambda x: (
            -(x["final_score"] or 0),
            -x["business_impact"],
            -x["attack_confidence"],
            -x["severity"],
            x["incident_id"]
        )
    )


# ==========================================
# HOME ENDPOINT
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Welcome to CyberRank AI",
        "status": "Running",
        "version": "1.2.0",
        "engine": "Hybrid AI + Explainable AI + SQLite"
    }


# ==========================================
# ADD SINGLE INCIDENT
# ==========================================

@app.post("/incidents")
def add_incident(incident: IncidentInput):

    db = SessionLocal()

    try:

        existing = db.query(Incident).filter(
            Incident.incident_id == incident.incident_id
        ).first()

        if existing:

            raise HTTPException(
                status_code=409,
                detail="Incident ID already exists"
            )

        data = process_incident(incident)

        new_incident = Incident(**data)

        db.add(new_incident)
        db.commit()
        db.refresh(new_incident)

        return {
            "message": "Incident successfully analysed and saved",
            "incident": incident_to_dict(new_incident)
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        db.close()


# ==========================================
# ADD MULTIPLE INCIDENTS
# ==========================================

@app.post("/incidents/bulk")
def add_bulk_incidents(new_incidents: List[IncidentInput]):

    db = SessionLocal()

    try:

        results = []

        batch_ids = set()

        for incident in new_incidents:

            incident_id = incident.incident_id

            if incident_id in batch_ids:
                raise HTTPException(
                    status_code=409,
                    detail=f"Duplicate incident ID: {incident_id}"
                )

            batch_ids.add(incident_id)

            existing = db.query(Incident).filter(
                Incident.incident_id == incident_id
            ).first()

            if existing:
                raise HTTPException(
                    status_code=409,
                    detail=f"Duplicate incident ID: {incident_id}"
                )

            data = process_incident(incident)

            new_record = Incident(**data)

            db.add(new_record)

            results.append(data)

        db.commit()

        return {
            "total_processed": len(results),
            "ranked_incidents": rank_incidents(results)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        db.close()


# ==========================================
# GET ALL RANKED INCIDENTS
# ==========================================

@app.get("/incidents/ranked")
def get_ranked_incidents(status: str = None):

    db = SessionLocal()

    try:
        query = db.query(Incident)

        if status:
            allowed_statuses = [
                "OPEN",
                "INVESTIGATING",
                "RESOLVED",
                "CLOSED"
            ]

            status_filter = status.strip().upper()

            if status_filter not in allowed_statuses:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid status filter"
                )

            query = query.filter(
                Incident.status == status_filter
            )

        records = query.all()

        incident_list = [
            incident_to_dict(item)
            for item in records
        ]

        ranked = rank_incidents(incident_list)

        return {
            "total_incidents": len(ranked),
            "incidents": ranked,
            "status_filter": status.upper() if status else "ALL"
        }

    finally:
        db.close()


# ==========================================
# GET INCIDENT AI ANALYSIS
# ==========================================

@app.get("/incidents/{incident_id}/analysis")
def get_incident_analysis(incident_id: str):

    db = SessionLocal()

    try:

        incident = db.query(Incident).filter(
            Incident.incident_id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        data = incident_to_dict(incident)

        risk_details = calculate_risk_details(data)

        priority = data["priority"]

        explanation = generate_risk_explanation(
            risk_details["factor_details"],
            priority
        )

        recommendations = get_recommendations(priority)

        return {
            "incident_id": data["incident_id"],
            "incident_type": data["incident_type"],

            "rule_score": risk_details["rule_score"],
            "ml_prediction": data["ml_prediction"],
            "final_score": data["final_score"],

            "priority": priority,

            "factor_details": risk_details["factor_details"],

            "explanation": explanation,

            "recommendations": recommendations,

            "model_note": (
                "The ML prediction is based on a model trained "
                "using synthetic data and is not a validated "
                "real-world attack probability."
            )
        }

    finally:
        db.close()


# ==========================================
# GET INDIVIDUAL INCIDENT
# ==========================================

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):

    db = SessionLocal()

    try:

        incident = db.query(Incident).filter(
            Incident.incident_id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        return incident_to_dict(incident)

    finally:
        db.close()


# ==========================================
# ==========================================
# ==========================================
# ASSIGN INCIDENT TO TEAM MEMBER
# ==========================================



# UPDATE INCIDENT STATUS
# ==========================================
# ==========================================
# ASSIGN INCIDENT TO TEAM MEMBER
# ==========================================

@app.patch("/incidents/{incident_id}/assign")
def assign_incident(
    incident_id: str,
    assignment: IncidentAssignment
):
    db = SessionLocal()

    try:
        incident = db.query(Incident).filter(
            Incident.incident_id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        assigned_to = assignment.assigned_to.strip()

        if not assigned_to:
            raise HTTPException(
                status_code=400,
                detail="Team member name cannot be empty"
            )

        incident.assigned_to = assigned_to

        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident assigned successfully",
            "incident": incident_to_dict(incident)
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))

    finally:
        db.close()


# ==========================================
# UPDATE INVESTIGATION NOTES
# ==========================================

@app.patch("/incidents/{incident_id}/notes")
def update_investigation_notes(
    incident_id: str,
    note_update: InvestigationNoteUpdate
):
    db = SessionLocal()

    try:
        incident = db.query(Incident).filter(
            Incident.incident_id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        incident.investigation_notes = note_update.notes.strip()

        db.commit()
        db.refresh(incident)

        return {
            "message": "Investigation notes saved successfully",
            "incident": incident_to_dict(incident)
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))

    finally:
        db.close()
@app.patch("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    update: IncidentStatusUpdate
):
    db = SessionLocal()

    try:
        incident = db.query(Incident).filter(
            Incident.incident_id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        allowed_statuses = [
            "OPEN",
            "INVESTIGATING",
            "RESOLVED",
            "CLOSED"
        ]

        new_status = update.status.strip().upper()

        if new_status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Choose OPEN, INVESTIGATING, RESOLVED, or CLOSED."
            )

        incident.status = new_status

        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident status updated successfully",
            "incident": incident_to_dict(incident)
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        db.close()

# ==========================================


# ==========================================
# GET INCIDENT STATISTICS
# ==========================================


@app.get("/statistics")
def get_statistics():
    db = SessionLocal()

    try:
        records = db.query(Incident).all()

        total = len(records)

        # Priority distribution
        critical = sum(1 for item in records if item.priority == "CRITICAL")
        high = sum(1 for item in records if item.priority == "HIGH")
        medium = sum(1 for item in records if item.priority == "MEDIUM")
        low = sum(1 for item in records if item.priority == "LOW")

        # Status distribution
        open_count = sum(1 for item in records if item.status == "OPEN")
        investigating = sum(1 for item in records if item.status == "INVESTIGATING")
        resolved = sum(1 for item in records if item.status == "RESOLVED")
        closed = sum(1 for item in records if item.status == "CLOSED")

        return {
            "total_incidents": total,

            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,

            "open": open_count,
            "investigating": investigating,
            "resolved": resolved,
            "closed": closed
        }

    finally:
        db.close()

        # ==========================================
# GET DAILY INCIDENT TRENDS
# ==========================================

@app.get("/analytics/trends")
def get_incident_trends():

    db = SessionLocal()

    try:
        today = date.today()
        start_date = today - timedelta(days=6)

        records = db.query(Incident).filter(
            Incident.created_at >= start_date
        ).all()

        trends = []

        for i in range(7):
            current_date = start_date + timedelta(days=i)

            daily_records = [
                item for item in records
                if item.created_at.date() == current_date
            ]

            trends.append({
                "date": current_date.isoformat(),
                "total": len(daily_records),
                "critical": sum(
                    1 for item in daily_records
                    if item.priority == "CRITICAL"
                ),
                "high": sum(
                    1 for item in daily_records
                    if item.priority == "HIGH"
                ),
                "medium": sum(
                    1 for item in daily_records
                    if item.priority == "MEDIUM"
                ),
                "low": sum(
                    1 for item in daily_records
                    if item.priority == "LOW"
                )
            })

        return {
            "period": "Last 7 days",
            "daily_trends": trends
        }

    finally:
        db.close()
