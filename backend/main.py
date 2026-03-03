"""
main.py
Heart Disease Prediction System — FastAPI Backend
Startup: uvicorn main:app --reload --port 8000
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import (
    API_TITLE, API_DESCRIPTION, API_VERSION,
    ALLOWED_ORIGINS, FEATURE_NAMES, FEATURE_LABELS, FEATURE_DESCRIPTIONS,
)
from routes import predict, explain, sensitivity, report

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level  = logging.INFO,
    format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream = sys.stdout,
)
logger = logging.getLogger(__name__)


# ── Lifespan: load model once at startup ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Heart AI Backend starting up ...")
    try:
        from core.model_loader import get_model_and_scaler
        model, scaler = get_model_and_scaler()
        logger.info("✅ Model and Scaler loaded successfully.")
    except FileNotFoundError:
        logger.warning(
            "⚠️  Model/Scaler files not found. "
            "Endpoints will return 503 until models are placed in ./models/ directory."
        )
    yield
    logger.info("Heart AI Backend shutting down.")


# ── Application ────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = API_TITLE,
    description = API_DESCRIPTION,
    version     = API_VERSION,
    lifespan    = lifespan,
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(explain.router)
app.include_router(sensitivity.router)
app.include_router(report.router)


# ── Root & Health ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Meta"], summary="API info")
async def root():
    return {
        "service":     API_TITLE,
        "version":     API_VERSION,
        "description": API_DESCRIPTION,
        "endpoints": {
            "POST /predict":     "Cardiac risk prediction",
            "POST /explain":     "SHAP feature attributions",
            "POST /sensitivity": "Risk sensitivity analysis",
            "POST /report":      "Smart medical report",
            "GET  /features":   "Feature metadata",
            "GET  /health":     "Health check",
        },
        "docs": "/docs",
    }


@app.get("/health", tags=["Meta"], summary="Health check")
async def health():
    try:
        from core.model_loader import _model, _scaler
        return {
            "status":        "ok",
            "model_loaded":  _model  is not None,
            "scaler_loaded": _scaler is not None,
        }
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "degraded", "error": str(e)})


@app.get("/features", tags=["Meta"], summary="List input features")
async def features():
    return {
        "features": [
            {
                "name":        f,
                "label":       FEATURE_LABELS.get(f, f),
                "description": FEATURE_DESCRIPTIONS.get(f, ""),
            }
            for f in FEATURE_NAMES
        ]
    }
