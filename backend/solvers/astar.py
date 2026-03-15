"""
A* Search Solver for N-Queens
Uses heapq with f(n) = g(n) + h(n)
  g(n) = number of queens placed (depth)
  h(n) = number of attacking queen pairs (admissible heuristic)
"""

import heapq
import time
import sys


def count_attacks(state):
    """Count the number of attacking queen pairs."""
    attacks = 0
    n = len(state)
    for i in range(n):
        for j in range(i + 1, n):
            if state[i] == state[j] or abs(state[i] - state[j]) == abs(i - j):
                attacks += 1
    return attacks


def solve(n: int) -> dict:
    """
    Run A* search to solve the N-Queens problem.
    f(n) = g(n) + h(n) where g = depth, h = attacking pairs.
    """
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_memory = 0

    counter = 0
    initial_state = []
    g = 0
    h = count_attacks(initial_state)
    f = g + h
    heap = [(f, counter, initial_state)]

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
                "algorithm": "astar",
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
            safe = True
            for r in range(row):
                if state[r] == col or abs(state[r] - col) == abs(r - row):
                    safe = False
                    break

            if safe:
                new_state = list(state) + [col]
                g_new = len(new_state)
                h_new = count_attacks(new_state)
                f_new = g_new + h_new
                counter += 1
                heapq.heappush(heap, (f_new, counter, new_state))

    elapsed = (time.time() - start) * 1000
    return {
        "algorithm": "astar",
        "n": n,
        "solved": False,
        "nodes": nodes_expanded,
        "time_ms": round(elapsed, 2),
        "memory_kb": round(peak_memory / 1024, 2),
        "steps": steps,
        "error": "A* exhausted all states",
        "state": [],
    }
