/**
 * Tile — Game-grade grid tile mesh with role-specific detailing.
 *
 * Implements tactile tabletop game aesthetics:
 * - Regular tiles: Beveled stone slabs with micro-gap grout lines
 * - Start tile: Sci-fi teleportation launch pad with glowing blue rings
 * - Goal tile: Luminous amber checkpoint platform
 * - High cost tile: Sunken amber-hazard rough terrain with cost indicator
 * - Wall top: Recessed foundation receiver
 *
 * @module scene/Tile
 */

import { useRef } from 'react';
import { type Mesh } from 'three';
import { Html } from '@react-three/drei';
import { useRaceStore } from '../state/raceStore';
import { playPlace } from '../utils/sound';

interface TileProps {
  x: number;
  y: number;
  isStart: boolean;
  isGoal: boolean;
  isWall: boolean;
  cost?: number;
  receiveShadow?: boolean;
  onClick: () => void;
}

const TILE_HEIGHT = 0.08;
const TILE_SIZE = 0.96;

// Palette
const COLOR_TILE_BASE = '#d6cfc4';
const COLOR_TILE_TOP = '#ede7de';
const COLOR_START = '#2563eb';
const COLOR_START_GLOW = '#60a5fa';
const COLOR_GOAL = '#d97706';
const COLOR_GOAL_GLOW = '#fbbf24';
const COLOR_WALL_FOUNDATION = '#292524';
const COLOR_HIGH_COST_PIT = '#78350f';
const COLOR_HIGH_COST_SURFACE = '#b45309';

export function Tile({
  x,
  y,
  isStart,
  isGoal,
  isWall,
  cost,
  receiveShadow = true,
  onClick,
}: TileProps) {
  const meshRef = useRef<Mesh>(null);
  const showResults = useRaceStore((s) => s.showResults);
  const isHighCost = cost !== undefined && cost > 1 && !isStart && !isGoal && !isWall;

  const handleClick = () => {
    playPlace();
    onClick();
  };

  return (
    <group position={[x, 0, y]}>
      {/* Base slab */}
      <mesh
        ref={meshRef}
        position={[0, TILE_HEIGHT / 2, 0]}
        receiveShadow={receiveShadow}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <boxGeometry args={[TILE_SIZE, TILE_HEIGHT, TILE_SIZE]} />
        <meshStandardMaterial
          color={
            isWall
              ? COLOR_WALL_FOUNDATION
              : isStart
              ? COLOR_START
              : isGoal
              ? COLOR_GOAL
              : isHighCost
              ? COLOR_HIGH_COST_PIT
              : COLOR_TILE_BASE
          }
          roughness={isHighCost ? 0.95 : 0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Surface Inset / Role Details */}
      {!isWall && !isHighCost && !isStart && !isGoal && (
        <mesh position={[0, TILE_HEIGHT + 0.005, 0]} receiveShadow={receiveShadow}>
          <boxGeometry args={[0.88, 0.01, 0.88]} />
          <meshStandardMaterial color={COLOR_TILE_TOP} roughness={0.45} metalness={0.05} />
        </mesh>
      )}

      {/* Start Pad Glowing Teleport Ring */}
      {isStart && (
        <group position={[0, TILE_HEIGHT + 0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.38, 24]} />
            <meshStandardMaterial
              color={COLOR_START_GLOW}
              emissive={COLOR_START_GLOW}
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.14, 16]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#3b82f6"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      )}

      {/* Goal Pad Beacon Disc */}
      {isGoal && (
        <group position={[0, TILE_HEIGHT + 0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.24, 0.4, 24]} />
            <meshStandardMaterial
              color={COLOR_GOAL_GLOW}
              emissive={COLOR_GOAL_GLOW}
              emissiveIntensity={1.0}
              roughness={0.2}
            />
          </mesh>
        </group>
      )}

      {/* High Cost Rough Terrain Pit */}
      {isHighCost && (
        <group position={[0, TILE_HEIGHT + 0.006, 0]}>
          <mesh receiveShadow={receiveShadow}>
            <boxGeometry args={[0.86, 0.012, 0.86]} />
            <meshStandardMaterial
              color={COLOR_HIGH_COST_SURFACE}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
          {/* Inner textured hazard mud layer */}
          <mesh position={[0, 0.008, 0]} receiveShadow={receiveShadow}>
            <boxGeometry args={[0.74, 0.01, 0.74]} />
            <meshStandardMaterial
              color="#92400e"
              emissive="#d97706"
              emissiveIntensity={0.3}
              roughness={0.95}
            />
          </mesh>
        </group>
      )}

      {/* Path Cost Badge */}
      {isHighCost && !showResults && (
        <Html
          center
          position={[0, 0.14, 0]}
          zIndexRange={[0, 5]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="flex items-center gap-0.5 text-[9px] font-mono font-black text-amber-950 bg-amber-300/95 px-1.5 py-0.5 rounded shadow-md border border-amber-600/40 select-none">
            <span className="text-[7px] text-amber-900/80">COST</span>
            <span>{cost}</span>
          </span>
        </Html>
      )}
    </group>
  );
}
