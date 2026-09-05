/**
 * Wall — Dense miniature jungle thicket wall block.
 *
 * Designed with tabletop game diorama aesthetics:
 * - Lush mossy earthen undergrowth mound
 * - Clustered hardwood tree trunks with natural variation
 * - Multi-tiered dense leafy tropical canopies
 * - Low jungle bushes & undergrowth foliage
 * - Casts rich organic dappled shadows onto the desert terrain
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
      {/* Mossy Jungle Undergrowth Mound Base */}
      <mesh
        position={[0, 0.04, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={[0.94, 0.08, 0.94]} />
        <meshStandardMaterial color="#1c3817" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Clustered Jungle Hardwood Tree Trunks */}
      <mesh
        position={[-0.2, 0.28, -0.18]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry args={[0.038, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#4a3525" roughness={0.9} />
      </mesh>
      <mesh
        position={[0.22, 0.32, -0.15]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry args={[0.04, 0.052, 0.58, 8]} />
        <meshStandardMaterial color="#543d2b" roughness={0.9} />
      </mesh>
      <mesh
        position={[-0.12, 0.36, 0.22]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry args={[0.042, 0.055, 0.66, 8]} />
        <meshStandardMaterial color="#422f20" roughness={0.9} />
      </mesh>
      <mesh
        position={[0.18, 0.25, 0.2]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry args={[0.036, 0.048, 0.46, 8]} />
        <meshStandardMaterial color="#4e3828" roughness={0.9} />
      </mesh>

      {/* Multi-Tiered Dense Jungle Foliage Canopies */}
      {/* Center merging dense canopy */}
      <mesh
        position={[0.02, 0.58, 0.02]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#1e5628" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Tallest deep rainforest crown */}
      <mesh
        position={[-0.12, 0.72, 0.22]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.26, 1]} />
        <meshStandardMaterial color="#1b4d24" roughness={0.82} metalness={0.05} />
      </mesh>

      {/* Medium tropical green crown */}
      <mesh
        position={[0.22, 0.65, -0.15]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial color="#23632f" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Western jungle crown */}
      <mesh
        position={[-0.2, 0.54, -0.18]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.23, 1]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Eastern vibrant canopy */}
      <mesh
        position={[0.18, 0.48, 0.2]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.21, 1]} />
        <meshStandardMaterial color="#388e3c" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Low Jungle Undergrowth Bushes */}
      <mesh
        position={[-0.28, 0.12, 0.06]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#276730" roughness={0.9} />
      </mesh>
      <mesh
        position={[0.26, 0.13, 0.08]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#317d3b" roughness={0.9} />
      </mesh>
      <mesh
        position={[0.05, 0.11, -0.28]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#235d2b" roughness={0.9} />
      </mesh>
      <mesh
        position={[-0.05, 0.12, 0.28]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <icosahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#2c7235" roughness={0.9} />
      </mesh>
    </group>
  );
}
