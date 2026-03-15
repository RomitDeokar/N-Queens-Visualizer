"""
Logger — appends performance results to runs.json
"""

import json
import os
import time

RUNS_FILE = os.path.join(os.path.dirname(__file__), "runs.json")


def load_runs() -> list:
    """Load all runs from runs.json."""
    if not os.path.exists(RUNS_FILE):
        return []
    try:
        with open(RUNS_FILE, "r") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError):
        return []


def log_run(result: dict):
    """Append a solver result to runs.json."""
    runs = load_runs()
    entry = {
        "algorithm": result.get("algorithm", ""),
        "n": result.get("n", 0),
        "nodes": result.get("nodes", 0),
        "time_ms": result.get("time_ms", 0),
        "memory_kb": result.get("memory_kb", 0),
        "steps": result.get("steps", 0),
        "solved": result.get("solved", False),
        "timestamp": int(time.time()),
    }
    if "error" in result:
        entry["error"] = result["error"]
    runs.append(entry)
    with open(RUNS_FILE, "w") as f:
        json.dump(runs, f, indent=2)
