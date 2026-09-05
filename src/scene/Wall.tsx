/**
 * Wall — Raised wall block mesh.
 *
 * Walls are distinct 3D volumes (not flat textures) to give "physical weight"
 * as specified in the GDD. They cast and receive shadows.
 *
 * @module scene/Wall
 */

import { useRef } from 'react';
import { type Mesh } from 'three';

interface WallProps {
  x: number;
  y: number;
}

const WALL_HEIGHT = 0.8;
const WALL_SIZE = 0.96;
const WALL_COLOR = '#6b6560';

export function Wall({ x, y }: WallProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[x, WALL_HEIGHT / 2 + 0.1, y]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[WALL_SIZE, WALL_HEIGHT, WALL_SIZE]} />
      <meshStandardMaterial color={WALL_COLOR} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}
