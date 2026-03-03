"""
services/sensitivity_service.py
Risk Sensitivity Analyzer — local perturbation analysis.

For each continuous feature, perturbs it by ±10% and measures
the resulting change in predicted cardiac risk probability.
Preserves original perturbation logic exactly.
"""

import logging
import numpy as np
from typing import List

from schemas import PatientInput, SensitivityResponse, SensitivityResult
from core.model_loader import get_model_and_scaler, preprocess_input, predict_single
from core.config import FEATURE_NAMES, FEATURE_LABELS

logger = logging.getLogger(__name__)

# Features to analyze (exclude binary/ordinal categoricals)
SENSITIVITY_FEATURES = ["age", "trestbps", "chol", "thalach", "oldpeak"]

PERTURBATION_PCT = 0.10  # ±10%


def _classify_impact(delta_abs: float) -> str:
    if delta_abs >= 0.10:
        return "High"
    elif delta_abs >= 0.04:
        return "Medium"
    return "Low"


def run_sensitivity_analysis(patient: PatientInput) -> SensitivityResponse:
    """
    Perturb each continuous feature by +10% and measure risk delta.

    Algorithm (preserved from original):
      1. Get baseline probability
      2. For each feature in SENSITIVITY_FEATURES:
         a. Create a copy of input with feature × 1.10
         b. Re-preprocess and re-predict
         c. Compute delta = new_prob - baseline_prob
      3. Sort by |delta| descending
      4. Tag highest-impact feature
    """
    model, scaler = get_model_and_scaler()
    input_dict    = patient.model_dump()

    # ── Baseline ───────────────────────────────────────────────────────────────
    X_base           = preprocess_input(input_dict, scaler)
    baseline_result  = predict_single(model, X_base)
    baseline_prob    = baseline_result["probability"]

    results: List[SensitivityResult] = []

    for feature in SENSITIVITY_FEATURES:
        original_val = input_dict[feature]

        # +10% perturbation (clamp to feature valid range where necessary)
        perturbed_val = original_val * (1 + PERTURBATION_PCT)

        perturbed_dict          = dict(input_dict)
        perturbed_dict[feature] = perturbed_val

        X_perturbed  = preprocess_input(perturbed_dict, scaler)
        pert_result  = predict_single(model, X_perturbed)
        new_prob     = pert_result["probability"]

        delta      = new_prob - baseline_prob
        delta_pct  = delta * 100.0
        direction  = "▲" if delta >= 0 else "▼"
        impact     = _classify_impact(abs(delta))

        results.append(SensitivityResult(
            feature       = feature,
            label         = FEATURE_LABELS.get(feature, feature),
            delta_pct     = round(delta_pct, 2),
            original_risk = round(baseline_prob * 100, 2),
            new_risk      = round(new_prob * 100, 2),
            direction     = direction,
            impact        = impact,
        ))

    # Sort by absolute delta descending
    results.sort(key=lambda r: abs(r.delta_pct), reverse=True)

    highest_impact = results[0].label if results else "N/A"

    logger.info(
        f"Sensitivity analysis done. Baseline={baseline_prob:.4f}. "
        f"Highest impact: {highest_impact}"
    )

    return SensitivityResponse(
        results              = results,
        highest_impact       = highest_impact,
        baseline_probability = round(baseline_prob * 100, 2),
    )
