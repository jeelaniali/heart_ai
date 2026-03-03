"""
core/config.py
Application configuration using environment variables.
"""

import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(os.getenv("MODELS_DIR", BASE_DIR / "models"))

MODEL_PATH  = MODELS_DIR / "heart_model.pt"
SCALER_PATH = MODELS_DIR / "scaler.pkl"

# ── API Settings ───────────────────────────────────────────────────────────────
API_TITLE       = "Heart Disease Prediction API"
API_DESCRIPTION = "AI-powered cardiac risk assessment with SHAP explainability"
API_VERSION     = "2.0.0"

# ── CORS ───────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://*.vercel.app"
).split(",")

# ── Feature Definitions ────────────────────────────────────────────────────────
FEATURE_NAMES = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal"
]

FEATURE_LABELS = {
    "age":      "Age (years)",
    "sex":      "Sex",
    "cp":       "Chest Pain Type",
    "trestbps": "Resting Blood Pressure",
    "chol":     "Serum Cholesterol",
    "fbs":      "Fasting Blood Sugar",
    "restecg":  "Resting ECG",
    "thalach":  "Max Heart Rate",
    "exang":    "Exercise Angina",
    "oldpeak":  "ST Depression",
    "slope":    "ST Slope",
    "ca":       "Major Vessels",
    "thal":     "Thalassemia",
}

FEATURE_DESCRIPTIONS = {
    "age":      "Patient age in years — risk increases with age.",
    "sex":      "Biological sex: 0 = Female, 1 = Male.",
    "cp":       "Chest pain type: 0=Typical angina, 1=Atypical, 2=Non-anginal, 3=Asymptomatic.",
    "trestbps": "Resting blood pressure in mm Hg at hospital admission.",
    "chol":     "Serum cholesterol level in mg/dl. High values indicate elevated risk.",
    "fbs":      "Fasting blood sugar > 120 mg/dl: 1=True, 0=False.",
    "restecg":  "Resting ECG result: 0=Normal, 1=ST-T abnormality, 2=LV hypertrophy.",
    "thalach":  "Maximum heart rate achieved during exercise stress test.",
    "exang":    "Exercise-induced angina: 1=Yes, 0=No.",
    "oldpeak":  "ST depression induced by exercise relative to rest.",
    "slope":    "Slope of peak exercise ST segment: 0=Upsloping, 1=Flat, 2=Downsloping.",
    "ca":       "Number of major vessels (0–3) colored by fluoroscopy.",
    "thal":     "Thalassemia: 1=Normal, 2=Fixed defect, 3=Reversible defect.",
}

# ── Clinical Thresholds ────────────────────────────────────────────────────────
CLINICAL_THRESHOLDS = {
    "trestbps": {"safe": 120, "caution": 140, "unit": "mm Hg", "label": "Blood Pressure"},
    "chol":     {"safe": 200, "caution": 240, "unit": "mg/dl",  "label": "Cholesterol"},
    "thalach":  {"min_safe": 100, "unit": "bpm", "label": "Max Heart Rate"},
    "fbs":      {"threshold": 1, "unit": "",     "label": "Fasting Blood Sugar"},
}

# ── Risk Levels ────────────────────────────────────────────────────────────────
def get_risk_level(probability: float) -> dict:
    if probability >= 0.75:
        return {"level": "Critical", "color": "#ef4444", "bg": "#7f1d1d"}
    elif probability >= 0.55:
        return {"level": "High",     "color": "#f97316", "bg": "#7c2d12"}
    elif probability >= 0.35:
        return {"level": "Moderate", "color": "#eab308", "bg": "#713f12"}
    else:
        return {"level": "Low",      "color": "#22c55e", "bg": "#14532d"}
