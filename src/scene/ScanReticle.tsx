/**
 * ScanReticle — Holographic scout scanner reticle.
 *
 * Represents the active search probe examining candidate grid cells.
 * Renders a glowing targeting ring that sweeps across frontier nodes,
 * visually decoupling the search evaluation from the physical agent pawn.
 *
 * @module scene/ScanReticle
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
import type { Mesh } from 'three';
import type { Point } from '../algorithms/types';

interface ScanReticleProps {
  position: Point;
  color: string;
}

export function ScanReticle({ position, color }: ScanReticleProps) {
  const ringRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  // Fast, responsive spring so the reticle snaps sharply to scanned cells
  const { posX, posZ } = useSpring({
    posX: position.x,
    posZ: position.y,
    config: { tension: 350, friction: 26 },
  });

  // Pulse and rotate the reticle
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 2;
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(0.8 + 0.2 * Math.sin(t * 8));
    }
  });

  return (
    <animated.group position-x={posX} position-y={0.12} position-z={posZ}>
      {/* Outer rotating reticle ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.44, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Inner pulsing targeting beacon */}
      <mesh ref={innerRef} position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Vertical light probe beam */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 0.5, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.35}
        />
      </mesh>
    </animated.group>
  );
}
