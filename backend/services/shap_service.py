"""
services/shap_service.py
SHAP-based model explainability service.
Uses DeepExplainer for PyTorch neural networks.
ML logic is preserved exactly — no simplification.
"""

import logging
import numpy as np
from typing import List

from schemas import PatientInput, ExplainResponse, ShapValue
from core.model_loader import get_model_and_scaler, preprocess_input
from core.config import FEATURE_NAMES, FEATURE_LABELS, FEATURE_DESCRIPTIONS

logger = logging.getLogger(__name__)


def _get_background_data(scaler) -> "np.ndarray":
    """
    Generate synthetic background dataset for SHAP baseline.
    Uses feature midpoints scaled through the original scaler.
    In production this should be replaced with a sample of real training data.
    """
    # Representative midpoints for each feature (based on UCI Heart Disease dataset statistics)
    midpoints = {
        "age":      54.0,
        "sex":       0.68,
        "cp":        0.97,
        "trestbps": 131.6,
        "chol":     246.3,
        "fbs":       0.15,
        "restecg":   0.53,
        "thalach":  149.6,
        "exang":     0.33,
        "oldpeak":   1.04,
        "slope":     1.40,
        "ca":        0.73,
        "thal":      2.31,
    }
    row = np.array([[midpoints[f] for f in FEATURE_NAMES]], dtype=np.float32)
    # Create a small background by slightly perturbing midpoints (100 samples)
    rng = np.random.RandomState(42)
    noise = rng.normal(0, 0.05, (100, len(FEATURE_NAMES))).astype(np.float32)
    background_raw = np.clip(row + noise * row, 0.001, None)
    return scaler.transform(background_raw).astype(np.float32)


def run_shap_explanation(patient: PatientInput) -> ExplainResponse:
    """
    Compute SHAP values for a single patient using DeepExplainer.

    Returns:
        ExplainResponse with per-feature SHAP values, base value,
        prediction output, and the top risk-increasing feature.
    """
    import shap
    import torch

    model, scaler = get_model_and_scaler()
    input_dict    = patient.model_dump()
    X_scaled      = preprocess_input(input_dict, scaler).astype(np.float32)

    # Background dataset for SHAP baseline
    background = _get_background_data(scaler)

    # Convert to tensors
    background_tensor = torch.tensor(background, dtype=torch.float32)
    input_tensor      = torch.tensor(X_scaled,   dtype=torch.float32)

    # ── SHAP DeepExplainer (unchanged ML logic) ────────────────────────────────
    explainer   = shap.DeepExplainer(model, background_tensor)
    shap_values = explainer.shap_values(input_tensor)  # shape: (1, 13)

    # shap_values may be list (binary) or ndarray — handle both
    if isinstance(shap_values, list):
        sv = np.array(shap_values[0]).flatten()
    else:
        sv = np.array(shap_values).flatten()

    base_value       = float(explainer.expected_value[0]) if hasattr(explainer.expected_value, '__len__') else float(explainer.expected_value)
    prediction_output = float(model(input_tensor).detach().numpy().flatten()[0])

    # ── Build response objects ─────────────────────────────────────────────────
    raw_input = [input_dict[f] for f in FEATURE_NAMES]

    shap_list: List[ShapValue] = []
    for i, fname in enumerate(FEATURE_NAMES):
        sv_val    = float(sv[i])
        direction = "increases" if sv_val > 0 else "decreases"
        shap_list.append(ShapValue(
            feature    = fname,
            label      = FEATURE_LABELS.get(fname, fname),
            value      = raw_input[i],
            shap_value = round(sv_val, 6),
            direction  = direction,
        ))

    # Sort by absolute SHAP value descending
    shap_list.sort(key=lambda x: abs(x.shap_value), reverse=True)

    # Top risk-increasing feature
    top_risk = next(
        (s.label for s in shap_list if s.direction == "increases"),
        shap_list[0].label
    )

    logger.info(f"SHAP explanation computed. Base={base_value:.4f}, Output={prediction_output:.4f}")

    return ExplainResponse(
        shap_values       = shap_list,
        base_value        = round(base_value, 6),
        prediction_output = round(prediction_output, 6),
        top_risk_feature  = top_risk,
    )
