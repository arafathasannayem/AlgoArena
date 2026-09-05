/**
 * GoalGlow — Emissive pulsing glow at the goal tile.
 *
 * Uses an emissive material with animation via useFrame to create a
 * soft pulsing effect that makes the goal visibly distinct.
 *
 * @module scene/GoalGlow
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Mesh } from 'three';

interface GoalGlowProps {
  x: number;
  y: number;
}

export function GoalGlow({ x, y }: GoalGlowProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    // Pulse the emissive intensity
    const t = clock.getElapsedTime();
    const pulse = 0.5 + 0.5 * Math.sin(t * 2);
    const mat = meshRef.current.material;
    if ('emissiveIntensity' in mat) {
      (mat as { emissiveIntensity: number }).emissiveIntensity = 0.3 + pulse * 0.7;
    }
    // Gentle float
    meshRef.current.position.y = 0.15 + Math.sin(t * 1.5) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[x, 0.15, y]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}
