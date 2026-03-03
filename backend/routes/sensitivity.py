"""
routes/sensitivity.py
POST /sensitivity — Risk Sensitivity Analyzer endpoint.
"""

from fastapi import APIRouter, HTTPException
from schemas import PatientInput, SensitivityResponse
from services.sensitivity_service import run_sensitivity_analysis
import logging

router = APIRouter(prefix="/sensitivity", tags=["Sensitivity"])
logger = logging.getLogger(__name__)


@router.post("", response_model=SensitivityResponse, summary="Risk sensitivity analysis")
async def sensitivity(patient: PatientInput):
    """
    Run local perturbation analysis on continuous features.

    Each feature is perturbed by +10% and the resulting change in
    cardiac risk probability is computed and ranked.
    """
    try:
        return run_sensitivity_analysis(patient)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Sensitivity analysis failed")
        raise HTTPException(status_code=500, detail=str(e))
