/**
 * AgentPawn — Animated Camel caravan agent pawn with colored top saddle.
 *
 * Uses the camel.glb 3D asset with:
 * - Color-coded top saddle blanket and caravan pack for instant team identification
 * - Ground team energy aura ring
 * - Spring position lerp with heading direction turn & gait bob
 *
 * @module scene/AgentPawn
 */

import { useRef, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useGLTF, Clone } from '@react-three/drei';
import type { Point } from '../algorithms/types';

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

const CAMEL_URL = '/3d-assets/camel.glb';
const DRACO_URL = '/draco/';

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
  const { scene: camelScene } = useGLTF(CAMEL_URL, DRACO_URL);

  const { posX, posZ, s } = useSpring({
    posX: position.x + offsetX,
    posZ: position.y + offsetZ,
    s: scale,
    config: { tension: 220, friction: 20 },
  });

  // Track heading direction to turn camel towards travel direction
  const lastPos = useRef(position);
  const targetRotY = useRef(0);
  const currentRotY = useRef(0);

  useEffect(() => {
    if (position.x !== lastPos.current.x || position.y !== lastPos.current.y) {
      const dx = position.x - lastPos.current.x;
      const dz = position.y - lastPos.current.y;
      targetRotY.current = Math.atan2(dx, dz);
      lastPos.current = position;
    }
  }, [position]);

  // Subtle idle breathing/gait bob and rotation lerp
  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    const t = clock.getElapsedTime() + (position.x * 0.7 + position.y * 0.3);
    modelRef.current.position.y = Math.sin(t * 3.0) * 0.015;

    // Smoothly interpolate rotation to face heading
    let diff = targetRotY.current - currentRotY.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentRotY.current += diff * 0.15;
    modelRef.current.rotation.y = currentRotY.current;
  });

  return (
    <animated.group
      position-x={posX}
      position-y={0.08}
      position-z={posZ}
      scale={s}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <group ref={modelRef}>
        {/* Ground team aura halo */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.36, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* 3D Camel Model */}
        <group position={[0, 0.25, 0]}>
          <Clone
            object={camelScene}
            scale={[0.22, 0.22, 0.22]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
          />
        </group>

        {/* Colored Caravan Saddle & Pack atop camel's hump to differentiate agents */}
        {/* Saddle blanket draped over the hump */}
        <mesh position={[0, 0.35, 0.02]} castShadow={castShadow}>
          <boxGeometry args={[0.2, 0.1, 0.26]} />
          <meshStandardMaterial
            color={color}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Saddle bedroll pack resting on the top */}
        <mesh
          position={[0, 0.41, 0.02]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow={castShadow}
        >
          <cylinderGeometry args={[0.065, 0.065, 0.22, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Gold saddle strap accents */}
        <mesh position={[0, 0.33, -0.1]} castShadow={castShadow}>
          <boxGeometry args={[0.21, 0.02, 0.03]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.33, 0.14]} castShadow={castShadow}>
          <boxGeometry args={[0.21, 0.02, 0.03]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Illuminated top crest gem */}
        <mesh position={[0, 0.48, 0.02]}>
          <sphereGeometry args={[0.045, 16, 16]} />
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

useGLTF.preload(CAMEL_URL, DRACO_URL);
