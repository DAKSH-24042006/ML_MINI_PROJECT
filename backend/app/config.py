from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "backend" / "data"
FASTF1_CACHE_DIR = DATA_DIR / "fastf1_cache"
SAMPLE_DATA_DIR = DATA_DIR / "sample"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

# Ensure directories exist
FASTF1_CACHE_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Curated sessions for fast selection
CURATED_SESSIONS = [
    {
        "season": 2023,
        "round": 14,
        "country": "Italy",
        "location": "Monza",
        "event_name": "Italian Grand Prix",
        "session": "R",
        "session_name": "Race",
        "key_drivers": ["VER", "PER", "SAI", "LEC", "HAM", "RUS", "NOR", "PIA", "ALO"]
    },
    {
        "season": 2023,
        "round": 10,
        "country": "Great Britain",
        "location": "Silverstone",
        "event_name": "British Grand Prix",
        "session": "R",
        "session_name": "Race",
        "key_drivers": ["VER", "NOR", "HAM", "PIA", "RUS", "ALO", "SAI", "LEC"]
    },
    {
        "season": 2024,
        "round": 1,
        "country": "Bahrain",
        "location": "Sakhir",
        "event_name": "Bahrain Grand Prix",
        "session": "R",
        "session_name": "Race",
        "key_drivers": ["VER", "PER", "SAI", "LEC", "RUS", "NOR", "HAM", "PIA", "ALO"]
    }
]
