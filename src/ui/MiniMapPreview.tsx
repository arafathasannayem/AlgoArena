/**
 * MiniMapPreview — SVG vector thumbnail for map presets with Brick Racer styling.
 *
 * Renders an overhead schematic with baseplate green (#237841) floor,
 * brick walls (#582A12), warm gold start (#AA7F2E), and bright yellow goals (#F2CD37).
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
      className={`rounded-lg border border-[#05131D] shrink-0 select-none ${className}`}
      aria-label={`${preset.name} mini-map preview`}
    >
      {/* Baseplate green floor */}
      <rect x={0} y={0} width={totalWidth} height={totalHeight} fill="#237841" />

      {/* Rough Terrain Cost Tiles (Amber) */}
      {costs &&
        costs.map(([x, y]) => (
          <rect
            key={`cost-${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#FE8A18"
            fillOpacity={0.7}
          />
        ))}

      {/* Stacked Brick Walls (Reddish Brown) */}
      {walls.map(([x, y]) => (
        <rect
          key={`wall-${x}-${y}`}
          x={x * cellSize + 0.5}
          y={y * cellSize + 0.5}
          width={Math.max(1, cellSize - 1)}
          height={Math.max(1, cellSize - 1)}
          fill="#582A12"
          stroke="#05131D"
          strokeWidth={0.5}
          rx={cellSize > 8 ? 1 : 0}
        />
      ))}

      {/* Start Point (Warm Gold Disc) */}
      <circle
        cx={(start.x + 0.5) * cellSize}
        cy={(start.y + 0.5) * cellSize}
        r={Math.max(2, cellSize * 0.42)}
        fill="#AA7F2E"
        stroke="#05131D"
        strokeWidth={0.5}
      />

      {/* Goal Points (Bright Yellow) */}
      {goals.map((g, i) => (
        <circle
          key={`goal-${i}-${g.x}-${g.y}`}
          cx={(g.x + 0.5) * cellSize}
          cy={(g.y + 0.5) * cellSize}
          r={Math.max(2, cellSize * 0.42)}
          fill="#F2CD37"
          stroke="#05131D"
          strokeWidth={0.5}
        />
      ))}
    </svg>
  );
}
