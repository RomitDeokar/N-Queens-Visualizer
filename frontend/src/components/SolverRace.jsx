import React, { useMemo } from 'react';

const SOLVER_COLORS = {
  bfs: {
    bg: 'from-blue-500 to-blue-600',
    text: 'text-blue-400',
    accent: 'bg-blue-500',
    glow: 'shadow-blue-500/30',
    tag: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    barColor: '#3b82f6',
  },
  dfs: {
    bg: 'from-emerald-500 to-emerald-600',
    text: 'text-emerald-400',
    accent: 'bg-emerald-500',
    glow: 'shadow-emerald-500/30',
    tag: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    barColor: '#10b981',
  },
  best_first: {
    bg: 'from-amber-500 to-orange-500',
    text: 'text-amber-400',
    accent: 'bg-amber-500',
    glow: 'shadow-amber-500/30',
    tag: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    barColor: '#f59e0b',
  },
  astar: {
    bg: 'from-purple-500 to-violet-500',
    text: 'text-purple-400',
    accent: 'bg-purple-500',
    glow: 'shadow-purple-500/30',
    tag: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    barColor: '#8b5cf6',
  },
};

const SOLVER_LABELS = { bfs: 'BFS', dfs: 'DFS', best_first: 'Best-First', astar: 'A*' };
const SOLVER_ICONS = { bfs: '🌊', dfs: '🔍', best_first: '⚡', astar: '🌟' };
const SOLVER_TYPES = { bfs: 'Uninformed', dfs: 'Uninformed', best_first: 'Informed', astar: 'Informed' };

