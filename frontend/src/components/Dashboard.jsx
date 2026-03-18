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

export default function Dashboard({ allResults, theme = 'dark' }) {
  const isLight = theme === 'light';

  // Theme-aware chart colors
  const colors = useMemo(() => ({
    gridColor: isLight ? 'rgba(180, 170, 150, 0.2)' : 'rgba(55, 65, 81, 0.2)',
    tickColor: isLight ? '#6b5e4f' : '#9aa5b4',
    titleColor: isLight ? '#2c2417' : '#e8ecf4',
    tooltipBg: isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(10, 15, 26, 0.95)',
    tooltipTitle: isLight ? '#2c2417' : '#e8ecf4',
    tooltipBody: isLight ? '#6b5e4f' : '#9aa5b4',
    tooltipBorder: isLight ? 'rgba(200, 190, 175, 0.5)' : 'rgba(55, 65, 81, 0.5)',
    legendColor: isLight ? '#6b5e4f' : '#9aa5b4',
    yTitleColor: isLight ? '#8a7e6f' : '#6b7280',
    textPrimary: isLight ? '#2c2417' : '#e2e8f0',
    textSecondary: isLight ? '#6b5e4f' : '#94a3b8',
    textMuted: isLight ? '#8a7e6f' : '#64748b',
    textHeading: isLight ? '#1a1108' : '#ffffff',
    cardBg: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(31, 41, 55, 0.4)',
    failedText: isLight ? '#b91c1c' : '#f87171',
    solvedGreen: isLight ? '#047857' : '#34d399',
    solvedYellow: isLight ? '#b45309' : '#fbbf24',
    solvedRed: isLight ? '#b91c1c' : '#ef4444',
    rowText: isLight ? '#2c2417' : '#e2e8f0',
    rowHover: isLight ? 'rgba(243, 240, 235, 0.8)' : 'rgba(31, 41, 55, 0.3)',
  }), [isLight]);

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
        const val = run[metric];
        if (val === undefined || val === null) return null;
        return Math.round(val * 100) / 100;
      }),
      backgroundColor: nValues.map(n => {
        const run = grouped[`${n}-${algo}`];
        if (run && !run.solved) {
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
          color: colors.legendColor,
          font: { size: 11, family: 'Inter, system-ui, sans-serif', weight: '500' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      title: {
        display: true,
        text: title,
        color: colors.titleColor,
        font: { size: 14, weight: '700', family: 'Inter, system-ui, sans-serif' },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipTitle,
        bodyColor: colors.tooltipBody,
        borderColor: colors.tooltipBorder,
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
        grid: { color: colors.gridColor, drawBorder: false },
        ticks: { color: colors.tickColor, font: { size: 11, weight: '500' } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: colors.gridColor, drawBorder: false },
        ticks: {
          color: colors.tickColor,
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
          color: colors.yTitleColor,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Cards */}
      {summaryStats && hasData && (
        <div className="dashboard-summary-grid">
          {algoNames.map(algo => {
            const s = summaryStats[algo];
            const isInformed = ALGO_TYPES[algo] === 'Informed';
            return (
              <div key={algo} className="glass-card dashboard-summary-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: ALGO_COLORS[algo].border }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.textPrimary }}>{ALGO_LABELS[algo]}</span>
                  <span style={{
                    fontSize: '0.5625rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 20,
                    fontWeight: 600,
                    background: isInformed ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: isInformed ? '#7c3aed' : '#3b82f6',
                    border: `1px solid ${isInformed ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  }}>{ALGO_TYPES[algo]}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: colors.textMuted, fontWeight: 600 }}>Avg Time</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: colors.textHeading }}>
                      {s.avgTime != null ? s.avgTime.toFixed(2) : '—'}<span style={{ fontSize: '0.75rem', color: colors.textSecondary, marginLeft: 4 }}>ms</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: colors.textSecondary }}>
                    <span>
                      Solved: <span style={{
                        fontWeight: 600,
                        color: s.solved === s.total ? colors.solvedGreen : s.solved === 0 ? colors.solvedRed : colors.solvedYellow,
                      }}>
                        {s.solved}/{s.total}
                      </span>
                    </span>
                    <span>Nodes: <span style={{ color: colors.textPrimary, fontWeight: 600 }}>{s.totalNodes.toLocaleString()}</span></span>
                  </div>
                  {s.failed > 0 && (
                    <div style={{ fontSize: '0.625rem', color: colors.failedText, opacity: 0.8 }}>
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
      <div className="glass-card dashboard-panel">
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3)',
            }}>📊</div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.textHeading }}>Performance Dashboard</h3>
              <p style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: 2 }}>
                {hasData
                  ? `Comparative metrics across ${nValues.length} board sizes (N = ${nValues.join(', ')}). Faded bars = solver failed.`
                  : 'Run solvers to populate the dashboard'}
              </p>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: colors.textSecondary }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: isLight ? 'rgba(243, 240, 235, 0.8)' : 'rgba(31, 41, 55, 0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '2rem', opacity: 0.5 }}>📈</span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No data yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: colors.textMuted }}>Run solvers across different N values to populate the dashboard.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: colors.textMuted }}>Use the "Run All (N=1 to 12)" button above for comprehensive data.</p>
          </div>
        ) : (
          <div className="dashboard-charts-grid">
            <div className="dashboard-chart-box">
              <Bar data={makeChartData('time_ms')} options={chartOptions('Solve Time Comparison', 'Time (ms)', true)} />
            </div>
            <div className="dashboard-chart-box">
              <Bar data={makeChartData('nodes')} options={chartOptions('Nodes Expanded', 'Nodes')} />
            </div>
            <div className="dashboard-chart-box">
              <Bar data={makeChartData('memory_kb')} options={chartOptions('Memory Usage', 'Memory (KB)')} />
            </div>
            <div className="dashboard-chart-box">
              <Bar data={makeChartData('steps')} options={chartOptions('Steps Performed', 'Steps')} />
            </div>
          </div>
        )}
      </div>

      {/* Raw Results Table */}
      {hasData && (
        <div className="glass-card dashboard-panel" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 3px 8px rgba(245, 158, 11, 0.3)',
            }}>📋</div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.textHeading }}>Results Table</h3>
              <p style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: 2 }}>Detailed comparison by board size — red = solver failed</p>
            </div>
          </div>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>N</th>
                {algoNames.map(a => (
                  <th key={a} style={{ textAlign: 'right', color: ALGO_COLORS[a].border }}>
                    {ALGO_LABELS[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nValues.map(n => (
                <tr key={n}>
                  <td style={{ fontWeight: 700, color: colors.textPrimary }}>N={n}</td>
                  {algoNames.map(a => {
                    const run = grouped[`${n}-${a}`];
                    if (!run) return <td key={a} style={{ textAlign: 'right', color: colors.textMuted }}>—</td>;
                    return (
                      <td key={a} style={{ textAlign: 'right', color: run.solved ? colors.textPrimary : colors.failedText }}>
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
