import React, { useMemo } from 'react';

/**
 * Board.jsx — Renders the N*N chessboard with queens and constraint overlay.
 * Fixed: queen rendering on all rows including the bottom row.
 * The grid no longer uses overflow:hidden so queens on the last row render correctly.
 */
export default function Board({ n, queens = [], showConstraints = true, showHeatmap = false }) {
  // Compute attack map for each cell
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
      if (col !== undefined && col !== null && col >= 0 && col < n) s.add(`${row}-${col}`);
    });
    return s;
  }, [queens, n]);

  // Responsive cell sizes based on N
  const getCellSizeClass = () => {
    if (n <= 5) return 'w-14 h-14 sm:w-16 sm:h-16';
    if (n <= 8) return 'w-11 h-11 sm:w-14 sm:h-14';
    if (n <= 10) return 'w-9 h-9 sm:w-11 sm:h-11';
    if (n <= 12) return 'w-7 h-7 sm:w-9 sm:h-9';
    return 'w-6 h-6 sm:w-7 sm:h-7';
  };

  const getQueenSizeClass = () => {
    if (n <= 5) return 'text-2xl sm:text-3xl';
    if (n <= 8) return 'text-xl sm:text-2xl';
    if (n <= 10) return 'text-lg sm:text-xl';
    if (n <= 12) return 'text-base sm:text-lg';
    return 'text-sm sm:text-base';
  };

  const cellSize = getCellSizeClass();
  const queenSize = getQueenSizeClass();

  const getCellClasses = (row, col) => {
    const isQueen = queenSet.has(`${row}-${col}`);
    const isDark = (row + col) % 2 === 1;
    const attacks = attackMap[row]?.[col] ?? 0;

    if (isQueen) {
      return 'queen-cell';
    }

    if (showConstraints && queens.length > 0) {
      if (attacks > 0) {
        return isDark ? 'cell-attacked-dark' : 'cell-attacked-light';
      } else {
        return isDark ? 'cell-safe-dark' : 'cell-safe-light';
      }
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

  const labelSize = n <= 8 ? 'text-xs' : n <= 12 ? 'text-[10px]' : 'text-[9px]';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Column labels */}
      <div className="flex ml-8" style={{ gap: '1px' }}>
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className={`${cellSize} flex items-center justify-center ${labelSize} font-mono text-surface-500 font-medium`}>
            {i}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col mr-1.5" style={{ gap: '1px' }}>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className={`${cellSize} flex items-center justify-center ${labelSize} font-mono text-surface-500 font-medium`}>
              {i}
            </div>
          ))}
        </div>

        {/* Board grid — NO overflow hidden so queens on bottom row render */}
        <div
          className="board-grid rounded-xl border border-surface-600/30 shadow-2xl shadow-black/40"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${n}, 1fr)`,
            gap: '1px',
            background: 'rgba(30, 41, 59, 0.5)',
          }}
        >
          {Array.from({ length: n }, (_, row) =>
            Array.from({ length: n }, (_, col) => {
              const isQueen = queenSet.has(`${row}-${col}`);
              const isLastRow = row === n - 1;
              const isFirstRow = row === 0;
              const isFirstCol = col === 0;
              const isLastCol = col === n - 1;

              // Corner rounding
              let cornerClass = '';
              if (isFirstRow && isFirstCol) cornerClass = 'rounded-tl-xl';
              else if (isFirstRow && isLastCol) cornerClass = 'rounded-tr-xl';
              else if (isLastRow && isFirstCol) cornerClass = 'rounded-bl-xl';
              else if (isLastRow && isLastCol) cornerClass = 'rounded-br-xl';

              return (
                <div
                  key={`${row}-${col}`}
                  className={`${cellSize} flex items-center justify-center transition-all duration-300 relative ${getCellClasses(row, col)} ${cornerClass}`}
                  style={getCellStyle(row, col)}
                >
                  {isQueen && (
                    <span
                      className={`queen-piece ${queenSize} z-10`}
                      role="img"
                      aria-label="queen"
                    >
                      ♛
                    </span>
                  )}
                  {!isQueen && showHeatmap && (attackMap[row]?.[col] ?? 0) > 0 && (
                    <span className="text-[9px] font-mono text-red-300/50 font-bold">
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
        <div className="flex items-center gap-5 mt-3 text-xs text-surface-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded queen-cell shadow-sm"></div>
            <span>Queen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/20"></div>
            <span>Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/20"></div>
            <span>Attacked</span>
          </div>
        </div>
      )}
    </div>
  );
}
