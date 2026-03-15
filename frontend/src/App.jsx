import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Board from './components/Board.jsx';
import SolverRace from './components/SolverRace.jsx';
import Dashboard from './components/Dashboard.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import StatePanel from './components/StatePanel.jsx';
import LogPanel from './components/LogPanel.jsx';

const API_BASE = '';
const N_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const ALGO_NAMES = ['bfs', 'dfs', 'best_first', 'astar'];
const ALGO_LABELS = { bfs: 'BFS', dfs: 'DFS', best_first: 'Best-First', astar: 'A*' };
const ALGO_ICONS = { bfs: '🌊', dfs: '🔍', best_first: '⚡', astar: '🌟' };

export default function App() {
  const [n, setN] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [allRuns, setAllRuns] = useState([]);
  const [agentInfo, setAgentInfo] = useState(null);
  const [activeAlgo, setActiveAlgo] = useState('astar');
  const [showConstraints, setShowConstraints] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState('visualizer');

  // Animation state
  const [animQueens, setAnimQueens] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(200);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef(null);
  const pausedRef = useRef(false);

  // Solutions state
  const [solutionsData, setSolutionsData] = useState(null);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [currentSolutionIdx, setCurrentSolutionIdx] = useState(0);
  const [showSolutionBrowser, setShowSolutionBrowser] = useState(false);

  // Backtracking visualization
  const [isBacktracking, setIsBacktracking] = useState(false);
  const [backtrackStep, setBacktrackStep] = useState(0);
  const [checkingCell, setCheckingCell] = useState(null);
  const [traceData, setTraceData] = useState([]);
  const backtrackRef = useRef(null);
  const backtrackPausedRef = useRef(false);
  const [backtrackPaused, setBacktrackPaused] = useState(false);

  // Fetch agent info
  useEffect(() => {
    fetch(`${API_BASE}/agent/${n}`)
      .then(res => res.json())
      .then(data => setAgentInfo(data))
      .catch(() => {});
  }, [n]);

  // Fetch runs
  const fetchRuns = useCallback(() => {
    fetch(`${API_BASE}/results`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllRuns(data); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  // Reset solutions when N changes
  useEffect(() => {
    setSolutionsData(null);
    setShowSolutionBrowser(false);
    setCurrentSolutionIdx(0);
    setTraceData([]);
  }, [n]);

  const fetchSolutions = async () => {
    setLoadingSolutions(true);
    try {
      const res = await fetch(`${API_BASE}/solutions/${n}`);
      const data = await res.json();
      setSolutionsData(data);
      setShowSolutionBrowser(true);
      setCurrentSolutionIdx(0);
      if (data.trace) setTraceData(data.trace);
    } catch (err) {
      console.error('Solutions fetch error:', err);
    } finally {
      setLoadingSolutions(false);
    }
  };

  // Solve
  const handleSolve = async () => {
    setIsRunning(true);
    setResults(null);
    setAnimQueens([]);
    setIsAnimating(false);
    setIsBacktracking(false);
    setCheckingCell(null);
    setShowSolutionBrowser(false);
    if (animRef.current) clearTimeout(animRef.current);
    if (backtrackRef.current) clearTimeout(backtrackRef.current);

    try {
      const res = await fetch(`${API_BASE}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n }),
      });
      const data = await res.json();
      setResults(data);
      fetchRuns();

      const best = ALGO_NAMES
        .filter(a => data[a]?.solved)
        .sort((a, b) => (data[a]?.time_ms || Infinity) - (data[b]?.time_ms || Infinity))[0];

      if (best) {
        setActiveAlgo(best);
        const solution = data[best].state;
        if (solution && solution.length > 0) {
          animateQueens(solution);
        }
      } else {
        setActiveAlgo(ALGO_NAMES.find(a => data[a]) || 'astar');
      }
    } catch (err) {
      console.error('Solve error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const animateQueens = (solution) => {
    setIsAnimating(true);
    setAnimQueens([]);
    setIsPaused(false);
    pausedRef.current = false;
    let step = 0;

    const next = () => {
      if (pausedRef.current) {
        animRef.current = setTimeout(next, 100);
        return;
      }
      if (step < solution.length) {
        setAnimQueens(prev => [...prev, solution[step]]);
        step++;
        animRef.current = setTimeout(next, animSpeed);
      } else {
        setIsAnimating(false);
      }
    };
    next();
  };

  const handleAlgoClick = (algo) => {
    setActiveAlgo(algo);
    if (animRef.current) clearTimeout(animRef.current);
    if (backtrackRef.current) clearTimeout(backtrackRef.current);
    setIsBacktracking(false);
    setCheckingCell(null);
    const r = results?.[algo];
    if (r?.state && r.state.length > 0) {
      animateQueens(r.state);
    } else {
      setAnimQueens([]);
      setIsAnimating(false);
    }
  };

  // Backtracking visualization with full trace
  const startBacktrackVisualization = async () => {
    if (n > 8) {
      alert('Backtracking visualization is available for N <= 8 to keep animations smooth.');
      return;
    }

    setIsBacktracking(true);
    setBacktrackStep(0);
    setAnimQueens([]);
    setCheckingCell(null);
    setBacktrackPaused(false);
    backtrackPausedRef.current = false;

    let trace = traceData;
    if (!trace || trace.length === 0) {
      setLoadingSolutions(true);
      try {
        const res = await fetch(`${API_BASE}/solutions/${n}`);
        const data = await res.json();
        trace = data.trace || [];
        setTraceData(trace);
        setSolutionsData(data);
      } catch { return; } finally { setLoadingSolutions(false); }
    }

    if (!trace?.length) {
      setIsBacktracking(false);
      return;
    }

    let idx = 0;

    const playStep = () => {
      if (backtrackPausedRef.current) {
        backtrackRef.current = setTimeout(playStep, 100);
        return;
      }

      if (idx >= trace.length) {
        setIsBacktracking(false);
        setCheckingCell(null);
        return;
      }

      const step = trace[idx];
      setBacktrackStep(idx);

      if (step.type === 'check') {
        setCheckingCell({ row: step.row, col: step.col });
      } else if (step.type === 'place') {
        setAnimQueens(step.state.slice());
        setCheckingCell({ row: step.row, col: step.col });
      } else if (step.type === 'remove') {
        setAnimQueens(step.state.slice());
        setCheckingCell(null);
      } else if (step.type === 'solution') {
        setAnimQueens(step.state.slice());
        setCheckingCell(null);
      }

      idx++;
      const speed = Math.max(15, animSpeed / 3);
      backtrackRef.current = setTimeout(playStep, speed);
    };

    playStep();
  };

  const toggleBacktrackPause = () => {
    const newVal = !backtrackPaused;
    setBacktrackPaused(newVal);
    backtrackPausedRef.current = newVal;
  };

  const stopBacktrackVisualization = () => {
    if (backtrackRef.current) clearTimeout(backtrackRef.current);
    setIsBacktracking(false);
    setCheckingCell(null);
    setBacktrackPaused(false);
    backtrackPausedRef.current = false;
  };

  // Display queens - determine what to show
  const displayQueens = (() => {
    if (isBacktracking || isAnimating || animQueens.length > 0) return animQueens;
    if (showSolutionBrowser && solutionsData?.all_solutions?.length > 0) {
      return solutionsData.all_solutions[currentSolutionIdx] || [];
    }
    return results?.[activeAlgo]?.state || [];
  })();

  // Run All
  const [runningAll, setRunningAll] = useState(false);
  const handleRunAll = async () => {
    setRunningAll(true);
    for (const nVal of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      try {
        await fetch(`${API_BASE}/solve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ n: nVal }),
        });
      } catch (e) {}
    }
    fetchRuns();
    setRunningAll(false);
  };

  const tabs = [
    { id: 'visualizer', label: 'Visualizer', icon: '♛' },
    { id: 'solutions', label: 'All Solutions', icon: '🔢' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'agent', label: 'Agent', icon: '🤖' },
  ];

  // Toggle pause for queen placement animation
  const toggleAnimPause = () => {
    const newVal = !isPaused;
    setIsPaused(newVal);
    pausedRef.current = newVal;
  };

  return (
    <div className="app-root">
      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-top">
            <div className="header-brand">
              <div className="brand-icon">♛</div>
              <div>
                <h1 className="brand-title">
                  <span className="gradient-text">N-Queens</span>
                  <span className="brand-subtitle">AI Solver</span>
                </h1>
                <p className="brand-tagline">Comparative Search Algorithm Visualizer</p>
              </div>
            </div>

            <div className="header-controls">
              {/* N Selector */}
              <div className="n-selector">
                <span className="n-label">N =</span>
                <div className="n-buttons">
                  {N_OPTIONS.map(nVal => (
                    <button
                      key={nVal}
                      onClick={() => {
                        setN(nVal);
                        setResults(null);
                        setAnimQueens([]);
                        setIsBacktracking(false);
                        setCheckingCell(null);
                        setTraceData([]);
                        if (animRef.current) clearTimeout(animRef.current);
                        if (backtrackRef.current) clearTimeout(backtrackRef.current);
                      }}
                      className={`n-btn ${n === nVal ? 'n-btn-active' : ''}`}
                    >
                      {nVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solve Button */}
              <button onClick={handleSolve} disabled={isRunning} className="btn-primary solve-btn">
                {isRunning ? (
                  <>
                    <svg className="spin-icon" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Solve N={n}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          {/* ===== VISUALIZER TAB ===== */}
          {activeTab === 'visualizer' && (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* Controls Bar */}
              {results && (
                <div className="controls-bar">
                  <div className="algo-selector">
                    <span className="controls-label">Algorithm:</span>
                    {ALGO_NAMES.map(algo => {
                      const r = results[algo];
                      return (
                        <button
                          key={algo}
                          onClick={() => handleAlgoClick(algo)}
                          className={`algo-btn ${activeAlgo === algo ? 'algo-btn-active' : r?.solved ? 'algo-btn-solved' : 'algo-btn-failed'}`}
                        >
                          <span>{ALGO_ICONS[algo]}</span>
                          {ALGO_LABELS[algo]}
                          {r?.solved && <span className="text-emerald-400">✓</span>}
                          {r?.error && <span className="text-red-400">✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="controls-row">
                    {/* Toggles */}
                    <label className="toggle-label" onClick={() => setShowConstraints(!showConstraints)}>
                      <div className={`toggle-track ${showConstraints ? 'toggle-on' : ''}`}>
                        <div className={`toggle-thumb ${showConstraints ? 'toggle-thumb-on' : ''}`} />
                      </div>
                      <span>Constraints</span>
                    </label>
                    <label className="toggle-label" onClick={() => setShowHeatmap(!showHeatmap)}>
                      <div className={`toggle-track ${showHeatmap ? 'toggle-on' : ''}`}>
                        <div className={`toggle-thumb ${showHeatmap ? 'toggle-thumb-on' : ''}`} />
                      </div>
                      <span>Heatmap</span>
                    </label>

                    {/* Speed Control */}
                    <div className="speed-control">
                      <span className="speed-label">🐢</span>
                      <input
                        type="range"
                        min="15"
                        max="500"
                        value={515 - animSpeed}
                        onChange={(e) => setAnimSpeed(515 - parseInt(e.target.value))}
                        className="speed-slider"
                      />
                      <span className="speed-label">🐇</span>
                      <span className="speed-value">{animSpeed}ms</span>
                    </div>

                    {/* Backtrack Viz Button */}
                    {n <= 8 && (
                      <div className="backtrack-controls">
                        <button
                          onClick={isBacktracking ? stopBacktrackVisualization : startBacktrackVisualization}
                          className={`backtrack-btn ${isBacktracking ? 'backtrack-btn-stop' : ''}`}
                        >
                          {isBacktracking ? '⏹ Stop' : '▶ Backtrack Viz'}
                        </button>
                        {isBacktracking && (
                          <button
                            onClick={toggleBacktrackPause}
                            className="backtrack-btn-pause"
                          >
                            {backtrackPaused ? '▶ Resume' : '⏸ Pause'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Pause button for normal animation */}
                    {isAnimating && (
                      <button onClick={toggleAnimPause} className="backtrack-btn-pause">
                        {isPaused ? '▶ Resume' : '⏸ Pause'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="visualizer-grid">
                {/* Left - Board */}
                <div className="board-section">
                  <div className="glass-card board-card">
                    <div className="board-card-header">
                      <h3 className="board-title">
                        <span className="board-title-icon">♛</span>
                        <span>Board — {n}×{n}</span>
                      </h3>
                      <div className="board-status">
                        {isAnimating && (
                          <div className="status-badge status-animating">
                            <div className="status-dot status-dot-amber" />
                            <span>Placing queens... ({animQueens.length}/{n})</span>
                          </div>
                        )}
                        {isBacktracking && (
                          <div className="status-badge status-backtracking">
                            <div className="status-dot status-dot-blue" />
                            <span>Step {backtrackStep + 1}{backtrackPaused ? ' (Paused)' : ''}</span>
                          </div>
                        )}
                        {!isAnimating && !isBacktracking && displayQueens.length === n && n > 0 && (
                          <div className="status-badge status-solved">
                            <div className="status-dot status-dot-green" />
                            <span>Solved!</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Board
                      n={n}
                      queens={displayQueens}
                      showConstraints={showConstraints}
                      showHeatmap={showHeatmap}
                      checkingCell={checkingCell}
                    />
                  </div>
                </div>

                {/* Right - Side panels */}
                <div className="side-panels">
                  {/* Log Panel - always visible during backtracking */}
                  <LogPanel
                    trace={traceData}
                    currentStep={backtrackStep}
                    isActive={isBacktracking}
                    n={n}
                  />

                  <StatePanel
                    queens={displayQueens}
                    n={n}
                    activeAlgo={activeAlgo}
                    results={results}
                    solutionsData={solutionsData}
                  />
                </div>
              </div>

              {/* Solver Race */}
              <div className="race-section">
                <SolverRace results={results} isRunning={isRunning} />
              </div>
            </motion.div>
          )}

          {/* ===== ALL SOLUTIONS TAB ===== */}
          {activeTab === 'solutions' && (
            <motion.div
              key="solutions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="glass-card section-card">
                <div className="section-header">
                  <div className="section-header-left">
                    <div className="section-icon section-icon-violet">🔢</div>
                    <div>
                      <h3 className="section-title">All Solutions for N={n}</h3>
                      <p className="section-subtitle">Find and browse every valid queen placement</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchSolutions}
                    disabled={loadingSolutions}
                    className="btn-primary"
                  >
                    {loadingSolutions ? (
                      <>
                        <svg className="spin-icon" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Computing...</span>
                      </>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>Find All Solutions</span>
                      </>
                    )}
                  </button>
                </div>

                {solutionsData && (
                  <div className="solutions-content solution-fade-in">
                    <div className="stats-grid stats-grid-4">
                      <div className="stat-pill">
                        <span className="stat-label">Total Solutions</span>
                        <span className="stat-value stat-value-lg stat-value-amber">{solutionsData.total_solutions?.toLocaleString()}</span>
                      </div>
                      <div className="stat-pill">
                        <span className="stat-label">Total Steps</span>
                        <span className="stat-value">{solutionsData.total_steps?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="stat-pill">
                        <span className="stat-label">Compute Time</span>
                        <span className="stat-value">{solutionsData.time_ms?.toFixed(2) || '0'} ms</span>
                      </div>
                      <div className="stat-pill">
                        <span className="stat-label">Board Size</span>
                        <span className="stat-value">{n} × {n}</span>
                      </div>
                    </div>

                    {solutionsData.all_solutions && solutionsData.all_solutions.length > 0 && (
                      <div>
                        <div className="solution-browser-header">
                          <span className="solution-counter">
                            Solution {currentSolutionIdx + 1} of {solutionsData.all_solutions.length}
                            {solutionsData.all_solutions.length < solutionsData.total_solutions && (
                              <span className="solution-counter-note"> (showing first {solutionsData.all_solutions.length})</span>
                            )}
                          </span>
                          <div className="solution-nav">
                            <button
                              onClick={() => setCurrentSolutionIdx(0)}
                              disabled={currentSolutionIdx === 0}
                              className="nav-btn"
                            >⏮</button>
                            <button
                              onClick={() => setCurrentSolutionIdx(Math.max(0, currentSolutionIdx - 1))}
                              disabled={currentSolutionIdx === 0}
                              className="nav-btn"
                            >← Prev</button>
                            <button
                              onClick={() => setCurrentSolutionIdx(Math.min(solutionsData.all_solutions.length - 1, currentSolutionIdx + 1))}
                              disabled={currentSolutionIdx >= solutionsData.all_solutions.length - 1}
                              className="nav-btn"
                            >Next →</button>
                            <button
                              onClick={() => setCurrentSolutionIdx(solutionsData.all_solutions.length - 1)}
                              disabled={currentSolutionIdx >= solutionsData.all_solutions.length - 1}
                              className="nav-btn"
                            >⏭</button>
                          </div>
                        </div>
                        <div className="solution-board-container">
                          <Board
                            n={n}
                            queens={solutionsData.all_solutions[currentSolutionIdx]}
                            showConstraints={true}
                            showHeatmap={false}
                          />
                        </div>
                        <div className="solution-state">
                          State = [{solutionsData.all_solutions[currentSolutionIdx]?.join(', ')}]
                        </div>
                      </div>
                    )}

                    {solutionsData.total_solutions === 0 && (
                      <div className="empty-state">
                        <span className="empty-icon">😔</span>
                        <p className="empty-text">No solutions exist for N={n}</p>
                        <p className="empty-subtext">The {n}-Queens problem has no valid placement.</p>
                      </div>
                    )}
                  </div>
                )}

                {!solutionsData && (
                  <div className="empty-state">
                    <span className="empty-icon" style={{ opacity: 0.4 }}>🔍</span>
                    <p className="empty-text">Click "Find All Solutions" to enumerate every valid placement for N={n}</p>
                  </div>
                )}
              </div>

              {/* Known solutions table */}
              <div className="glass-card section-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="known-solutions-title">
                  <span>📚</span> Known Solution Counts (N=1 to 15)
                </h3>
                <div className="known-solutions-grid">
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(nv => {
                    const counts = {1:1,2:0,3:0,4:2,5:10,6:4,7:40,8:92,9:352,10:724,11:2680,12:14200,13:73712,14:365596,15:2279184};
                    return (
                      <div key={nv} className={`known-solution-item ${nv === n ? 'known-solution-active' : ''}`}>
                        <div className="known-solution-n">N={nv}</div>
                        <div className="known-solution-count">{counts[nv]?.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== DASHBOARD TAB ===== */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="dashboard-header">
                <div />
                <button onClick={handleRunAll} disabled={runningAll} className="btn-primary">
                  {runningAll ? (
                    <>
                      <svg className="spin-icon" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Running all sizes...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Run All (N=1 to 12)</span>
                    </>
                  )}
                </button>
              </div>
              <Dashboard allResults={allRuns} />
            </motion.div>
          )}

          {/* ===== AGENT TAB ===== */}
          {activeTab === 'agent' && (
            <motion.div
              key="agent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="agent-grid"
            >
              <AgentPanel agentInfo={agentInfo} n={n} />
              <div className="agent-side">
                {/* Agent Selection Rules */}
                <div className="glass-card section-card">
                  <h3 className="section-title-sm">
                    <span className="section-icon section-icon-blue">📋</span>
                    Agent Selection Rules
                  </h3>
                  <div className="rules-list">
                    {[
                      { range: 'N <= 6', algo: 'BFS', reason: 'Feasible for small state spaces - complete search', icon: '🌊' },
                      { range: '7 <= N <= 15', algo: 'A*', reason: 'Best balance of completeness and efficiency', icon: '🌟' },
                      { range: 'N > 15', algo: 'Best-First', reason: 'Greedy approach needed for very large boards', icon: '⚡' },
                    ].map((rule, i) => {
                      const isActive = (i === 0 && n <= 6) || (i === 1 && n > 6 && n <= 15) || (i === 2 && n > 15);
                      return (
                        <div key={i} className={`rule-item ${isActive ? 'rule-item-active' : ''}`}>
                          <span className="rule-icon">{rule.icon}</span>
                          <div>
                            <div className="rule-text">
                              <span className="rule-range">{rule.range}</span>
                              <span className="rule-arrow">→</span>
                              <span className="rule-algo">{rule.algo}</span>
                            </div>
                            <div className="rule-reason">{rule.reason}</div>
                          </div>
                          {isActive && <span className="rule-active-badge">Active</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rationality */}
                <div className="glass-card section-card">
                  <h3 className="section-title-sm">
                    <span className="section-icon section-icon-amber">💡</span>
                    Rationality Argument
                  </h3>
                  <div className="rationality-text">
                    <p>
                      The agent is <span className="text-brand-300 font-semibold">rational</span> because
                      it selects the algorithm that maximizes the performance measure (minimising solve time
                      and nodes expanded) given its knowledge of how each algorithm scales.
                    </p>
                    <p>
                      BFS is <span className="text-blue-400 font-medium">complete</span> but grows exponentially
                      - suitable only for small N. A* uses an admissible heuristic to
                      find <span className="text-purple-400 font-medium">optimal paths efficiently</span>.
                      Best First Search trades optimality for <span className="text-amber-400 font-medium">speed</span> at
                      large scales.
                    </p>
                    <div className="rationality-note">
                      <p>This is honest rule-based selection - not claimed as inference or learning.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-icon">♛</span>
            <span className="gradient-text footer-title">N-Queens AI Solver</span>
          </div>
          <p className="footer-text">Comparative AI Agent - Search Algorithms, CSP & Intelligent Agent Analysis</p>
        </div>
      </footer>
    </div>
  );
}
