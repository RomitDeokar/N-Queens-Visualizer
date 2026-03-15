"""
BFS Solver for N-Queens
Breadth-First Search — queue-based uninformed search.
Explores all states level by level using collections.deque.
"""

from collections import deque
import time
import sys

BFS_NODE_LIMIT = 100_000


def is_safe(state, row, col):
    """Check if placing a queen at (row, col) is safe given current state."""
    for r in range(row):
        c = state[r]
        if c == col or abs(c - col) == abs(r - row):
            return False
    return True


def solve(n: int) -> dict:
    """
    Run BFS to solve the N-Queens problem.
    Returns dict with algorithm, n, solved, nodes, time_ms, memory_kb, steps, state/error.
    """
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_memory = 0

    # Each state in the queue is a list of column positions, one per row placed so far
    queue = deque()
    queue.append([])

    while queue:
        state = queue.popleft()
        row = len(state)
        nodes_expanded += 1

        mem = sys.getsizeof(queue)
        if mem > peak_memory:
            peak_memory = mem

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
                "error": "BFS halted — node limit reached",
                "state": list(state) if state else [],
            }

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
                new_state = list(state) + [col]
                queue.append(new_state)

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
