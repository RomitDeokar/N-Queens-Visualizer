import React, { useMemo } from 'react';

/**
 * Board.jsx - NxN chessboard with queens.
 * 
 * FIXED: Queens now render correctly on ALL rows including the last row.
 * Uses CSS Grid with explicit sizing and NO overflow:hidden anywhere.
 * Queen SVG is rendered with proper containment inside each cell.
 */
export default function Board({ n, queens = [], showConstraints = true, showHeatmap = false, checkingCell = null, compact = false }) {
  // Compute attack map for constraint visualization
  const { attackMap, maxAttacks } = useMemo(() => {
    const map = Array.from({ length: n }, () => Array(n).fill(0));
    let max = 0;

    for (let qi = 0; qi < queens.length; qi++) {
      const qr = qi;
      const qc = queens[qi];
      if (qc === undefined || qc === null || qc < 0 || qc >= n) continue;

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (r === qr && c === qc) continue;
          if (c === qc || r === qr || Math.abs(r - qr) === Math.abs(c - qc)) {
            map[r][c]++;
            if (map[r][c] > max) max = map[r][c];
          }
        }
      }
    }
    return { attackMap: map, maxAttacks: max };
  }, [n, queens]);

  // Build a set of queen positions for quick lookup
  const queenSet = useMemo(() => {
    const s = new Set();
    if (!queens || !Array.isArray(queens)) return s;
    for (let row = 0; row < queens.length; row++) {
      const col = queens[row];
      if (col !== undefined && col !== null && col >= 0 && col < n) {
        s.add(`${row}-${col}`);
      }
    }
    return s;
  }, [queens, n]);

  // Cell sizing based on N
  const getCellSize = () => {
    if (compact) {
      if (n <= 4) return 48;
      if (n <= 6) return 40;
      if (n <= 8) return 36;
      if (n <= 10) return 30;
      if (n <= 12) return 26;
      return 22;
    }
    if (n <= 4) return 80;
    if (n <= 6) return 64;
    if (n <= 8) return 56;
    if (n <= 10) return 46;
    if (n <= 12) return 38;
    return 32;
  };

  const getQueenSize = () => {
    if (compact) {
      if (n <= 4) return 28;
      if (n <= 6) return 22;
      if (n <= 8) return 20;
      if (n <= 10) return 16;
      if (n <= 12) return 14;
      return 12;
    }
    if (n <= 4) return 44;
    if (n <= 6) return 34;
    if (n <= 8) return 30;
    if (n <= 10) return 24;
    if (n <= 12) return 20;
    return 17;
  };

  const cellPx = getCellSize();
  const queenSizePx = getQueenSize();
  const gap = 2;

  const getCellClasses = (row, col) => {
    const isQueen = queenSet.has(`${row}-${col}`);
    const isDark = (row + col) % 2 === 1;
    const attacks = attackMap[row]?.[col] ?? 0;
    const isChecking = checkingCell && checkingCell.row === row && checkingCell.col === col;

    if (isChecking) return 'board-cell-checking';
    if (isQueen) return 'board-cell-queen';

    if (showConstraints && queens.length > 0) {
      if (attacks > 0) return isDark ? 'board-cell-attacked-dark' : 'board-cell-attacked-light';
      return isDark ? 'board-cell-safe-dark' : 'board-cell-safe-light';
    }

    return isDark ? 'board-cell-dark' : 'board-cell-light';
  };

  const getCellStyle = (row, col) => {
    if (!showHeatmap || !showConstraints || queens.length === 0) return {};
    const isQueen = queenSet.has(`${row}-${col}`);
    if (isQueen) return {};
    const attacks = attackMap[row]?.[col] ?? 0;
    if (attacks <= 0) {
      return { backgroundColor: 'rgba(16, 185, 129, 0.25)' };
    }
    const intensity = maxAttacks > 0 ? attacks / maxAttacks : 0;
    return {
      backgroundColor: `rgba(${Math.round(239 * intensity + 16 * (1 - intensity))}, ${Math.round(68 * intensity + 185 * (1 - intensity))}, ${Math.round(68 * intensity + 129 * (1 - intensity))}, ${0.25 + intensity * 0.45})`,
    };
  };

  const labelSize = compact ? 9 : (n <= 8 ? 13 : n <= 12 ? 11 : 10);
  const boardTotalWidth = n * cellPx + (n - 1) * gap;

  // Generate all cells in a flat array for the grid
  const cells = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const isQueen = queenSet.has(`${row}-${col}`);
      const isLastRow = row === n - 1;
      const isFirstRow = row === 0;
      const isFirstCol = col === 0;
      const isLastCol = col === n - 1;

      let borderRadius = '';
      const r = compact ? 6 : 8;
      if (isFirstRow && isFirstCol) borderRadius = `${r}px 0 0 0`;
      else if (isFirstRow && isLastCol) borderRadius = `0 ${r}px 0 0`;
      else if (isLastRow && isFirstCol) borderRadius = `0 0 0 ${r}px`;
      else if (isLastRow && isLastCol) borderRadius = `0 0 ${r}px 0`;

      cells.push(
        <div
          key={`${row}-${col}`}
          className={`board-cell ${getCellClasses(row, col)}`}
          style={{
            width: cellPx,
            height: cellPx,
            borderRadius,
            ...getCellStyle(row, col),
          }}
        >
          {isQueen && (
            <div
              className="queen-icon"
              style={{ width: queenSizePx, height: queenSizePx }}
            >
              <svg viewBox="0 0 45 45" width={queenSizePx} height={queenSizePx}>
                <g fill="none" fillRule="evenodd">
                  <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" transform="translate(0 -1)"/>
                    <path d="M24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" transform="translate(0 -1)"/>
                    <path d="M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" transform="translate(0 -1)"/>
                    <path d="M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" transform="translate(0 -1)"/>
                    <path d="M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" transform="translate(0 -1)"/>
                    <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-7-5 6.5-5-6.5-3.5 7-7.5-1 2.5 12.5z" strokeLinecap="butt"/>
                    <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1 2.5-1 2.5-1.5 1.5 0 2.5 0 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
                    <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" strokeLinecap="butt"/>
                    <path d="M11 29a35 35 1 0 1 23 0" fill="none"/>
                    <path d="M12.5 31.5h20" fill="none" strokeLinejoin="miter"/>
                    <path d="M11.5 34.5a35 35 1 0 0 22 0" fill="none"/>
                    <path d="M10.5 37.5a35 35 1 0 0 24 0" fill="none"/>
                  </g>
                </g>
              </svg>
            </div>
          )}
          {!isQueen && showHeatmap && (attackMap[row]?.[col] ?? 0) > 0 && (
            <span className="heatmap-number" style={{ fontSize: Math.max(9, cellPx * 0.22) }}>
              {attackMap[row][col]}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="board-wrapper">
      {/* Column labels */}
      {!compact && (
        <div className="board-col-labels" style={{ marginLeft: 28, width: boardTotalWidth }}>
          {Array.from({ length: n }, (_, i) => (
            <div
              key={i}
              style={{
                width: cellPx,
                fontSize: labelSize,
                textAlign: 'center',
                color: 'rgba(148, 163, 184, 0.7)',
                fontFamily: 'monospace',
                fontWeight: 600,
                lineHeight: '22px',
              }}
            >
              {String.fromCharCode(97 + i)}
            </div>
          ))}
        </div>
      )}

      <div className="board-body">
        {/* Row labels */}
        {!compact && (
          <div className="board-row-labels">
            {Array.from({ length: n }, (_, i) => (
              <div
                key={i}
                style={{
                  height: cellPx,
                  fontSize: labelSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  color: 'rgba(148, 163, 184, 0.7)',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {n - i}
              </div>
            ))}
          </div>
        )}

        {/* The actual board grid - FIX: explicit min-height to prevent last row clipping */}
        <div
          className="board-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${n}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${n}, ${cellPx}px)`,
            gap: `${gap}px`,
            borderRadius: compact ? '8px' : '14px',
            padding: '4px',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))',
            border: '1px solid rgba(71, 85, 105, 0.4)',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 80px rgba(76, 110, 245, 0.05)',
            minHeight: n * cellPx + (n - 1) * gap + 8,
          }}
        >
          {cells}
        </div>
      </div>

      {/* Legend */}
      {showConstraints && queens.length > 0 && !compact && (
        <div className="board-legend">
          <div className="board-legend-item">
            <div className="board-legend-swatch" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }} />
            <span>Queen</span>
          </div>
          <div className="board-legend-item">
            <div className="board-legend-swatch" style={{ background: 'rgba(16, 185, 129, 0.4)', border: '1px solid rgba(16, 185, 129, 0.3)' }} />
            <span>Safe</span>
          </div>
          <div className="board-legend-item">
            <div className="board-legend-swatch" style={{ background: 'rgba(239, 68, 68, 0.4)', border: '1px solid rgba(239, 68, 68, 0.3)' }} />
            <span>Attacked</span>
          </div>
        </div>
      )}
    </div>
  );
}
