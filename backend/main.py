"""
FastAPI entry point for N-Queens Comparative AI Agent.
Runs solvers, serves API, handles CORS.
Also serves the built frontend static files.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import threading
import time
import os

from solvers import bfs, dfs, best_first, astar
from agent import select_algorithm, PEAS, TASK_ENVIRONMENT
from logger import log_run, load_runs

app = FastAPI(title="N-Queens AI Agent API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory status tracking for solver race
solver_status = {
    "bfs": {"steps": 0, "nodes": 0, "done": False, "solved": False},
    "dfs": {"steps": 0, "nodes": 0, "done": False, "solved": False},
    "best_first": {"steps": 0, "nodes": 0, "done": False, "solved": False},
    "astar": {"steps": 0, "nodes": 0, "done": False, "solved": False},
}

# Store latest results
latest_results = {}


class SolveRequest(BaseModel):
    n: int


def run_solver(solver_module, name, n):
    """Run a solver and update status."""
    global solver_status, latest_results
    solver_status[name] = {"steps": 0, "nodes": 0, "done": False, "solved": False}
    result = solver_module.solve(n)
    result["timestamp"] = int(time.time())
    solver_status[name] = {
        "steps": result.get("steps", 0),
        "nodes": result.get("nodes", 0),
        "done": True,
        "solved": result.get("solved", False),
    }
    latest_results[name] = result
    log_run(result)


@app.post("/solve")
async def solve(request: SolveRequest):
    """Run all 4 solvers for given N. Returns results."""
    global solver_status, latest_results
    n = request.n

    if n < 1 or n > 15:
        return {"error": "N must be between 1 and 15"}

    # Reset status
    for key in solver_status:
        solver_status[key] = {"steps": 0, "nodes": 0, "done": False, "solved": False}
    latest_results.clear()

    solvers = [
        (bfs, "bfs"),
        (dfs, "dfs"),
        (best_first, "best_first"),
        (astar, "astar"),
    ]

    threads = []
    for solver_module, name in solvers:
        t = threading.Thread(target=run_solver, args=(solver_module, name, n))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    return latest_results


@app.get("/status/{solver}")
async def get_status(solver: str):
    """Get current step count for live race display."""
    if solver in solver_status:
        return solver_status[solver]
    return {"error": f"Unknown solver: {solver}"}


@app.get("/status")
async def get_all_status():
    """Get status for all solvers."""
    return solver_status


@app.get("/results")
async def get_results():
    """Return all logged runs from runs.json."""
    return load_runs()


@app.get("/agent/{n}")
async def get_agent(n: int):
    """Return which algorithm the agent selects for N."""
    selection = select_algorithm(n)
    return {
        **selection,
        "peas": PEAS,
        "task_environment": TASK_ENVIRONMENT,
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


# Serve built frontend — must come AFTER all API routes
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(DIST_DIR):
    # Serve assets with caching
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve frontend SPA — all non-API routes get index.html."""
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
