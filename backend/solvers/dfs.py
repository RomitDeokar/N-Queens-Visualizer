"""
DFS Solver for N-Queens
Depth-First Search / Backtracking — recursive.
Also framed as a CSP:
  Variables: one per row (which column)
  Domain: columns 0 to N-1
  Constraints: no shared column, no shared diagonal
"""

import time
import sys


def solve(n: int) -> dict:
    """
    Run DFS backtracking to solve the N-Queens problem.
    """
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
    diag1 = set()  # row - col
    diag2 = set()  # row + col

    def backtrack(row):
        nonlocal peak_memory
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
            if col not in columns and (row - col) not in diag1 and (row + col) not in diag2:
                state.append(col)
                columns.add(col)
                diag1.add(row - col)
                diag2.add(row + col)

                if backtrack(row + 1):
                    return True

                state.pop()
                columns.remove(col)
                diag1.remove(row - col)
                diag2.remove(row + col)

        return False

    backtrack(0)
    elapsed = (time.time() - start) * 1000
    result["time_ms"] = round(elapsed, 2)
    result["memory_kb"] = round(peak_memory / 1024, 2)
    if not result["solved"]:
        result["error"] = "DFS exhausted all states — no solution found"
    return result
