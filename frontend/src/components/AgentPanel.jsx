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
    { key: 'P', label: 'Performance', value: peas.performance, color: 'from-emerald-400 to-emerald-600', textColor: 'text-emerald-400' },
    { key: 'E', label: 'Environment', value: peas.environment, color: 'from-blue-400 to-blue-600', textColor: 'text-blue-400' },
    { key: 'A', label: 'Actuators', value: peas.actuators, color: 'from-amber-400 to-amber-600', textColor: 'text-amber-400' },
    { key: 'S', label: 'Sensors', value: peas.sensors, color: 'from-purple-400 to-purple-600', textColor: 'text-purple-400' },
  ];

  const envProps = [
    { label: 'Observability', value: taskEnv.observability, icon: '👁️' },
    { label: 'Determinism', value: taskEnv.determinism, icon: '🎲' },
    { label: 'Dynamics', value: taskEnv.dynamics, icon: '⚡' },
    { label: 'Continuity', value: taskEnv.continuity, icon: '📐' },
    { label: 'Agents', value: taskEnv.agents, icon: '👤' },
  ];

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm shadow shadow-violet-500/30">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Intelligent Agent</h3>
            <p className="text-xs text-surface-400 mt-0.5">Simple Reflex Agent — fixed condition-action rules</p>
          </div>
        </div>
      </div>

      {/* Agent Rule */}
      {agentInfo?.rule && (
        <div className="mb-6 bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-brand-400 font-bold mb-1.5">Rule Applied for N={n}</div>
          <div className="text-sm text-brand-200 font-mono leading-relaxed">{agentInfo.rule}</div>
        </div>
      )}

      {/* PEAS Table */}
      <div className="mb-6">
        <h4 className="text-xs uppercase tracking-widest text-surface-400 font-bold mb-3">PEAS Model</h4>
        <div className="space-y-2.5">
          {peasItems.map(item => (
            <div key={item.key} className="flex items-start gap-3 bg-surface-800/40 rounded-xl p-3.5 border border-surface-700/20 hover:border-surface-600/40 transition-colors">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow`}>
                {item.key}
              </div>
              <div className="min-w-0">
                <div className={`text-[10px] font-semibold uppercase tracking-wide ${item.textColor}`}>{item.label}</div>
                <div className="text-sm text-surface-200 mt-0.5">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Environment */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-surface-400 font-bold mb-3">Task Environment Properties</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {envProps.map(prop => (
            <div key={prop.label} className="bg-surface-800/40 rounded-xl p-3 border border-surface-700/20 text-center hover:border-surface-600/40 transition-colors">
              <div className="text-lg mb-1.5">{prop.icon}</div>
              <div className="text-[10px] text-surface-500 uppercase tracking-wide font-semibold">{prop.label}</div>
              <div className="text-xs text-surface-200 font-medium mt-0.5">{prop.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
