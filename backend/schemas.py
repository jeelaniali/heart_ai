"""
schemas.py
Pydantic request/response schemas for Heart Disease Prediction API.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any


# ── Input Schema ───────────────────────────────────────────────────────────────

class PatientInput(BaseModel):
    age:      float = Field(..., ge=1,   le=120,  description="Age in years")
    sex:      float = Field(..., ge=0,   le=1,    description="Sex (0=Female, 1=Male)")
    cp:       float = Field(..., ge=0,   le=3,    description="Chest pain type (0-3)")
    trestbps: float = Field(..., ge=50,  le=300,  description="Resting blood pressure (mm Hg)")
    chol:     float = Field(..., ge=50,  le=700,  description="Serum cholesterol (mg/dl)")
    fbs:      float = Field(..., ge=0,   le=1,    description="Fasting blood sugar > 120 mg/dl (1=True)")
    restecg:  float = Field(..., ge=0,   le=2,    description="Resting ECG results (0-2)")
    thalach:  float = Field(..., ge=50,  le=250,  description="Maximum heart rate achieved")
    exang:    float = Field(..., ge=0,   le=1,    description="Exercise induced angina (1=Yes)")
    oldpeak:  float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise")
    slope:    float = Field(..., ge=0,   le=2,    description="Slope of peak exercise ST segment (0-2)")
    ca:       float = Field(..., ge=0,   le=3,    description="Number of major vessels (0-3)")
    thal:     float = Field(..., ge=1,   le=3,    description="Thalassemia (1=Normal, 2=Fixed defect, 3=Reversable defect)")

    model_config = {"json_schema_extra": {
        "example": {
            "age": 52, "sex": 1, "cp": 0, "trestbps": 125,
            "chol": 212, "fbs": 0, "restecg": 1, "thalach": 168,
            "exang": 0, "oldpeak": 1.0, "slope": 2, "ca": 2, "thal": 3
        }
    }}


# ── Response Schemas ───────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    probability: float
    prediction:  int
    label:       str
    risk_level:  str
    risk_color:  str
    input:       Dict[str, float]


class ShapValue(BaseModel):
    feature:     str
    label:       str
    value:       float
    shap_value:  float
    direction:   str  # "increases" | "decreases"


class ExplainResponse(BaseModel):
    shap_values:      List[ShapValue]
    base_value:       float
    prediction_output: float
    top_risk_feature: str


class SensitivityResult(BaseModel):
    feature:       str
    label:         str
    delta_pct:     float
    original_risk: float
    new_risk:      float
    direction:     str   # "▲" | "▼"
    impact:        str   # "High" | "Medium" | "Low"


class SensitivityResponse(BaseModel):
    results:             List[SensitivityResult]
    highest_impact:      str
    baseline_probability: float


class ReportSection(BaseModel):
    title:   str
    content: str


class ReportResponse(BaseModel):
    patient_summary:   Dict[str, Any]
    risk_assessment:   str
    clinical_findings: List[str]
    lifestyle_advice:  List[Dict[str, str]]
    sections:          List[ReportSection]
    generated_at:      str
    disclaimer:        str
