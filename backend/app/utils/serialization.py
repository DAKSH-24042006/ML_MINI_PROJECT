import numpy as np
import pandas as pd
from typing import Any

def sanitize_for_json(obj: Any) -> Any:
    """Recursively converts NumPy and Pandas data types into native JSON serializable types."""
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [sanitize_for_json(v) for v in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return round(float(obj), 4)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return [sanitize_for_json(v) for v in obj.tolist()]
    elif isinstance(obj, pd.Series):
        return sanitize_for_json(obj.to_dict())
    elif isinstance(obj, pd.DataFrame):
        return sanitize_for_json(obj.to_dict(orient="records"))
    elif pd.isna(obj):
        return None
    return obj
