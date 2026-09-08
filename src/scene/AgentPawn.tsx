/**
 * AgentPawn — Minifigure-style brick racer pawn.
 *
 * Implements Brick Racer authentic minifig token aesthetics:
 * - Blocky torso in algorithm racer color
 * - Iconic yellow cylindrical head with top stud
 * - Sturdy leg block and team aura ground ring
 * - Discrete hop movement between cells (no smooth sliding)
 * - Celebratory spin upon reaching the goal
 *
 * @module scene/AgentPawn
 */

import { useRef, useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Point } from '../algorithms/types';
import { useAgentStore } from '../state/agentStore';

interface AgentPawnProps {
  position: Point;
  color: string;
  offsetX?: number;
  offsetZ?: number;
  scale?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick: () => void;
}

export function AgentPawn({
  position,
  color,
  offsetX = 0,
  offsetZ = 0,
  scale = 1.0,
  castShadow = true,
  receiveShadow = true,
  onClick,
}: AgentPawnProps) {
  const modelRef = useRef<Group>(null);
  const [isHopping, setIsHopping] = useState(false);

  // Check agent result status for victory spin
  const agents = useAgentStore((s) => s.agents);
  const isDoneSuccess = agents.some(
    (a) => a.position.x === position.x && a.position.y === position.y && a.result?.status === 'success'
  );

  const { posX, posZ, hopY, s } = useSpring({
    posX: position.x + offsetX,
    posZ: position.y + offsetZ,
    hopY: isHopping ? 0.22 : 0,
    s: scale,
    config: { tension: 320, friction: 18 },
  });

  const lastPos = useRef(position);
  const targetRotY = useRef(0);
  const currentRotY = useRef(0);

  useEffect(() => {
    if (position.x !== lastPos.current.x || position.y !== lastPos.current.y) {
      const dx = position.x - lastPos.current.x;
      const dz = position.y - lastPos.current.y;
      targetRotY.current = Math.atan2(dx, dz);
      lastPos.current = position;

      // Trigger discrete hop
      setIsHopping(true);
      const timer = setTimeout(() => setIsHopping(false), 140);
      return () => clearTimeout(timer);
    }
  }, [position]);

  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    const t = clock.getElapsedTime();

    if (isDoneSuccess) {
      // Celebratory victory spin!
      modelRef.current.rotation.y += 0.12;
      modelRef.current.position.y = Math.sin(t * 8) * 0.04;
    } else {
      // Face travel heading
      let diff = targetRotY.current - currentRotY.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      currentRotY.current += diff * 0.25;
      modelRef.current.rotation.y = currentRotY.current;

      // Idle thinking bounce (2px)
      modelRef.current.position.y = Math.sin(t * 4.0) * 0.012;
    }
  });

  return (
    <animated.group
      position-x={posX}
      position-y={hopY.to((y) => 0.08 + y)}
      position-z={posZ}
      scale={s}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <group ref={modelRef}>
        {/* Team Color Aura Base Ring */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.32, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* ── Minifigure Brick Geometry ── */}

        {/* Legs / Base Block */}
        <mesh position={[0, 0.08, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
          <boxGeometry args={[0.26, 0.16, 0.16]} />
          <meshStandardMaterial color="#05131D" roughness={0.35} metalness={0.05} />
        </mesh>

        {/* Torso in Algorithm's Canonical Racer Color */}
        <mesh position={[0, 0.25, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
          <boxGeometry args={[0.3, 0.22, 0.18]} />
          <meshStandardMaterial
            color={color}
            roughness={0.3}
            metalness={0.06}
          />
        </mesh>

        {/* Neck Stud */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          <meshStandardMaterial color="#F2CD37" roughness={0.3} />
        </mesh>

        {/* Iconic Minifigure Yellow Head */}
        <mesh position={[0, 0.46, 0]} castShadow={castShadow}>
          <cylinderGeometry args={[0.11, 0.11, 0.13, 16]} />
          <meshStandardMaterial
            color="#F2CD37"
            roughness={0.25}
            metalness={0.05}
          />
        </mesh>

        {/* Head Top LEGO Stud */}
        <mesh position={[0, 0.545, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial
            color="#F2CD37"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      </group>
    </animated.group>
  );
}
