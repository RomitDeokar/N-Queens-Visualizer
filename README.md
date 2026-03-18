# Comparative AI Agent for N-Queens
### Search Algorithms, CSP, and Intelligent Agent Analysis

> An AI system that solves the N-Queens problem using four algorithms from the syllabus, compares their performance, and frames the entire solution as an Intelligent Agent 

https://5173-itcmncev38f058qxko46i-b9b802c4.sandbox.novita.ai/

---

## Table of Contents

- [Project Overview](#project-overview)
- [Syllabus Mapping](#syllabus-mapping)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Algorithm Details](#algorithm-details)
- [Intelligent Agent Design](#intelligent-agent-design)
- [UI Components](#ui-components)
- [API Reference](#api-reference)
- [Performance Metrics](#performance-metrics)
- [Report Notes](#report-notes)

---

## Project Overview

The N-Queens problem asks: place N queens on an N×N chessboard such that no two queens attack each other — no shared row, column, or diagonal.

This project extends the classical problem into a **comparative AI system** by:

- Implementing 4 solving approaches from the syllabus
- Framing the system as a **Simple Reflex Intelligent Agent**
- Modelling the problem as a **Constraint Satisfaction Problem (CSP)**
- Comparing all solvers on time, memory, and nodes expanded
- Visualising constraint propagation, search state, and solver progress live

Test sizes: **N = 4, 6, 8, 10, 12**

---

## Syllabus Mapping

| Unit | Topic | Where It Appears |
|------|-------|-----------------|
| Unit 1 | Problem formulation | Formal state, operators, goal definition. State panel in UI |
| Unit 1 | State space, toy problems | N-Queens defined as a toy problem with explicit state space |
| Unit 2 | BFS | `solvers/bfs.py` — queue-based uninformed search |
| Unit 2 | DFS | `solvers/dfs.py` — recursive backtracking |
| Unit 2 | Best First Search | `solvers/best_first.py` — heapq with attack-count heuristic |
| Unit 2 | A* Algorithm | `solvers/astar.py` — f(n) = g(n) + h(n) |
| Unit 2 | Uninformed vs informed | BFS/DFS vs Best First/A* comparison in dashboard |
| Unit 3 | CSP | DFS reframed as CSP with explicit variables, domain, constraints |
| Unit 3 | Constraint propagation | Constraint visualizer — cells blocked live after each placement |
| Unit 3 | Intelligent Agent | `agent.py` — Simple Reflex Agent with PEAS model |
| Unit 3 | Types of Agents | Simple Reflex Agent — documented in AgentPanel UI |
| Unit 3 | PEAS model | AgentPanel.jsx shows all four PEAS components |
| Unit 3 | Task environment | Fully observable, deterministic, static, discrete, single-agent |
| Unit 3 | Performance measures | Dashboard — nodes, time, memory logged and compared |
| Unit 3 | Rationality | Agent selects best algorithm for given N based on defined rules |

---

## Features

Seven features, each tied to a specific syllabus term:

### 1. Constraint Visualizer
Each empty cell is coloured based on attack status:
- **Green** — no queen can attack this cell
- **Red** — one or more queens attack this cell
- **Crown (♛)** — queen placed here

After each queen placement, newly blocked cells flash to show constraint propagation live. This makes CSP visible as a process, not just a concept.

**Syllabus anchor:** CSP, constraint propagation — Unit 3

---

### 2. Solver Race Mode
All four solvers run simultaneously (via staggered polling). Each has its own progress bar and step counter updating in real time. The first solver to find a solution highlights in green.

Makes it immediately obvious why informed search outperforms uninformed search.

**Syllabus anchor:** Search algorithms comparison — Unit 2

---

### 3. PEAS Panel + Task Environment Table
Displays the full Intelligent Agent model:

**PEAS:**
| Component | Definition |
|-----------|------------|
| Performance | Solve time + nodes expanded |
| Environment | N×N chessboard |
| Actuator | Queen placement |
| Sensor | Current board state |

**Task Environment Properties:**
- Fully Observable
- Deterministic
- Static
- Discrete
- Single-Agent

**Syllabus anchor:** Intelligent Agent, Types of Agents, Task Environment — Unit 3

---

### 4. BFS Failure Message
When BFS exceeds the time limit, displays:

```
BFS halted at N=10 — exponential queue growth.
Memory exceeded practical limit.
```

Honest, minimal, directly tied to uninformed search theory.

**Syllabus anchor:** Uninformed search limits — Unit 2

---

### 5. Conflict Heatmap
Each cell's background darkness is proportional to how many queens currently attack it. Cells with more conflicts are darker. Computed as:

```python
attack_count[row][col] = number of placed queens that can reach (row, col)
```

**Syllabus anchor:** CSP constraint domain — Unit 3

---

### 6. Search Snapshot
Displays the current search state for the active solver:

```
Depth: 5   |   Exploring: row 5 → col 3
```

Variables already tracked inside each solver — surfaced directly to the UI.

**Syllabus anchor:** Problem space and search — Unit 2

---

### 7. State Representation Panel
Displays the board as a formal state array:

```
State = [0, 4, 7, 5]
```

Index = row, value = column where queen is placed. Directly shows the problem formulation abstraction from Unit 1.

**Syllabus anchor:** Problem formulation, state space — Unit 1

---

## Project Structure

```
nqueens-ai/
│
├── backend/
│   ├── main.py                  # FastAPI entry point, runs solvers, serves API
│   ├── agent.py                 # Simple Reflex Agent — selects algorithm based on N
│   ├── logger.py                # Appends performance results to runs.json
│   ├── requirements.txt         # fastapi, uvicorn only
│   │
│   └── solvers/
│       ├── bfs.py               # BFS using collections.deque (uninformed)
│       ├── dfs.py               # DFS backtracking — also framed as CSP
│       ├── best_first.py        # Best First Search using heapq, h = attacking pairs
│       └── astar.py             # A* using heapq, f = g + h
│
├── frontend/
│   ├── App.jsx                  # Root layout and global state
│   ├── package.json
│   │
│   └── components/
│       ├── Board.jsx            # Chessboard grid — renders queens, empty cells
│       ├── ConstraintView.jsx   # Green/red cell overlay + propagation flash
│       ├── SolverRace.jsx       # 4 progress bars + step counters
│       ├── Dashboard.jsx        # Chart.js bar charts for N=4 to N=12
│       ├── AgentPanel.jsx       # PEAS table + task environment properties
│       └── StatePanel.jsx       # State array display + search snapshot
│
└── report/
    └── peas_analysis.md         # 1-page PEAS + rationality write-up for submission
```

---

## Tech Stack

| Layer | Tool | Cost |
|-------|------|------|
| Frontend framework | React + Vite | Free |
| Styling | Tailwind CSS | Free |
| Charts | Chart.js via CDN | Free |
| Backend | Python 3 + FastAPI | Free |
| Server | Uvicorn | Free |
| AI / solver logic | Python stdlib only (`heapq`, `time`, `sys`) | Free |
| Data storage | `runs.json` flat file | Free |
| Optional hosting | Vercel (frontend) + Render (backend) | Free tier |

**Zero paid dependencies.**

---

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
```

`requirements.txt`:
```
fastapi
uvicorn
```

### Frontend

```bash
cd frontend
npm install
```

---

## How to Run

### Start backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:8000`

---

## Algorithm Details

### BFS — Breadth First Search
- **Data structure:** `collections.deque` (queue)
- **Strategy:** Explores all states level by level
- **Heuristic:** None (uninformed)
- **Expected behaviour:** Finds optimal solution but exhausts memory rapidly. Fails above N=8 in practice.
- **CSP note:** No constraint checking until full placement — highly inefficient
- **Hard stop — required:** BFS must never run unchecked or it will freeze the UI during a live demo.

```python
BFS_NODE_LIMIT = 100_000

if nodes_expanded > BFS_NODE_LIMIT:
    return {
        "solved": False,
        "nodes": nodes_expanded,
        "error": "BFS halted — node limit reached"
    }
```

Return `nodes_expanded` even on halt so the dashboard renders a partial bar rather than a blank.

### DFS — Depth First Search / Backtracking
- **Data structure:** Recursion stack
- **Strategy:** Place queen row by row, backtrack on conflict
- **CSP framing:**
  - Variables: one per row (which column)
  - Domain: columns 1 to N
  - Constraints: no shared column, no shared diagonal
- **Expected behaviour:** Fast for small N, deeper backtracking for larger N

### Best First Search
- **Data structure:** `heapq` (priority queue)
- **Strategy:** Always explore state with lowest heuristic value
- **Heuristic:** `h(n) = number of attacking queen pairs on board`
- **Expected behaviour:** Significantly faster than BFS, guided toward conflict-free placements

### A* Search
- **Data structure:** `heapq` (priority queue)
- **Formula:** `f(n) = g(n) + h(n)`
  - `g(n)` = number of queens placed so far (depth)
  - `h(n)` = number of attacking pairs (admissible — each requires at least one move to fix)
- **Expected behaviour:** Best balance of completeness and efficiency for medium N

---

## Intelligent Agent Design

### Agent Type
**Simple Reflex Agent** — acts on current percept (board size N) using a fixed rule set.

### Selection Rules (`agent.py`)

```python
def select_algorithm(n: int) -> str:
    if n <= 6:
        return "bfs"
    elif n <= 15:
        return "astar"
    else:
        return "best_first"
```

### Rule Display in UI
The AgentPanel shows:
```
Rule applied: N between 7 and 15 → A* selected
```

This is an honest rule-based explanation — not claimed as inference or learning.

### PEAS Model

| Component | Value |
|-----------|-------|
| Performance measure | Minimise solve time and nodes expanded |
| Environment | N×N chessboard of given size |
| Actuators | Queen placement at (row, col) |
| Sensors | Current board state — queen positions |

### Task Environment Properties

| Property | Value |
|----------|-------|
| Observability | Fully observable |
| Determinism | Deterministic |
| Dynamics | Static |
| Continuity | Discrete |
| Agents | Single-agent |

---

## UI Components

### `Board.jsx`
Renders the N×N chessboard. Accepts a `queens` array (state representation) and renders crowns at placed positions.

### `ConstraintView.jsx`
Overlays each cell with a colour:
- Computes `attacked[row][col]` for every empty cell after each step
- Green = 0 attacks, gradient to red as attacks increase
- Newly blocked cells transition with a brief flash animation

### `SolverRace.jsx`
- Polls each solver's step count every 100ms
- Updates 4 progress bars independently
- Displays `Solver: Step N` below each bar
- Winner highlighted on completion

### `Dashboard.jsx`
- Reads from `runs.json` via API
- Renders Chart.js bar charts for each metric across N = 4, 6, 8, 10, 12
- BFS bars show partial/failed data where applicable

### `AgentPanel.jsx`
- Static PEAS table
- Task environment properties table
- Agent rule display (which rule fired, which algorithm selected)

### `StatePanel.jsx`
- State array: `State = [0, 4, 7, 5, ...]`
- Search snapshot: `Depth: 5 | Exploring: row 5 → col 3`
- Updates on each solver step

---

## API Reference

All endpoints served by FastAPI at `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/solve` | Run all 4 solvers for given N. Returns results. |
| `GET` | `/status/{solver}` | Get current step count for live race display |
| `GET` | `/results` | Return all logged runs from `runs.json` |
| `GET` | `/agent/{n}` | Return which algorithm the agent selects for N |

### `/solve` request body
```json
{
  "n": 8
}
```

### `/solve` response
```json
{
  "bfs": {
    "algorithm": "bfs", "n": 8, "solved": false,
    "nodes": 100000, "time_ms": 3200, "memory_kb": 18400, "steps": 100000,
    "error": "BFS halted — node limit reached", "timestamp": 1710412800
  },
  "dfs": {
    "algorithm": "dfs", "n": 8, "solved": true,
    "nodes": 876, "time_ms": 12, "memory_kb": 140, "steps": 48,
    "state": [0, 4, 7, 5, 2, 6, 1, 3], "timestamp": 1710412800
  },
  "best_first": {
    "algorithm": "best_first", "n": 8, "solved": true,
    "nodes": 210, "time_ms": 8, "memory_kb": 92, "steps": 31,
    "state": [0, 4, 7, 5, 2, 6, 1, 3], "timestamp": 1710412800
  },
  "astar": {
    "algorithm": "astar", "n": 8, "solved": true,
    "nodes": 143, "time_ms": 6, "memory_kb": 80, "steps": 27,
    "state": [0, 4, 7, 5, 2, 6, 1, 3], "timestamp": 1710412800
  }
}
```

---

## Performance Metrics

Collected for each solver run and stored in `runs.json`.

### Log entry schema

Each run appends exactly one object:

```json
{
  "algorithm": "astar",
  "n": 8,
  "nodes": 152,
  "time_ms": 14,
  "memory_kb": 240,
  "steps": 33,
  "solved": true,
  "timestamp": 1710412800
}
```

`timestamp` is `int(time.time())` — lets the dashboard order runs and filter by most recent session.

For a halted BFS run, `solved` is `false` and `nodes` still contains the count reached before the limit, so the dashboard can render a partial bar rather than showing nothing:

```json
{
  "algorithm": "bfs",
  "n": 10,
  "nodes": 100000,
  "time_ms": 3200,
  "memory_kb": 18400,
  "steps": 100000,
  "solved": false,
  "error": "BFS halted — node limit reached",
  "timestamp": 1710412800
}
```

### Metric collection

| Metric | How measured |
|--------|-------------|
| `nodes` | Incremented on each state visit inside solver |
| `time_ms` | `time.time()` before and after solve call, converted to ms |
| `memory_kb` | `sys.getsizeof(queue/stack)` at peak, converted to KB |
| `solved` | Boolean — did solver return a valid solution within limits |
| `steps` | Incremented on each queen placement attempt |
| `timestamp` | `int(time.time())` at solve start |

---

## Report Notes

The file `report/peas_analysis.md` contains the 1-page written analysis for submission, covering:

- Formal N-Queens problem formulation (Unit 1)
- State space definition, operators, goal state
- PEAS model with justification for each component
- Task environment property analysis
- Rationality argument — why the agent's selection rule is rational given the performance measure
- Algorithm comparison findings from test runs

This written section is what separates a code submission from an academic project. Submit it alongside the codebase.

---

## Project Title (for submission form)

**"Comparative AI Agent for N-Queens: Search Algorithms, CSP, and Intelligent Agent Analysis"**

---

*All tools used are free and open source. No paid libraries, APIs, or services required.*
