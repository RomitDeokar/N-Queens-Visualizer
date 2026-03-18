import React from 'react';

export default function AgentPanel({ agentInfo, n }) {
  const peas = agentInfo?.peas || {
    performance: 'Minimise solve time and nodes expanded',
    environment: 'N\u00d7N chessboard of given size',
    actuators: 'Queen placement at (row, col)',
    sensors: 'Current board state \u2014 queen positions',
  };

  const taskEnv = agentInfo?.task_environment || {
    observability: 'Fully observable',
    determinism: 'Deterministic',
    dynamics: 'Static',
    continuity: 'Discrete',
    agents: 'Single-agent',
  };

  const peasItems = [
    { key: 'P', label: 'Performance', value: peas.performance, color: 'from-emerald-400 to-emerald-600', textColor: '#059669' },
    { key: 'E', label: 'Environment', value: peas.environment, color: 'from-blue-400 to-blue-600', textColor: '#3b82f6' },
    { key: 'A', label: 'Actuators', value: peas.actuators, color: 'from-amber-400 to-amber-600', textColor: '#d97706' },
    { key: 'S', label: 'Sensors', value: peas.sensors, color: 'from-purple-400 to-purple-600', textColor: '#7c3aed' },
  ];

  const envProps = [
    { label: 'Observability', value: taskEnv.observability, icon: '👁️' },
    { label: 'Determinism', value: taskEnv.determinism, icon: '🎲' },
    { label: 'Dynamics', value: taskEnv.dynamics, icon: '⚡' },
    { label: 'Continuity', value: taskEnv.continuity, icon: '📐' },
    { label: 'Agents', value: taskEnv.agents, icon: '👤' },
  ];

  const cspItems = [
    { label: 'Variables', value: `X = {x₁, x₂, ..., x${n}} — one variable per row (which column the queen goes in)`, icon: '▸' },
    { label: 'Domains', value: `D(xᵢ) = {0, 1, ..., ${n - 1}} — each queen can be placed in any column`, icon: '▸' },
    { label: 'Constraints', value: 'No two queens share a column, row, or diagonal: xᵢ ≠ xⱼ, |xᵢ - xⱼ| ≠ |i - j| for all i ≠ j', icon: '▸' },
    { label: 'Constraint Type', value: 'Binary constraints between all pairs of variables (all-different + diagonal check)', icon: '▸' },
    { label: 'Propagation', value: 'After placing queen in row i at column c, prune c and attacked diagonals from domains of remaining rows', icon: '▸' },
    { label: 'Solution', value: `A complete assignment of all ${n} variables satisfying all constraints — no conflicts`, icon: '◆' },
  ];

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, boxShadow: '0 3px 8px rgba(139, 92, 246, 0.3)',
          }}>🤖</div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>Intelligent Agent</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Simple Reflex Agent — fixed condition-action rules</p>
          </div>
        </div>
      </div>

      {/* Agent Rule */}
      {agentInfo?.rule && (
        <div style={{
          marginBottom: '1.5rem',
          background: 'rgba(76, 110, 245, 0.08)',
          border: '1px solid rgba(76, 110, 245, 0.2)',
          borderRadius: 12,
          padding: '1rem',
        }}>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4c6ef5', fontWeight: 700, marginBottom: '0.375rem' }}>Rule Applied for N={n}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>{agentInfo.rule}</div>
        </div>
      )}

      {/* PEAS Table */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>PEAS Model</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {peasItems.map(item => (
            <div key={item.key} className="stat-pill" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem' }}>
              <div className={`bg-gradient-to-br ${item.color}`} style={{
                width: 32, height: 32, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 900, color: 'white', flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}>
                {item.key}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: item.textColor }}>{item.label}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Environment */}
      <div>
        <h4 style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>Task Environment Properties</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.625rem' }}>
          {envProps.map(prop => (
            <div key={prop.label} className="stat-pill" style={{ alignItems: 'center', textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontSize: '1.125rem', marginBottom: '0.375rem' }}>{prop.icon}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{prop.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: 2 }}>{prop.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CSP Section */}
      <div className="csp-section">
        <h4 className="csp-title">
          Constraint Satisfaction Problem (CSP) Formulation
        </h4>
        <div className="csp-items">
          {cspItems.map((item, idx) => (
            <div key={idx} className="csp-item">
              <span className="csp-item-icon">{item.icon}</span>
              <div>
                <span className="csp-item-label">{item.label}</span>
                <div className="csp-item-value">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          borderRadius: 10,
          background: 'rgba(76, 110, 245, 0.06)',
          border: '1px solid rgba(76, 110, 245, 0.15)',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: '#4c6ef5' }}>How DFS acts as a CSP solver:</strong> The DFS backtracking algorithm places queens row by row. 
            After each placement, it checks column and diagonal constraints against all previously placed queens. 
            If a conflict is found, it backtracks — this is equivalent to constraint checking and domain pruning in a CSP framework. 
            The constraint visualizer on the board shows this propagation live: green cells have no attacks (valid domain values), 
            red cells are eliminated by constraints.
          </p>
        </div>
      </div>
    </div>
  );
}
