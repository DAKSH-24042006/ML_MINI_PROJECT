import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from backend.app.services.feature_engineering import TelemetryFeatureExtractor

class ClusteringEngine:
    """
    K-Means unsupervised clustering on telemetry features:
    - Normalizes multi-dimensional telemetry features
    - Applies KMeans(n_clusters=k)
    - Performs PCA 2D projection for intuitive visualization
    - Automatically generates dynamic cluster interpretations based on centroid stats
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.features = TelemetryFeatureExtractor.FEATURE_COLUMNS

    def run_clustering_pipeline(self, df: pd.DataFrame, k: int = 3) -> Dict[str, Any]:
        available_features = [f for f in self.features if f in df.columns]
        if not available_features or len(df) < k:
            raise ValueError(f"Need at least {k} data points to run K-Means.")

        X = df[available_features].values

        # Scaling
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # K-Means model
        kmeans = KMeans(n_clusters=k, random_state=self.random_state, n_init=10)
        labels = kmeans.fit_predict(X_scaled)

        # PCA 2-component projection for 2D visualization
        pca = PCA(n_components=2, random_state=self.random_state)
        pca_coords = pca.fit_transform(X_scaled)
        explained_variance = [round(float(v) * 100, 2) for v in pca.explained_variance_ratio_]

        # Attach cluster labels to temporary working dataframe
        cluster_df = df.copy()
        cluster_df['cluster'] = labels
        cluster_df['pca_x'] = pca_coords[:, 0]
        cluster_df['pca_y'] = pca_coords[:, 1]

        # Calculate cluster summaries and dynamic interpretation
        cluster_summaries = []
        overall_mean_speed = df['avg_speed'].mean() if 'avg_speed' in df else 200.0
        overall_mean_throttle = df['full_throttle_pct'].mean() if 'full_throttle_pct' in df else 50.0
        overall_mean_brake = df['brake_pct'].mean() if 'brake_pct' in df else 15.0

        for cluster_id in range(k):
            subset = cluster_df[cluster_df['cluster'] == cluster_id]
            size = len(subset)
            if size == 0:
                continue

            c_speed = float(subset['avg_speed'].mean()) if 'avg_speed' in subset else 0.0
            c_throttle = float(subset['full_throttle_pct'].mean()) if 'full_throttle_pct' in subset else 0.0
            c_brake = float(subset['brake_pct'].mean()) if 'brake_pct' in subset else 0.0
            c_lap_time = float(subset['lap_time'].mean()) if 'lap_time' in subset else 0.0
            c_tyre_age = float(subset['tyre_age'].mean()) if 'tyre_age' in subset else 0.0

            # Dynamic interpretation generation
            style_traits = []
            if c_speed > overall_mean_speed:
                style_traits.append("High Speed / Push Lap")
            else:
                style_traits.append("Conservative Pace")

            if c_throttle > overall_mean_throttle:
                style_traits.append("High Throttle Commitment")
            
            if c_brake > overall_mean_brake:
                style_traits.append("Heavy Braking Demands")
            
            if c_tyre_age > 15:
                style_traits.append("High Tyre Degradation Stint")
            elif c_tyre_age < 5:
                style_traits.append("Fresh Tyre Window")

            label_title = f"Cluster {cluster_id + 1}: " + " - ".join(style_traits[:2])

            cluster_summaries.append({
                "cluster_id": cluster_id,
                "label": label_title,
                "size": size,
                "percentage": round((size / len(df)) * 100, 1),
                "avg_speed": round(c_speed, 2),
                "full_throttle_pct": round(c_throttle, 2),
                "brake_pct": round(c_brake, 2),
                "avg_lap_time": round(c_lap_time, 3),
                "avg_tyre_age": round(c_tyre_age, 1),
                "drivers_represented": list(subset['driver'].unique()) if 'driver' in subset else []
            })

        # Points for 2D scatter plot
        scatter_points = []
        for _, row in cluster_df.iterrows():
            scatter_points.append({
                "driver": str(row.get("driver", "UNK")),
                "lap_number": int(row.get("lap_number", 0)),
                "lap_time": round(float(row.get("lap_time", 0.0)), 3),
                "cluster": int(row["cluster"]),
                "pca_x": round(float(row["pca_x"]), 3),
                "pca_y": round(float(row["pca_y"]), 3),
                "avg_speed": round(float(row.get("avg_speed", 0.0)), 2)
            })

        return {
            "k": k,
            "explained_variance_pct": explained_variance,
            "clusters": cluster_summaries,
            "scatter_points": scatter_points
        }
