import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Board from './components/Board.jsx';
import SolverRace from './components/SolverRace.jsx';
import Dashboard from './components/Dashboard.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import StatePanel from './components/StatePanel.jsx';

const API_BASE = '';

// All N values from 1 to 15 (odd AND even)
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

  // Animation state for step-by-step playback
  const [animQueens, setAnimQueens] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef(null);

  // Fetch agent info when N changes
  useEffect(() => {
    fetch(`${API_BASE}/agent/${n}`)
      .then(res => res.json())
      .then(data => setAgentInfo(data))
      .catch(() => {});
  }, [n]);

  // Fetch historical results
  const fetchRuns = useCallback(() => {
    fetch(`${API_BASE}/results`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllRuns(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Solve
  const handleSolve = async () => {
    setIsRunning(true);
    setResults(null);
    setAnimQueens([]);
    setIsAnimating(false);
    if (animRef.current) clearTimeout(animRef.current);

    try {
      const res = await fetch(`${API_BASE}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n }),
      });
      const data = await res.json();
      setResults(data);
      fetchRuns();

      // Find best solved algorithm for display
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
    let step = 0;

    const next = () => {
      if (step < solution.length) {
        setAnimQueens(prev => [...prev, solution[step]]);
        step++;
        animRef.current = setTimeout(next, 250);
      } else {
        setIsAnimating(false);
      }
    };
    next();
  };

  const handleAlgoClick = (algo) => {
    setActiveAlgo(algo);
    if (animRef.current) clearTimeout(animRef.current);
    const r = results?.[algo];
    if (r?.state && r.state.length > 0) {
      animateQueens(r.state);
    } else {
      setAnimQueens([]);
      setIsAnimating(false);
    }
  };

  // Current queens to display
  const displayQueens = isAnimating || animQueens.length > 0
    ? animQueens
    : results?.[activeAlgo]?.state || [];

  // Run All button — run for a selection of N values
  const [runningAll, setRunningAll] = useState(false);
  const handleRunAll = async () => {
    setRunningAll(true);
    const runValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const nVal of runValues) {
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
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'agent', label: 'Agent', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/8 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-brand-500/30">
                ♛
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  <span className="gradient-text">N-Queens</span>
                  <span className="text-surface-300 font-light ml-2">AI Solver</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-surface-500 mt-0.5 tracking-wide">
                  Comparative Search Algorithm Visualizer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* N Selector - Scrollable */}
              <div className="flex items-center gap-2 bg-surface-800/80 rounded-xl px-3 py-2 border border-surface-700/50 backdrop-blur-sm">
                <span className="text-xs text-surface-400 font-semibold whitespace-nowrap">N =</span>
                <div className="flex gap-1 overflow-x-auto max-w-[280px] sm:max-w-none scrollbar-hide">
                  {N_OPTIONS.map(nVal => (
                    <button
                      key={nVal}
                      onClick={() => { setN(nVal); setResults(null); setAnimQueens([]); }}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all duration-200 flex-shrink-0 ${
                        n === nVal
                          ? 'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/40 scale-110'
                          : 'text-surface-400 hover:bg-surface-700 hover:text-surface-200'
                      }`}
                    >
                      {nVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solve Button */}
              <button
                onClick={handleSolve}
                disabled={isRunning}
                className="btn-primary flex items-center gap-2 group"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <span className="group-hover:animate-pulse">⚡</span>
                    <span>Solve N={n}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 bg-surface-800/60 rounded-xl p-1 w-fit backdrop-blur-sm border border-surface-700/30">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* ===== VISUALIZER TAB ===== */}
          {activeTab === 'visualizer' && (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Algorithm Selector */}
              {results && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-surface-400 font-semibold mr-1">Algorithm:</span>
                  {ALGO_NAMES.map(algo => {
                    const r = results[algo];
                    return (
                      <button
                        key={algo}
                        onClick={() => handleAlgoClick(algo)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                          activeAlgo === algo
                            ? 'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                            : r?.solved
                            ? 'bg-surface-800/80 text-surface-300 border border-surface-600/50 hover:border-brand-500/40 hover:bg-surface-700/80'
                            : 'bg-surface-800/40 text-surface-500 border border-surface-700/30'
                        }`}
                      >
                        <span>{ALGO_ICONS[algo]}</span>
                        {ALGO_LABELS[algo]}
                        {r?.solved && <span className="text-emerald-400">✓</span>}
                        {r?.error && <span className="text-red-400">✗</span>}
                      </button>
                    );
                  })}

                  <div className="ml-auto flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showConstraints ? 'bg-brand-600' : 'bg-surface-700'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showConstraints ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs text-surface-400 group-hover:text-surface-300">Constraints</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${showHeatmap ? 'bg-brand-600' : 'bg-surface-700'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showHeatmap ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs text-surface-400 group-hover:text-surface-300">Heatmap</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Board */}
                <div className="lg:col-span-2">
                  <div className="glass-card p-6 sm:p-8 flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-5">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm shadow shadow-amber-500/30">♛</span>
                        <span>Board — {n}x{n}</span>
                      </h3>
                      {isAnimating && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                          <span className="text-xs text-amber-400 font-medium">Placing queens...</span>
                        </div>
                      )}
                    </div>
                    <Board
                      n={n}
                      queens={displayQueens}
                      showConstraints={showConstraints}
                      showHeatmap={showHeatmap}
                    />
                  </div>
                </div>

                {/* Right - State Panel */}
                <div className="space-y-6">
                  <StatePanel
                    queens={displayQueens}
                    n={n}
                    activeAlgo={activeAlgo}
                    results={results}
                  />
                </div>
              </div>

              {/* Solver Race */}
              <div className="mt-6">
                <SolverRace results={results} isRunning={isRunning} />
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
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div />
                <button
                  onClick={handleRunAll}
                  disabled={runningAll}
                  className="btn-primary flex items-center gap-2"
                >
                  {runningAll ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <AgentPanel agentInfo={agentInfo} n={n} />
              <div className="space-y-6">
                {/* Agent Selection Rules */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm shadow shadow-blue-500/30">📋</span>
                    Agent Selection Rules
                  </h3>
                  <div className="space-y-3">
                    {[
                      { range: 'N <= 6', algo: 'BFS', reason: 'Feasible for small state spaces — complete search', icon: '🌊' },
                      { range: '7 <= N <= 15', algo: 'A*', reason: 'Best balance of completeness and efficiency', icon: '🌟' },
                      { range: 'N > 15', algo: 'Best-First', reason: 'Greedy approach needed for very large boards', icon: '⚡' },
                    ].map((rule, i) => {
                      const isActive = (i === 0 && n <= 6) || (i === 1 && n > 6 && n <= 15) || (i === 2 && n > 15);
                      return (
                        <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? 'bg-brand-500/10 border-brand-500/30 shadow-lg shadow-brand-500/10'
                            : 'bg-surface-800/40 border-surface-700/30'
                        }`}>
                          <span className="text-lg mt-0.5">{rule.icon}</span>
                          <div>
                            <div className="text-sm text-surface-200">
                              <span className="font-mono font-bold text-brand-300">{rule.range}</span>
                              <span className="mx-2 text-surface-500">→</span>
                              <span className="font-semibold">{rule.algo}</span>
                            </div>
                            <div className="text-xs text-surface-400 mt-0.5">{rule.reason}</div>
                          </div>
                          {isActive && <span className="ml-auto text-brand-400 text-xs font-semibold bg-brand-500/15 px-2 py-0.5 rounded-full">Active</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rationality */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow shadow-amber-500/30">💡</span>
                    Rationality Argument
                  </h3>
                  <div className="text-sm text-surface-300 leading-relaxed space-y-3">
                    <p>
                      The agent is <span className="text-brand-300 font-semibold">rational</span> because
                      it selects the algorithm that maximizes the performance measure (minimising solve time
                      and nodes expanded) given its knowledge of how each algorithm scales.
                    </p>
                    <p>
                      BFS is <span className="text-blue-400 font-medium">complete</span> but grows exponentially
                      — suitable only for small N. A* uses an admissible heuristic to
                      find <span className="text-purple-400 font-medium">optimal paths efficiently</span>.
                      Best First Search trades optimality for <span className="text-amber-400 font-medium">speed</span> at
                      large scales.
                    </p>
                    <div className="mt-4 p-3 rounded-lg bg-surface-800/40 border border-surface-700/30">
                      <p className="text-xs text-surface-400 italic">
                        This is honest rule-based selection — not claimed as inference or learning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 mt-16 py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">♛</span>
            <span className="text-sm font-semibold gradient-text">N-Queens AI Solver</span>
          </div>
          <p className="text-xs text-surface-500">
            Comparative AI Agent — Search Algorithms, CSP & Intelligent Agent Analysis
          </p>
        </div>
      </footer>
    </div>
  );
}
