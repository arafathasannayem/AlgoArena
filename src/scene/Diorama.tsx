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
import { useAgentStore } from '../state/agentStore';
import { Tile } from './Tile';
import { Wall } from './Wall';
import { GoalGlow } from './GoalGlow';
import { AgentPawn } from './AgentPawn';
import { ScanReticle } from './ScanReticle';
import { NodeOverlay } from './Node';
import { PathTrail } from './PathTrail';
import { HeuristicRay } from './HeuristicRay';
import { CameraController } from './CameraController';

/** Inner scene component — reads store and renders geometry. */
function DioramaScene() {
  const width = useGridStore((s) => s.width);
  const height = useGridStore((s) => s.height);
  const walls = useGridStore((s) => s.walls);
  const start = useGridStore((s) => s.start);
  const goal = useGridStore((s) => s.goal);
  const applyTool = useGridStore((s) => s.applyTool);

  const agents = useAgentStore((s) => s.agents);
  const toggleOverlay = useAgentStore((s) => s.toggleOverlay);

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
            onClick={() => applyTool(x, y)}
          />,
        );

        if (isWall) {
          ws.push(
            <Wall
              key={`w-${k}`}
              x={x}
              y={y}
              onClick={() => applyTool(x, y)}
            />,
          );
        }
      }
    }
    return { tiles: ts, wallBlocks: ws };
  }, [width, height, walls, start, goal, applyTool]);

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

      {/* Lighting rig — static "baked" feel */}
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[20, 35, 20]}
        intensity={1.5}
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
        {tiles}
        {wallBlocks}
        <GoalGlow x={goal.x} y={goal.y} />

        {/* Agents & their overlays */}
        {agents.map((agent) => (
          <group key={agent.id}>
            {/* Grounded physical pawn running valid paths */}
            <AgentPawn
              position={agent.position}
              color={agent.color}
              onClick={() => toggleOverlay(agent.id)}
            />

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
        ))}
      </group>
    </>
  );
}

/** Diorama canvas wrapper. */
export function Diorama() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <DioramaScene />
    </Canvas>
  );
}
