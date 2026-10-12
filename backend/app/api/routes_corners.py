from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional
from backend.app.services.corner_service import corner_service, DRIVER_TEAMS
from backend.app.ml.corner_ml import corner_ml_engine

router = APIRouter()

@router.get("/monza/layout")
async def get_monza_layout():
    """Returns official Monza layout with turns, straights, and meter windows."""
    return corner_service.get_layout()

@router.get("/drivers")
async def get_available_drivers():
    """Returns available drivers with their team affiliations and brand colors."""
    return DRIVER_TEAMS

@router.get("/compare")
async def compare_drivers(
    d1: str = Query("VER", description="Driver 1 code"),
    d2: str = Query("HAM", description="Driver 2 code"),
    season: int = Query(2023, description="Championship season: 2023 or 2024"),
    session: str = Query("R", description="Session type: R (Race) or Q (Qualifying)")
):
    """
    Computes spatial continuous delta (350 points) and turn-by-turn winner attribution
    illuminated with driver team colors for specified season and session format.
    """
    return corner_service.compare_two_drivers(d1=d1, d2=d2, season=season, session_type=session)

@router.get("/importances")
async def get_turn_importances():
    """Returns Decision Tree feature importances for all corners and straights at Monza."""
    return corner_ml_engine.get_feature_importances()

@router.post("/predict-lap")
async def predict_custom_lap(payload: Dict[str, float] = Body(...)):
    """
    Accepts user-tuned corner apex speeds and straight top speeds to predict lap time
    and calculate delta vs Monza Pole.
    """
    return corner_ml_engine.predict_custom_lap(payload)

@router.get("/monza/real-3d")
async def get_monza_real_3d():
    """
    Returns authentic FastF1 3D GPS coordinates (X, Y, Z) and telemetry
    (Distance, Speed, Throttle, Brake) from Carlos Sainz's 2023 Monza Pole lap.
    """
    import os, json
    json_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample", "monza_real_3d.json")
    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            return json.load(f)
    return []

