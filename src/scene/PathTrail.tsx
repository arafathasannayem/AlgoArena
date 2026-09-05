/**
 * PathTrail — Visualization of the current best-known path.
 *
 * Renders a series of small raised indicators along the path,
 * colored with the agent's color.
 *
 * @module scene/PathTrail
 */

import type { Point } from '../algorithms/types';

interface PathTrailProps {
  path: Point[];
  color: string;
}

export function PathTrail({ path, color }: PathTrailProps) {
  if (path.length === 0) return null;

  return (
    <group>
      {path.map((p, i) => (
        <mesh key={`p-${i}`} position={[p.x, 0.16, p.y]}>
          <boxGeometry args={[0.3, 0.04, 0.3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
