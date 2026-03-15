"""
BFS Solver for N-Queens
Breadth-First Search — queue-based uninformed search.
With node limit and timeout for large N.
"""

from collections import deque
import time
import sys

BFS_NODE_LIMIT = 50_000
BFS_TIME_LIMIT_SEC = 5


def is_safe(state, row, col):
    """Check if placing a queen at (row, col) is safe."""
    for r in range(row):
        c = state[r]
        if c == col or abs(c - col) == abs(r - row):
            return False
    return True


def solve(n: int) -> dict:
    """Run BFS to solve the N-Queens problem with limits."""
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_memory = 0

    queue = deque()
    queue.append(())  # Use tuples for memory efficiency

    while queue:
        state = queue.popleft()
        row = len(state)
        nodes_expanded += 1

        # Check time limit
        elapsed_sec = time.time() - start
        if elapsed_sec > BFS_TIME_LIMIT_SEC:
            elapsed = elapsed_sec * 1000
            return {
                "algorithm": "bfs",
                "n": n,
                "solved": False,
                "nodes": nodes_expanded,
                "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_memory / 1024, 2),
                "steps": steps,
                "error": f"BFS halted — time limit ({BFS_TIME_LIMIT_SEC}s) reached",
                "state": list(state) if state else [],
            }

        if nodes_expanded > BFS_NODE_LIMIT:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "bfs",
                "n": n,
                "solved": False,
                "nodes": nodes_expanded,
                "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_memory / 1024, 2),
                "steps": steps,
                "error": f"BFS halted — node limit ({BFS_NODE_LIMIT:,}) reached",
                "state": list(state) if state else [],
            }

        mem = sys.getsizeof(queue)
        if mem > peak_memory:
            peak_memory = mem

        if row == n:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "bfs",
                "n": n,
                "solved": True,
                "nodes": nodes_expanded,
                "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_memory / 1024, 2),
                "steps": steps,
                "state": list(state),
            }

        for col in range(n):
            steps += 1
            if is_safe(state, row, col):
                queue.append(state + (col,))

    elapsed = (time.time() - start) * 1000
    return {
        "algorithm": "bfs",
        "n": n,
        "solved": False,
        "nodes": nodes_expanded,
        "time_ms": round(elapsed, 2),
        "memory_kb": round(peak_memory / 1024, 2),
        "steps": steps,
        "error": "BFS exhausted all states — no solution found",
        "state": [],
    }
