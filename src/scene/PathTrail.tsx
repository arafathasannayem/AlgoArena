/**
 * PathTrail — Visualization of the current best-known path.
 *
 * Renders glowing neon energy nodes along the path with emissive cores
 * to create an illuminated circuit trail across the diorama.
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
        <group key={`p-${i}`} position={[p.x, 0.14, p.y]}>
          {/* Outer glowing energy disc */}
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.9}
              transparent
              opacity={0.75}
            />
          </mesh>

          {/* Inner bright energy core */}
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={color}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
