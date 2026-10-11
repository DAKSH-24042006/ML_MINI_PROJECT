import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from backend.app.services.feature_engineering import TelemetryFeatureExtractor

class ClassificationEngine:
    """
    Trains and compares Classification models for F1 Lap Performance (High vs Low performance lap):
    1. Logistic Regression
    2. Decision Tree Classifier
    3. Support Vector Classifier (SVC)
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.features = TelemetryFeatureExtractor.FEATURE_COLUMNS

    def run_classification_pipeline(self, df: pd.DataFrame, test_size: float = 0.25) -> Dict[str, Any]:
        available_features = [f for f in self.features if f in df.columns]
        if not available_features or len(df) < 8 or 'is_high_performance' not in df.columns:
            raise ValueError("Insufficient data or missing target to perform classification.")

        X = df[available_features].values
        y = df['is_high_performance'].values

        # Ensure both classes exist
        if len(np.unique(y)) < 2:
            raise ValueError("Target contains only one class. More lap variability required.")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=self.random_state, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=self.random_state),
            "Decision Tree": DecisionTreeClassifier(max_depth=4, min_samples_leaf=2, random_state=self.random_state),
            "Support Vector Machine (SVC)": SVC(kernel='rbf', C=5.0, probability=True, random_state=self.random_state)
        }

        results = []
        confusion_matrices = {}
        best_model_name = None
        highest_f1 = -1.0

        for name, model in models.items():
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)

            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, zero_division=0)
            rec = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            cm = confusion_matrix(y_test, y_pred)

            if f1 > highest_f1:
                highest_f1 = f1
                best_model_name = name

            results.append({
                "model": name,
                "accuracy": round(float(acc), 4),
                "precision": round(float(prec), 4),
                "recall": round(float(rec), 4),
                "f1_score": round(float(f1), 4)
            })

            # Format confusion matrix for UI display
            # cm format: [[TN, FP], [FN, TP]]
            confusion_matrices[name] = {
                "true_negative": int(cm[0][0]) if cm.shape == (2, 2) else 0,
                "false_positive": int(cm[0][1]) if cm.shape == (2, 2) else 0,
                "false_negative": int(cm[1][0]) if cm.shape == (2, 2) else 0,
                "true_positive": int(cm[1][1]) if cm.shape == (2, 2) else 0
            }

        return {
            "metrics": results,
            "confusion_matrices": confusion_matrices,
            "best_model": best_model_name,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "threshold_used_seconds": float(df['median_threshold'].iloc[0]) if 'median_threshold' in df.columns else float(df['lap_time'].median())
        }
