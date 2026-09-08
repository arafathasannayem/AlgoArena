/**
 * Wall — Stacked procedural ABS plastic brick obstacle.
 *
 * Implements Brick Racer authentic brick wall styling:
 * - Stacked 1–3 brick blocks rising from the baseplate with top cylinder studs
 * - ABS plastic gloss material (roughness 0.35, clearcoat 0.6)
 * - Dynamic color matching active board skin (Reddish Brown, Castle Stone, Space Neon, City Tan)
 *
 * @module scene/Wall
 */

import { useMemo } from 'react';
import { useThemeStore } from '../state/themeStore';

interface WallProps {
  x: number;
  y: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: () => void;
}

const BRICK_WIDTH = 0.92;
const BRICK_HEIGHT = 0.28;
const STUD_RADIUS = 0.22;
const STUD_HEIGHT = 0.06;

export function Wall({
  x,
  y,
  castShadow = true,
  receiveShadow = true,
  onClick,
}: WallProps) {
  const theme = useThemeStore((s) => s.currentTheme);

  // Procedural 1 to 3 brick height variance based on coordinates for visual texture
  const brickCount = useMemo(() => ((x * 37 + y * 19) % 3) + 1, [x, y]);
  const totalHeight = brickCount * BRICK_HEIGHT;

  const isSpaceTheme = theme.id === 'space';

  return (
    <group
      position={[x, 0.08, y]}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Stacked Brick Blocks */}
      {Array.from({ length: brickCount }).map((_, i) => {
        const brickY = i * BRICK_HEIGHT + BRICK_HEIGHT / 2;
        const isAlt = i % 2 === 1;
        const color = isAlt ? theme.wallAltColor : theme.wallColor;

        return (
          <mesh
            key={`brick-${i}`}
            position={[0, brickY, 0]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
          >
            <boxGeometry args={[BRICK_WIDTH, BRICK_HEIGHT - 0.015, BRICK_WIDTH]} />
            <meshStandardMaterial
              color={color}
              emissive={isSpaceTheme ? color : '#000000'}
              emissiveIntensity={isSpaceTheme ? 0.4 : 0}
              roughness={isSpaceTheme ? 0.1 : 0.35}
              metalness={0.06}
            />
          </mesh>
        );
      })}

      {/* Top LEGO Studs on the highest brick */}
      <mesh
        position={[0, totalHeight + STUD_HEIGHT / 2, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
        <meshStandardMaterial
          color={theme.wallColor}
          emissive={isSpaceTheme ? theme.wallColor : '#000000'}
          emissiveIntensity={isSpaceTheme ? 0.5 : 0}
          roughness={isSpaceTheme ? 0.1 : 0.28}
          metalness={0.08}
        />
      </mesh>
    </group>
  );
}