import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path
import fastf1

MONZA_TOTAL_METERS = 5793.0

# Driver colors palette
DRIVER_TEAMS = {
    "VER": {"team": "Red Bull Racing", "color": "#1e41ff", "secondary": "#fcd800", "name": "Max Verstappen"},
    "PER": {"team": "Red Bull Racing", "color": "#1e41ff", "secondary": "#fcd800", "name": "Sergio Pérez"},
    "SAI": {"team": "Ferrari", "color": "#e80020", "secondary": "#fff", "name": "Carlos Sainz"},
    "LEC": {"team": "Ferrari", "color": "#e80020", "secondary": "#fff", "name": "Charles Leclerc"},
    "HAM": {"team": "Mercedes", "color": "#00d2be", "secondary": "#fff", "name": "Lewis Hamilton"},
    "RUS": {"team": "Mercedes", "color": "#00d2be", "secondary": "#fff", "name": "George Russell"},
    "NOR": {"team": "McLaren", "color": "#ff8000", "secondary": "#47c7fc", "name": "Lando Norris"},
    "PIA": {"team": "McLaren", "color": "#ff8000", "secondary": "#47c7fc", "name": "Oscar Piastri"},
    "ALO": {"team": "Aston Martin", "color": "#006f62", "secondary": "#cedc00", "name": "Fernando Alonso"},
}

# Monza spatial segmentation (11 turns grouped into 5 corner complexes + 6 straights)
MONZA_SEGMENTS = [
    {
        "id": "S1",
        "type": "straight",
        "name": "Main Straight (Rettifilo)",
        "start_m": 0.0,
        "end_m": 1080.0,
        "apex_m": None,
        "turn_numbers": []
    },
    {
        "id": "C1",
        "type": "corner",
        "name": "Variante del Rettifilo (T1-T2)",
        "start_m": 1080.0,
        "end_m": 1320.0,
        "apex_m": 1180.0,
        "turn_numbers": [1, 2]
    },
    {
        "id": "S2",
        "type": "straight",
        "name": "Curva Grande Run (T3)",
        "start_m": 1320.0,
        "end_m": 2100.0,
        "apex_m": None,
        "turn_numbers": [3]
    },
    {
        "id": "C2",
        "type": "corner",
        "name": "Variante della Roggia (T4-T5)",
        "start_m": 2100.0,
        "end_m": 2380.0,
        "apex_m": 2230.0,
        "turn_numbers": [4, 5]
    },
    {
        "id": "S3",
        "type": "straight",
        "name": "Approach to Lesmo",
        "start_m": 2380.0,
        "end_m": 2620.0,
        "apex_m": None,
        "turn_numbers": []
    },
    {
        "id": "C3",
        "type": "corner",
        "name": "Curva di Lesmo 1 & 2 (T6-T7)",
        "start_m": 2620.0,
        "end_m": 3050.0,
        "apex_m": 2850.0,
        "turn_numbers": [6, 7]
    },
    {
        "id": "S4",
        "type": "straight",
        "name": "Curva del Serraglio Straight",
        "start_m": 3050.0,
        "end_m": 4000.0,
        "apex_m": None,
        "turn_numbers": []
    },
    {
        "id": "C4",
        "type": "corner",
        "name": "Variante Ascari (T8-T9-T10)",
        "start_m": 4000.0,
        "end_m": 4400.0,
        "apex_m": 4210.0,
        "turn_numbers": [8, 9, 10]
    },
    {
        "id": "S5",
        "type": "straight",
        "name": "Back Straight to Parabolica",
        "start_m": 4400.0,
        "end_m": 5050.0,
        "apex_m": None,
        "turn_numbers": []
    },
    {
        "id": "C5",
        "type": "corner",
        "name": "Curva Parabolica (T11)",
        "start_m": 5050.0,
        "end_m": 5450.0,
        "apex_m": 5260.0,
        "turn_numbers": [11]
    },
    {
        "id": "S6",
        "type": "straight",
        "name": "Pit Straight Finish",
        "start_m": 5450.0,
        "end_m": 5793.0,
        "apex_m": None,
        "turn_numbers": []
    }
]

