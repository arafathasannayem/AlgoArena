/**
 * AgentPawn — Sculpted game character pawn with team-glow pedestal and spring physics.
 *
 * Implements game-grade character visuals:
 * - Emissive team energy ring projecting on the tile below
 * - Metallic pedestal collar
 * - Sculpted tapered chassis
 * - Illuminated robotic visor/core emitting the agent's team color
 * - Spring position lerp with subtle natural bob
 *
 * @module scene/AgentPawn
 */

import { useRef } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Point } from '../algorithms/types';

interface AgentPawnProps {
  position: Point;
  color: string;
  offsetX?: number;
  offsetZ?: number;
  scale?: number;
  castShadow?: boolean;
  onClick: () => void;
}

export function AgentPawn({
  position,
  color,
  offsetX = 0,
  offsetZ = 0,
  scale = 1.0,
  castShadow = true,
  onClick,
}: AgentPawnProps) {
  const modelRef = useRef<Group>(null);

  const { posX, posZ, s } = useSpring({
    posX: position.x + offsetX,
    posZ: position.y + offsetZ,
    s: scale,
    config: { tension: 220, friction: 20 },
  });

  // Subtle idle micro-bob animation to make pawns feel alive
  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    const t = clock.getElapsedTime() + (position.x * 0.7 + position.y * 0.3);
    modelRef.current.position.y = Math.sin(t * 2.5) * 0.02;
  });

  return (
    <animated.group
      position-x={posX}
      position-y={0.45}
      position-z={posZ}
      scale={s}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <group ref={modelRef}>
        {/* Ground neon energy aura */}
        <mesh position={[0, -0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.32, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Metallic pedestal base collar */}
        <mesh castShadow={castShadow} position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.26, 0.29, 0.09, 20]} />
          <meshStandardMaterial color="#1f242d" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Team color accent ring on pedestal */}
        <mesh castShadow={castShadow} position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.23, 0.25, 0.04, 20]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Sculpted body torso */}
        <mesh castShadow={castShadow} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.14, 0.21, 0.32, 16]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.3} />
        </mesh>

        {/* Neck collar */}
        <mesh castShadow={castShadow} position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.13, 0.14, 0.05, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Head chassis */}
        <mesh castShadow={castShadow} position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.35} />
        </mesh>

        {/* Glowing robotic sensor visor */}
        <mesh position={[0, 0.29, 0.12]}>
          <boxGeometry args={[0.18, 0.06, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={1.8}
            roughness={0.1}
          />
        </mesh>
      </group>
    </animated.group>
  );
}
