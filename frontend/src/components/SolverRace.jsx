import React, { useMemo } from 'react';

const SOLVER_COLORS = {
  bfs: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-400', barColor: '#3b82f6', tag: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  dfs: { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400', barColor: '#10b981', tag: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  best_first: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-400', barColor: '#f59e0b', tag: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  astar: { bg: 'from-purple-500 to-violet-500', text: 'text-purple-400', barColor: '#8b5cf6', tag: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
};

const SOLVER_LABELS = { bfs: 'BFS', dfs: 'DFS', best_first: 'Best-First', astar: 'A*' };
const SOLVER_ICONS = { bfs: '🌊', dfs: '🔍', best_first: '⚡', astar: '🌟' };
const SOLVER_TYPES = { bfs: 'Uninformed', dfs: 'Uninformed', best_first: 'Informed', astar: 'Informed' };

export default function SolverRace({ results, isRunning }) {
  const solverNames = ['bfs', 'dfs', 'best_first', 'astar'];

  const sorted = useMemo(() => {
    if (!results) return solverNames;
    return [...solverNames].sort((a, b) => {
      const aRes = results[a];
      const bRes = results[b];
      if (aRes?.solved && !bRes?.solved) return -1;
      if (!aRes?.solved && bRes?.solved) return 1;
      return (aRes?.time_ms ?? Infinity) - (bRes?.time_ms ?? Infinity);
    });
  }, [results]);

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

  const ranking = useMemo(() => {
    if (!results) return {};
    const solved = solverNames
      .filter(s => results[s]?.solved)
      .sort((a, b) => (results[a]?.time_ms ?? Infinity) - (results[b]?.time_ms ?? Infinity));
    const map = {};
    solved.forEach((s, i) => { map[s] = i + 1; });
    return map;
  }, [results]);

  // Max time for bar normalization - use log scale for large differences
  const maxTime = useMemo(() => {
    if (!results) return 1;
    const times = solverNames
      .filter(s => results[s]?.solved && results[s]?.time_ms != null)
      .map(s => results[s].time_ms);
    return times.length > 0 ? Math.max(...times, 0.01) : 1;
  }, [results]);

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 3px 8px rgba(16, 185, 129, 0.3)',
          }}>🏁</div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Solver Race</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>All four algorithms competing simultaneously</p>
          </div>
        </div>
        {isRunning && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 10,
            padding: '0.375rem 0.75rem',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 500 }}>Racing...</span>
          </div>
        )}
      </div>

      {/* Visual Race Bars */}
      {results && (
        <div style={{
          marginBottom: '1.25rem',
          background: 'rgba(31, 41, 55, 0.3)',
          borderRadius: 12,
          padding: '1rem',
          border: '1px solid rgba(55, 65, 81, 0.2)',
        }}>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>
            Time Comparison
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {sorted.map((name) => {
              const r = results[name];
              const color = SOLVER_COLORS[name];
              const isWin = winner === name;
              const pct = r?.solved && r.time_ms != null ? Math.max((r.time_ms / maxTime) * 100, 5) : 0;

              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.875rem' }}>{SOLVER_ICONS[name]}</span>
                    <span className={color.text} style={{ fontSize: '0.75rem', fontWeight: 700 }}>{SOLVER_LABELS[name]}</span>
                  </div>
                  <div style={{
                    flex: 1, height: 28,
                    background: 'rgba(55, 65, 81, 0.2)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {r?.solved ? (
                      <div style={{
                        height: '100%',
                        borderRadius: 20,
                        transition: 'width 0.7s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 8,
                        width: `${pct}%`,
                        minWidth: 50,
                        background: isWin
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : color.barColor,
                      }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}>
                          {r.time_ms?.toFixed(2)}ms
                        </span>
                      </div>
                    ) : r?.error ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                        <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 500 }}>HALTED</span>
                      </div>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>—</span>
                      </div>
                    )}
                  </div>
                  {isWin && <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>🏆</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Solver Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {solverNames.map((name) => {
          const r = results?.[name];
          const color = SOLVER_COLORS[name];
          const isWinner = winner === name;
          const isFailed = r && !r.solved && r.error;
          const rank = ranking[name];

          return (
            <div
              key={name}
              style={{
                position: 'relative',
                borderRadius: 14,
                padding: '1rem',
                transition: 'all 0.3s',
                background: isWinner
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(20, 184, 166, 0.04))'
                  : isFailed
                  ? 'rgba(220, 38, 38, 0.04)'
                  : 'rgba(31, 41, 55, 0.4)',
                border: isWinner
                  ? '2px solid rgba(16, 185, 129, 0.3)'
                  : isFailed
                  ? '1px solid rgba(220, 38, 38, 0.2)'
                  : '1px solid rgba(55, 65, 81, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.125rem' }}>{SOLVER_ICONS[name]}</span>
                  <span className={color.text} style={{ fontWeight: 700, fontSize: '0.875rem' }}>{SOLVER_LABELS[name]}</span>
                  <span className={color.tag} style={{
                    fontSize: '0.6rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 20,
                    border: '1px solid',
                    fontWeight: 600,
                  }}>{SOLVER_TYPES[name]}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isWinner && (
                    <span style={{
                      fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: 20,
                      background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 700,
                    }}>🏆 #1</span>
                  )}
                  {rank && rank > 1 && (
                    <span style={{
                      fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: 20,
                      background: 'rgba(55, 65, 81, 0.4)', color: '#cbd5e1',
                      border: '1px solid rgba(55, 65, 81, 0.3)', fontWeight: 700,
                    }}>#{rank}</span>
                  )}
                  {isFailed && (
                    <span style={{
                      fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: 20,
                      background: 'rgba(220, 38, 38, 0.15)', color: '#fca5a5',
                      border: '1px solid rgba(220, 38, 38, 0.2)', fontWeight: 700,
                    }}>HALTED</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6, background: 'rgba(55, 65, 81, 0.3)',
                borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem',
              }}>
                <div
                  className={isRunning && !r?.solved ? 'progress-active' : ''}
                  style={{
                    height: '100%', borderRadius: 3,
                    background: `linear-gradient(90deg, ${color.barColor}, ${color.barColor}cc)`,
                    transition: 'width 0.7s ease-out',
                    width: r?.solved ? '100%' : '0%',
                  }}
                />
              </div>

              {r && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
                <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Click Solve to start</span>
                </div>
              )}

              {isFailed && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.7rem',
                  color: 'rgba(248, 113, 113, 0.8)',
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(220, 38, 38, 0.05)',
                  borderRadius: 10,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgba(220, 38, 38, 0.1)',
                }}>
                  {r.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Winner Summary */}
      {results && winner && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem',
          borderRadius: 14,
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08), rgba(31, 41, 55, 0.3))',
          border: '1px solid rgba(16, 185, 129, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.125rem' }}>🏆</span>
              <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                <span className={SOLVER_COLORS[winner].text} style={{ fontWeight: 700 }}>{SOLVER_LABELS[winner]}</span>
                {' '}wins with{' '}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#6ee7b7' }}>
                  {results[winner]?.time_ms?.toFixed(2)} ms
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {solverNames.filter(s => results[s]?.solved && s !== winner).map(s => (
                <span key={s} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>
                  <span className={SOLVER_COLORS[s].text}>{SOLVER_LABELS[s]}</span>
                  {': '}
                  <span style={{ color: '#cbd5e1' }}>{results[s]?.time_ms?.toFixed(2)}ms</span>
                  {results[winner]?.time_ms > 0 && (
                    <span style={{ color: '#64748b', marginLeft: 4 }}>
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
