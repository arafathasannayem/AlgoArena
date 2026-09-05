/**
 * Tile — Grid tile mesh rendered as a thin flat box.
 *
 * Colored based on role: start (blue), goal (amber), wall (dark), or empty.
 * Receives shadows from walls. Clickable for tool application.
 *
 * @module scene/Tile
 */

import { useRef } from 'react';
import { type Mesh } from 'three';
import { Html } from '@react-three/drei';
import { useRaceStore } from '../state/raceStore';

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

const TILE_HEIGHT = 0.1;
const TILE_GAP = 0.02; // tiny gap between tiles
const TILE_SIZE = 1 - TILE_GAP;

// Colors
const COLOR_TILE = '#e8e2da';
const COLOR_START = '#3b82f6';
const COLOR_GOAL = '#f59e0b';
const COLOR_WALL_TOP = '#8b8178';
const COLOR_HIGH_COST = '#d97706'; // rich amber / rough terrain

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

  let color: string;
  if (isStart) color = COLOR_START;
  else if (isGoal) color = COLOR_GOAL;
  else if (isWall) color = COLOR_WALL_TOP;
  else if (isHighCost) color = COLOR_HIGH_COST;
  else color = COLOR_TILE;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[x, TILE_HEIGHT / 2, y]}
        receiveShadow={receiveShadow}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <boxGeometry args={[TILE_SIZE, TILE_HEIGHT, TILE_SIZE]} />
        <meshStandardMaterial
          color={color}
          roughness={isHighCost ? 0.85 : 0.4}
          metalness={isHighCost ? 0.05 : 0.1}
        />
      </mesh>

      {/* Path Cost Badge */}
      {isHighCost && !showResults && (
        <Html
          center
          position={[x, 0.14, y]}
          zIndexRange={[0, 5]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="text-[9px] font-mono font-black text-amber-950 bg-amber-200/90 px-1 py-0.5 rounded shadow-sm border border-amber-600/30 select-none">
            {cost}
          </span>
        </Html>
      )}
    </group>
  );
}