# Baseline characteristic speeds for Monza for academic fallback / fast response
DRIVER_BENCHMARK_PROFILES = {
    "VER": {
        "base_lap": 84.82,
        "S1": {"top_speed": 352.4, "full_throttle_pct": 98.2},
        "C1": {"apex_speed": 74.5, "braking_m": 128.0, "exit_speed": 165.2, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 312.0, "full_throttle_pct": 99.5},
        "C2": {"apex_speed": 118.2, "braking_m": 115.0, "exit_speed": 182.0, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 272.5, "full_throttle_pct": 95.0},
        "C3": {"apex_speed": 168.0, "braking_m": 92.0, "exit_speed": 218.0, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 338.5, "full_throttle_pct": 98.8},
        "C4": {"apex_speed": 196.4, "braking_m": 88.0, "exit_speed": 252.0, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 346.2, "full_throttle_pct": 99.1},
        "C5": {"apex_speed": 218.5, "braking_m": 82.0, "exit_speed": 268.0, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 332.0, "full_throttle_pct": 99.4}
    },
    "SAI": {
        "base_lap": 84.44, # Pole Sitter
        "S1": {"top_speed": 354.8, "full_throttle_pct": 98.5},
        "C1": {"apex_speed": 76.2, "braking_m": 132.0, "exit_speed": 166.5, "style": "U-Shape Momentum"},
        "S2": {"top_speed": 314.5, "full_throttle_pct": 99.6},
        "C2": {"apex_speed": 119.5, "braking_m": 118.0, "exit_speed": 183.2, "style": "U-Shape Momentum"},
        "S3": {"top_speed": 274.0, "full_throttle_pct": 95.5},
        "C3": {"apex_speed": 169.5, "braking_m": 94.0, "exit_speed": 219.0, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 341.0, "full_throttle_pct": 99.0},
        "C4": {"apex_speed": 198.0, "braking_m": 90.0, "exit_speed": 253.5, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 349.5, "full_throttle_pct": 99.3},
        "C5": {"apex_speed": 219.8, "braking_m": 85.0, "exit_speed": 270.2, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 334.5, "full_throttle_pct": 99.6}
    },
    "LEC": {
        "base_lap": 84.51,
        "S1": {"top_speed": 354.2, "full_throttle_pct": 98.4},
        "C1": {"apex_speed": 75.8, "braking_m": 130.0, "exit_speed": 166.0, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 313.8, "full_throttle_pct": 99.4},
        "C2": {"apex_speed": 119.0, "braking_m": 116.0, "exit_speed": 182.8, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 273.5, "full_throttle_pct": 95.2},
        "C3": {"apex_speed": 169.0, "braking_m": 93.0, "exit_speed": 218.5, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 340.2, "full_throttle_pct": 98.9},
        "C4": {"apex_speed": 197.5, "braking_m": 89.0, "exit_speed": 253.0, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 348.8, "full_throttle_pct": 99.2},
        "C5": {"apex_speed": 219.2, "braking_m": 84.0, "exit_speed": 269.5, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 333.8, "full_throttle_pct": 99.5}
    },
    "HAM": {
        "base_lap": 85.10,
        "S1": {"top_speed": 348.5, "full_throttle_pct": 97.6},
        "C1": {"apex_speed": 77.0, "braking_m": 136.0, "exit_speed": 163.5, "style": "U-Shape Momentum"},
        "S2": {"top_speed": 309.5, "full_throttle_pct": 99.0},
        "C2": {"apex_speed": 117.5, "braking_m": 120.0, "exit_speed": 180.5, "style": "U-Shape Momentum"},
        "S3": {"top_speed": 270.0, "full_throttle_pct": 94.2},
        "C3": {"apex_speed": 167.0, "braking_m": 96.0, "exit_speed": 216.5, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 335.0, "full_throttle_pct": 98.2},
        "C4": {"apex_speed": 195.0, "braking_m": 92.0, "exit_speed": 250.5, "style": "U-Shape Momentum"},
        "S5": {"top_speed": 343.0, "full_throttle_pct": 98.8},
        "C5": {"apex_speed": 217.0, "braking_m": 88.0, "exit_speed": 266.0, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 329.5, "full_throttle_pct": 99.0}
    },
    "RUS": {
        "base_lap": 85.14,
        "S1": {"top_speed": 348.8, "full_throttle_pct": 97.8},
        "C1": {"apex_speed": 76.5, "braking_m": 134.0, "exit_speed": 164.0, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 310.0, "full_throttle_pct": 99.1},
        "C2": {"apex_speed": 117.8, "braking_m": 119.0, "exit_speed": 181.0, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 270.5, "full_throttle_pct": 94.5},
        "C3": {"apex_speed": 167.2, "braking_m": 95.0, "exit_speed": 217.0, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 335.5, "full_throttle_pct": 98.4},
        "C4": {"apex_speed": 195.2, "braking_m": 91.0, "exit_speed": 251.0, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 343.5, "full_throttle_pct": 98.9},
        "C5": {"apex_speed": 217.2, "braking_m": 87.0, "exit_speed": 266.5, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 330.0, "full_throttle_pct": 99.1}
    },
    "NOR": {
        "base_lap": 85.04,
        "S1": {"top_speed": 349.5, "full_throttle_pct": 98.0},
        "C1": {"apex_speed": 75.8, "braking_m": 131.0, "exit_speed": 165.0, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 311.0, "full_throttle_pct": 99.2},
        "C2": {"apex_speed": 118.0, "braking_m": 117.0, "exit_speed": 181.8, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 271.8, "full_throttle_pct": 94.8},
        "C3": {"apex_speed": 168.2, "braking_m": 93.5, "exit_speed": 218.0, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 336.8, "full_throttle_pct": 98.6},
        "C4": {"apex_speed": 196.5, "braking_m": 89.5, "exit_speed": 252.0, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 344.8, "full_throttle_pct": 99.0},
        "C5": {"apex_speed": 218.0, "braking_m": 85.5, "exit_speed": 267.5, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 331.0, "full_throttle_pct": 99.2}
    },
    "PIA": {
        "base_lap": 85.22,
        "S1": {"top_speed": 349.0, "full_throttle_pct": 97.9},
        "C1": {"apex_speed": 75.2, "braking_m": 133.0, "exit_speed": 164.2, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 310.5, "full_throttle_pct": 99.1},
        "C2": {"apex_speed": 117.6, "braking_m": 118.0, "exit_speed": 181.0, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 271.0, "full_throttle_pct": 94.6},
        "C3": {"apex_speed": 167.8, "braking_m": 94.0, "exit_speed": 217.2, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 336.0, "full_throttle_pct": 98.5},
        "C4": {"apex_speed": 195.8, "braking_m": 90.5, "exit_speed": 251.2, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 344.0, "full_throttle_pct": 98.9},
        "C5": {"apex_speed": 217.5, "braking_m": 86.5, "exit_speed": 266.8, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 330.5, "full_throttle_pct": 99.1}
    },
    "PER": {
        "base_lap": 85.17,
        "S1": {"top_speed": 351.0, "full_throttle_pct": 98.0},
        "C1": {"apex_speed": 74.0, "braking_m": 132.0, "exit_speed": 163.8, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 311.2, "full_throttle_pct": 99.3},
        "C2": {"apex_speed": 117.5, "braking_m": 117.0, "exit_speed": 181.2, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 271.5, "full_throttle_pct": 94.7},
        "C3": {"apex_speed": 167.5, "braking_m": 94.0, "exit_speed": 217.5, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 337.5, "full_throttle_pct": 98.6},
        "C4": {"apex_speed": 195.5, "braking_m": 90.0, "exit_speed": 251.5, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 345.5, "full_throttle_pct": 99.0},
        "C5": {"apex_speed": 217.8, "braking_m": 85.0, "exit_speed": 267.0, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 331.2, "full_throttle_pct": 99.3}
    },
    "ALO": {
        "base_lap": 85.22,
        "S1": {"top_speed": 347.0, "full_throttle_pct": 97.4},
        "C1": {"apex_speed": 76.8, "braking_m": 129.0, "exit_speed": 164.5, "style": "V-Shape Late Braker"},
        "S2": {"top_speed": 308.5, "full_throttle_pct": 98.9},
        "C2": {"apex_speed": 118.0, "braking_m": 116.5, "exit_speed": 181.5, "style": "V-Shape Late Braker"},
        "S3": {"top_speed": 269.5, "full_throttle_pct": 94.0},
        "C3": {"apex_speed": 168.0, "braking_m": 93.0, "exit_speed": 217.8, "style": "U-Shape Momentum"},
        "S4": {"top_speed": 334.0, "full_throttle_pct": 98.1},
        "C4": {"apex_speed": 196.0, "braking_m": 89.0, "exit_speed": 251.8, "style": "V-Shape Late Braker"},
        "S5": {"top_speed": 342.0, "full_throttle_pct": 98.7},
        "C5": {"apex_speed": 218.2, "braking_m": 84.0, "exit_speed": 267.5, "style": "U-Shape Momentum"},
        "S6": {"top_speed": 329.0, "full_throttle_pct": 98.9}
    }
}

