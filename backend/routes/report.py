"""
routes/report.py
POST /report — Smart Medical Report Generator endpoint.
"""

from fastapi import APIRouter, HTTPException
from schemas import PatientInput, ReportResponse
from services.report_service import generate_report
import logging

router = APIRouter(prefix="/report", tags=["Report"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ReportResponse, summary="Generate smart medical report")
async def report(patient: PatientInput):
    """
    Generate a comprehensive, clinically-structured medical report.

    Combines prediction, clinical guideline thresholds, and
    lifestyle advisory into a hospital-style document.
    """
    try:
        return generate_report(patient)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Report generation failed")
        raise HTTPException(status_code=500, detail=str(e))
