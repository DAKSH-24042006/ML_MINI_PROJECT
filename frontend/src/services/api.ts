const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchAvailableSessions() {
  const res = await fetch(`${API_BASE_URL}/data/sessions`);
  if (!res.ok) throw new Error('Failed to fetch available sessions');
  return res.json();
}

export async function loadSessionData(params: {
  season: number;
  grand_prix: string;
  session_type: string;
  drivers?: string[];
}) {
  const res = await fetch(`${API_BASE_URL}/data/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to load session telemetry data');
  return res.json();
}

export async function fetchCurrentDataset() {
  const res = await fetch(`${API_BASE_URL}/data/current`);
  if (!res.ok) throw new Error('Failed to fetch current dataset status');
  return res.json();
}

export async function runRegression(testSize: number = 0.25) {
  const res = await fetch(`${API_BASE_URL}/models/regression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_size: testSize }),
  });
  if (!res.ok) throw new Error('Failed to execute regression models');
  return res.json();
}

export async function runClassification(testSize: number = 0.25) {
  const res = await fetch(`${API_BASE_URL}/models/classification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_size: testSize }),
  });
  if (!res.ok) throw new Error('Failed to execute classification models');
  return res.json();
}

export async function runClustering(k: number = 3) {
  const res = await fetch(`${API_BASE_URL}/models/clustering`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ k }),
  });
  if (!res.ok) throw new Error('Failed to execute clustering');
  return res.json();
}

export async function fetchFeatureImportance() {
  const res = await fetch(`${API_BASE_URL}/models/feature-importance`);
  if (!res.ok) throw new Error('Failed to fetch feature importances');
  return res.json();
}

export async function fetchTelemetryComparison(params: {
  season: number;
  grand_prix: string;
  session_type: string;
  driver_1: string;
  driver_2: string;
}) {
  const query = new URLSearchParams({
    season: params.season.toString(),
    grand_prix: params.grand_prix,
    session_type: params.session_type,
    driver_1: params.driver_1,
    driver_2: params.driver_2,
  });
  const res = await fetch(`${API_BASE_URL}/telemetry/compare?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch telemetry comparison');
  return res.json();
}

export async function fetchCorrelationMatrix() {
  const res = await fetch(`${API_BASE_URL}/telemetry/eda/correlations`);
  if (!res.ok) throw new Error('Failed to fetch correlation matrix');
  return res.json();
}

export async function predictCustomLap(params: {
  avg_speed?: number;
  max_speed?: number;
  min_speed?: number;
  speed_std?: number;
  avg_throttle?: number;
  full_throttle_pct?: number;
  brake_pct?: number;
  braking_intensity_avg?: number;
  avg_rpm?: number;
  max_rpm?: number;
  avg_gear?: number;
  gear_shifts_count?: number;
  drs_usage_pct?: number;
  tyre_age?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/models/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to predict custom telemetry lap');
  return res.json();
}

export async function fetchCornerLayout() {
  const res = await fetch(`${API_BASE_URL}/corners/monza/layout`);
  if (!res.ok) throw new Error('Failed to fetch Monza corner layout');
  return res.json();
}

export async function compareCorners(
  driver1: string = 'VER',
  driver2: string = 'HAM',
  season: number = 2023,
  session: string = 'R'
) {
  const query = new URLSearchParams({
    d1: driver1,
    d2: driver2,
    season: season.toString(),
    session: session
  });
  const res = await fetch(`${API_BASE_URL}/corners/compare?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch corner comparison');
  return res.json();
}

export async function fetchCornerImportances() {
  const res = await fetch(`${API_BASE_URL}/corners/importances`);
  if (!res.ok) throw new Error('Failed to fetch corner importances');
  return res.json();
}

export async function predictCornerLap(params: Record<string, number>) {
  const res = await fetch(`${API_BASE_URL}/corners/predict-lap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to predict corner-based lap');
  return res.json();
}

