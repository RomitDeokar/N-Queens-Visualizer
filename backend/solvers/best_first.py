"""
Best First Search Solver for N-Queens
Uses heapq priority queue with h(n) = number of attacking queen pairs.
Informed search — always explores state with lowest heuristic value.
"""

import heapq
import time
import sys


def count_attacks(state):
    """Count the number of attacking queen pairs in the current state."""
    attacks = 0
    n = len(state)
    for i in range(n):
        for j in range(i + 1, n):
            if state[i] == state[j] or abs(state[i] - state[j]) == abs(i - j):
                attacks += 1
    return attacks


def solve(n: int) -> dict:
    """
    Run Best First Search to solve the N-Queens problem.
    Priority = h(n) = number of attacking pairs.
    """
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_memory = 0

    # Priority queue: (heuristic, tie-breaker counter, state)
    counter = 0
    initial_state = []
    h = count_attacks(initial_state)
    heap = [(h, counter, initial_state)]

    while heap:
        _, _, state = heapq.heappop(heap)
        row = len(state)
        nodes_expanded += 1

        mem = sys.getsizeof(heap)
        if mem > peak_memory:
            peak_memory = mem

        if row == n:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "best_first",
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
            # Quick conflict check
            safe = True
            for r in range(row):
                if state[r] == col or abs(state[r] - col) == abs(r - row):
                    safe = False
                    break

            if safe:
                new_state = list(state) + [col]
                h = count_attacks(new_state)
                counter += 1
                heapq.heappush(heap, (h, counter, new_state))

    elapsed = (time.time() - start) * 1000
    return {
        "algorithm": "best_first",
        "n": n,
        "solved": False,
        "nodes": nodes_expanded,
        "time_ms": round(elapsed, 2),
        "memory_kb": round(peak_memory / 1024, 2),
        "steps": steps,
        "error": "Best First Search exhausted all states",
        "state": [],
    }
