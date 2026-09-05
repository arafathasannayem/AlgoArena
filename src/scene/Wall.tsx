/**
 * Wall — Sandstone boulder barrier.
 *
 * Uses the sandstone-boulder.glb 3D asset as impassable terrain blocks
 * across the desert landscape.
 *
 * @module scene/Wall
 */

import { useRef, useMemo } from 'react';
import type { Group } from 'three';
import { useGLTF, Clone } from '@react-three/drei';

interface WallProps {
  x: number;
  y: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: () => void;
}

const BOULDER_URL = '/3d-assets/sandstone-boulder.glb';
const DRACO_URL = '/draco/';

export function Wall({
  x,
  y,
  castShadow = true,
  receiveShadow = true,
  onClick,
}: WallProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(BOULDER_URL, DRACO_URL);

  // Slight organic rotation based on grid coordinates so walls look natural
  const rotY = useMemo(() => ((x * 37 + y * 19) % 4) * (Math.PI / 2), [x, y]);

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
      {/* Sandy foundation mound */}
      <mesh position={[0, 0.03, 0]} receiveShadow={receiveShadow}>
        <boxGeometry args={[0.92, 0.06, 0.92]} />
        <meshStandardMaterial color="#c89b6b" roughness={0.9} />
      </mesh>

      {/* 3D Sandstone Boulder Model */}
      <group position={[0, 0.06, 0]} rotation={[0, rotY, 0]}>
        <Clone
          object={scene}
          scale={[0.5, 0.5, 0.5]}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      </group>
    </group>
  );
}

useGLTF.preload(BOULDER_URL, DRACO_URL);