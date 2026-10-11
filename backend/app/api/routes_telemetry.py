from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import numpy as np

from backend.app.api.routes_data import ACTIVE_SESSION_DATA, data_service
from backend.app.utils.serialization import sanitize_for_json

router = APIRouter(prefix="/telemetry", tags=["Telemetry & EDA Traces"])

@router.get("/compare")
def compare_driver_telemetry(
    season: int = Query(2023),
    grand_prix: str = Query("Monza"),
    session_type: str = Query("R"),
    driver_1: str = Query("VER"),
    driver_2: str = Query("HAM")
):
    """
    Returns continuous distance-aligned telemetry curves for two drivers
    (Speed, Throttle, Brake, Gear, RPM vs Distance) for track section comparison.
    """
    try:
        data = data_service.get_telemetry_trace_comparison(
            season=season,
            grand_prix=grand_prix,
            session_type=session_type,
            driver_1=driver_1,
            driver_2=driver_2
        )
        return sanitize_for_json(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch telemetry trace: {str(e)}")

@router.get("/eda/correlations")
def get_feature_correlations():
    """Calculates correlation matrix across numeric telemetry features for EDA heatmap."""
    try:
        from backend.app.api.routes_models import get_active_dataframe
        from backend.app.services.feature_engineering import TelemetryFeatureExtractor

        df = get_active_dataframe()
        features = [col for col in TelemetryFeatureExtractor.FEATURE_COLUMNS if col in df.columns]
        if "lap_time" in df.columns and "lap_time" not in features:
            features.append("lap_time")

        corr_matrix = df[features].corr().round(3)

        # Convert to matrix structure for visualization
        matrix_data = []
        for feat_row in features:
            row_dict = {"feature": feat_row}
            for feat_col in features:
                row_dict[feat_col] = float(corr_matrix.loc[feat_row, feat_col])
            matrix_data.append(row_dict)

        return sanitize_for_json({
            "features": features,
            "correlation_matrix": matrix_data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation computation failed: {str(e)}")
