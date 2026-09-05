/**
 * AgentPawn — Low-poly pawn mesh with spring-animated position.
 *
 * The pawn smoothly lerps between grid cells using @react-spring/three.
 * Supports clustering offsets and scaling so multiple agents on the same
 * square sit close to each other without overlapping.
 * Clicking toggles the agent's visualization overlay.
 *
 * @module scene/AgentPawn
 */

import { animated, useSpring } from '@react-spring/three';
import type { Point } from '../algorithms/types';

interface AgentPawnProps {
  position: Point;
  color: string;
  offsetX?: number;
  offsetZ?: number;
  scale?: number;
  onClick: () => void;
}

export function AgentPawn({
  position,
  color,
  offsetX = 0,
  offsetZ = 0,
  scale = 1.0,
  onClick,
}: AgentPawnProps) {
  const { posX, posZ, s } = useSpring({
    posX: position.x + offsetX,
    posZ: position.y + offsetZ,
    s: scale,
    config: { tension: 200, friction: 22 },
  });

  return (
    <animated.group
      position-x={posX}
      position-y={0.5}
      position-z={posZ}
      scale={s}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Pawn base — tapered cylinder */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 0.5, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Pawn head — sphere */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
      </mesh>
    </animated.group>
  );
}
