import React from 'react';

export default function StatePanel({ queens = [], n, activeAlgo, results }) {
  const r = results?.[activeAlgo];
  const stateStr = queens.length > 0 ? `[${queens.join(', ')}]` : '[]';

  return (
    <div className="space-y-5">
      {/* State Array Card */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-sm shadow shadow-brand-500/30">
            🧩
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">State Representation</h3>
            <p className="text-[10px] text-surface-500">index = row, value = column</p>
          </div>
        </div>

        <div className="bg-surface-800/60 rounded-xl p-4 border border-surface-700/20">
          <div className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-2">Current State</div>
          <div className="font-mono text-sm text-brand-300 break-all leading-relaxed">
            State = {stateStr}
          </div>
          {queens.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${queens.length === n ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-[11px] text-surface-400">
                {queens.length} queen{queens.length !== 1 ? 's' : ''} placed on {n}x{n} board
                {queens.length === n && <span className="text-emerald-400 ml-1 font-semibold">— Complete!</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search Snapshot */}
      {r && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow shadow-amber-500/30">
              📡
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Search Snapshot</h3>
              <p className="text-[10px] text-surface-500">{activeAlgo?.toUpperCase().replace('_', ' ')} algorithm</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
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
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-medium">Solution found — all {n} queens placed safely</span>
            </div>
          )}

          {r.error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-xs text-red-400 font-medium">{r.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Problem Formulation */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-sm shadow shadow-teal-500/30">
            📝
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Problem Formulation</h3>
            <p className="text-[10px] text-surface-500">Formal CSP definition</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {[
            { label: 'Initial State', value: '[] (empty board)', icon: '○' },
            { label: 'Operators', value: `Place queen in next row at column c in [0, ${n - 1}]`, icon: '▸' },
            { label: 'Goal Test', value: `${n} queens placed, no conflicts`, icon: '◆' },
            { label: 'Path Cost', value: 'Number of queen placements (depth)', icon: '△' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2.5 bg-surface-800/40 rounded-lg p-2.5 border border-surface-700/15">
              <span className="text-brand-400 mt-0.5 font-mono text-[10px]">{item.icon}</span>
              <div>
                <span className="text-surface-400 font-semibold">{item.label}</span>
                <div className="text-surface-200 mt-0.5 font-mono">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
