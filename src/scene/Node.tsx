/**
 * Node — Visualization overlay for frontier and visited nodes.
 *
 * Renders colored translucent flat boxes on grid cells to indicate:
 * - Visited nodes (agent's color, lower opacity)
 * - Frontier nodes (agent's color, higher opacity, slightly raised)
 *
 * @module scene/Node
 */

import type { Point } from '../algorithms/types';

interface NodeOverlayProps {
  visitedNodes: Set<string>;
  frontierNodes: Point[];
  color: string;
}

export function NodeOverlay({ visitedNodes, frontierNodes, color }: NodeOverlayProps) {
  const visited: React.ReactNode[] = [];
  const frontier: React.ReactNode[] = [];

  // Render visited nodes
  visitedNodes.forEach((key) => {
    const parts = key.split(',');
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (isNaN(x) || isNaN(y)) return;

    visited.push(
      <mesh key={`v-${key}`} position={[x, 0.12, y]}>
        <boxGeometry args={[0.9, 0.02, 0.9]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} />
      </mesh>,
    );
  });

  // Render frontier nodes (slightly raised, more opaque)
  for (const node of frontierNodes) {
    const k = `${node.x},${node.y}`;
    frontier.push(
      <mesh key={`f-${k}`} position={[node.x, 0.14, node.y]}>
        <boxGeometry args={[0.85, 0.03, 0.85]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>,
    );
  }

  return (
    <group>
      {visited}
      {frontier}
    </group>
  );
}
