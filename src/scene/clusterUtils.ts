/**
 * Cluster Utilities — Offsets and scaling for multi-agent cell occupancy.
 *
 * Ensures agents sharing the same square sit close to each other without overlapping.
 *
 * @module scene/clusterUtils
 */

export interface ClusterOffset {
  offsetX: number;
  offsetZ: number;
  scale: number;
}

/**
 * Calculates non-overlapping cluster offset and scale for an agent based on
 * its arrival rank within a shared grid cell.
 *
 * - 1 agent: centered [0, 0], scale 1.0
 * - 2 agents: side-by-side [-0.24, 0] and [0.24, 0], scale 0.78
 * - 3 agents: triangular [0, -0.22], [-0.22, 0.16], [0.22, 0.16], scale 0.68
 * - 4+ agents: 4 quadrants [-0.20, -0.20], [0.20, -0.20], [-0.20, 0.20], [0.20, 0.20], scale 0.58
 */
export function getClusterOffset(index: number, total: number): ClusterOffset {
  if (total <= 1) {
    return { offsetX: 0, offsetZ: 0, scale: 1.0 };
  }

  if (total === 2) {
    return {
      offsetX: index === 0 ? -0.24 : 0.24,
      offsetZ: 0,
      scale: 0.78,
    };
  }

  if (total === 3) {
    const offsets = [
      { offsetX: 0, offsetZ: -0.22 },
      { offsetX: -0.22, offsetZ: 0.16 },
      { offsetX: 0.22, offsetZ: 0.16 },
    ];
    return {
      ...(offsets[index] ?? { offsetX: 0, offsetZ: 0 }),
      scale: 0.68,
    };
  }

  // 4 or more agents in the same cell
  const offsets = [
    { offsetX: -0.20, offsetZ: -0.20 },
    { offsetX: 0.20, offsetZ: -0.20 },
    { offsetX: -0.20, offsetZ: 0.20 },
    { offsetX: 0.20, offsetZ: 0.20 },
  ];

  return {
    ...(offsets[Math.min(index, 3)] ?? { offsetX: 0, offsetZ: 0 }),
    scale: 0.58,
  };
}
