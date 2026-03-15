import React from 'react';

const KNOWN_SOLUTIONS = {1:1,2:0,3:0,4:2,5:10,6:4,7:40,8:92,9:352,10:724,11:2680,12:14200,13:73712,14:365596,15:2279184};

export default function StatePanel({ queens = [], n, activeAlgo, results, solutionsData }) {
  const r = results?.[activeAlgo];
  const stateStr = queens.length > 0 ? `[${queens.join(', ')}]` : '[]';

  return (
    <div className="space-y-4">
      {/* State Array Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #4c6ef5, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 3px 8px rgba(76, 110, 245, 0.3)',
          }}>🧩</div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>State Representation</h3>
            <p style={{ fontSize: '0.625rem', color: '#64748b' }}>index = row, value = column</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.5)',
          borderRadius: 12,
          padding: '1rem',
          border: '1px solid rgba(55, 65, 81, 0.2)',
        }}>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
            Current State
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            color: '#91a7ff',
            wordBreak: 'break-all',
            lineHeight: 1.6,
          }}>
            State = {stateStr}
          </div>
          {queens.length > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: queens.length === n ? '#34d399' : '#fbbf24',
              }} />
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {queens.length} queen{queens.length !== 1 ? 's' : ''} placed on {n}×{n} board
                {queens.length === n && <span style={{ color: '#34d399', marginLeft: 4, fontWeight: 600 }}>— Complete!</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Total Solutions Info */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 3px 8px rgba(139, 92, 246, 0.3)',
          }}>🔢</div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Solution Count</h3>
            <p style={{ fontSize: '0.625rem', color: '#64748b' }}>Total valid placements for N={n}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
          <div className="stat-pill">
            <span className="stat-label">Total Solutions</span>
            <span className="stat-value" style={{ fontSize: '1rem', color: '#fcd34d' }}>
              {solutionsData?.total_solutions?.toLocaleString() ?? KNOWN_SOLUTIONS[n]?.toLocaleString() ?? '—'}
            </span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Search Steps</span>
            <span className="stat-value">
              {solutionsData?.total_steps?.toLocaleString() ?? '—'}
            </span>
          </div>
        </div>

        {solutionsData?.time_ms != null && solutionsData.time_ms > 0 && (
          <div className="stat-pill" style={{ marginTop: '0.625rem' }}>
            <span className="stat-label">Enumeration Time</span>
            <span className="stat-value">{solutionsData.time_ms.toFixed(2)} ms</span>
          </div>
        )}

        {KNOWN_SOLUTIONS[n] === 0 && (
          <div style={{
            marginTop: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            borderRadius: 10,
            padding: '0.5rem 0.75rem',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 500 }}>No solution exists for N={n}</span>
          </div>
        )}
      </div>

      {/* Search Snapshot */}
      {r && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 3px 8px rgba(245, 158, 11, 0.3)',
            }}>📡</div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Search Snapshot</h3>
              <p style={{ fontSize: '0.625rem', color: '#64748b' }}>{activeAlgo?.toUpperCase().replace('_', ' ')} algorithm</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div className="stat-pill">
              <span className="stat-label">Depth</span>
              <span className="stat-value">{queens.length}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Time</span>
              <span className="stat-value">{r.time_ms?.toFixed(2) ?? '—'} ms</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Nodes</span>
              <span className="stat-value">{r.nodes?.toLocaleString() ?? '—'}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Memory</span>
              <span className="stat-value">{r.memory_kb?.toFixed(1) ?? '—'} KB</span>
            </div>
          </div>

          {r.solved && queens.length === n && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 10,
              padding: '0.5rem 0.75rem',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 500 }}>Solution found - all {n} queens placed safely</span>
            </div>
          )}

          {r.error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: 10,
              padding: '0.5rem 0.75rem',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
              <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 500 }}>{r.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Problem Formulation */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #14b8a6, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 3px 8px rgba(20, 184, 166, 0.3)',
          }}>📝</div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Problem Formulation</h3>
            <p style={{ fontSize: '0.625rem', color: '#64748b' }}>Formal CSP definition</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem' }}>
          {[
            { label: 'Initial State', value: '[] (empty board)', icon: '○' },
            { label: 'Operators', value: `Place queen in next row at column c in [0, ${n - 1}]`, icon: '▸' },
            { label: 'Goal Test', value: `${n} queens placed, no conflicts`, icon: '◆' },
            { label: 'Path Cost', value: 'Number of queen placements (depth)', icon: '△' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              background: 'rgba(31, 41, 55, 0.3)',
              borderRadius: 10,
              padding: '0.625rem',
              border: '1px solid rgba(55, 65, 81, 0.15)',
            }}>
              <span style={{ color: '#91a7ff', marginTop: 2, fontFamily: 'monospace', fontSize: '0.625rem' }}>{item.icon}</span>
              <div>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{item.label}</span>
                <div style={{ color: '#e2e8f0', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
