/**
 * Tile — Brick Racer baseplate tile with cylinder studs.
 *
 * Implements authentic LEGO Party!-inspired brick diorama aesthetics:
 * - Baseplate tile with central raised cylinder stud and ABS plastic gloss
 * - Start tile: Warm Gold brick plate with flag mount
 * - Goal tile: Bright Yellow brick plate
 * - High-cost tile: Dark textured rough plate with legible cost number
 * - Theming: Dynamically reflects active board skin (Classic, Castle, Space, City)
 *
 * @module scene/Tile
 */

import { useRef } from 'react';
import type { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { useRaceStore } from '../state/raceStore';
import { useGridStore } from '../state/gridStore';
import { useThemeStore } from '../state/themeStore';
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
const STUD_RADIUS = 0.22;
const STUD_HEIGHT = 0.05;

// Canonical Semantic Brick Colors
const COLOR_START = '#AA7F2E';      // Warm Gold brick
const COLOR_GOAL = '#F2CD37';       // Bright Yellow brick

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
  const isRunning = useRaceStore((s) => s.status === 'running');
  const showCostLabels = useGridStore((s) => s.showCostLabels);
  const theme = useThemeStore((s) => s.currentTheme);

  const isHighCost = cost !== undefined && cost > 1 && !isStart && !isGoal && !isWall;

  const handleClick = () => {
    if (isRunning) return;
    playPlace();
    onClick();
  };

  // Determine base tile color
  let tileColor = theme.baseplateColor;
  let studColor = theme.studColor;

  if (isWall) {
    tileColor = theme.pedestalColor;
    studColor = theme.pedestalColor;
  } else if (isStart) {
    tileColor = COLOR_START;
    studColor = '#d4af37';
  } else if (isGoal) {
    tileColor = COLOR_GOAL;
    studColor = '#ffe066';
  } else if (isHighCost) {
    tileColor = theme.roughCostColor;
    studColor = theme.roughCostColor;
  }

  return (
    <group position={[x, 0, y]}>
      {/* Baseplate cell brick */}
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
          color={tileColor}
          roughness={isHighCost ? 0.7 : 0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Central Raised LEGO Stud (hidden under walls) */}
      {!isWall && (
        <mesh
          position={[0, TILE_HEIGHT + STUD_HEIGHT / 2, 0]}
          receiveShadow={receiveShadow}
          castShadow={!isHighCost}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
          <meshStandardMaterial
            color={studColor}
            roughness={0.3}
            metalness={0.08}
          />
        </mesh>
      )}

      {/* Start Tile: Gold Brick Perimeter Rim */}
      {isStart && (
        <mesh position={[0, TILE_HEIGHT + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.44, 24]} />
          <meshStandardMaterial
            color="#ffe066"
            emissive="#AA7F2E"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Goal Tile: Bright Yellow Radiant Halo */}
      {isGoal && (
        <mesh position={[0, TILE_HEIGHT + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.45, 24]} />
          <meshStandardMaterial
            color="#F2CD37"
            emissive="#F2CD37"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* High-Cost Tile: Inscribed Cost Number */}
      {isHighCost && (
        <group position={[0, TILE_HEIGHT + 0.01, 0]}>
          {/* Border accent for rough terrain */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.44, 4]} />
            <meshStandardMaterial color="#FE8A18" roughness={0.6} />
          </mesh>

          {showCostLabels && !showResults && (
            <Text
              position={[0, 0.08, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.28}
              color="#F2CD37"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              +{cost}
            </Text>
          )}
        </group>
      )}
    </group>
  );
}
