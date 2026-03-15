import React, { useMemo } from 'react';

/**
 * Board.jsx — Renders the NxN chessboard with queens.
 * 
 * FIX: Queens now render correctly on ALL rows including the bottom row.
 * The board uses explicit pixel sizing (not Tailwind classes that can clip),
 * and overflow is set to visible on all containers.
 */
export default function Board({ n, queens = [], showConstraints = true, showHeatmap = false, checkingCell = null }) {
  // Compute attack map
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

  const queenSet = useMemo(() => {
    const s = new Set();
    queens.forEach((col, row) => {
      if (col !== undefined && col !== null && col >= 0 && col < n) {
        s.add(`${row}-${col}`);
      }
    });
    return s;
  }, [queens, n]);

  // Use pixel-based sizing to avoid any Tailwind overflow issues
  const getCellSize = () => {
    if (n <= 4) return 64;
    if (n <= 6) return 56;
    if (n <= 8) return 48;
    if (n <= 10) return 40;
    if (n <= 12) return 34;
    return 28;
  };

  const getQueenFontSize = () => {
    if (n <= 4) return 32;
    if (n <= 6) return 28;
    if (n <= 8) return 24;
    if (n <= 10) return 20;
    if (n <= 12) return 16;
    return 14;
  };

  const cellPx = getCellSize();
  const queenFontPx = getQueenFontSize();
  const gap = 1;

  const getCellBg = (row, col) => {
    const isQueen = queenSet.has(`${row}-${col}`);
    const isDark = (row + col) % 2 === 1;
    const attacks = attackMap[row]?.[col] ?? 0;
    const isChecking = checkingCell && checkingCell.row === row && checkingCell.col === col;

    if (isChecking) return 'cell-checking';
    if (isQueen) return 'queen-cell';

    if (showConstraints && queens.length > 0) {
      if (attacks > 0) return isDark ? 'cell-attacked-dark' : 'cell-attacked-light';
      return isDark ? 'cell-safe-dark' : 'cell-safe-light';
    }

    return isDark ? 'cell-dark' : 'cell-light';
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

  const labelSize = n <= 8 ? 12 : n <= 12 ? 10 : 9;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', overflow: 'visible' }}>
      {/* Column labels */}
      <div style={{ display: 'flex', marginLeft: `${cellPx * 0.5 + 8}px`, gap: `${gap}px`, overflow: 'visible' }}>
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            style={{
              width: cellPx, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: labelSize, fontFamily: 'monospace', color: '#6b7280', fontWeight: 500,
            }}
          >
            {i}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', overflow: 'visible' }}>
        {/* Row labels */}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: 6, gap: `${gap}px`, overflow: 'visible' }}>
          {Array.from({ length: n }, (_, i) => (
            <div
              key={i}
              style={{
                width: 20, height: cellPx,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: labelSize, fontFamily: 'monospace', color: '#6b7280', fontWeight: 500,
              }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Board grid - uses explicit pixel dimensions, NO overflow hidden */}
        <div
          className="board-grid rounded-xl border border-surface-600/30"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${n}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${n}, ${cellPx}px)`,
            gap: `${gap}px`,
            background: 'rgba(30, 41, 59, 0.5)',
            overflow: 'visible',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {Array.from({ length: n }, (_, row) =>
            Array.from({ length: n }, (_, col) => {
              const isQueen = queenSet.has(`${row}-${col}`);
              const isLastRow = row === n - 1;
              const isFirstRow = row === 0;
              const isFirstCol = col === 0;
              const isLastCol = col === n - 1;

              let borderRadius = '';
              if (isFirstRow && isFirstCol) borderRadius = '12px 0 0 0';
              else if (isFirstRow && isLastCol) borderRadius = '0 12px 0 0';
              else if (isLastRow && isFirstCol) borderRadius = '0 0 0 12px';
              else if (isLastRow && isLastCol) borderRadius = '0 0 12px 0';

              return (
                <div
                  key={`${row}-${col}`}
                  className={`${getCellBg(row, col)} transition-all duration-200`}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'visible',
                    borderRadius,
                    ...getCellStyle(row, col),
                  }}
                >
                  {isQueen && (
                    <span
                      className="queen-piece"
                      style={{
                        fontSize: queenFontPx,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                      role="img"
                      aria-label="queen"
                    >
                      ♛
                    </span>
                  )}
                  {!isQueen && showHeatmap && (attackMap[row]?.[col] ?? 0) > 0 && (
                    <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(252, 165, 165, 0.5)', fontWeight: 700 }}>
                      {attackMap[row][col]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      {showConstraints && queens.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8, fontSize: 12, color: '#9aa5b4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: 'linear-gradient(135deg, #fbbf24, #d97706)' }} />
            <span>Queen</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(16, 185, 129, 0.3)', border: '1px solid rgba(16, 185, 129, 0.2)' }} />
            <span>Safe</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.2)' }} />
            <span>Attacked</span>
          </div>
        </div>
      )}
    </div>
  );
}
