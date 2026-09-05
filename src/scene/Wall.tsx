/**
 * Wall — Stylized stone monolith wall block.
 *
 * Designed with miniature tabletop game aesthetics:
 * - Solid chiseled stone base
 * - Beveled decorative top cap
 * - Micro-relief edge chamfers for enhanced lighting and shadows
 *
 * @module scene/Wall
 */

import { useRef } from 'react';
import type { Group } from 'three';

interface WallProps {
  x: number;
  y: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: () => void;
}

const WALL_BASE_COLOR = '#3f3c3a';
const WALL_CAP_COLOR = '#57524e';
const WALL_ACCENT_COLOR = '#292524';

export function Wall({
  x,
  y,
  castShadow = true,
  receiveShadow = true,
  onClick,
}: WallProps) {
  const groupRef = useRef<Group>(null);

  return (
    <group
      ref={groupRef}
      position={[x, 0, y]}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Lower foundation plinth */}
      <mesh
        position={[0, 0.12, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[0.96, 0.08, 0.96]} />
        <meshStandardMaterial color={WALL_ACCENT_COLOR} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Main stone monolith body */}
      <mesh
        position={[0, 0.46, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[0.92, 0.62, 0.92]} />
        <meshStandardMaterial color={WALL_BASE_COLOR} roughness={0.88} metalness={0.12} />
      </mesh>

      {/* Beveled top cap */}
      <mesh
        position={[0, 0.81, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[0.86, 0.1, 0.86]} />
        <meshStandardMaterial color={WALL_CAP_COLOR} roughness={0.75} metalness={0.15} />
      </mesh>
    </group>
  );
}
