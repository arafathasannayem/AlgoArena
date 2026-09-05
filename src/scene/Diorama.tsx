/**
 * Diorama — Main React Three Fiber canvas with isometric camera.
 *
 * Renders the grid as a 3D isometric diorama with:
 * - Orthographic camera at true isometric angle (position [D,D,D] → lookAt origin)
 * - Interactive movable camera (orbit, pan, zoom) via Drei OrbitControls
 * - Grid tiles as flat box geometry
 * - Walls as raised 3D blocks with shadows
 * - Goal glow via emissive material + pulse animation
 * - Directional "sun" light + ambient fill + shadow mapping
 * - Agents with grounded pawns and holographic scout scan reticles
 *
 * @module scene/Diorama
 */

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useGridStore } from '../state/gridStore';
import { useAgentStore, type Agent } from '../state/agentStore';
import { useCameraStore } from '../state/cameraStore';
import { Tile } from './Tile';
import { Wall } from './Wall';
import { GoalGlow } from './GoalGlow';
import { AgentPawn } from './AgentPawn';
import { ScanReticle } from './ScanReticle';
import { NodeOverlay } from './Node';
import { PathTrail } from './PathTrail';
import { HeuristicRay } from './HeuristicRay';
import { CameraController } from './CameraController';
import { getClusterOffset } from './clusterUtils';
import { SquareClusterIndicator } from './SquareClusterIndicator';

