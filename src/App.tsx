/**
 * App — Root component for Algorithm Arena.
 *
 * Layers the 3D diorama scene beneath floating glass HUD panels.
 * Phase 3: 3D isometric scene replaces the 2D grid view from Phase 2.
 */

import { Diorama } from './scene/Diorama';
import { ToolPalette } from './ui/ToolPalette';
import { GridSizeControl } from './ui/GridSizeControl';

export function App() {
  return (
    <div className="h-screen w-screen bg-board-base overflow-hidden relative">
      {/* 3D isometric diorama scene (full viewport) */}
      <Diorama />

      {/* Floating glass HUD panels */}
      <ToolPalette />
      <GridSizeControl />
    </div>
  );
}
