import React, { useMemo } from 'react';

const SOLVER_COLORS = {
  bfs: { text: '#3b82f6', barColor: '#3b82f6', barGrad: 'linear-gradient(90deg, #3b82f6, #60a5fa)', tag: 'bg-blue' },
  dfs: { text: '#10b981', barColor: '#10b981', barGrad: 'linear-gradient(90deg, #10b981, #34d399)', tag: 'bg-emerald' },
  best_first: { text: '#f59e0b', barColor: '#f59e0b', barGrad: 'linear-gradient(90deg, #f59e0b, #fbbf24)', tag: 'bg-amber' },
  astar: { text: '#8b5cf6', barColor: '#8b5cf6', barGrad: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', tag: 'bg-purple' },
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

  const maxTime = useMemo(() => {
    if (!results) return 1;
    const times = solverNames
      .filter(s => results[s]?.time_ms != null)
      .map(s => results[s].time_ms);
    return times.length > 0 ? Math.max(...times, 0.01) : 1;
  }, [results]);

  const solvedCount = useMemo(() => {
    if (!results) return 0;
    return solverNames.filter(s => results[s]?.solved).length;
  }, [results]);

  const failedCount = useMemo(() => {
    if (!results) return 0;
    return solverNames.filter(s => results[s] && !results[s].solved).length;
  }, [results]);

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 3px 8px rgba(16, 185, 129, 0.3)',
          }}>🏁</div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>Solver Race</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>All four algorithms competing simultaneously</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isRunning && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 10, padding: '0.375rem 0.75rem',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>Racing...</span>
            </div>
          )}
          {results && !isRunning && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {solvedCount > 0 && (
                <span style={{
                  fontSize: '0.65rem', padding: '0.25rem 0.5rem', borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.1)', color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600,
                }}>{solvedCount} Solved</span>
              )}
              {failedCount > 0 && (
                <span style={{
                  fontSize: '0.65rem', padding: '0.25rem 0.5rem', borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600,
                }}>{failedCount} Failed</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Race Bars */}
      {results && (
        <div style={{
          marginBottom: '1.25rem',
          background: 'var(--stat-pill-bg)',
          borderRadius: 12,
          padding: '1rem',
          border: '1px solid var(--stat-pill-border)',
        }}>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Performance Comparison
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {sorted.map((name) => {
              const r = results[name];
              const color = SOLVER_COLORS[name];
              const isWin = winner === name;
              const isFailed = r && !r.solved;
              const pct = r?.time_ms != null ? Math.max((r.time_ms / maxTime) * 100, 5) : 0;

              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 85, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.875rem' }}>{SOLVER_ICONS[name]}</span>
                    <span style={{ color: color.text, fontSize: '0.75rem', fontWeight: 700 }}>{SOLVER_LABELS[name]}</span>
                  </div>
                  <div style={{
                    flex: 1, height: 28,
                    background: 'var(--bg-surface)',
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
                        minWidth: 60,
                        background: isWin
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : color.barGrad,
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
                    ) : isFailed ? (
                      <div style={{
                        height: '100%',
                        borderRadius: 20,
                        width: `${pct}%`,
                        minWidth: 80,
                        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 8,
                        transition: 'width 0.7s ease-out',
                      }}>
                        <span style={{
                          fontSize: '0.6rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: '#dc2626',
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          FAILED {r.time_ms != null ? `(${r.time_ms.toFixed(0)}ms)` : ''}
                        </span>
                      </div>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>—</span>
                      </div>
                    )}
                  </div>
                  {isWin && <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>🏆</span>}
                  {isFailed && !isWin && <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>❌</span>}
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
          const isFailed = r && !r.solved;
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
                  ? 'rgba(16, 185, 129, 0.06)'
                  : isFailed
                  ? 'rgba(220, 38, 38, 0.04)'
                  : 'var(--stat-pill-bg)',
                border: isWinner
                  ? '2px solid rgba(16, 185, 129, 0.3)'
                  : isFailed
                  ? '1px solid rgba(220, 38, 38, 0.25)'
                  : '1px solid var(--stat-pill-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.125rem' }}>{SOLVER_ICONS[name]}</span>
                  <span style={{ color: color.text, fontWeight: 700, fontSize: '0.875rem' }}>{SOLVER_LABELS[name]}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 20,
                    border: '1px solid',
                    fontWeight: 600,
                    background: SOLVER_TYPES[name] === 'Informed' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: SOLVER_TYPES[name] === 'Informed' ? '#7c3aed' : '#3b82f6',
                    borderColor: SOLVER_TYPES[name] === 'Informed' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  }}>{SOLVER_TYPES[name]}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isWinner && (
                    <span style={{
                      fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: 20,
                      background: 'rgba(16, 185, 129, 0.15)', color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 700,
                    }}>🏆 WINNER</span>
                  )}
                  {rank && rank > 1 && !isFailed && (
                    <span style={{
                      fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: 20,
                      background: 'var(--stat-pill-bg)', color: 'var(--text-secondary)',
                      border: '1px solid var(--stat-pill-border)', fontWeight: 700,
                    }}>#{rank}</span>
                  )}
                  {isFailed && (
                    <span style={{
                      fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: 20,
                      background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626',
                      border: '1px solid rgba(220, 38, 38, 0.2)', fontWeight: 700,
                    }}>FAILED</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6, background: 'var(--bg-surface)',
                borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem',
              }}>
                <div
                  className={isRunning && !r ? 'progress-active' : ''}
                  style={{
                    height: '100%', borderRadius: 3,
                    background: isFailed
                      ? 'linear-gradient(90deg, #ef4444, #ef444480)'
                      : `linear-gradient(90deg, ${color.barColor}, ${color.barColor}cc)`,
                    transition: 'width 0.7s ease-out',
                    width: r?.solved ? '100%' : isFailed ? '100%' : '0%',
                    opacity: isFailed ? 0.5 : 1,
                  }}
                />
              </div>

              {r && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="stat-pill">
                    <span className="stat-label">Time</span>
                    <span className="stat-value" style={isFailed ? { color: '#dc2626' } : {}}>
                      {r.time_ms != null ? r.time_ms.toFixed(2) : '—'} ms
                    </span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Nodes</span>
                    <span className="stat-value" style={isFailed ? { color: '#dc2626' } : {}}>
                      {r.nodes?.toLocaleString() ?? '—'}
                    </span>
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click Solve to start</span>
                </div>
              )}

              {isFailed && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.7rem',
                  color: '#dc2626',
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
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.125rem' }}>🏆</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <span style={{ color: SOLVER_COLORS[winner].text, fontWeight: 700 }}>{SOLVER_LABELS[winner]}</span>
                {' '}wins with{' '}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#059669' }}>
                  {results[winner]?.time_ms?.toFixed(2)} ms
                </span>
                {' '}<span style={{ color: 'var(--text-muted)' }}>({SOLVER_TYPES[winner]} search)</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {solverNames.filter(s => s !== winner).map(s => {
                const r = results[s];
                const isFailed = r && !r.solved;
                return (
                  <span key={s} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>
                    <span style={{ color: SOLVER_COLORS[s].text }}>{SOLVER_LABELS[s]}</span>
                    {': '}
                    {isFailed ? (
                      <span style={{ color: '#dc2626' }}>Failed</span>
                    ) : r?.solved ? (
                      <>
                        <span style={{ color: 'var(--text-primary)' }}>{r.time_ms?.toFixed(2)}ms</span>
                        {results[winner]?.time_ms > 0 && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
                            ({(r.time_ms / results[winner]?.time_ms).toFixed(1)}x)
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Educational Note when uninformed solvers fail */}
      {results && failedCount > 0 && solvedCount > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: 12,
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', marginTop: 1 }}>💡</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Why did {failedCount === 1 ? 'one solver' : `${failedCount} solvers`} fail?</strong>
              {' '}
              {solverNames.filter(s => results[s] && !results[s].solved).map(s => SOLVER_LABELS[s]).join(' and ')}
              {' '}{failedCount === 1 ? 'is an' : 'are'} <strong style={{ color: '#3b82f6' }}>uninformed</strong> search
              {failedCount === 1 ? '' : 'es'} — {failedCount === 1 ? 'it explores' : 'they explore'} blindly without domain knowledge.
              {' '}Informed algorithms like{' '}
              <strong style={{ color: '#7c3aed' }}>A*</strong> and{' '}
              <strong style={{ color: '#d97706' }}>Best-First</strong> use heuristics to prune
              invalid states early and focus on promising branches, solving the problem with far fewer nodes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
