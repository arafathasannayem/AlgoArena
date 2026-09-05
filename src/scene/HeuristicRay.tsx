/**
 * HeuristicRay — Line from the agent's current position to its heuristic target.
 *
 * Only rendered when the algorithm sets `heuristicTarget` (A*, Greedy, etc.).
 * Uses a simple line geometry connecting agent position to the goal.
 *
 * @module scene/HeuristicRay
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Line as ThreeLine,
  LineBasicMaterial,
} from 'three';
import type { Point } from '../algorithms/types';

interface HeuristicRayProps {
  from: Point;
  to: Point;
  color: string;
}

export function HeuristicRay({ from, to, color }: HeuristicRayProps) {
  const lineRef = useRef<ThreeLine>(null);

  const material = useMemo(
    () => new LineBasicMaterial({ color, transparent: true, opacity: 0.5 }),
    [color],
  );

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array([
      from.x, 0.6, from.y,
      to.x, 0.6, to.y,
    ]);
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, [from.x, from.y, to.x, to.y]);

  const lineObject = useMemo(() => {
    return new ThreeLine(geometry, material);
  }, [geometry, material]);

  // Animate opacity pulse
  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material;
    if (mat instanceof LineBasicMaterial) {
      mat.opacity = 0.3 + 0.3 * Math.sin(clock.getElapsedTime() * 4);
    }
  });

  return <primitive ref={lineRef} object={lineObject} />;
}
