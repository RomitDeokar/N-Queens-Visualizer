"""
Best First Search Solver for N-Queens
Greedy: only uses h(n) = inverse of next-row availability.
Prunes dead-end states.
"""

import heapq
import time
import sys

NODE_LIMIT = 200_000
TIME_LIMIT_SEC = 5


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
                    "algorithm": "best_first", "n": n, "solved": False,
                    "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
                    "memory_kb": round(peak_frontier / 1024, 2),
                    "steps": steps,
                    "error": f"Best First halted — time limit ({TIME_LIMIT_SEC}s)",
                    "state": list(state) if state else [],
                }

        if nodes_expanded > NODE_LIMIT:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "best_first", "n": n, "solved": False,
                "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_frontier / 1024, 2),
                "steps": steps,
                "error": f"Best First halted — node limit ({NODE_LIMIT:,})",
                "state": list(state) if state else [],
            }

        if row == n:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "best_first", "n": n, "solved": True,
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

            # Greedy heuristic: count available squares in next row
            next_row = row + 1
            if next_row < n:
                available = 0
                for c in range(n):
                    if not (new_cols & (1 << c)) and (next_row - c) not in new_d1 and (next_row + c) not in new_d2:
                        available += 1
                if available == 0:
                    continue  # Dead end — prune
                h = n - available  # Prefer more options
            else:
                h = 0

            counter += 1
            heapq.heappush(heap, (h, counter, new_state, new_cols, new_d1, new_d2))

        if nodes_expanded % 10000 == 0:
            cur_mem = sys.getsizeof(heap)
            if cur_mem > peak_frontier:
                peak_frontier = cur_mem

    elapsed = (time.time() - start) * 1000
    return {
        "algorithm": "best_first", "n": n, "solved": False,
        "nodes": nodes_expanded, "time_ms": round(elapsed, 2),
        "memory_kb": round(peak_frontier / 1024, 2),
        "steps": steps, "error": "Best First exhausted all states", "state": [],
    }
