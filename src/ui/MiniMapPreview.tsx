/**
 * MiniMapPreview — Crisp SVG vector thumbnail for map presets.
 *
 * Renders a miniature overhead schematic of walls, rough terrain costs,
 * start point, and goal beacon for instant visual recognition in menus.
 *
 * @module ui/MiniMapPreview
 */

import type { MapPreset } from '../maps/presets';

interface MiniMapPreviewProps {
  preset: MapPreset;
  className?: string;
  size?: number;
}

export function MiniMapPreview({ preset, className = '', size = 120 }: MiniMapPreviewProps) {
  const { width, height, walls, costs, start } = preset;
  const goals = preset.goals && preset.goals.length > 0 ? preset.goals : [preset.goal];
  const cellSize = size / Math.max(width, height);
  const totalWidth = width * cellSize;
  const totalHeight = height * cellSize;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className={`rounded-lg bg-slate-950 border border-white/10 shrink-0 select-none ${className}`}
      aria-label={`${preset.name} mini-map preview`}
    >
      {/* Background Grid Pattern / Subtle border */}
      <rect x={0} y={0} width={totalWidth} height={totalHeight} fill="#090d16" />

      {/* Rough Terrain Cost Tiles (Amber) */}
      {costs &&
        costs.map(([x, y]) => (
          <rect
            key={`cost-${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#d97706"
            fillOpacity={0.65}
          />
        ))}

      {/* Wall Monoliths (Slate) */}
      {walls.map(([x, y]) => (
        <rect
          key={`wall-${x}-${y}`}
          x={x * cellSize + 0.5}
          y={y * cellSize + 0.5}
          width={Math.max(1, cellSize - 1)}
          height={Math.max(1, cellSize - 1)}
          fill="#94a3b8"
          rx={cellSize > 8 ? 1 : 0}
        />
      ))}

      {/* Start Point (Cyan Aura) */}
      <circle
        cx={(start.x + 0.5) * cellSize}
        cy={(start.y + 0.5) * cellSize}
        r={Math.max(2, cellSize * 0.45)}
        fill="#38bdf8"
      />

      {/* Goal Points (Amber Auras) — one per goal node */}
      {goals.map((g, i) => (
        <circle
          key={`goal-${i}-${g.x}-${g.y}`}
          cx={(g.x + 0.5) * cellSize}
          cy={(g.y + 0.5) * cellSize}
          r={Math.max(2, cellSize * 0.45)}
          fill="#fbbf24"
        />
      ))}
    </svg>
  );
}
