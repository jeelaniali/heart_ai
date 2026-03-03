"""
routes/explain.py
POST /explain — SHAP explainability endpoint.
"""

from fastapi import APIRouter, HTTPException
from schemas import PatientInput, ExplainResponse
from services.shap_service import run_shap_explanation
import logging

router = APIRouter(prefix="/explain", tags=["Explainability"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ExplainResponse, summary="Compute SHAP feature attributions")
async def explain(patient: PatientInput):
    """
    Compute SHAP values for each input feature using DeepExplainer.

    Returns a ranked list of feature attributions, the SHAP base value,
    model output, and the single highest-risk feature.
    """
    try:
        return run_shap_explanation(patient)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("SHAP explanation failed")
        raise HTTPException(status_code=500, detail=str(e))