class CornerService:
    """
    Manages Monza track spatial segmentation and 2-driver telemetry delta extraction.
    """

    def __init__(self):
        self.segments = MONZA_SEGMENTS
        self.profiles = DRIVER_BENCHMARK_PROFILES
        self.driver_teams = DRIVER_TEAMS

    def get_layout(self) -> Dict[str, Any]:
        """Returns the spatial structure of Monza with all turns and straights."""
        return {
            "circuit": "Autodromo Nazionale Monza",
            "total_distance_m": MONZA_TOTAL_METERS,
            "corners_count": 11,
            "corner_complexes": 5,
            "straights_count": 6,
            "segments": self.segments
        }

    def generate_interpolated_lap_trace(
        self,
        driver_code: str,
        season: int = 2023,
        session_type: str = "R",
        num_points: int = 350
    ) -> np.ndarray:
        """
        Synthesizes a distance-normalized velocity profile (km/h) for the given driver.
        Qualifying ('Q'): All-out attack, +4-7 km/h top speeds, +2-4 km/h apexes, full DRS open.
        2024 vs 2023: Red Bull / McLaren gains + Ferrari upgrades adjusted accordingly.
        """
        profile = self.profiles.get(driver_code, self.profiles["VER"])
        distances = np.linspace(0, MONZA_TOTAL_METERS, num_points)
        speeds = np.zeros(num_points)

        # Session modifiers: Qualifying is faster and has DRS active everywhere
        is_quali = session_type.upper() == "Q"
        speed_boost = 6.5 if is_quali else 0.0
        apex_boost = 3.2 if is_quali else 0.0

        # 2024 season shifts (McLaren & Ferrari gains at Monza 2024 where LEC won)
        season_mod = 0.0
        if season == 2024:
            if driver_code in ["LEC", "SAI"]:
                season_mod = 2.5 # Ferrari 2024 Monza win package
            elif driver_code in ["NOR", "PIA"]:
                season_mod = 3.0 # McLaren 2024 MCL38 front row
            elif driver_code in ["VER", "PER"]:
                season_mod = -1.0 # Red Bull RB20 balance struggles at Monza 2024

        for i, d in enumerate(distances):
            # Locate active segment
            active_seg = self.segments[0]
            for seg in self.segments:
                if seg["start_m"] <= d <= seg["end_m"]:
                    active_seg = seg
                    break

            seg_id = active_seg["id"]
            seg_info = profile[seg_id]

            if active_seg["type"] == "straight":
                # Accelerate towards top speed
                rel_pos = (d - active_seg["start_m"]) / max(1.0, active_seg["end_m"] - active_seg["start_m"])
                prev_speed = 205.0 + apex_boost
                top_speed = seg_info["top_speed"] + speed_boost + season_mod
                speeds[i] = prev_speed + (top_speed - prev_speed) * (1 - np.exp(-3.5 * rel_pos))
            else:
                # Corner: speed drops into apex and ramps out
                apex_m = active_seg["apex_m"] or (active_seg["start_m"] + active_seg["end_m"]) / 2.0
                dist_to_apex = abs(d - apex_m)
                apex_speed = seg_info["apex_speed"] + apex_boost + (season_mod * 0.4)
                entry_speed = seg_info.get("exit_speed", 260.0) + 40.0 + speed_boost
                decay = np.exp(- (dist_to_apex / 75.0) ** 2)
                speeds[i] = apex_speed + (entry_speed - apex_speed) * (1.0 - decay)

        # Smooth signal
        kernel = np.ones(5) / 5
        speeds = np.convolve(speeds, kernel, mode='same')
        return distances, speeds

    def compare_two_drivers(
        self,
        d1: str = "VER",
        d2: str = "HAM",
        season: int = 2023,
        session_type: str = "R",
        num_points: int = 350
    ) -> Dict[str, Any]:
        """
        Computes turn-by-turn and continuous spatial delta between two drivers with season and session format support.
        """
        d1 = d1.upper() if d1.upper() in self.profiles else "VER"
        d2 = d2.upper() if d2.upper() in self.profiles else "HAM"

        d1_meta = self.driver_teams.get(d1, {"team": "Unknown", "color": "#1e41ff", "name": d1})
        d2_meta = self.driver_teams.get(d2, {"team": "Unknown", "color": "#00d2be", "name": d2})

        d1_profile = self.profiles[d1]
        d2_profile = self.profiles[d2]

        is_quali = session_type.upper() == "Q"
        # Lap time offset in qualifying (~3.5-4s quicker than race pace due to fuel & DRS)
        time_offset = -3.8 if is_quali else 0.0

        d1_lap_time = round(d1_profile["base_lap"] + time_offset + (-0.35 if season == 2024 and d1 in ["NOR", "LEC"] else 0.0), 3)
        d2_lap_time = round(d2_profile["base_lap"] + time_offset + (-0.35 if season == 2024 and d2 in ["NOR", "LEC"] else 0.0), 3)

        dist_arr, d1_speeds = self.generate_interpolated_lap_trace(d1, season=season, session_type=session_type, num_points=num_points)
        _, d2_speeds = self.generate_interpolated_lap_trace(d2, season=season, session_type=session_type, num_points=num_points)

        # Delta calculation:
        # Time to traverse dx = dx / v (convert km/h to m/s)
        dx = MONZA_TOTAL_METERS / num_points
        d1_v_ms = np.maximum(d1_speeds / 3.6, 5.0)
        d2_v_ms = np.maximum(d2_speeds / 3.6, 5.0)

        dt_d1 = dx / d1_v_ms
        dt_d2 = dx / d2_v_ms

        cum_t1 = np.cumsum(dt_d1)
        cum_t2 = np.cumsum(dt_d2)
        delta_time = cum_t1 - cum_t2  # negative means d1 is faster

        # Continuous trace points for chart
        trace = []
        for i in range(num_points):
            leader = d1 if delta_time[i] <= 0 else d2
            leader_color = d1_meta["color"] if delta_time[i] <= 0 else d2_meta["color"]
            trace.append({
                "distance": round(float(dist_arr[i]), 1),
                "d1_speed": round(float(d1_speeds[i]), 1),
                "d2_speed": round(float(d2_speeds[i]), 1),
                "delta_time": round(float(delta_time[i]), 3),
                "delta_speed": round(float(d1_speeds[i] - d2_speeds[i]), 1),
                "leader": leader,
                "leader_color": leader_color
            })

        # Segment-by-segment winner attribution
        segment_results = []
        for seg in self.segments:
            seg_id = seg["id"]
            p1_seg = d1_profile[seg_id]
            p2_seg = d2_profile[seg_id]

            if seg["type"] == "corner":
                s1_val = p1_seg["apex_speed"]
                s2_val = p2_seg["apex_speed"]
                delta_s = s1_val - s2_val
                # Higher apex speed or shorter braking distance = faster in turn
                is_d1_winner = delta_s > 0
                winner = d1 if is_d1_winner else d2
                winner_color = d1_meta["color"] if is_d1_winner else d2_meta["color"]

                segment_results.append({
                    "segment_id": seg_id,
                    "segment_name": seg["name"],
                    "type": "corner",
                    "turn_numbers": seg["turn_numbers"],
                    "d1_speed": s1_val,
                    "d2_speed": s2_val,
                    "delta_speed": round(delta_s, 1),
                    "d1_braking_m": p1_seg.get("braking_m", 120.0),
                    "d2_braking_m": p2_seg.get("braking_m", 120.0),
                    "d1_exit_speed": p1_seg.get("exit_speed", 180.0),
                    "d2_exit_speed": p2_seg.get("exit_speed", 180.0),
                    "d1_style": p1_seg.get("style", "V-Shape Late Braker"),
                    "d2_style": p2_seg.get("style", "U-Shape Momentum"),
                    "winner": winner,
                    "winner_color": winner_color,
                    "time_delta_gain": round(-delta_s * 0.008, 3) # approx time gain
                })
            else:
                s1_val = p1_seg["top_speed"]
                s2_val = p2_seg["top_speed"]
                delta_s = s1_val - s2_val
                is_d1_winner = delta_s > 0
                winner = d1 if is_d1_winner else d2
                winner_color = d1_meta["color"] if is_d1_winner else d2_meta["color"]

                segment_results.append({
                    "segment_id": seg_id,
                    "segment_name": seg["name"],
                    "type": "straight",
                    "turn_numbers": seg["turn_numbers"],
                    "d1_speed": s1_val,
                    "d2_speed": s2_val,
                    "delta_speed": round(delta_s, 1),
                    "d1_full_throttle": p1_seg.get("full_throttle_pct", 98.0),
                    "d2_full_throttle": p2_seg.get("full_throttle_pct", 98.0),
                    "winner": winner,
                    "winner_color": winner_color,
                    "time_delta_gain": round(-delta_s * 0.006, 3)
                })

        total_lap_delta = round(float(delta_time[-1]), 3)

        return {
            "driver1": {
                "code": d1,
                "name": d1_meta["name"],
                "team": d1_meta["team"],
                "color": d1_meta["color"],
                "lap_time": d1_lap_time
            },
            "driver2": {
                "code": d2,
                "name": d2_meta["name"],
                "team": d2_meta["team"],
                "color": d2_meta["color"],
                "lap_time": d2_lap_time
            },
            "season": season,
            "session_type": session_type,
            "total_lap_delta": total_lap_delta,
            "overall_winner": d1 if total_lap_delta <= 0 else d2,
            "overall_winner_color": d1_meta["color"] if total_lap_delta <= 0 else d2_meta["color"],
            "segments": segment_results,
            "trace": trace
        }

corner_service = CornerService()
