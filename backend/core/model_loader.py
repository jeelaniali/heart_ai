"""
core/model_loader.py
Loads the PyTorch model and StandardScaler once at application startup.
All other services import the singletons from here.
"""

import pickle
import logging
from pathlib import Path
from typing import Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

# ── Lazy singletons ────────────────────────────────────────────────────────────
_model  = None
_scaler = None


# ── PyTorch Neural Network Definition ─────────────────────────────────────────
# Must match the architecture used during training exactly.

def _build_model_class():
    import torch
    import torch.nn as nn

    class HeartNN(nn.Module):
        def __init__(self, input_dim: int = 13):
            super().__init__()
            self.network = nn.Sequential(
                nn.Linear(input_dim, 128),  # 0
                nn.BatchNorm1d(128),         # 1
                nn.ReLU(),                   # 2
                nn.Dropout(0.3),             # 3
                nn.Linear(128, 64),          # 4
                nn.BatchNorm1d(64),          # 5
                nn.ReLU(),                   # 6
                nn.Dropout(0.3),             # 7
                nn.Linear(64, 32),           # 8
                nn.BatchNorm1d(32),          # 9
                nn.ReLU(),                   # 10
                nn.Dropout(0.2),             # 11
                nn.Linear(32, 1),            # 12
                nn.Sigmoid(),                # 13
            )

        def forward(self, x):
            return self.network(x)

    return HeartNN

def load_model(model_path: Optional[Path] = None):
    """
    Load the trained PyTorch model from disk.
    Caches in module-level singleton after first load.
    """
    global _model
    if _model is not None:
        return _model

    from core.config import MODEL_PATH
    path = model_path or MODEL_PATH

    import torch
    HeartNN = _build_model_class()

    checkpoint = torch.load(str(path), map_location=torch.device("cpu"))
    
    # Handle checkpoints saved as dict with metadata
    if isinstance(checkpoint, dict) and "model_state" in checkpoint:
        input_dim  = checkpoint.get("input_dim", 13)
        state_dict = checkpoint["model_state"]
    else:
        input_dim  = 13
        state_dict = checkpoint

    model = HeartNN(input_dim=input_dim)
    model.load_state_dict(state_dict)
    model.eval()

    _model = model
    logger.info(f"Model loaded from {path}")
    return _model


def load_scaler(scaler_path: Optional[Path] = None):
    """
    Load the fitted StandardScaler from disk.
    Caches in module-level singleton after first load.
    """
    global _scaler
    if _scaler is not None:
        return _scaler

    from core.config import SCALER_PATH
    path = scaler_path or SCALER_PATH

    with open(str(path), "rb") as f:
        _scaler = pickle.load(f)

    logger.info(f"Scaler loaded from {path}")
    return _scaler


def get_model_and_scaler() -> Tuple:
    """Convenience function — returns (model, scaler) tuple."""
    return load_model(), load_scaler()


def preprocess_input(input_dict: dict, scaler) -> "np.ndarray":
    """
    Convert a raw feature dict → scaled numpy array.
    Preserves original feature order as defined in FEATURE_NAMES.
    """
    from core.config import FEATURE_NAMES
    import numpy as np

    row = np.array([[input_dict[f] for f in FEATURE_NAMES]], dtype=np.float32)
    return scaler.transform(row)


def predict_single(model, X_scaled: "np.ndarray") -> dict:
    """
    Run forward pass and return structured prediction result.
    Does NOT modify model weights (inference only).
    """
    import torch

    tensor = torch.tensor(X_scaled, dtype=torch.float32)
    with torch.no_grad():
        probability = model(tensor).item()

    from core.config import get_risk_level
    risk_info = get_risk_level(probability)

    return {
        "probability": round(probability, 4),
        "prediction":  int(probability >= 0.5),
        "label":       "Heart Disease Detected" if probability >= 0.5 else "No Heart Disease Detected",
        "risk_level":  risk_info["level"],
        "risk_color":  risk_info["color"],
    }
