"""
services/prediction_service.py
Orchestrates the full prediction pipeline:
  raw input → preprocessing → inference → structured response.
"""

import logging
from schemas import PatientInput, PredictionResponse
from core.model_loader import get_model_and_scaler, preprocess_input, predict_single

logger = logging.getLogger(__name__)


def run_prediction(patient: PatientInput) -> PredictionResponse:
    """
    Main prediction entry-point.

    1. Load cached model + scaler
    2. Preprocess feature dict → scaled array
    3. Forward pass → probability
    4. Return structured PredictionResponse
    """
    model, scaler = get_model_and_scaler()

    input_dict = patient.model_dump()
    X_scaled   = preprocess_input(input_dict, scaler)
    result     = predict_single(model, X_scaled)

    logger.info(
        f"Prediction: prob={result['probability']:.4f} "
        f"level={result['risk_level']}"
    )

    return PredictionResponse(
        probability = result["probability"],
        prediction  = result["prediction"],
        label       = result["label"],
        risk_level  = result["risk_level"],
        risk_color  = result["risk_color"],
        input       = input_dict,
    )
