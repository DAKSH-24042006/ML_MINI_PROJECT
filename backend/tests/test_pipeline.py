import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.services.fastf1_service import FastF1DataService
from backend.app.ml.regression import RegressionEngine
from backend.app.ml.classification import ClassificationEngine
from backend.app.ml.clustering import ClusteringEngine

def test_full_ml_pipeline():
    print("=== Testing F1 ML Pipeline ===")
    service = FastF1DataService()
    
    # 1. Load session data
    session_result = service.load_session_data(
        season=2023, grand_prix="Monza", session_type="R", selected_drivers=["VER", "HAM", "LEC", "NOR"]
    )
    df = session_result["features_df"]
    print(f"Data source: {session_result['source']}")
    print(f"Loaded {len(df)} laps. Columns: {list(df.columns)}")
    assert len(df) > 0, "DataFrame should not be empty"
    assert "lap_time" in df.columns, "lap_time must be present"
    assert "is_high_performance" in df.columns, "is_high_performance must be present"

    # 2. Test Regression
    reg_engine = RegressionEngine()
    reg_res = reg_engine.run_regression_pipeline(df)
    print("\n--- Regression Results ---")
    for m in reg_res["metrics"]:
        print(f"  {m['model']}: MAE={m['mae']}, RMSE={m['rmse']}, R2_test={m['r2_test']}")
    print(f"Best regression model: {reg_res['best_model']}")
    print(f"DT Feature Importances: {list(reg_res['feature_importances'].keys())[:5]}")

    # 3. Test Classification
    clf_engine = ClassificationEngine()
    clf_res = clf_engine.run_classification_pipeline(df)
    print("\n--- Classification Results ---")
    for m in clf_res["metrics"]:
        print(f"  {m['model']}: Accuracy={m['accuracy']}, Precision={m['precision']}, Recall={m['recall']}, F1={m['f1_score']}")
    print(f"Best classification model: {clf_res['best_model']}")
    print(f"Confusion Matrices: {clf_res['confusion_matrices']}")

    # 4. Test Clustering
    cluster_engine = ClusteringEngine()
    cluster_res = cluster_engine.run_clustering_pipeline(df, k=3)
    print("\n--- Clustering Results ---")
    for c in cluster_res["clusters"]:
        print(f"  Cluster {c['cluster_id']}: {c['label']} (size={c['size']}, avg_speed={c['avg_speed']} km/h)")
    print(f"Explained Variance: {cluster_res['explained_variance_pct']}")

    # 5. Test Telemetry trace comparison
    trace_res = service.get_telemetry_trace_comparison(season=2023, grand_prix="Monza", driver_1="VER", driver_2="HAM")
    print(f"\nTelemetry trace comparison generated: {len(trace_res['telemetry_points'])} points.")
    
    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_full_ml_pipeline()
