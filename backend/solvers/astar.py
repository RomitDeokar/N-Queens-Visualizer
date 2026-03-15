"""
A* Search Solver for N-Queens
Uses a smarter heuristic: number of columns/diagonals blocked for future rows.
Prunes dead-end states where a future row has no available column.
"""

import heapq
import time
import sys

NODE_LIMIT = 200_000
TIME_LIMIT_SEC = 5


def count_future_conflicts(row, n, cols_bits, d1_set, d2_set):
    """
    Count how many future rows have zero available columns (dead ends).
    Also sum up the inverse of available options as heuristic.
    """
    h = 0
    for r in range(row, n):
        available = 0
        for c in range(n):
            if not (cols_bits & (1 << c)) and (r - c) not in d1_set and (r + c) not in d2_set:
                available += 1
                if available >= 2:
                    break  # Enough to know it's not dead
        if available == 0:
            return 999  # Dead end — prune
        if available == 1:
            h += 1  # Forced move
    return h


def solve(n: int) -> dict:
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_frontier = 0

    counter = 0
    heap = [(0, counter, (), 0, frozenset(), frozenset())]

    while heap:
        _, _, state, cols_bits, d1_set, d2_set = heapq.heappop(heap)
        row = len(state)
        nodes_expanded += 1

        if nodes_expanded % 20000 == 0:
            if (time.time() - start) > TIME_LIMIT_SEC:
                elapsed = (time.time() - start) * 1000
                return {
                    "algorithm": "astar", "n": n, "solved": False,
                    "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
                    "memory_kb": round(peak_frontier / 1024, 2),
                    "steps": steps,
                    "error": f"A* halted — time limit ({TIME_LIMIT_SEC}s)",
                    "state": list(state) if state else [],
                }

        if nodes_expanded > NODE_LIMIT:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "astar", "n": n, "solved": False,
                "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_frontier / 1024, 2),
                "steps": steps,
                "error": f"A* halted — node limit ({NODE_LIMIT:,})",
                "state": list(state) if state else [],
            }

        if row == n:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "astar", "n": n, "solved": True,
                "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_frontier / 1024, 2),
                "steps": steps, "state": list(state),
            }

        for col in range(n):
            steps += 1
            col_bit = 1 << col
            if cols_bits & col_bit:
                continue
            d1 = row - col
            d2 = row + col
            if d1 in d1_set or d2 in d2_set:
                continue

            new_state = state + (col,)
            new_cols = cols_bits | col_bit
            new_d1 = d1_set | {d1}
            new_d2 = d2_set | {d2}

            g = row + 1
            h = count_future_conflicts(row + 1, n, new_cols, new_d1, new_d2)
            
            if h >= 999:
                continue  # Prune dead ends

            counter += 1
            heapq.heappush(heap, (g + h, counter, new_state, new_cols, new_d1, new_d2))

        if nodes_expanded % 10000 == 0:
            cur_mem = sys.getsizeof(heap)
            if cur_mem > peak_frontier:
                peak_frontier = cur_mem

    elapsed = (time.time() - start) * 1000
    return {
        "algorithm": "astar", "n": n, "solved": False,
        "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
        "memory_kb": round(peak_frontier / 1024, 2),
        "steps": steps, "error": "A* exhausted all states", "state": [],
    }
