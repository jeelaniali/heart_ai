"""
services/report_service.py
Smart Medical Report Generator.

Produces a clinically-structured narrative report combining:
  - Prediction results
  - SHAP explanations
  - Clinical guideline thresholds
  - Personalised lifestyle advisories

Preserves all original clinical guideline logic.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any

from schemas import PatientInput, ReportResponse, ReportSection
from core.model_loader import get_model_and_scaler, preprocess_input, predict_single
from core.config import FEATURE_LABELS, CLINICAL_THRESHOLDS, get_risk_level

logger = logging.getLogger(__name__)


# ── Clinical Lifestyle Advisory Logic (original, preserved) ───────────────────

def _generate_lifestyle_advice(input_dict: dict, risk_level: str) -> List[Dict[str, str]]:
    """
    Clinical guideline-based lifestyle advisory.
    Returns list of {category, status, advice, severity} dicts.
    """
    advice = []

    # Blood Pressure
    bp = input_dict["trestbps"]
    if bp > 140:
        advice.append({
            "category": "Blood Pressure",
            "status":   "Danger",
            "severity": "danger",
            "advice":   (
                f"Resting BP of {bp:.0f} mm Hg is Stage 2 Hypertension. "
                "Seek immediate medical evaluation. Adopt a low-sodium diet (<2,300 mg/day), "
                "increase aerobic activity, and consider antihypertensive medication if prescribed."
            ),
        })
    elif bp > 120:
        advice.append({
            "category": "Blood Pressure",
            "status":   "Caution",
            "severity": "caution",
            "advice":   (
                f"BP of {bp:.0f} mm Hg indicates Elevated/Stage 1 Hypertension. "
                "Reduce sodium intake, practice stress management techniques (mindfulness, yoga), "
                "and monitor blood pressure weekly."
            ),
        })
    else:
        advice.append({
            "category": "Blood Pressure",
            "status":   "Optimal",
            "severity": "safe",
            "advice":   f"BP of {bp:.0f} mm Hg is within healthy range. Maintain current lifestyle habits.",
        })

    # Cholesterol
    chol = input_dict["chol"]
    if chol > 240:
        advice.append({
            "category": "Cholesterol",
            "status":   "Danger",
            "severity": "danger",
            "advice":   (
                f"Cholesterol of {chol:.0f} mg/dl is classified as High. "
                "Follow an ACC/AHA heart-healthy diet: reduce saturated fat (<6% of calories), "
                "eliminate trans fats, increase soluble fibre (oats, beans), and discuss statin therapy with your physician."
            ),
        })
    elif chol > 200:
        advice.append({
            "category": "Cholesterol",
            "status":   "Borderline",
            "severity": "caution",
            "advice":   (
                f"Cholesterol of {chol:.0f} mg/dl is borderline high. "
                "Limit dietary cholesterol to <300 mg/day, increase omega-3 intake (fatty fish 2×/week), "
                "and retest in 3 months."
            ),
        })
    else:
        advice.append({
            "category": "Cholesterol",
            "status":   "Optimal",
            "severity": "safe",
            "advice":   f"Cholesterol of {chol:.0f} mg/dl is within desirable range.",
        })

    # Max Heart Rate
    thalach    = input_dict["thalach"]
    age        = input_dict["age"]
    max_hr_pct = (thalach / (220 - age)) * 100 if age < 220 else 0

    if max_hr_pct < 60:
        advice.append({
            "category": "Cardiovascular Fitness",
            "status":   "Poor",
            "severity": "danger",
            "advice":   (
                f"Max heart rate of {thalach:.0f} bpm is only {max_hr_pct:.0f}% of age-predicted maximum. "
                "Begin supervised cardiac rehabilitation. Gradually increase aerobic exercise to 150 min/week "
                "of moderate intensity (brisk walking, cycling)."
            ),
        })
    elif max_hr_pct < 80:
        advice.append({
            "category": "Cardiovascular Fitness",
            "status":   "Moderate",
            "severity": "caution",
            "advice":   (
                f"Max heart rate of {thalach:.0f} bpm is {max_hr_pct:.0f}% of age-predicted maximum. "
                "Increase physical activity to AHA-recommended 150 min/week moderate or 75 min/week vigorous activity."
            ),
        })
    else:
        advice.append({
            "category": "Cardiovascular Fitness",
            "status":   "Good",
            "severity": "safe",
            "advice":   f"Max heart rate of {thalach:.0f} bpm ({max_hr_pct:.0f}% of predicted maximum) suggests adequate cardiovascular fitness.",
        })

    # Fasting Blood Sugar
    if input_dict["fbs"] == 1:
        advice.append({
            "category": "Blood Sugar",
            "status":   "Elevated",
            "severity": "caution",
            "advice":   (
                "Fasting blood sugar > 120 mg/dl suggests possible pre-diabetes or diabetes. "
                "Consult an endocrinologist. Adopt a low-glycaemic diet, increase physical activity, "
                "and monitor HbA1c every 3 months."
            ),
        })

    # Exercise Angina
    if input_dict["exang"] == 1:
        advice.append({
            "category": "Exercise Tolerance",
            "status":   "Impaired",
            "severity": "danger",
            "advice":   (
                "Exercise-induced angina is present. This is a significant cardiac warning sign. "
                "Avoid strenuous unmonitored exercise. Seek cardiology consultation for stress test evaluation "
                "and potential coronary artery disease workup."
            ),
        })

    # ST Depression
    oldpeak = input_dict["oldpeak"]
    if oldpeak > 2.0:
        advice.append({
            "category": "ECG Pattern",
            "status":   "Abnormal",
            "severity": "danger",
            "advice":   (
                f"ST depression of {oldpeak:.1f} mm is clinically significant. "
                "This indicates myocardial ischaemia. Immediate cardiology referral is recommended. "
                "Avoid intense physical exertion until evaluated."
            ),
        })

    return advice


def _generate_clinical_findings(input_dict: dict, risk_level: str) -> List[str]:
    """Generate structured clinical observations."""
    findings = []

    risk_pct = {"Low": "< 35%", "Moderate": "35–55%", "High": "55–75%", "Critical": "> 75%"}
    findings.append(
        f"Predicted cardiac risk falls in the {risk_level} category "
        f"({risk_pct.get(risk_level, 'Unknown')} probability range)."
    )

    sex_str = "Male" if input_dict["sex"] == 1 else "Female"
    findings.append(f"Patient is a {input_dict['age']:.0f}-year-old {sex_str}.")

    cp_map = {0: "Typical angina", 1: "Atypical angina", 2: "Non-anginal pain", 3: "Asymptomatic"}
    findings.append(f"Chest pain type: {cp_map.get(int(input_dict['cp']), 'Unknown')}.")

    thal_map = {1: "Normal", 2: "Fixed defect", 3: "Reversible defect"}
    findings.append(f"Thalassemia status: {thal_map.get(int(input_dict['thal']), 'Unknown')}.")

    findings.append(
        f"Number of major vessels visualised on fluoroscopy: {int(input_dict['ca'])}."
    )

    slope_map = {0: "Upsloping (favourable)", 1: "Flat (borderline)", 2: "Downsloping (unfavourable)"}
    findings.append(f"Peak exercise ST segment slope: {slope_map.get(int(input_dict['slope']), 'Unknown')}.")

    return findings


def generate_report(patient: PatientInput) -> ReportResponse:
    """
    Generate a complete smart medical report for a patient.
    """
    model, scaler = get_model_and_scaler()
    input_dict    = patient.model_dump()

    X_scaled = preprocess_input(input_dict, scaler)
    result   = predict_single(model, X_scaled)
    prob     = result["probability"]
    risk_lvl = result["risk_level"]

    lifestyle_advice  = _generate_lifestyle_advice(input_dict, risk_lvl)
    clinical_findings = _generate_clinical_findings(input_dict, risk_lvl)

    # ── Report Sections ────────────────────────────────────────────────────────
    sex_str  = "Male"   if input_dict["sex"] == 1 else "Female"
    cp_map   = {0: "Typical angina", 1: "Atypical angina", 2: "Non-anginal pain", 3: "Asymptomatic"}
    thal_map = {1: "Normal", 2: "Fixed defect", 3: "Reversible defect"}

    sections = [
        ReportSection(
            title   = "Executive Summary",
            content = (
                f"This AI-generated cardiac risk assessment report evaluates the likelihood of "
                f"heart disease based on 13 clinical parameters. The predictive model — a deep "
                f"neural network trained on the UCI Heart Disease dataset — estimates a "
                f"{'HIGH' if prob >= 0.5 else 'LOW'} probability of cardiac disease at "
                f"{prob * 100:.1f}% (Risk Level: {risk_lvl}). "
                f"{'Immediate clinical evaluation is strongly recommended.' if prob >= 0.5 else 'Continue preventive monitoring and healthy lifestyle practices.'}"
            ),
        ),
        ReportSection(
            title   = "Patient Demographics",
            content = (
                f"Age: {input_dict['age']:.0f} years | Sex: {sex_str} | "
                f"Chest Pain Type: {cp_map.get(int(input_dict['cp']), 'Unknown')} | "
                f"Thalassemia: {thal_map.get(int(input_dict['thal']), 'Unknown')}"
            ),
        ),
        ReportSection(
            title   = "Haemodynamic Parameters",
            content = (
                f"Resting Blood Pressure: {input_dict['trestbps']:.0f} mm Hg | "
                f"Serum Cholesterol: {input_dict['chol']:.0f} mg/dl | "
                f"Fasting Blood Sugar >120 mg/dl: {'Yes' if input_dict['fbs'] == 1 else 'No'} | "
                f"Maximum Heart Rate: {input_dict['thalach']:.0f} bpm"
            ),
        ),
        ReportSection(
            title   = "Electrocardiographic Findings",
            content = (
                f"Resting ECG: {['Normal', 'ST-T Wave Abnormality', 'Left Ventricular Hypertrophy'][int(input_dict['restecg'])]} | "
                f"Exercise-Induced Angina: {'Present' if input_dict['exang'] == 1 else 'Absent'} | "
                f"ST Depression (Oldpeak): {input_dict['oldpeak']:.1f} mm | "
                f"ST Slope: {['Upsloping', 'Flat', 'Downsloping'][int(input_dict['slope'])]} | "
                f"Major Vessels (Fluoroscopy): {int(input_dict['ca'])}"
            ),
        ),
        ReportSection(
            title   = "Risk Stratification",
            content = (
                f"The model outputs a risk probability of {prob * 100:.1f}%, placing this patient "
                f"in the {risk_lvl} risk category. "
                + (
                    "Patients in this category have a substantially elevated likelihood of significant "
                    "coronary artery disease. Prompt cardiology referral and comprehensive diagnostic "
                    "workup (stress echocardiogram, coronary angiography) are indicated."
                    if prob >= 0.55 else
                    "Patients in this category should maintain regular cardiovascular screening and "
                    "adhere to AHA/ACC primary prevention guidelines."
                )
            ),
        ),
        ReportSection(
            title   = "Recommendations",
            content = (
                "1. Follow up with a board-certified cardiologist within 2 weeks.\n"
                "2. Obtain a 12-lead resting ECG and fasting lipid panel.\n"
                "3. Consider exercise stress testing under clinical supervision.\n"
                "4. Adhere to prescribed pharmacotherapy (antihypertensives, statins if indicated).\n"
                "5. Implement dietary modifications per AHA Heart-Healthy Diet guidelines.\n"
                "6. Target ≥150 minutes of moderate-intensity aerobic activity per week.\n"
                "7. Monitor blood pressure and blood glucose at regular intervals."
            ) if prob >= 0.5 else (
                "1. Schedule routine annual cardiovascular screening.\n"
                "2. Maintain a heart-healthy diet low in saturated fats and sodium.\n"
                "3. Sustain ≥150 minutes of moderate aerobic exercise per week.\n"
                "4. Avoid smoking and limit alcohol to ≤1 standard drink/day (women) or ≤2/day (men).\n"
                "5. Manage stress through evidence-based techniques (mindfulness, cognitive therapy).\n"
                "6. Re-evaluate with updated clinical measurements in 12 months."
            ),
        ),
    ]

    patient_summary = {
        "age":          input_dict["age"],
        "sex":          sex_str,
        "risk_level":   risk_lvl,
        "probability":  round(prob * 100, 1),
        "prediction":   result["label"],
        "trestbps":     input_dict["trestbps"],
        "chol":         input_dict["chol"],
        "thalach":      input_dict["thalach"],
    }

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    logger.info(f"Medical report generated. Risk={risk_lvl}, Prob={prob:.4f}")

    return ReportResponse(
        patient_summary   = patient_summary,
        risk_assessment   = result["label"],
        clinical_findings = clinical_findings,
        lifestyle_advice  = lifestyle_advice,
        sections          = sections,
        generated_at      = generated_at,
        disclaimer        = (
            "DISCLAIMER: This report is generated by an AI system and is intended for "
            "research and educational purposes only. It does NOT constitute medical advice, "
            "diagnosis, or treatment. Always consult a qualified healthcare professional "
            "for medical decisions. The model's predictions are probabilistic and may not "
            "reflect individual clinical reality."
        ),
    )
