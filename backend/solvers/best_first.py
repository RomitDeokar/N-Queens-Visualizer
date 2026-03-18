"""
Best-First Search (Greedy) Solver for N-Queens
Uses f(n) = h(n) only — greedy heuristic without path cost.

Best-First for N-Queens uses heuristic-guided backtracking with:
- Greedy 1-row look-ahead: prefer columns leaving more next-row options
- Prunes at generation time (only safe placements considered)
- Dead-end detection only in the immediately next row

Best-First is INFORMED (uses domain knowledge) but:
- Only looks 1 row ahead (vs A*'s multi-row forward-checking)
- No path cost consideration (purely greedy)
- May make locally good but globally bad choices, needing more backtracking

This makes it faster than BFS/DFS (informed pruning + ordering)
but slightly slower than A* (shallower look-ahead means more backtracking).

Expected behavior:
- Small-Medium N (1-12): Solves efficiently but more nodes than A*
- Large N (13-15): Solves with slightly more effort than A*
"""

import time

NODE_LIMIT = 300_000
TIME_LIMIT_SEC = 10


def solve(n: int) -> dict:
    """
    Greedy Best-First Search: heuristic-guided backtracking with
    1-row look-ahead and generation-time pruning using bitmasks.
    """
    start = time.time()
    nodes = [0]
    steps = [0]
    solution = [None]
    state = []
    
    def backtrack(row, c_bits, d1_bits, d2_bits):
        nodes[0] += 1
        
        if nodes[0] % 5000 == 0:
            if time.time() - start > TIME_LIMIT_SEC:
                return False
        if nodes[0] > NODE_LIMIT:
            return False
        
        if row == n:
            solution[0] = list(state)
            return True
        
        candidates = []
        for col in range(n):
            steps[0] += 1
            if c_bits & (1 << col):
                continue
            rd1 = row - col + n
            rd2 = row + col
            if d1_bits & (1 << rd1) or d2_bits & (1 << rd2):
                continue
            
            new_c = c_bits | (1 << col)
            new_d1 = d1_bits | (1 << rd1)
            new_d2 = d2_bits | (1 << rd2)
            
            # Greedy: only check next row (1-row look-ahead)
            next_row = row + 1
            if next_row < n:
                avail = 0
                for c in range(n):
                    if not (new_c & (1 << c)):
                        fd1 = next_row - c + n
                        fd2 = next_row + c
                        if not (new_d1 & (1 << fd1)) and not (new_d2 & (1 << fd2)):
                            avail += 1
                if avail == 0:
                    continue  # Next row dead end
                h = n - avail
            else:
                h = 0
            
            candidates.append((h, col, new_c, new_d1, new_d2))
        
        candidates.sort()
        
        for _, col, new_c, new_d1, new_d2 in candidates:
            state.append(col)
            if backtrack(row + 1, new_c, new_d1, new_d2):
                return True
            state.pop()
        
        return False
    
    found = backtrack(0, 0, 0, 0)
    elapsed = (time.time() - start) * 1000
    peak_memory = n * 48
    
    if found and solution[0]:
        return {
            "algorithm": "best_first", "n": n, "solved": True,
            "nodes": nodes[0], "time_ms": round(elapsed, 2),
            "memory_kb": round(peak_memory / 1024, 2),
            "steps": steps[0], "state": solution[0],
        }
    else:
        error = "Best-First halted — "
        if nodes[0] > NODE_LIMIT:
            error += f"node limit ({NODE_LIMIT:,}) exceeded"
        elif elapsed > TIME_LIMIT_SEC * 1000:
            error += f"time limit ({TIME_LIMIT_SEC}s) exceeded"
        else:
            error += "no solution found"
        return {
            "algorithm": "best_first", "n": n, "solved": False,
            "nodes": nodes[0], "time_ms": round(elapsed, 2),
            "memory_kb": round(peak_memory / 1024, 2),
            "steps": steps[0], "error": error,
            "state": list(state) if state else [],
        }
