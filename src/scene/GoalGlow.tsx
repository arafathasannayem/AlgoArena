/**
 * GoalGlow — Game-grade emissive beacon and floating crystal at the goal tile.
 *
 * Renders an animated floating octahedron gem, counter-rotating energy rings,
 * and a vertical celestial beacon beam to give the goal unmistakable presence.
 *
 * @module scene/GoalGlow
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import { useAgentStore } from '../state/agentStore';

interface GoalGlowProps {
  x: number;
  y: number;
}

export function GoalGlow({ x, y }: GoalGlowProps) {
  const groupRef = useRef<Group>(null);
  const crystalRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const innerRingRef = useRef<Mesh>(null);

  const agents = useAgentStore((s) => s.agents);

  // Has any agent, visited search node, or scout scanner reached the goal?
  const isGoalReached = agents.some(
    (a) =>
      (a.position.x === x && a.position.y === y) ||
      a.visitedNodes.has(`${x},${y}`) ||
      (a.scanPosition && a.scanPosition.x === x && a.scanPosition.y === y) ||
      (a.status === 'done' && a.result?.status === 'success')
  );

  useFrame(({ clock }) => {
    if (isGoalReached) return;
    const t = clock.getElapsedTime();

    // Floating gem bobbing and spinning
    if (crystalRef.current) {
      crystalRef.current.position.y = 0.55 + Math.sin(t * 2) * 0.08;
      crystalRef.current.rotation.y = t * 1.5;
      crystalRef.current.rotation.z = Math.sin(t * 1.2) * 0.15;
    }

    // Ground energy rings rotating in opposite directions
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      const pulse = 0.9 + 0.1 * Math.sin(t * 3);
      ringRef.current.scale.set(pulse, pulse, 1);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 1.2;
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, y]}>
      {/* Outer pulsing ground beacon ring */}
      <mesh ref={ringRef} position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.44, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={isGoalReached ? 0.3 : 1.2}
          transparent
          opacity={isGoalReached ? 0.25 : 0.8}
        />
      </mesh>

      {/* Inner counter-rotating ring */}
      <mesh ref={innerRingRef} position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.24, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={isGoalReached ? 0.4 : 1.5}
          transparent
          opacity={isGoalReached ? 0.3 : 0.9}
        />
      </mesh>

      {/* Floating rotating diamond crystal & celestial beam — vanishes once node reaches it */}
      {!isGoalReached && (
        <>
          <mesh ref={crystalRef} position={[0, 0.55, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={1.0}
              roughness={0.15}
              metalness={0.8}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Vertical light column beacon */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.12, 0.9, 16]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.6}
              transparent
              opacity={0.25}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
