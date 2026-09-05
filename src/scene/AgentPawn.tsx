/**
 * AgentPawn — Low-poly pawn mesh with spring-animated position.
 *
 * The pawn smoothly lerps between grid cells using @react-spring/three.
 * Clicking toggles the agent's visualization overlay.
 *
 * @module scene/AgentPawn
 */

import { animated, useSpring } from '@react-spring/three';
import type { Point } from '../algorithms/types';

interface AgentPawnProps {
  position: Point;
  color: string;
  onClick: () => void;
}

export function AgentPawn({ position, color, onClick }: AgentPawnProps) {
  const { posX, posZ } = useSpring({
    posX: position.x,
    posZ: position.y,
    config: { tension: 180, friction: 22 },
  });

  return (
    <animated.group
      position-x={posX}
      position-y={0.5}
      position-z={posZ}
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
