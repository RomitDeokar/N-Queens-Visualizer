import React, { useEffect, useRef } from 'react';

/**
 * LogPanel.jsx - Shows step-by-step backtracking logs
 * Color-coded: green=place, red=remove, blue=check, gold=solution
 * Like the reference screenshot with scrollable log entries.
 */
export default function LogPanel({ trace = [], currentStep = 0, isActive = false, n = 8 }) {
  const scrollRef = useRef(null);

  // Auto-scroll to latest step
  useEffect(() => {
    if (scrollRef.current && isActive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep, isActive]);

  const visibleTrace = trace.slice(0, currentStep + 1);
  const lastSteps = isActive ? visibleTrace.slice(-100) : visibleTrace.slice(0, 200);

  if (!trace.length && !isActive) {
    return (
      <div className="log-panel-container">
        <div className="log-panel-header">
          <div className="log-panel-icon">📋</div>
          <div>
            <h3 className="log-panel-title">Algorithm Logs</h3>
            <p className="log-panel-subtitle">Step-by-step backtracking process</p>
          </div>
        </div>
        <div className="log-panel-empty">
          <span className="log-panel-empty-icon">🔍</span>
          <p>Start backtracking visualization to see logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="log-panel-container">
      <div className="log-panel-header">
        <div className="log-panel-icon">📋</div>
        <div>
          <h3 className="log-panel-title">Algorithm Logs</h3>
          <p className="log-panel-subtitle">
            {isActive ? `Step ${currentStep + 1} of ${trace.length}` : `${visibleTrace.length} steps recorded`}
          </p>
        </div>
        {isActive && (
          <div className="log-panel-live-badge">
            <div className="log-panel-live-dot" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      <div className="log-panel-body" ref={scrollRef}>
        {lastSteps.map((step, idx) => {
          let colorClass = '';
          let icon = '';
          let text = '';

          switch (step.type) {
            case 'check':
              colorClass = 'log-entry-check';
              icon = '🔍';
              text = `Checking square (${step.row + 1}, ${step.col + 1}) on Board`;
              break;
            case 'place':
              colorClass = 'log-entry-place';
              icon = '👑';
              text = `Place Queen at position (${step.row + 1}, ${step.col + 1}) on Board`;
              break;
            case 'remove':
              colorClass = 'log-entry-remove';
              icon = '❌';
              text = `Remove Queen at position (${step.row + 1}, ${step.col + 1}) on Board`;
              break;
            case 'solution':
              colorClass = 'log-entry-solution';
              icon = '🎉';
              text = `Solution #${step.solution_number} found! State = [${step.state.join(', ')}]`;
              break;
            default:
              colorClass = 'log-entry-check';
              icon = '·';
              text = `Step ${step.step}`;
          }

          return (
            <div key={idx} className={`log-entry ${colorClass}`}>
              <span className="log-entry-icon">{icon}</span>
              <span className="log-entry-text">{text}</span>
              <span className="log-entry-step">#{step.step}</span>
            </div>
          );
        })}
      </div>

      {/* Summary stats at bottom */}
      <div className="log-panel-footer">
        <div className="log-stat">
          <span className="log-stat-label">Checks</span>
          <span className="log-stat-value log-stat-check">
            {visibleTrace.filter(s => s.type === 'check').length}
          </span>
        </div>
        <div className="log-stat">
          <span className="log-stat-label">Places</span>
          <span className="log-stat-value log-stat-place">
            {visibleTrace.filter(s => s.type === 'place').length}
          </span>
        </div>
        <div className="log-stat">
          <span className="log-stat-label">Removes</span>
          <span className="log-stat-value log-stat-remove">
            {visibleTrace.filter(s => s.type === 'remove').length}
          </span>
        </div>
        <div className="log-stat">
          <span className="log-stat-label">Solutions</span>
          <span className="log-stat-value log-stat-solution">
            {visibleTrace.filter(s => s.type === 'solution').length}
          </span>
        </div>
      </div>
    </div>
  );
}
