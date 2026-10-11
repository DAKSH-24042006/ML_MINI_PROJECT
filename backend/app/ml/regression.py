import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from backend.app.services.feature_engineering import TelemetryFeatureExtractor

class RegressionEngine:
    """
    Trains and compares Regression models for F1 Lap Time prediction:
    1. Linear Regression
    2. Decision Tree Regressor
    3. Support Vector Regressor (SVR)
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.features = TelemetryFeatureExtractor.FEATURE_COLUMNS

    def run_regression_pipeline(self, df: pd.DataFrame, test_size: float = 0.25) -> Dict[str, Any]:
        available_features = [f for f in self.features if f in df.columns]
        if not available_features or len(df) < 6:
            raise ValueError("Insufficient data or missing features to perform regression analysis.")

        X = df[available_features].values
        y = df['lap_time'].values

        # Split train & test sets (ensuring academic integrity: no data leakage)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=self.random_state
        )

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        models = {
            "Linear Regression": LinearRegression(),
            "Decision Tree": DecisionTreeRegressor(max_depth=5, min_samples_leaf=2, random_state=self.random_state),
            "Support Vector Regressor (SVR)": SVR(kernel='rbf', C=10.0, epsilon=0.1)
        }

        results = []
        predictions_sample = []

        best_model_name = None
        lowest_rmse = float("inf")

        dt_feature_importances = {}

        for name, model in models.items():
            # Fit model
            if name == "Decision Tree":
                # Decision Tree can use unscaled or scaled; scaled works identically
                model.fit(X_train_scaled, y_train)
                # Extract feature importances
                dt_feature_importances = {
                    feat: round(float(imp), 4)
                    for feat, imp in zip(available_features, model.feature_importances_)
                }
            else:
                model.fit(X_train_scaled, y_train)

            # Predictions
            y_pred_test = model.predict(X_test_scaled)
            y_pred_train = model.predict(X_train_scaled)

            # Metrics
            mae = mean_absolute_error(y_test, y_pred_test)
            rmse = root_mean_squared_error(y_test, y_pred_test)
            r2 = r2_score(y_test, y_pred_test)
            r2_train = r2_score(y_train, y_pred_train)

            if rmse < lowest_rmse:
                lowest_rmse = rmse
                best_model_name = name

            results.append({
                "model": name,
                "mae": round(float(mae), 4),
                "rmse": round(float(rmse), 4),
                "r2_test": round(float(r2), 4),
                "r2_train": round(float(r2_train), 4)
            })

            # Record predictions comparison for visualization (first 15 test items)
            if len(predictions_sample) == 0:
                for idx in range(min(15, len(y_test))):
                    predictions_sample.append({
                        "sample_idx": idx + 1,
                        "actual_lap_time": round(float(y_test[idx]), 3),
                        name: round(float(y_pred_test[idx]), 3)
                    })
            else:
                for idx in range(min(15, len(y_test))):
                    predictions_sample[idx][name] = round(float(y_pred_test[idx]), 3)

        return {
            "metrics": results,
            "best_model": best_model_name,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "predictions_sample": predictions_sample,
            "feature_importances": dt_feature_importances
        }
