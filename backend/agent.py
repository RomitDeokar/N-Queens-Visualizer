"""
Simple Reflex Agent for N-Queens
Selects the best algorithm based on board size N using fixed rules.
"""


def select_algorithm(n: int) -> dict:
    """
    Simple reflex agent: selects algorithm based on N.
    Returns the algorithm name and the rule that fired.
    """
    if n <= 6:
        return {
            "algorithm": "bfs",
            "rule": f"N = {n} (small) → BFS selected — feasible for small state spaces",
        }
    elif n <= 15:
        return {
            "algorithm": "astar",
            "rule": f"N = {n} (medium) → A* selected — best balance of completeness and efficiency",
        }
    else:
        return {
            "algorithm": "best_first",
            "rule": f"N = {n} (large) → Best First selected — greedy approach for large boards",
        }


PEAS = {
    "performance": "Minimise solve time and nodes expanded",
    "environment": "N×N chessboard of given size",
    "actuators": "Queen placement at (row, col)",
    "sensors": "Current board state — queen positions",
}

TASK_ENVIRONMENT = {
    "observability": "Fully observable",
    "determinism": "Deterministic",
    "dynamics": "Static",
    "continuity": "Discrete",
    "agents": "Single-agent",
}
