import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,

  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ALGO_COLORS = {
  bfs: { bg: 'rgba(59, 130, 246, 0.75)', border: 'rgba(59, 130, 246, 1)' },
  dfs: { bg: 'rgba(16, 185, 129, 0.75)', border: 'rgba(16, 185, 129, 1)' },
  best_first: { bg: 'rgba(245, 158, 11, 0.75)', border: 'rgba(245, 158, 11, 1)' },
  astar: { bg: 'rgba(139, 92, 246, 0.75)', border: 'rgba(139, 92, 246, 1)' },
};

const ALGO_LABELS = {
  bfs: 'BFS',
  dfs: 'DFS',
  best_first: 'Best-First',
  astar: 'A*',
};

const ALGO_TYPES = {
  bfs: 'Uninformed',
  dfs: 'Uninformed',
  best_first: 'Informed',
  astar: 'Informed',
};

export default function Dashboard({ allResults }) {
  // Group results by N, taking the most recent per algorithm per N
  const grouped = useMemo(() => {
    const g = {};
    if (!allResults || !Array.isArray(allResults)) return g;

    for (const run of allResults) {
      const key = `${run.n}-${run.algorithm}`;
      if (!g[key] || (run.timestamp || 0) > (g[key].timestamp || 0)) {
        g[key] = run;
      }
    }
    return g;
  }, [allResults]);

  // Dynamically determine which N values we have data for
  const nValues = useMemo(() => {
    const ns = new Set();
    if (allResults && Array.isArray(allResults)) {
      for (const run of allResults) {
        if (run.n) ns.add(run.n);
      }
    }
    return Array.from(ns).sort((a, b) => a - b);
  }, [allResults]);

  const algoNames = ['bfs', 'dfs', 'best_first', 'astar'];

  const makeChartData = (metric) => ({
    labels: nValues.map(n => `N=${n}`),
    datasets: algoNames.map(algo => ({
      label: ALGO_LABELS[algo],
      data: nValues.map(n => {
        const run = grouped[`${n}-${algo}`];
        if (!run) return null;
        // For time/nodes/steps/memory, show data for both solved AND failed runs
        const val = run[metric];
        if (val === undefined || val === null) return null;
        return Math.round(val * 100) / 100;
      }),
      backgroundColor: nValues.map(n => {
        const run = grouped[`${n}-${algo}`];
        if (run && !run.solved) {
          // Show failed runs with a striped/lighter color
          return ALGO_COLORS[algo].bg.replace('0.75', '0.3');
        }
        return ALGO_COLORS[algo].bg;
      }),
      borderColor: nValues.map(n => {
        const run = grouped[`${n}-${algo}`];
        if (run && !run.solved) {
          return ALGO_COLORS[algo].border.replace('1)', '0.5)');
        }
        return ALGO_COLORS[algo].border;
      }),
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      borderDash: nValues.map(n => {
        const run = grouped[`${n}-${algo}`];
        return (run && !run.solved) ? [4, 4] : [];
      }),
    })),
  });

  const chartOptions = (title, yLabel, isTime = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9aa5b4',
          font: { size: 11, family: 'Inter, system-ui, sans-serif', weight: '500' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      title: {
        display: true,
        text: title,
        color: '#e8ecf4',
        font: { size: 14, weight: '700', family: 'Inter, system-ui, sans-serif' },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 15, 26, 0.95)',
        titleColor: '#e8ecf4',
        bodyColor: '#9aa5b4',
        borderColor: 'rgba(55, 65, 81, 0.5)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 10,
        titleFont: { size: 12, weight: '700', family: 'Inter' },
        bodyFont: { size: 11, family: 'JetBrains Mono, monospace' },
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const datasetIdx = context.datasetIndex;
            const dataIdx = context.dataIndex;
            const algo = algoNames[datasetIdx];
            const n = nValues[dataIdx];
            const run = grouped[`${n}-${algo}`];
            const prefix = run && !run.solved ? '[FAILED] ' : '';
            
            if (value === null || value === undefined) return `${context.dataset.label}: N/A`;
            if (isTime) return `${prefix}${context.dataset.label}: ${value.toFixed(2)} ms`;
            if (yLabel.includes('KB')) return `${prefix}${context.dataset.label}: ${value.toFixed(1)} KB`;
            return `${prefix}${context.dataset.label}: ${value.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(55, 65, 81, 0.2)', drawBorder: false },
        ticks: { color: '#9aa5b4', font: { size: 11, weight: '500' } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(55, 65, 81, 0.2)', drawBorder: false },
        ticks: {
          color: '#9aa5b4',
          font: { size: 10, family: 'JetBrains Mono, monospace' },
          callback: function(value) {
            if (isTime) return value >= 1 ? value.toFixed(1) : value.toFixed(2);
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          }
        },
        title: {
          display: true,
          text: yLabel,
          color: '#6b7280',
          font: { size: 11, weight: '500' },
        },
        border: { display: false },
      },
    },
  });

  // Compute summary stats
  const summaryStats = useMemo(() => {
    if (nValues.length === 0) return null;
    const stats = {};
    for (const algo of algoNames) {
      let totalTime = 0, count = 0, totalNodes = 0, failCount = 0;
      for (const n of nValues) {
        const run = grouped[`${n}-${algo}`];
        if (run) {
          if (run.solved) {
            totalTime += run.time_ms || 0;
            totalNodes += run.nodes || 0;
            count++;
          } else {
            failCount++;
          }
        }
      }
      stats[algo] = {
        avgTime: count > 0 ? totalTime / count : null,
        totalNodes: totalNodes,
        solved: count,
        failed: failCount,
        total: nValues.length,
      };
    }
    return stats;
  }, [grouped, nValues]);

  const hasData = Object.keys(grouped).length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summaryStats && hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {algoNames.map(algo => {
            const s = summaryStats[algo];
            const isInformed = ALGO_TYPES[algo] === 'Informed';
            return (
              <div key={algo} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: ALGO_COLORS[algo].border }} />
                  <span className="text-sm font-bold text-surface-200">{ALGO_LABELS[algo]}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isInformed ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  }`}>{ALGO_TYPES[algo]}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] uppercase text-surface-500 font-semibold">Avg Time</div>
                    <div className="text-lg font-bold font-mono text-white">
                      {s.avgTime != null ? s.avgTime.toFixed(2) : '—'}<span className="text-xs text-surface-400 ml-1">ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-surface-400">
                    <span>
                      Solved: <span className={`font-semibold ${s.solved === s.total ? 'text-green-400' : s.solved === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {s.solved}/{s.total}
                      </span>
                    </span>
                    <span>Nodes: <span className="text-surface-200 font-semibold">{s.totalNodes.toLocaleString()}</span></span>
                  </div>
                  {s.failed > 0 && (
                    <div className="text-[10px] text-red-400/70">
                      Failed {s.failed} of {s.total} board sizes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="glass-card p-6">
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm shadow shadow-blue-500/30">
              📊
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Performance Dashboard</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                {hasData
                  ? `Comparative metrics across ${nValues.length} board sizes (N = ${nValues.join(', ')}). Faded bars = solver failed.`
                  : 'Run solvers to populate the dashboard'}
              </p>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-16 text-surface-400">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/60 flex items-center justify-center mb-4">
              <span className="text-3xl opacity-50">📈</span>
            </div>
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs mt-1 text-surface-500">Run solvers across different N values to populate the dashboard.</p>
            <p className="text-xs mt-2 text-surface-500">Use the "Run All (N=1 to 12)" button above for comprehensive data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-surface-800/30 rounded-xl p-5 border border-surface-700/20" style={{ height: '320px' }}>
              <Bar data={makeChartData('time_ms')} options={chartOptions('Solve Time Comparison', 'Time (ms)', true)} />
            </div>
            <div className="bg-surface-800/30 rounded-xl p-5 border border-surface-700/20" style={{ height: '320px' }}>
              <Bar data={makeChartData('nodes')} options={chartOptions('Nodes Expanded', 'Nodes')} />
            </div>
            <div className="bg-surface-800/30 rounded-xl p-5 border border-surface-700/20" style={{ height: '320px' }}>
              <Bar data={makeChartData('memory_kb')} options={chartOptions('Memory Usage', 'Memory (KB)')} />
            </div>
            <div className="bg-surface-800/30 rounded-xl p-5 border border-surface-700/20" style={{ height: '320px' }}>
              <Bar data={makeChartData('steps')} options={chartOptions('Steps Performed', 'Steps')} />
            </div>
          </div>
        )}
      </div>

      {/* Raw Results Table */}
      {hasData && (
        <div className="glass-card p-6 overflow-x-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow shadow-amber-500/30">
              📋
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Results Table</h3>
              <p className="text-xs text-surface-400 mt-0.5">Detailed comparison by board size — red = solver failed</p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left py-3 px-3 text-surface-400 font-semibold">N</th>
                {algoNames.map(a => (
                  <th key={a} className="text-right py-3 px-3 font-semibold" style={{ color: ALGO_COLORS[a].border }}>
                    {ALGO_LABELS[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nValues.map(n => (
                <tr key={n} className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-surface-200">N={n}</td>
                  {algoNames.map(a => {
                    const run = grouped[`${n}-${a}`];
                    if (!run) return <td key={a} className="py-2.5 px-3 text-right text-surface-600">—</td>;
                    return (
                      <td key={a} className={`py-2.5 px-3 text-right font-mono ${run.solved ? 'text-surface-200' : 'text-red-400/70'}`}>
                        {run.solved
                          ? `${run.time_ms?.toFixed(2)}ms / ${run.nodes?.toLocaleString()} nodes`
                          : `Failed (${run.time_ms?.toFixed(0)}ms / ${run.nodes?.toLocaleString()} nodes)`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
