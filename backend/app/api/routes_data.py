from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

from backend.app.services.fastf1_service import FastF1DataService
from backend.app.config import CURATED_SESSIONS
from backend.app.utils.serialization import sanitize_for_json

router = APIRouter(prefix="/data", tags=["Data Acquisition & Preprocessing"])
data_service = FastF1DataService()

# Global memory cache of active loaded dataset for session
ACTIVE_SESSION_DATA = {}

class LoadDataRequest(BaseModel):
    season: int = 2023
    grand_prix: str = "Monza"
    session_type: str = "R"
    drivers: Optional[List[str]] = None

@router.get("/sessions")
def get_available_sessions():
    """Returns curated list of Grand Prix sessions available for quick analysis."""
    return {"sessions": CURATED_SESSIONS}

@router.post("/load")
def load_session(payload: LoadDataRequest):
    """Loads and preprocesses lap telemetry data for selected session and drivers."""
    try:
        result = data_service.load_session_data(
            season=payload.season,
            grand_prix=payload.grand_prix,
            session_type=payload.session_type,
            selected_drivers=payload.drivers
        )
        df = result["features_df"]
        ACTIVE_SESSION_DATA["df"] = df
        ACTIVE_SESSION_DATA["metadata"] = {
            "season": payload.season,
            "grand_prix": payload.grand_prix,
            "session_type": payload.session_type,
            "drivers": payload.drivers
        }

        # Summary telemetry statistics
        driver_summary = []
        for drv, grp in df.groupby("driver"):
            driver_summary.append({
                "driver": str(drv),
                "laps_completed": len(grp),
                "best_lap_time": round(float(grp["lap_time"].min()), 3),
                "avg_lap_time": round(float(grp["lap_time"].mean()), 3),
                "avg_speed": round(float(grp["avg_speed"].mean()), 2),
                "max_speed": round(float(grp["max_speed"].max()), 2),
                "avg_full_throttle": round(float(grp["full_throttle_pct"].mean()), 2),
                "avg_braking": round(float(grp["brake_pct"].mean()), 2),
                "lap_consistency_std": round(float(grp["lap_time"].std()), 3) if len(grp) > 1 else 0.0
            })

        return sanitize_for_json({
            "status": "success",
            "source": result["source"],
            "stats": result["stats"],
            "total_laps_analyzed": len(df),
            "driver_summary": driver_summary,
            "sample_records": df.head(10).to_dict(orient="records")
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load session: {str(e)}")

@router.get("/current")
def get_current_dataset_status():
    """Checks whether a dataset is currently loaded in backend memory."""
    if "df" not in ACTIVE_SESSION_DATA:
        # Load default Monza dataset automatically
        result = data_service.load_session_data(season=2023, grand_prix="Monza", session_type="R")
        ACTIVE_SESSION_DATA["df"] = result["features_df"]
        ACTIVE_SESSION_DATA["metadata"] = {"season": 2023, "grand_prix": "Monza", "session_type": "R"}

    df = ACTIVE_SESSION_DATA["df"]
    return sanitize_for_json({
        "loaded": True,
        "metadata": ACTIVE_SESSION_DATA.get("metadata", {}),
        "total_laps": len(df),
        "drivers": list(df["driver"].unique()) if "driver" in df else []
    })
