import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from backend.app.services.corner_service import DRIVER_BENCHMARK_PROFILES

MONZA_POLE_TIME = 84.444 # Carlos Sainz 2023 Pole

class CornerMLEngine:
    """
    Machine Learning Engine operating on Corner-by-Corner and Straight telemetry features.
    1. Linear Regression (OLS) - Physical segment sensitivity coefficients
    2. Decision Tree Regressor - Feature importance ranking per turn/straight
    3. Support Vector Regressor (SVR) - Non-linear lap time prediction
    4. K-Means Clustering - Driving style classification
    """

    FEATURE_KEYS = [
        "c1_apex", "c2_apex", "c3_apex", "c4_apex", "c5_apex",
        "s1_top", "s2_top", "s3_top", "s4_top", "s5_top", "s6_top"
    ]

    FEATURE_LABELS = {
        "c1_apex": "T1-T2 Rettifilo Chicane Apex",
        "c2_apex": "T4-T5 Roggia Chicane Apex",
        "c3_apex": "T6-T7 Lesmo Complex Apex",
        "c4_apex": "T8-T10 Ascari Chicane Apex",
        "c5_apex": "T11 Parabolica Apex",
        "s1_top": "Main Straight Top Speed",
        "s2_top": "Curva Grande Full Throttle Speed",
        "s3_top": "Lesmo Approach Speed",
        "s4_top": "Serraglio Straight Top Speed",
        "s5_top": "Back Straight Top Speed",
        "s6_top": "Pit Straight Top Speed"
    }

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.lr_model = LinearRegression()
        self.dt_model = DecisionTreeRegressor(max_depth=4, random_state=random_state)
        self.svr_model = SVR(kernel='rbf', C=10.0, epsilon=0.05)
        self.kmeans_model = KMeans(n_clusters=2, random_state=random_state, n_init=10)
        self._fit_models()

    def _generate_synthetic_dataset(self) -> pd.DataFrame:
        """
        Builds a robust academic dataset of laps with realistic corner & straight telemetry
        grounded in the 9 drivers' historical Monza performances.
        """
        records = []
        np.random.seed(self.random_state)

        for driver, profile in DRIVER_BENCHMARK_PROFILES.items():
            base_time = profile["base_lap"]
            c1_base = profile["C1"]["apex_speed"]
            c2_base = profile["C2"]["apex_speed"]
            c3_base = profile["C3"]["apex_speed"]
            c4_base = profile["C4"]["apex_speed"]
            c5_base = profile["C5"]["apex_speed"]

            s1_base = profile["S1"]["top_speed"]
            s2_base = profile["S2"]["top_speed"]
            s3_base = profile["S3"]["top_speed"]
            s4_base = profile["S4"]["top_speed"]
            s5_base = profile["S5"]["top_speed"]
            s6_base = profile["S6"]["top_speed"]

            # Generate 25 distinct clean laps per driver with realistic variations
            for lap_idx in range(25):
                noise = np.random.normal(0, 0.12)
                fuel_burn = -0.025 * lap_idx
                deg_penalty = 0.04 * max(0, lap_idx - 6)

                c1 = c1_base + np.random.normal(0, 0.9)
                c2 = c2_base + np.random.normal(0, 0.8)
                c3 = c3_base + np.random.normal(0, 0.7)
                c4 = c4_base + np.random.normal(0, 0.7)
                c5 = c5_base + np.random.normal(0, 0.8)

                s1 = s1_base + np.random.normal(0, 1.2)
                s2 = s2_base + np.random.normal(0, 0.9)
                s3 = s3_base + np.random.normal(0, 0.8)
                s4 = s4_base + np.random.normal(0, 1.1)
                s5 = s5_base + np.random.normal(0, 1.2)
                s6 = s6_base + np.random.normal(0, 0.9)

                # Physics: higher apex and higher straight speeds reduce lap time
                corner_delta = (
                    -0.032 * (c1 - c1_base) +
                    -0.024 * (c2 - c2_base) +
                    -0.028 * (c3 - c3_base) +
                    -0.035 * (c4 - c4_base) +
                    -0.038 * (c5 - c5_base)
                )

                straight_delta = (
                    -0.028 * (s1 - s1_base) +
                    -0.012 * (s2 - s2_base) +
                    -0.008 * (s3 - s3_base) +
                    -0.024 * (s4 - s4_base) +
                    -0.026 * (s5 - s5_base) +
                    -0.014 * (s6 - s6_base)
                )

                lap_time = base_time + corner_delta + straight_delta + fuel_burn + deg_penalty + noise

                records.append({
                    "driver": driver,
                    "lap_number": lap_idx + 1,
                    "c1_apex": round(c1, 2),
                    "c2_apex": round(c2, 2),
                    "c3_apex": round(c3, 2),
                    "c4_apex": round(c4, 2),
                    "c5_apex": round(c5, 2),
                    "s1_top": round(s1, 2),
                    "s2_top": round(s2, 2),
                    "s3_top": round(s3, 2),
                    "s4_top": round(s4, 2),
                    "s5_top": round(s5, 2),
                    "s6_top": round(s6, 2),
                    "lap_time": round(lap_time, 3)
                })

        return pd.DataFrame(records)

    def _fit_models(self):
        """Fits all models on the dataset."""
        df = self._generate_synthetic_dataset()
        X = df[self.FEATURE_KEYS].values
        y = df["lap_time"].values

        X_scaled = self.scaler.fit_transform(X)

        self.lr_model.fit(X_scaled, y)
        self.dt_model.fit(X, y) # Unscaled for direct decision tree splits
        self.svr_model.fit(X_scaled, y)

        # Style clustering on corner features
        corner_X = df[["c1_apex", "c2_apex", "c3_apex", "c4_apex", "c5_apex"]].values
        self.kmeans_model.fit(corner_X)

    def get_feature_importances(self) -> List[Dict[str, Any]]:
        """Returns MDI feature importances from Decision Tree."""
        importances = self.dt_model.feature_importances_
        results = []
        for key, imp in zip(self.FEATURE_KEYS, importances):
            results.append({
                "feature": key,
                "label": self.FEATURE_LABELS[key],
                "importance_pct": round(float(imp) * 100.0, 2),
                "is_corner": key.startswith("c")
            })
        results.sort(key=lambda x: x["importance_pct"], reverse=True)
        return results

    def predict_custom_lap(self, inputs: Dict[str, float]) -> Dict[str, Any]:
        """
        Predicts lap time from custom user-controlled corner & straight parameters.
        """
        # Defaults to Monza baseline
        defaults = {
            "c1_apex": 75.5,
            "c2_apex": 118.5,
            "c3_apex": 168.5,
            "c4_apex": 196.5,
            "c5_apex": 218.5,
            "s1_top": 352.0,
            "s2_top": 312.0,
            "s3_top": 272.0,
            "s4_top": 338.0,
            "s5_top": 346.0,
            "s6_top": 332.0
        }

        feature_vector = np.array([[
            float(inputs.get(k, defaults[k])) for k in self.FEATURE_KEYS
        ]])

        feature_vector_scaled = self.scaler.transform(feature_vector)

        # Predict across models
        pred_lr = float(self.lr_model.predict(feature_vector_scaled)[0])
        pred_dt = float(self.dt_model.predict(feature_vector)[0])
        pred_svr = float(self.svr_model.predict(feature_vector_scaled)[0])

        ensemble_lap = round(0.5 * pred_svr + 0.3 * pred_lr + 0.2 * pred_dt, 3)
        delta_vs_pole = round(ensemble_lap - MONZA_POLE_TIME, 3)

        # Style classification
        corner_vector = feature_vector[:, :5]
        cluster_id = int(self.kmeans_model.predict(corner_vector)[0])
        driving_style = "V-Shape / Late Braker" if cluster_id == 0 else "U-Shape / Momentum Roller"

        return {
            "predicted_lap_time": ensemble_lap,
            "linear_regression_pred": round(pred_lr, 3),
            "svr_pred": round(pred_svr, 3),
            "decision_tree_pred": round(pred_dt, 3),
            "monza_pole_benchmark": MONZA_POLE_TIME,
            "delta_vs_pole": delta_vs_pole,
            "is_faster_than_pole": delta_vs_pole <= 0,
            "driving_style": driving_style,
            "feature_importances": self.get_feature_importances()
        }

corner_ml_engine = CornerMLEngine()