/** Inner scene component — reads store and renders geometry. */
function DioramaScene() {
  const width = useGridStore((s) => s.width);
  const height = useGridStore((s) => s.height);
  const walls = useGridStore((s) => s.walls);
  const costs = useGridStore((s) => s.costs);
  const start = useGridStore((s) => s.start);
  const goal = useGridStore((s) => s.goal);
  const applyTool = useGridStore((s) => s.applyTool);

  const agents = useAgentStore((s) => s.agents);
  const toggleOverlay = useAgentStore((s) => s.toggleOverlay);
  const isTopDown = useCameraStore((s) => s.isTopDown);

  // Group agents by current cell position to handle multi-agent clustering
  const { agentOffsets, cellClusters } = useMemo(() => {
    const cellMap = new Map<string, Agent[]>();
    for (const agent of agents) {
      const k = `${agent.position.x},${agent.position.y}`;
      const list = cellMap.get(k);
      if (list) {
        list.push(agent);
      } else {
        cellMap.set(k, [agent]);
      }
    }

    const offsets = new Map<
      string,
      { offsetX: number; offsetZ: number; scale: number; isVisiblePawn: boolean }
    >();
    const clusters: { key: string; x: number; y: number; lastEnteredAgents: Agent[] }[] = [];

    for (const [key, cellAgents] of cellMap.entries()) {
      // Sort by arrival order: earliest first, latest last
      cellAgents.sort((a, b) => a.enteredAt - b.enteredAt);
      const total = cellAgents.length;

      cellAgents.forEach((agent, index) => {
        const cluster = getClusterOffset(index, total);
        // Display up to 4 corner pawns on ground, 4+ represented by indicator
        const isVisiblePawn = index < 4;
        offsets.set(agent.id, {
          offsetX: cluster.offsetX,
          offsetZ: cluster.offsetZ,
          scale: cluster.scale,
          isVisiblePawn,
        });
      });

      if (total >= 4) {
        const [xStr, yStr] = key.split(',');
        clusters.push({
          key,
          x: Number(xStr),
          y: Number(yStr),
          lastEnteredAgents: cellAgents.slice(3),
        });
      }
    }

    return { agentOffsets: offsets, cellClusters: clusters };
  }, [agents]);

  // Center the grid around the origin
  const offsetX = -(width - 1) / 2;
  const offsetZ = -(height - 1) / 2;

  // Responsive zoom: fit grid in viewport
  const gridMax = Math.max(width, height);
  const zoom = useMemo(() => {
    // Base zoom for a 10-unit grid; scale inversely with grid size
    return Math.max(18, 280 / gridMax);
  }, [gridMax]);

  // Build tile and wall arrays
  const { tiles, wallBlocks } = useMemo(() => {
    const ts: React.ReactNode[] = [];
    const ws: React.ReactNode[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const k = `${x},${y}`;
        const isWall = walls.has(k);
        const isStart = x === start.x && y === start.y;
        const isGoal = x === goal.x && y === goal.y;

        ts.push(
          <Tile
            key={`t-${k}`}
            x={x}
            y={y}
            isStart={isStart}
            isGoal={isGoal}
            isWall={isWall}
            cost={costs.get(k)}
            receiveShadow={!isTopDown}
            onClick={() => applyTool(x, y)}
          />,
        );

        if (isWall) {
          ws.push(
            <Wall
              key={`w-${k}`}
              x={x}
              y={y}
              castShadow={!isTopDown}
              receiveShadow={!isTopDown}
              onClick={() => applyTool(x, y)}
            />,
          );
        }
      }
    }
    return { tiles: ts, wallBlocks: ws };
  }, [width, height, walls, costs, start, goal, isTopDown, applyTool]);

  return (
    <>
      {/* True isometric camera: position at (D,D,D), lookAt(0,0,0) */}
      <OrthographicCamera
        makeDefault
        position={[40, 40, 40]}
        zoom={zoom}
        near={-100}
        far={1000}
        onUpdate={(cam) => cam.lookAt(0, 0, 0)}
      />

      {/* Interactive Orbit, Pan & Zoom Camera Controller */}
      <CameraController defaultZoom={zoom} />

      {/* Lighting rig — static "baked" feel in 3D, even ambient in top-down 2D */}
      <ambientLight intensity={isTopDown ? 0.95 : 0.45} />
      <directionalLight
        castShadow={!isTopDown}
        position={isTopDown ? [0, 50, 0] : [20, 35, 20]}
        intensity={isTopDown ? 0.6 : 1.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
      />

      {/* Grid container — centered at origin */}
      <group position={[offsetX, 0, offsetZ]}>
        {/* Diorama Tabletop Pedestal Base (underneath the grid in 3D mode) */}
        {!isTopDown && (
          <group position={[(width - 1) / 2, 0, (height - 1) / 2]}>
            {/* Upper beveled slate trim */}
            <mesh position={[0, -0.05, 0]} receiveShadow>
              <boxGeometry args={[width + 0.3, 0.1, height + 0.3]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
            </mesh>
            {/* Deep foundation pedestal block */}
            <mesh position={[0, -0.28, 0]} receiveShadow>
              <boxGeometry args={[width + 0.7, 0.38, height + 0.7]} />
              <meshStandardMaterial color="#0f172a" roughness={0.85} metalness={0.3} />
            </mesh>
            {/* Sleek edge accent line */}
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[width + 0.32, 0.02, height + 0.32]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} />
            </mesh>
          </group>
        )}

        {/* Start Position Soft Beacon Halo */}
        <mesh position={[start.x, 0.11, start.y]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.44, 24]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.9}
            transparent
            opacity={0.65}
          />
        </mesh>

        {tiles}
        {wallBlocks}
        <GoalGlow x={goal.x} y={goal.y} />

        {/* Agents & their overlays */}
        {agents.map((agent) => {
          const offsetInfo = agentOffsets.get(agent.id) ?? {
            offsetX: 0,
            offsetZ: 0,
            scale: 1.0,
            isVisiblePawn: true,
          };

          return (
            <group key={agent.id}>
              {/* Grounded physical pawn running valid paths */}
              {offsetInfo.isVisiblePawn && (
                <AgentPawn
                  position={agent.position}
                  color={agent.color}
                  offsetX={offsetInfo.offsetX}
                  offsetZ={offsetInfo.offsetZ}
                  scale={offsetInfo.scale}
                  castShadow={!isTopDown}
                  onClick={() => toggleOverlay(agent.id)}
                />
              )}

              {agent.showOverlay && (
                <>
                  {/* Active scout scanner reticle exploring nodes */}
                  {agent.scanPosition && agent.status === 'running' && (
                    <ScanReticle
                      position={agent.scanPosition}
                      color={agent.color}
                    />
                  )}

                  <NodeOverlay
                    visitedNodes={agent.visitedNodes}
                    frontierNodes={agent.frontierNodes}
                    color={agent.color}
                  />
                  <PathTrail path={agent.currentPath} color={agent.color} />
                  {agent.heuristicTarget && (
                    <HeuristicRay
                      from={agent.scanPosition ?? agent.position}
                      to={agent.heuristicTarget}
                      color={agent.color}
                    />
                  )}
                </>
              )}
            </group>
          );
        })}

        {/* 4+ Agent Square Overflow Indicators */}
        {cellClusters.map((cluster) => (
          <SquareClusterIndicator
            key={`cluster-${cluster.key}`}
            x={cluster.x}
            y={cluster.y}
            lastEnteredAgents={cluster.lastEnteredAgents}
            onToggleOverlay={toggleOverlay}
          />
        ))}
      </group>
    </>
  );
}

/** Diorama canvas wrapper. */
export function Diorama() {
  const isTopDown = useCameraStore((s) => s.isTopDown);

  return (
    <Canvas
      shadows={!isTopDown}
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <DioramaScene />
    </Canvas>
  );
}
