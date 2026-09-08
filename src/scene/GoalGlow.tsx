/**
 * GoalGlow — Bright Yellow goal brick with checkered-flag accessory.
 *
 * Implements Section 6.4:
 * - Bright Yellow brick base with gold stud
 * - Checkered goal flag with subtle vertical bob (~4px, 2s loop)
 * - Concentric yellow ground beacon rings
 *
 * @module scene/GoalGlow
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useAgentStore } from '../state/agentStore';

interface GoalGlowProps {
  x: number;
  y: number;
  onClick?: () => void;
}

export function GoalGlow({ x, y, onClick }: GoalGlowProps) {
  const flagGroupRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  const agents = useAgentStore((s) => s.agents);

  // Check if any agent has reached this goal
  const isGoalReached = agents.some(
    (a) =>
      (a.position.x === x && a.position.y === y) ||
      a.visitedNodes.has(`${x},${y}`) ||
      (a.scanPosition && a.scanPosition.x === x && a.scanPosition.y === y) ||
      (a.status === 'done' && a.result?.status === 'success')
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Subtle ~4px vertical bob animation (2s loop)
    if (flagGroupRef.current) {
      flagGroupRef.current.position.y = 0.12 + Math.sin(t * Math.PI) * 0.035;
    }

    if (ringRef.current) {
      const pulse = 0.95 + 0.08 * Math.sin(t * 3);
      ringRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group
      position={[x, 0, y]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Yellow Radiant Ground Beacon Ring */}
      <group ref={ringRef} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.3, 0.44, 24]} />
          <meshStandardMaterial
            color="#F2CD37"
            emissive="#F2CD37"
            emissiveIntensity={isGoalReached ? 0.4 : 1.2}
            transparent
            opacity={isGoalReached ? 0.35 : 0.85}
          />
        </mesh>
      </group>

      {/* Flag Group with 2s Vertical Bob */}
      <group ref={flagGroupRef}>
        {/* Yellow Goal Brick Mount */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial color="#F2CD37" roughness={0.3} metalness={0.08} />
        </mesh>

        {/* Flag Pole */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
          <meshStandardMaterial color="#05131D" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Pole Finial Gold Stud */}
        <mesh position={[0, 0.61, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#F2CD37" emissive="#F2CD37" emissiveIntensity={0.6} />
        </mesh>

        {/* Checkered Goal Flag */}
        <mesh position={[0.13, 0.5, 0]}>
          <boxGeometry args={[0.24, 0.16, 0.02]} />
          <meshStandardMaterial
            color="#F4F4F4"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Black Checker Square 1 */}
        <mesh position={[0.07, 0.54, 0.012]}>
          <boxGeometry args={[0.11, 0.07, 0.005]} />
          <meshStandardMaterial color="#05131D" roughness={0.4} />
        </mesh>

        {/* Black Checker Square 2 */}
        <mesh position={[0.19, 0.46, 0.012]}>
          <boxGeometry args={[0.11, 0.07, 0.005]} />
          <meshStandardMaterial color="#05131D" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