export default function SolverRace({ results, isRunning }) {
  const solverNames = ['bfs', 'dfs', 'best_first', 'astar'];

  // Sort by time (lowest first), with failed solvers at end
  const sorted = useMemo(() => {
    if (!results) return solverNames;
    return [...solverNames].sort((a, b) => {
      const aRes = results[a];
      const bRes = results[b];
      // Solved come before unsolved
      if (aRes?.solved && !bRes?.solved) return -1;
      if (!aRes?.solved && bRes?.solved) return 1;
      // Among solved, sort by time
      return (aRes?.time_ms ?? Infinity) - (bRes?.time_ms ?? Infinity);
    });
  }, [results]);

  // Winner
  const winner = useMemo(() => {
    if (!results) return null;
    const solved = solverNames.filter(s => results[s]?.solved);
    if (solved.length === 0) return null;
    return solved.reduce((best, s) => {
      const bestTime = results[best]?.time_ms ?? Infinity;
      const curTime = results[s]?.time_ms ?? Infinity;
      return curTime < bestTime ? s : best;
    });
  }, [results]);

  // Ranking
  const ranking = useMemo(() => {
    if (!results) return {};
    const solved = solverNames
      .filter(s => results[s]?.solved)
      .sort((a, b) => (results[a]?.time_ms ?? Infinity) - (results[b]?.time_ms ?? Infinity));
    const map = {};
    solved.forEach((s, i) => { map[s] = i + 1; });
    return map;
  }, [results]);

  // Max time for bar normalization (only among solved)
  const maxTime = useMemo(() => {
    if (!results) return 1;
    const times = solverNames
      .filter(s => results[s]?.solved && results[s]?.time_ms != null)
      .map(s => results[s].time_ms);
    return times.length > 0 ? Math.max(...times, 0.01) : 1;
  }, [results]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm shadow shadow-emerald-500/30">
            🏁
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Solver Race</h3>
            <p className="text-xs text-surface-400 mt-0.5">All four algorithms competing simultaneously</p>
          </div>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Racing...</span>
          </div>
        )}
      </div>

      {/* Race bars - visual time comparison */}
      {results && (
        <div className="mb-5 bg-surface-800/30 rounded-xl p-4 border border-surface-700/20">
          <div className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-3">Time Comparison</div>
          <div className="space-y-2.5">
            {sorted.map((name) => {
              const r = results[name];
              const color = SOLVER_COLORS[name];
              const isWin = winner === name;
              const pct = r?.solved && r.time_ms != null ? Math.max((r.time_ms / maxTime) * 100, 3) : 0;

              return (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-20 flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-sm">{SOLVER_ICONS[name]}</span>
                    <span className={`text-xs font-bold ${color.text}`}>{SOLVER_LABELS[name]}</span>
                  </div>
                  <div className="flex-1 h-6 bg-surface-700/30 rounded-full overflow-hidden relative">
                    {r?.solved ? (
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2 ${isWin ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : ''}`}
                        style={{
                          width: `${pct}%`,
                          background: isWin ? undefined : color.barColor,
                          minWidth: '40px',
                        }}
                      >
                        <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                          {r.time_ms?.toFixed(2)}ms
                        </span>
                      </div>
                    ) : r?.error ? (
                      <div className="h-full flex items-center pl-3">
                        <span className="text-[10px] text-red-400 font-medium">HALTED</span>
                      </div>
                    ) : (
                      <div className="h-full flex items-center pl-3">
                        <span className="text-[10px] text-surface-500">—</span>
                      </div>
                    )}
                  </div>
                  {isWin && <span className="text-sm flex-shrink-0">🏆</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {solverNames.map((name) => {
          const r = results?.[name];
          const color = SOLVER_COLORS[name];
          const isWinner = winner === name;
          const isFailed = r && !r.solved && r.error;
          const rank = ranking[name];
          const timeProgress = r?.solved ? 100 : 0;

          return (
            <div
              key={name}
              className={`relative rounded-xl p-4 transition-all duration-500 ${
                isWinner
                  ? `bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-2 border-emerald-500/40 shadow-lg ${color.glow}`
                  : isFailed
                  ? 'bg-red-500/5 border border-red-500/20'
                  : 'bg-surface-800/50 border border-surface-700/40 hover:border-surface-600/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{SOLVER_ICONS[name]}</span>
                  <span className={`font-bold text-sm ${color.text}`}>{SOLVER_LABELS[name]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${color.tag}`}>
                    {SOLVER_TYPES[name]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isWinner && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      🏆 #1
                    </span>
                  )}
                  {rank && rank > 1 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-300 border border-surface-600/30 font-bold">
                      #{rank}
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                      HALTED
                    </span>
                  )}
                </div>
              </div>

              <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color.bg} transition-all duration-700 ease-out ${
                    isRunning && !r?.solved ? 'progress-active' : ''
                  }`}
                  style={{ width: `${timeProgress}%` }}
                />
              </div>

              {r && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="stat-pill">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{r.time_ms != null ? r.time_ms.toFixed(2) : '—'} ms</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Nodes</span>
                    <span className="stat-value">{r.nodes?.toLocaleString() ?? '—'}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Steps</span>
                    <span className="stat-value">{r.steps?.toLocaleString() ?? '—'}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Memory</span>
                    <span className="stat-value">{r.memory_kb != null ? r.memory_kb.toFixed(1) : '—'} KB</span>
                  </div>
                </div>
              )}

              {!r && !isRunning && (
                <div className="text-center py-3">
                  <span className="text-xs text-surface-500">Click Solve to start</span>
                </div>
              )}

              {isFailed && (
                <div className="mt-2 text-[11px] text-red-400/80 font-mono bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/10">
                  {r.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Winner Summary */}
      {results && winner && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-surface-800/40 to-surface-800/40 border border-emerald-500/20">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm text-surface-200">
                <span className={`font-bold ${SOLVER_COLORS[winner].text}`}>{SOLVER_LABELS[winner]}</span>
                {' '}wins with{' '}
                <span className="font-mono font-bold text-emerald-300">
                  {results[winner]?.time_ms?.toFixed(2)} ms
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-surface-400 flex-wrap">
              {solverNames.filter(s => results[s]?.solved && s !== winner).map(s => (
                <span key={s} className="font-mono">
                  <span className={SOLVER_COLORS[s].text}>{SOLVER_LABELS[s]}</span>
                  {': '}
                  {results[s]?.time_ms?.toFixed(2)}ms
                  {results[winner]?.time_ms > 0 && (
                    <span className="text-surface-500 ml-1">
                      ({((results[s]?.time_ms / results[winner]?.time_ms)).toFixed(1)}x)
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
