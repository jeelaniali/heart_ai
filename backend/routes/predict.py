"""
routes/predict.py
POST /predict — cardiac risk prediction endpoint.
"""

from fastapi import APIRouter, HTTPException
from schemas import PatientInput, PredictionResponse
from services.prediction_service import run_prediction
import logging

router = APIRouter(prefix="/predict", tags=["Prediction"])
logger = logging.getLogger(__name__)


@router.post("", response_model=PredictionResponse, summary="Predict cardiac risk")
async def predict(patient: PatientInput):
    """
    Predict the probability of heart disease for a single patient.

    Returns probability (0–1), binary prediction, risk level label,
    and the risk color code for UI rendering.
    """
    try:
        return run_prediction(patient)
    except FileNotFoundError as e:
        logger.error(f"Model file not found: {e}")
        raise HTTPException(status_code=503, detail=f"Model not available: {e}. Run train.py first.")
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(e))
