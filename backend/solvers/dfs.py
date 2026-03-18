"""
DFS Solver for N-Queens
Depth-First Search — explicit stack-based UNINFORMED tree search.

This is a TRUE uninformed DFS that demonstrates why uninformed search
is inadequate for constraint satisfaction problems.

DFS generates ALL possible children (every column position) at each row
and pushes them onto the stack WITHOUT checking safety constraints.
Conflict checking ONLY happens when a complete state is reached (all N
queens placed) — a true "generate and test" approach.

This means DFS blindly explores the full search tree of depth N with
branching factor N, giving it O(N^N) potential states to explore.
For N=8 that's 16 million+ states — most of which are invalid.

This is the WORST approach because:
1. No pruning at generation (uninformed — no domain knowledge used)
2. No pruning at expansion (conflict check only at goal)
3. Exponential waste — explores complete branches that are clearly dead
4. Memory grows with stack depth × branching factor

Expected behavior:
- N=1-5: Solves, but slower than informed approaches
- N=6-7: Solves but with MANY wasted node expansions
- N=8+: Hits node/time limits — FAILS to find a solution

This demonstrates that uninformed search is not suitable for N-Queens
and motivates the use of informed search (Best-First, A*).
"""

import time
import sys

DFS_NODE_LIMIT = 80_000
DFS_TIME_LIMIT_SEC = 3


def is_valid_solution(state, n):
    """Check if a COMPLETE state (all N queens placed) has zero conflicts.
    Only called when len(state) == n — this is the 'test' in 'generate-and-test'.
    """
    for i in range(n):
        for j in range(i + 1, n):
            if state[i] == state[j]:
                return False  # Same column
            if abs(state[i] - state[j]) == abs(i - j):
                return False  # Same diagonal
    return True


def solve(n: int) -> dict:
    """
    Run TRUE uninformed Depth-First Search (generate-and-test).
    
    Strategy: Push ALL column positions as children onto the stack.
    NO safety checking during tree traversal — only check when a
    complete N-queen placement is reached (leaf node at depth N).
    
    This is fundamentally different from backtracking:
    - Backtracking: prunes invalid states early (informed by constraints)
    - DFS generate-and-test: blindly generates everything, tests at the end
    """
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_memory = 0

    # Explicit LIFO stack
    # Each entry is a partial state: tuple of column positions per row
    stack = [()]
    nodes_generated = 1

    while stack:
        state = stack.pop()
        row = len(state)
        nodes_expanded += 1
        steps += 1

        # Track peak memory periodically
        if nodes_expanded % 2000 == 0:
            mem = sys.getsizeof(stack)
            if len(stack) > 0:
                sample = min(100, len(stack))
                smem = sum(sys.getsizeof(stack[i]) for i in range(sample))
                mem += (smem / sample) * len(stack)
            peak_memory = max(peak_memory, mem)

        # Check time limit
        if nodes_expanded % 5000 == 0:
            elapsed_sec = time.time() - start
            if elapsed_sec > DFS_TIME_LIMIT_SEC:
                return {
                    "algorithm": "dfs",
                    "n": n,
                    "solved": False,
                    "nodes": nodes_expanded,
                    "time_ms": round(elapsed_sec * 1000, 2),
                    "memory_kb": round(peak_memory / 1024, 2),
                    "steps": steps,
                    "error": f"DFS halted — time limit ({DFS_TIME_LIMIT_SEC}s) exceeded after {nodes_expanded:,} node expansions. Uninformed search cannot handle N={n}.",
                    "state": list(state) if state else [],
                }

        # Check node limit
        if nodes_expanded > DFS_NODE_LIMIT:
            elapsed = (time.time() - start) * 1000
            return {
                "algorithm": "dfs",
                "n": n,
                "solved": False,
                "nodes": nodes_expanded,
                "time_ms": round(elapsed, 2),
                "memory_kb": round(peak_memory / 1024, 2),
                "steps": steps,
                "error": f"DFS halted — node limit ({DFS_NODE_LIMIT:,}) exceeded. Blind search explored {nodes_expanded:,} states without finding a solution.",
                "state": list(state) if state else [],
            }

        # GOAL TEST: Only check validity when ALL queens are placed
        # This is the key inefficiency — we do ZERO pruning during traversal
        if row == n:
            if is_valid_solution(state, n):
                elapsed = (time.time() - start) * 1000
                mem = sys.getsizeof(stack)
                peak_memory = max(peak_memory, mem)
                return {
                    "algorithm": "dfs",
                    "n": n,
                    "solved": True,
                    "nodes": nodes_expanded,
                    "time_ms": round(elapsed, 2),
                    "memory_kb": round(peak_memory / 1024, 2),
                    "steps": steps,
                    "state": list(state),
                }
            # Invalid complete state — this was a wasted exploration!
            continue

        # Generate ALL children — every column, NO PRUNING
        # This is uninformed search: no domain knowledge used
        # Push in reverse order so col 0 is popped first (leftmost DFS)
        for col in range(n - 1, -1, -1):
            child = state + (col,)
            stack.append(child)
            nodes_generated += 1
            steps += 1

    elapsed = (time.time() - start) * 1000
    return {
        "algorithm": "dfs",
        "n": n,
        "solved": False,
        "nodes": nodes_expanded,
        "time_ms": round(elapsed, 2),
        "memory_kb": round(peak_memory / 1024, 2),
        "steps": steps,
        "error": "DFS exhausted entire search space — no solution found",
        "state": [],
    }
