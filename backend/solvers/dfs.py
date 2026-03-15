"""
DFS Solver for N-Queens
Depth-First Search / Backtracking — recursive.
With time limit for safety.
"""

import time
import sys

DFS_TIME_LIMIT_SEC = 10


def solve(n: int) -> dict:
    """Run DFS backtracking to solve the N-Queens problem."""
    start = time.time()
    result = {
        "algorithm": "dfs",
        "n": n,
        "solved": False,
        "nodes": 0,
        "steps": 0,
        "memory_kb": 0,
        "state": [],
    }
    peak_memory = 0
    state = []
    columns = set()
    diag1 = set()
    diag2 = set()
    timed_out = [False]

    def backtrack(row):
        nonlocal peak_memory
        
        # Check time limit periodically
        if result["nodes"] % 10000 == 0:
            if time.time() - start > DFS_TIME_LIMIT_SEC:
                timed_out[0] = True
                return False
        
        result["nodes"] += 1

        mem = sys.getsizeof(state) + sys.getsizeof(columns) + sys.getsizeof(diag1) + sys.getsizeof(diag2)
        if mem > peak_memory:
            peak_memory = mem

        if row == n:
            result["solved"] = True
            result["state"] = list(state)
            return True

        for col in range(n):
            result["steps"] += 1
            d1 = row - col
            d2 = row + col
            if col not in columns and d1 not in diag1 and d2 not in diag2:
                state.append(col)
                columns.add(col)
                diag1.add(d1)
                diag2.add(d2)

                if backtrack(row + 1):
                    return True

                if timed_out[0]:
                    return False

                state.pop()
                columns.remove(col)
                diag1.remove(d1)
                diag2.remove(d2)

        return False

    backtrack(0)
    elapsed = (time.time() - start) * 1000
    result["time_ms"] = round(elapsed, 2)
    result["memory_kb"] = round(peak_memory / 1024, 2)
    if timed_out[0]:
        result["error"] = f"DFS halted — time limit ({DFS_TIME_LIMIT_SEC}s) reached"
    elif not result["solved"]:
        result["error"] = "DFS exhausted all states — no solution found"
    return result
