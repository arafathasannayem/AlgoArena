/**
 * GridView — 2D grid renderer for Phase 2 development.
 *
 * Renders the grid as a CSS grid of colored divs. Supports click-and-drag
 * wall painting via pointer events. This component will be replaced by the
 * 3D Diorama scene in Phase 3.
 *
 * @module ui/GridView
 */

import { useRef, useCallback } from 'react';
import { useGridStore } from '../state/gridStore';

export function GridView() {
  const width = useGridStore((s) => s.width);
  const height = useGridStore((s) => s.height);
  const walls = useGridStore((s) => s.walls);
  const start = useGridStore((s) => s.start);
  const goal = useGridStore((s) => s.goal);
  const applyTool = useGridStore((s) => s.applyTool);
  const isPainting = useRef(false);

  const handlePointerDown = useCallback(
    (x: number, y: number) => {
      isPainting.current = true;
      applyTool(x, y);
    },
    [applyTool],
  );

  const handlePointerEnter = useCallback(
    (x: number, y: number) => {
      if (isPainting.current) {
        applyTool(x, y);
      }
    },
    [applyTool],
  );

  const handlePointerUp = useCallback(() => {
    isPainting.current = false;
  }, []);

  // Build cell array
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const k = `${x},${y}`;
      const isWall = walls.has(k);
      const isStart = x === start.x && y === start.y;
      const isGoal = x === goal.x && y === goal.y;

      let bg: string;
      let label = '';
      if (isStart) {
        bg = 'bg-blue-500';
        label = 'S';
      } else if (isGoal) {
        bg = 'bg-amber-500';
        label = 'G';
      } else if (isWall) {
        bg = 'bg-board-wall';
      } else {
        bg = 'bg-board-tile hover:bg-board-base cursor-pointer';
      }

      cells.push(
        <div
          key={k}
          className={`border border-board-border/50 flex items-center justify-center text-xs font-bold select-none ${bg}`}
          onPointerDown={(e) => {
            e.preventDefault();
            handlePointerDown(x, y);
          }}
          onPointerEnter={() => handlePointerEnter(x, y)}
          style={{ aspectRatio: '1' }}
        >
          {label && <span className="text-white drop-shadow-md">{label}</span>}
        </div>,
      );
    }
  }

  return (
    <div
      className="select-none touch-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          width: `min(78vh, 78vw)`,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
