/**
 * Node — Visited and Frontier plate overlays for Brick Racer.
 *
 * Implements Section 6.5:
 * - Visited cells: thin translucent plate (25% opacity) snapped flush onto the baseplate
 * - Frontier cells: raised plate (55% opacity) elevated above the baseplate with pulse animation
 *
 * @module scene/Node
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Point } from '../algorithms/types';

interface NodeOverlayProps {
  visitedNodes: Set<string>;
  frontierNodes: Point[];
  color: string;
}

export function NodeOverlay({ visitedNodes, frontierNodes, color }: NodeOverlayProps) {
  const frontierGroupRef = useRef<Group>(null);

  // Slow pulse (800ms loop) for frontier plates
  useFrame(({ clock }) => {
    if (!frontierGroupRef.current) return;
    const pulse = 0.95 + 0.06 * Math.sin(clock.getElapsedTime() * (Math.PI / 0.4));
    frontierGroupRef.current.scale.set(pulse, 1, pulse);
  });

  const visited: React.ReactNode[] = [];
  const frontier: React.ReactNode[] = [];

  // Render visited plates (flush on baseplate, 25% opacity)
  visitedNodes.forEach((key) => {
    const parts = key.split(',');
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (isNaN(x) || isNaN(y)) return;

    visited.push(
      <mesh key={`v-${key}`} position={[x, 0.085, y]}>
        <boxGeometry args={[0.92, 0.01, 0.92]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.25}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>,
    );
  });

  // Render frontier plates (raised ~4px, 55% opacity)
  for (const node of frontierNodes) {
    const k = `${node.x},${node.y}`;
    frontier.push(
      <mesh key={`f-${k}`} position={[node.x, 0.12, node.y]}>
        <boxGeometry args={[0.88, 0.02, 0.88]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.55}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.3}
          depthWrite={false}
        />
      </mesh>,
    );
  }

  return (
    <group>
      {visited}
      <group ref={frontierGroupRef}>
        {frontier}
      </group>
    </group>
  );
}
