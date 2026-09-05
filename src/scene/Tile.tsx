/**
 * Tile — Desert-themed grid tile mesh with role-specific detailing.
 *
 * Implements tactile tabletop desert board aesthetics:
 * - Regular tiles: Sun-baked desert sand slabs with subtle sandstone bevels
 * - Start tile: Desert oasis spring pool with cyan water and stone perimeter
 * - Goal tile: Ancient golden sun-altar platform
 * - High cost tile: Jagged rough desert badlands/scree with scattered boulders
 * - Softly written cost number inscribed directly on the terrain design (no modal elements)
 *
 * @module scene/Tile
 */

import { useRef } from 'react';
import { type Mesh } from 'three';
import { Text, useGLTF, Clone } from '@react-three/drei';
import { useRaceStore } from '../state/raceStore';
import { useGridStore } from '../state/gridStore';
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

const SCRUB_URL = '/3d-assets/desert-scrub.glb';
const DRACO_URL = '/draco/';

// Desert Palette
const COLOR_TILE_BASE = '#c89b6b';
const COLOR_TILE_TOP = '#ebd5b3';
const COLOR_START = '#0284c7';
const COLOR_START_GLOW = '#38bdf8';
const COLOR_GOAL = '#d97706';
const COLOR_GOAL_GLOW = '#fbbf24';
const COLOR_WALL_FOUNDATION = '#1e3a1a';
const COLOR_ROUGH_TERRAIN_BED = '#4a2810';
const COLOR_ROUGH_TERRAIN_SURFACE = '#783d19';

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
  const isHighCost = cost !== undefined && cost > 1 && !isStart && !isGoal && !isWall;

  const handleClick = () => {
    if (isRunning) return;
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
              ? COLOR_ROUGH_TERRAIN_BED
              : COLOR_TILE_BASE
          }
          roughness={isHighCost ? 0.95 : 0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Surface Inset / Desert Sand Dune Slabs */}
      {!isWall && !isHighCost && !isStart && !isGoal && (
        <mesh position={[0, TILE_HEIGHT + 0.005, 0]} receiveShadow={receiveShadow}>
          <boxGeometry args={[0.88, 0.01, 0.88]} />
          <meshStandardMaterial color={COLOR_TILE_TOP} roughness={0.7} metalness={0.02} />
        </mesh>
      )}

      {/* Start Pad: Desert Oasis Spring Pool */}
      {isStart && (
        <group position={[0, TILE_HEIGHT + 0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.38, 24]} />
            <meshStandardMaterial
              color="#bae6fd"
              roughness={0.4}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.2, 24]} />
            <meshStandardMaterial
              color={COLOR_START_GLOW}
              emissive="#0284c7"
              emissiveIntensity={0.8}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Goal Pad: Ancient Desert Sun Altar Disc */}
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

      {/* High Cost: Rough Desert Terrain with Desert Scrub */}
      {isHighCost && (
        <RoughTerrainModel
          cost={cost}
          showCostLabels={showCostLabels}
          showResults={showResults}
          receiveShadow={receiveShadow}
        />
      )}
    </group>
  );
}

function RoughTerrainModel({
  cost,
  showCostLabels,
  showResults,
  receiveShadow,
}: {
  cost: number;
  showCostLabels: boolean;
  showResults: boolean;
  receiveShadow: boolean;
}) {
  const { scene } = useGLTF(SCRUB_URL, DRACO_URL);

  return (
    <group position={[0, TILE_HEIGHT, 0]}>
      {/* Cracked badlands stone bed */}
      <mesh position={[0, 0.005, 0]} receiveShadow={receiveShadow}>
        <boxGeometry args={[0.88, 0.012, 0.88]} />
        <meshStandardMaterial
          color={COLOR_ROUGH_TERRAIN_SURFACE}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* 3D Desert Scrub Asset */}
      <group position={[0, 0.01, -0.05]}>
        <Clone
          object={scene}
          scale={[0.75, 0.75, 0.75]}
          castShadow={receiveShadow}
          receiveShadow={receiveShadow}
        />
      </group>

      {/* Softly written cost value directly on the terrain surface (toggleable) */}
      {showCostLabels && !showResults && (
        <Text
          position={[0, 0.025, 0.22]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.24}
          color="#fef3c7"
          fillOpacity={0.85}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {cost}
        </Text>
      )}
    </group>
  );
}

useGLTF.preload(SCRUB_URL, DRACO_URL);
