export interface SessionInfo {
  season: number;
  round: number;
  country: string;
  location: string;
  event_name: string;
  session: string;
  session_name: string;
  key_drivers: string[];
}

export interface PreprocessingStats {
  raw_laps: number;
  clean_laps: number;
  removed_in_out_laps: number;
  removed_inaccurate_laps: number;
  removed_outlier_sc_laps: number;
  total_removed: number;
  session_median_lap_time: number;
  lap_time_cutoff_threshold: number;
  drivers_count: number;
}

export interface DriverSummary {
  driver: string;
  laps_completed: number;
  best_lap_time: number;
  avg_lap_time: number;
  avg_speed: number;
  max_speed: number;
  avg_full_throttle: number;
  avg_braking: number;
  lap_consistency_std: number;
}

export interface RegressionMetric {
  model: string;
  mae: number;
  rmse: number;
  r2_test: number;
  r2_train: number;
}

export interface RegressionResponse {
  metrics: RegressionMetric[];
  best_model: string;
  train_samples: number;
  test_samples: number;
  predictions_sample: Array<{
    sample_idx: number;
    actual_lap_time: number;
    [modelName: string]: number;
  }>;
  feature_importances: Record<string, number>;
}

export interface ClassificationMetric {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface ConfusionMatrix {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface ClassificationResponse {
  metrics: ClassificationMetric[];
  confusion_matrices: Record<string, ConfusionMatrix>;
  best_model: string;
  train_samples: number;
  test_samples: number;
  threshold_used_seconds: number;
}

export interface ClusterSummary {
  cluster_id: number;
  label: string;
  size: number;
  percentage: number;
  avg_speed: number;
  full_throttle_pct: number;
  brake_pct: number;
  avg_lap_time: number;
  avg_tyre_age: number;
  drivers_represented: string[];
}

export interface ClusteringResponse {
  k: number;
  explained_variance_pct: number[];
  clusters: ClusterSummary[];
  scatter_points: Array<{
    driver: string;
    lap_number: number;
    lap_time: number;
    cluster: number;
    pca_x: number;
    pca_y: number;
    avg_speed: number;
  }>;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  percentage: number;
}

export interface TelemetryPoint {
  distance: number;
  [key: string]: number;
}

export interface TelemetryCompareResponse {
  driver_1: { code: string; lap_time: number };
  driver_2: { code: string; lap_time: number };
  telemetry_points: TelemetryPoint[];
}

export interface CustomPredictResponse {
  status: string;
  predicted_lap_time: number;
  predicted_lap_formatted: string;
  median_benchmark: number;
  delta_vs_median: number;
  is_high_performance: boolean;
  performance_label: string;
  confidence_pct: number;
  cluster_id: number;
  cluster_label: string;
  sector_splits: {
    sector_1: number;
    sector_2: number;
    sector_3: number;
  };
}
