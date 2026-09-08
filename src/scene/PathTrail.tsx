/**
 * PathTrail — Gold stud shortest-path trail for Brick Racer.
 *
 * Implements Section 6.5:
 * - Solid gold stud trail (warm gold #AA7F2E to bright yellow #F2CD37)
 * - Raised cylindrical gold studs on path tiles with emissive glow
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
        <group key={`pt-${i}`} position={[p.x, 0.09, p.y]}>
          {/* Gold Stud Mount Plate */}
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshStandardMaterial
              color="#F2CD37"
              emissive="#AA7F2E"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>

          {/* Glowing Gold Stud Head */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 16]} />
            <meshStandardMaterial
              color="#F2CD37"
              emissive="#F2CD37"
              emissiveIntensity={1.2}
              roughness={0.15}
              metalness={0.5}
            />
          </mesh>

          {/* Connecting Team Color Line Segment */}
          {i > 0 && path[i - 1] && (
            <mesh
              position={[
                (path[i - 1]!.x - p.x) / 2,
                -0.005,
                (path[i - 1]!.y - p.y) / 2,
              ]}
              rotation={[
                0,
                Math.atan2(path[i - 1]!.x - p.x, path[i - 1]!.y - p.y),
                0,
              ]}
            >
              <boxGeometry args={[0.1, 0.02, 0.85]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
