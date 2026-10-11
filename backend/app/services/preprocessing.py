import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

class TelemetryPreprocessor:
    """
    Cleans raw lap and telemetry datasets:
    - Filters out in-laps and out-laps (pit visits)
    - Excludes non-accurate/invalid laps
    - Eliminates safety car / yellow flag / outlier laps using adaptive median thresholds
    - Provides detailed preprocessing audit metrics for academic demonstration
    """

    @staticmethod
    def clean_laps_data(laps_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        raw_count = len(laps_df)
        if raw_count == 0:
            return laps_df, {"raw_laps": 0, "clean_laps": 0, "removed_laps": 0}

        df = laps_df.copy()

        # Step 1: Remove in-laps and out-laps
        in_out_mask = (
            df['PitInTime'].isna() if 'PitInTime' in df.columns else pd.Series(True, index=df.index)
        ) & (
            df['PitOutTime'].isna() if 'PitOutTime' in df.columns else pd.Series(True, index=df.index)
        )
        removed_in_out = raw_count - int(in_out_mask.sum())
        df = df[in_out_mask].copy()

        # Step 2: Remove unrepresentative laps where IsAccurate is explicitly False
        if 'IsAccurate' in df.columns:
            accurate_mask = df['IsAccurate'].astype(bool)
            removed_inaccurate = len(df) - int(accurate_mask.sum())
            df = df[accurate_mask].copy()
        else:
            removed_inaccurate = 0

        # Step 3: Ensure LapTime is valid numeric seconds
        if 'LapTime' in df.columns and pd.api.types.is_timedelta64_dtype(df['LapTime']):
            df['LapTimeSeconds'] = df['LapTime'].dt.total_seconds()
        elif 'LapTimeSeconds' not in df.columns and 'LapTime' in df.columns:
            df['LapTimeSeconds'] = pd.to_numeric(df['LapTime'], errors='coerce')

        df = df.dropna(subset=['LapTimeSeconds']).copy()
        df = df[df['LapTimeSeconds'] > 40.0]  # Minimum realistic F1 lap time in seconds

        # Step 4: Safety car / Extreme outlier filtering (lap time > 1.25x session median)
        session_median = df['LapTimeSeconds'].median()
        session_q25 = df['LapTimeSeconds'].quantile(0.25)
        session_q75 = df['LapTimeSeconds'].quantile(0.75)
        iqr = session_q75 - session_q25
        upper_cutoff = session_median * 1.20  # Laps slower than 120% of median are SC or errors
        
        valid_lap_mask = (df['LapTimeSeconds'] <= upper_cutoff)
        removed_outliers = len(df) - int(valid_lap_mask.sum())
        clean_df = df[valid_lap_mask].copy()

        stats = {
            "raw_laps": raw_count,
            "clean_laps": len(clean_df),
            "removed_in_out_laps": int(removed_in_out),
            "removed_inaccurate_laps": int(removed_inaccurate),
            "removed_outlier_sc_laps": int(removed_outliers),
            "total_removed": raw_count - len(clean_df),
            "session_median_lap_time": round(float(session_median), 3) if not pd.isna(session_median) else 0.0,
            "lap_time_cutoff_threshold": round(float(upper_cutoff), 3) if not pd.isna(upper_cutoff) else 0.0,
            "drivers_count": int(clean_df['Driver'].nunique()) if 'Driver' in clean_df.columns else 0
        }

        return clean_df, stats

    @staticmethod
    def clean_telemetry_trace(telemetry_df: pd.DataFrame) -> pd.DataFrame:
        """Cleans and forward-fills high-frequency telemetry samples for smooth visualization."""
        if telemetry_df.empty:
            return telemetry_df
        
        tel = telemetry_df.copy()
        
        # Ensure numerical columns are numeric
        numeric_cols = ['Speed', 'Throttle', 'Brake', 'RPM', 'nGear', 'Distance']
        for col in numeric_cols:
            if col in tel.columns:
                tel[col] = pd.to_numeric(tel[col], errors='coerce')

        tel = tel.sort_values(by='Distance' if 'Distance' in tel.columns else tel.columns[0])
        tel = tel.ffill().bfill()
        return tel
