"""
BFS Solver for N-Queens
Breadth-First Search — queue-based UNINFORMED search.

This is a TRUE BFS using a FIFO queue that explores the search tree
level by level (row by row). Like DFS, it is UNINFORMED — no heuristic.

However, BFS checks conflicts when a state is dequeued (one row at a time).
This is slightly smarter than DFS's generate-and-test approach because
invalid states are caught earlier. But BFS still generates ALL possible
children at each level (every column position) and enqueues them all.

BFS is COMPLETE (guaranteed to find a solution if one exists) but has
ENORMOUS memory requirements: it stores ALL frontier states at once.

Space complexity: O(N^d) where d = depth = N
Time complexity: O(N^d) where d = depth

For N-Queens:
- Small N (1-7): Solves, but with many more nodes than informed search
- Medium N (8-9): Solves but very slowly with large memory usage
- Large N (10+): Hits memory/node limits — frontier becomes too large

BFS performs better than DFS because it catches conflicts one row earlier,
but far worse than informed methods (Best-First, A*) that prune + order.
"""

from collections import deque
import time
import sys

BFS_NODE_LIMIT = 200_000
BFS_TIME_LIMIT_SEC = 8


def has_conflict(state):
    """Check if the LAST queen placed conflicts with any earlier queen.
    This is checked when a state is dequeued — row-by-row validation.
    """
    if len(state) <= 1:
        return False
    row = len(state) - 1
    col = state[row]
    for r in range(row):
        c = state[r]
        if c == col or abs(c - col) == abs(r - row):
            return True
    return False


def solve(n: int) -> dict:
    """
    Run TRUE Breadth-First Search with a FIFO queue.
    Generates ALL children (every column), checks conflicts when dequeuing.
    """
    start = time.time()
    nodes_expanded = 0
    steps = 0
    peak_memory = 0

    queue = deque()
    queue.append(())

    while queue:
        state = queue.popleft()
        row = len(state)
        nodes_expanded += 1

        # Check if this state has a conflict (last queen vs prior queens)
        if row > 0 and has_conflict(state):
            steps += 1
            continue

        # Track peak memory
        if nodes_expanded % 3000 == 0:
            mem = sys.getsizeof(queue)
            if len(queue) > 0:
                sample_size = min(100, len(queue))
                sample_mem = sum(sys.getsizeof(queue[i]) for i in range(sample_size))
                mem += (sample_mem / sample_size) * len(queue)
            peak_memory = max(peak_memory, mem)

        # Check time limit
        if nodes_expanded % 10000 == 0:
            elapsed_sec = time.time() - start
            if elapsed_sec > BFS_TIME_LIMIT_SEC:
                return {
                    "algorithm": "bfs",
                    "n": n,
                    "solved": False,
                    "nodes": nodes_expanded,
                    "time_ms": round(elapsed_sec * 1000, 2),
                    "memory_kb": round(peak_memory / 1024, 2),
                    "steps": steps,
                    "error": f"BFS halted — time limit ({BFS_TIME_LIMIT_SEC}s) exceeded. Frontier grew to {len(queue):,} states.",
                    "state": list(state) if state else [],
                }

        # Check node limit
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
                "error": f"BFS halted — node limit ({BFS_NODE_LIMIT:,}) exceeded. Queue had {len(queue):,} pending states.",
                "state": list(state) if state else [],
            }

        # Goal test — all N queens placed conflict-free
        if row == n:
            elapsed = (time.time() - start) * 1000
            mem = sys.getsizeof(queue)
            peak_memory = max(peak_memory, mem)
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

        # Generate ALL children — every column, no heuristic ordering
        for col in range(n):
            steps += 1
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
