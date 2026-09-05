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

interface TileProps {
  x: number;
  y: number;
  isStart: boolean;
  isGoal: boolean;
  isWall: boolean;
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

export function Tile({ x, y, isStart, isGoal, isWall, onClick }: TileProps) {
  const meshRef = useRef<Mesh>(null);

  let color: string;
  if (isStart) color = COLOR_START;
  else if (isGoal) color = COLOR_GOAL;
  else if (isWall) color = COLOR_WALL_TOP;
  else color = COLOR_TILE;

  return (
    <mesh
      ref={meshRef}
      position={[x, TILE_HEIGHT / 2, y]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <boxGeometry args={[TILE_SIZE, TILE_HEIGHT, TILE_SIZE]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
