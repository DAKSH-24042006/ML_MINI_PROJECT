from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import pandas as pd

from backend.app.api.routes_data import ACTIVE_SESSION_DATA, data_service
from backend.app.ml.regression import RegressionEngine
from backend.app.ml.classification import ClassificationEngine
from backend.app.ml.clustering import ClusteringEngine
from backend.app.utils.serialization import sanitize_for_json

router = APIRouter(prefix="/models", tags=["Machine Learning Engines"])

def get_active_dataframe() -> pd.DataFrame:
    if "df" not in ACTIVE_SESSION_DATA or ACTIVE_SESSION_DATA["df"].empty:
        # Auto-load Monza sample
        res = data_service.load_session_data(season=2023, grand_prix="Monza", session_type="R")
        ACTIVE_SESSION_DATA["df"] = res["features_df"]
    return ACTIVE_SESSION_DATA["df"]

class RegressionRequest(BaseModel):
    test_size: float = 0.25

class ClassificationRequest(BaseModel):
    test_size: float = 0.25

class ClusteringRequest(BaseModel):
    k: int = 3

@router.post("/regression")
def run_regression(payload: RegressionRequest = RegressionRequest()):
    """
    Executes Linear Regression, Decision Tree, and SVR to predict lap times.
    Evaluates MAE, RMSE, and R2 dynamically.
    """
    try:
        df = get_active_dataframe()
        engine = RegressionEngine()
        results = engine.run_regression_pipeline(df, test_size=payload.test_size)
        return sanitize_for_json(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regression failed: {str(e)}")

@router.post("/classification")
def run_classification(payload: ClassificationRequest = ClassificationRequest()):
    """
    Executes Logistic Regression, Decision Tree Classifier, and Support Vector Classifier.
    Evaluates Accuracy, Precision, Recall, F1, and Confusion Matrices dynamically.
    """
    try:
        df = get_active_dataframe()
        engine = ClassificationEngine()
        results = engine.run_classification_pipeline(df, test_size=payload.test_size)
        return sanitize_for_json(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@router.post("/clustering")
def run_clustering(payload: ClusteringRequest = ClusteringRequest()):
    """
    Executes K-Means unsupervised clustering on multi-dimensional telemetry.
    Returns 2D PCA projection and dynamically derived cluster behavior interpretations.
    """
    try:
        df = get_active_dataframe()
        engine = ClusteringEngine()
        results = engine.run_clustering_pipeline(df, k=payload.k)
        return sanitize_for_json(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering failed: {str(e)}")

@router.get("/feature-importance")
def get_feature_importance():
    """Extracts ranked telemetry feature importance from trained Decision Tree model."""
    try:
        df = get_active_dataframe()
        engine = RegressionEngine()
        results = engine.run_regression_pipeline(df)
        importances = results.get("feature_importances", {})
        
        # Sort descending
        sorted_features = [
            {"feature": k, "importance": v, "percentage": round(v * 100, 2)}
            for k, v in sorted(importances.items(), key=lambda item: item[1], reverse=True)
        ]
        return sanitize_for_json({"features": sorted_features})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature importance calculation failed: {str(e)}")

class CustomPredictRequest(BaseModel):
    avg_speed: float = 248.5
    max_speed: float = 350.0
    min_speed: float = 80.0
    speed_std: float = 60.0
    avg_throttle: float = 75.0
    full_throttle_pct: float = 70.0
    brake_pct: float = 14.0
    braking_intensity_avg: float = 75.0
    avg_rpm: float = 11000.0
    max_rpm: float = 12400.0
    avg_gear: float = 6.0
    gear_shifts_count: int = 42
    drs_usage_pct: float = 16.5
    tyre_age: float = 5.0

@router.post("/predict")
def predict_custom_lap(payload: CustomPredictRequest):
    """
    Evaluates arbitrary user-provided telemetry inputs through trained ML models in real-time.
    Returns:
    - Predicted Lap Time & Sector splits
    - Delta against session median benchmark
    - Performance classification (High/Low) + confidence probability
    - Assigned driving style cluster
    """
    try:
        from sklearn.preprocessing import StandardScaler
        from sklearn.linear_model import LinearRegression, LogisticRegression
        from sklearn.cluster import KMeans
        from backend.app.services.feature_engineering import TelemetryFeatureExtractor
        import numpy as np

        df = get_active_dataframe()
        features = TelemetryFeatureExtractor.FEATURE_COLUMNS

        X = df[features].values
        y_time = df['lap_time'].values
        y_perf = df['is_high_performance'].values
        median_lap_time = float(df['lap_time'].median())

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # 1. Regressor for lap time
        reg = LinearRegression()
        reg.fit(X_scaled, y_time)

        # 2. Classifier for high/low performance
        clf = LogisticRegression(max_iter=1000)
        clf.fit(X_scaled, y_perf)

        # 3. Clusterer
        km = KMeans(n_clusters=3, random_state=42, n_init=10)
        km.fit(X_scaled)

        # Prepare user input vector
        user_vals = [
            payload.avg_speed,
            payload.max_speed,
            payload.min_speed,
            payload.speed_std,
            payload.avg_throttle,
            payload.full_throttle_pct,
            payload.brake_pct,
            payload.braking_intensity_avg,
            payload.avg_rpm,
            payload.max_rpm,
            payload.avg_gear,
            payload.gear_shifts_count,
            payload.drs_usage_pct,
            payload.tyre_age
        ]

        user_arr = np.array([user_vals])
        user_scaled = scaler.transform(user_arr)

        pred_time = float(reg.predict(user_scaled)[0])
        pred_class = int(clf.predict(user_scaled)[0])
        pred_probs = clf.predict_proba(user_scaled)[0]
        confidence = float(pred_probs[pred_class])
        cluster_id = int(km.predict(user_scaled)[0])

        delta = round(pred_time - median_lap_time, 3)

        # Format lap time as MM:SS.mmm
        minutes = int(pred_time // 60)
        seconds = pred_time % 60
        formatted_lap = f"{minutes}:{seconds:06.3f}" if minutes > 0 else f"{seconds:06.3f}"

        # Estimated sector splits proportional to Monza track sections
        s1 = round(pred_time * 0.311, 3)
        s2 = round(pred_time * 0.320, 3)
        s3 = round(pred_time * 0.369, 3)

        cluster_labels = {
            0: "Cluster 1: Balanced Pace & Tyre Preservation",
            1: "Cluster 2: Heavy Degradation Stint",
            2: "Cluster 3: Aggressive Apex Exit & Maximum Throttle"
        }

        return sanitize_for_json({
            "status": "success",
            "predicted_lap_time": round(pred_time, 3),
            "predicted_lap_formatted": formatted_lap,
            "median_benchmark": round(median_lap_time, 3),
            "delta_vs_median": delta,
            "is_high_performance": bool(pred_class == 1),
            "performance_label": "HIGH PERFORMANCE" if pred_class == 1 else "LOW PERFORMANCE",
            "confidence_pct": round(confidence * 100, 1),
            "cluster_id": cluster_id,
            "cluster_label": cluster_labels.get(cluster_id, f"Cluster {cluster_id + 1}"),
            "sector_splits": {
                "sector_1": s1,
                "sector_2": s2,
                "sector_3": s3
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom prediction failed: {str(e)}")
